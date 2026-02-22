import { Request, Response } from 'express';
import crypto from 'crypto';
import User from '../models/User';
import UserSession from '../models/UserSession';
import WhatsappSession, { SessionState, IWhatsAppSession } from '../models/WhatsappSession';
import { sendWhatsAppMessage } from '../services/whatsapp.service';
import { matchSchemes, UserProfile } from '../services/matchingEngine';

// ─── Constants ────────────────────────────────────────────────────────────────

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
const SESSION_TTL_HOURS = parseInt(process.env.SESSION_TTL_HOURS || '24');


// Map numeric replies to enum values for each question
const FARMER_TYPE_MAP: Record<string, string> = {
  '1': 'crop_farmer',
  '2': 'dairy',
  '3': 'fisherman',
  '4': 'labourer',
  '5': 'entrepreneur',
  '6': 'other',
};
const LAND_MAP: Record<string, string> = {
  '1': 'owned',
  '2': 'leased',
  '3': 'none',
};
const AGE_MAP: Record<string, string> = {
  '1': 'below_18',
  '2': '18_40',
  '3': '41_60',
  '4': 'above_60',
};
const CASTE_MAP: Record<string, string> = {
  '1': 'general',
  '2': 'sc',
  '3': 'st',
  '4': 'obc',
  '5': 'not_disclosed',
};
const INCOME_MAP: Record<string, string> = {
  '1': 'below_1L',
  '2': '1_3L',
  '3': '3_8L',
  '4': 'above_8L',
};
const SPECIAL_MAP: Record<string, string> = {
  '1': 'disability',
  '2': 'woman',
  '3': 'youth',
};

// ─── Message Templates ────────────────────────────────────────────────────────

const MSG = {
  welcome: (name: string) =>
    `🙏 Welcome back, *${name}*!\n\nWhat would you like to do?\n\n1️⃣ Update Profile\n2️⃣ Eligible Schemes\n3️⃣ Insurance Schemes\n4️⃣ Financial Support\n\nReply with 1, 2, 3, or 4`,

  newUser: () =>
    `🌾 *Welcome to YojanaMitra!*\n\nI'll help you find government schemes you're eligible for.\n\nLet's start — what is your *full name*?`,

  q1: () =>
    `📍 *Question 1 of 8*\nWhich *state* do you live in?\n\n(Type your state name, e.g. Maharashtra, Punjab, Bihar)`,

  q2: () =>
    `🧑‍🌾 *Question 2 of 8*\nWhat best describes you?\n\n1️⃣ Farmer (Crop)\n2️⃣ Dairy Farmer\n3️⃣ Fisherman\n4️⃣ Agriculture Labourer\n5️⃣ Agri Entrepreneur\n6️⃣ Other\n\nReply with a number (1–6)`,

  q3: () =>
    `🌾 *Question 3 of 8*\nDo you own agricultural land?\n\n1️⃣ Yes – I own land\n2️⃣ On Lease\n3️⃣ No land\n\nReply with 1, 2, or 3`,

  q4: () =>
    `🎂 *Question 4 of 8*\nWhat is your age group?\n\n1️⃣ Below 18\n2️⃣ 18 – 40\n3️⃣ 41 – 60\n4️⃣ Above 60\n\nReply with 1, 2, 3, or 4`,

  q5: () =>
    `🏷️ *Question 5 of 8*\nCaste category? _(helps find caste-specific schemes)_\n\n1️⃣ General\n2️⃣ SC\n3️⃣ ST\n4️⃣ OBC\n5️⃣ Prefer not to say\n\nReply with 1–5`,

  q6: () =>
    `💰 *Question 6 of 8*\nAnnual family income?\n\n1️⃣ Below ₹1 Lakh\n2️⃣ ₹1 – 3 Lakh\n3️⃣ ₹3 – 8 Lakh\n4️⃣ Above ₹8 Lakh\n\nReply with 1–4`,

  q7: () =>
    `📋 *Question 7 of 8*\nDo you hold a *BPL* (Below Poverty Line) ration card?\n\n1️⃣ Yes\n2️⃣ No\n\nReply with 1 or 2`,

  q8: () =>
    `⭐ *Question 8 of 8*\nDo you belong to any of these? _(optional — reply 4 to skip)_\n\n1️⃣ Person with Disability\n2️⃣ Woman Farmer\n3️⃣ Youth (18–35)\n4️⃣ None / Skip\n\nReply with 1, 2, 3, or 4`,

  invalid: (hint: string) =>
    `⚠️ Invalid reply. ${hint}`,

  profileSaved: (name: string, link: string) =>
    `✅ *Profile saved, ${name}!*\n\nHere is your personalized scheme dashboard:\n🔗 ${link}\n\nThis link is valid for 24 hours.\n\nType *menu* anytime to see options.`,

  schemeLink: (view: string, link: string) =>
    `🔗 Open your *${view}* dashboard:\n${link}\n\n_(Link valid for 24 hours)_`,

  profileReset: () =>
    `🔄 Let's update your profile.\n\nWhat is your *full name*?`,
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function extractPhone(from: string): string {
  // Twilio sends "whatsapp:+919876543210" — strip prefix and country code
  let phone = from.replace('whatsapp:+', '').replace('whatsapp:', '').replace('+', '');
  // Strip Indian country code (91) if present and number is 12 digits
  if (phone.startsWith('91') && phone.length === 12) {
    phone = phone.slice(2);
  }
  return phone;
}

/**
 * Run matching engine → persist results in UserSession → return shareable link.
 * Reuses an existing valid session for the same phone + view if one exists,
 * so the matching engine is not re-run on every menu tap.
 */
async function createSessionLink(
  user: InstanceType<typeof User>,
  view: 'schemes' | 'insurance' | 'financial' | 'all' = 'all',
): Promise<string> {

  // ── Cache check: reuse existing valid session for this phone + view ──
  const existing = await UserSession.findOne({
    phone:     user.phone,
    view,
    expiresAt: { $gt: new Date() },
  }).sort({ createdAt: -1 });

  if (existing) {
    return `${FRONTEND_URL}?token=${existing.token}`;
  }

  // ── No valid session — run matching engine and create a new one ──
  const profile: UserProfile = {
    state:           user.state,
    farmerType:      user.farmerType,
    ageRange:        user.ageRange,
    incomeRange:     user.incomeRange,
    caste:           user.caste,
    landOwnership:   user.landOwnership,
    isBPL:           user.isBPL,
    specialCategory: user.specialCategory,
  };

  const { eligible: eligibleSchemeIds, nearMiss: nearMissData } = await matchSchemes(profile);

  const token     = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + SESSION_TTL_HOURS * 60 * 60 * 1000);

  await UserSession.create({
    token,
    phone:  user.phone,
    userId: user._id.toString(),
    eligibleSchemeIds,
    nearMissData,
    view,
    expiresAt,
  });

  return `${FRONTEND_URL}?token=${token}`;
}


// ─── Main Handler ─────────────────────────────────────────────────────────────

export const handleWhatsappWebhook = async (req: Request, res: Response): Promise<void> => {
  // Twilio expects 200 OK immediately — reply with empty TwiML
  res.set('Content-Type', 'text/xml');
  res.status(200).send('<Response></Response>');

  try {
    const from: string = req.body.From || '';
    const body: string = (req.body.Body || '').trim();

    if (!from) return;

    const phone = extractPhone(from);
    const text  = body.toLowerCase();

    // Load or create session
    let session = await WhatsappSession.findOne({ phone });
    if (!session) {
      session = await WhatsappSession.create({ phone, state: 'new', answers: {} });
    }

    // Update activity timestamp
    session.lastActivityAt = new Date();

    // ── Handle "menu" keyword at any time ──
    if (text === 'menu' || text === 'hi' || text === 'hello' || text === 'start') {
      const user = await User.findOne({ phone });
      if (user) {
        session.state = 'menu';
        await session.save();
        await sendWhatsAppMessage(phone, MSG.welcome(user.name));
        return;
      }
      // No user — start onboarding
      session.state = 'ask_name';
      await session.save();
      await sendWhatsAppMessage(phone, MSG.newUser());
      return;
    }

    // ── Route by session state ──
    await handleState(phone, text, body, session);

  } catch (err) {
    console.error('Webhook error:', err);
    // Try to notify the user so they’re not left with silence
    try {
      const phone = extractPhone(req.body.From || '');
      if (phone) {
        await sendWhatsAppMessage(
          phone,
          `⚠️ Something went wrong. Please type *hi* to start again.`
        );
      }
    } catch (_) { /* ignore send failure */ }
  }
};

// ─── State Machine ────────────────────────────────────────────────────────────

async function handleState(
  phone: string,
  text: string,
  originalBody: string,
  session: IWhatsAppSession
): Promise<void> {

  const state = session.state as SessionState;

  switch (state) {

    // ── new: first ever message, no prior session ──
    case 'new': {
      const user = await User.findOne({ phone });
      if (user) {
        session.state = 'menu';
        await session.save();
        await sendWhatsAppMessage(phone, MSG.welcome(user.name));
      } else {
        session.state = 'ask_name';
        await session.save();
        await sendWhatsAppMessage(phone, MSG.newUser());
      }
      break;
    }

    // ── Onboarding ──
    case 'ask_name': {
      const name = originalBody.trim();
      if (name.length < 2) {
        await sendWhatsAppMessage(phone, MSG.invalid('Please enter your full name.'));
        return;
      }
      session.answers = { ...session.answers, name };
      session.state   = 'q1_state';
      session.markModified('answers');
      await session.save();
      await sendWhatsAppMessage(phone, MSG.q1());
      break;
    }

    case 'q1_state': {
      const stateName = originalBody.trim();
      if (stateName.length < 2) {
        await sendWhatsAppMessage(phone, MSG.invalid('Please enter your state name.'));
        return;
      }
      session.answers = { ...session.answers, state: stateName };
      session.state   = 'q2_farmer_type';
      session.markModified('answers');
      await session.save();
      await sendWhatsAppMessage(phone, MSG.q2());
      break;
    }

    case 'q2_farmer_type': {
      const val = FARMER_TYPE_MAP[text];
      if (!val) {
        await sendWhatsAppMessage(phone, MSG.invalid('Please reply with a number from 1 to 6.'));
        return;
      }
      session.answers = { ...session.answers, farmerType: val };
      session.state   = 'q3_land';
      session.markModified('answers');
      await session.save();
      await sendWhatsAppMessage(phone, MSG.q3());
      break;
    }

    case 'q3_land': {
      const val = LAND_MAP[text];
      if (!val) {
        await sendWhatsAppMessage(phone, MSG.invalid('Please reply with 1, 2, or 3.'));
        return;
      }
      session.answers = { ...session.answers, landOwnership: val };
      session.state   = 'q4_age';
      session.markModified('answers');
      await session.save();
      await sendWhatsAppMessage(phone, MSG.q4());
      break;
    }

    case 'q4_age': {
      const val = AGE_MAP[text];
      if (!val) {
        await sendWhatsAppMessage(phone, MSG.invalid('Please reply with 1, 2, 3, or 4.'));
        return;
      }
      session.answers = { ...session.answers, ageRange: val };
      session.state   = 'q5_caste';
      session.markModified('answers');
      await session.save();
      await sendWhatsAppMessage(phone, MSG.q5());
      break;
    }

    case 'q5_caste': {
      const val = CASTE_MAP[text];
      if (!val) {
        await sendWhatsAppMessage(phone, MSG.invalid('Please reply with a number from 1 to 5.'));
        return;
      }
      session.answers = { ...session.answers, caste: val };
      session.state   = 'q6_income';
      session.markModified('answers');
      await session.save();
      await sendWhatsAppMessage(phone, MSG.q6());
      break;
    }

    case 'q6_income': {
      const val = INCOME_MAP[text];
      if (!val) {
        await sendWhatsAppMessage(phone, MSG.invalid('Please reply with a number from 1 to 4.'));
        return;
      }
      session.answers = { ...session.answers, incomeRange: val };
      session.state   = 'q7_bpl';
      session.markModified('answers');
      await session.save();
      await sendWhatsAppMessage(phone, MSG.q7());
      break;
    }

    case 'q7_bpl': {
      if (text !== '1' && text !== '2') {
        await sendWhatsAppMessage(phone, MSG.invalid('Please reply with 1 (Yes) or 2 (No).'));
        return;
      }
      session.answers = { ...session.answers, isBPL: text === '1' };
      session.state   = 'q8_special';
      session.markModified('answers');
      await session.save();
      await sendWhatsAppMessage(phone, MSG.q8());
      break;
    }

    case 'q8_special': {
      const a = session.answers;
      let specialCategory: string[] = [];

      if (text !== '4') {
        const val = SPECIAL_MAP[text];
        if (!val) {
          await sendWhatsAppMessage(phone, MSG.invalid('Please reply with 1, 2, 3, or 4.'));
          return;
        }
        specialCategory = [val];
      }

      // ── Save user profile ──
      const profileData = {
        phone,
        name:            a.name!,
        state:           a.state!,
        farmerType:      a.farmerType      as any,
        landOwnership:   a.landOwnership   as any,
        ageRange:        a.ageRange        as any,
        caste:           a.caste           as any,
        incomeRange:     a.incomeRange     as any,
        isBPL:           a.isBPL,
        specialCategory,
        isPhoneVerified: true,
      };

      try {
        const user = await User.findOneAndUpdate(
          { phone },
          { $set: profileData },
          { upsert: true, new: true, runValidators: true }
        );

        // Invalidate any cached sessions so the next request re-runs matching
        await UserSession.deleteMany({ phone });

        // Run matching engine + create session link
        const link = await createSessionLink(user!, 'all');

        session.state  = 'complete';
        session.userId = user!._id.toString();
        await session.save();

        await sendWhatsAppMessage(phone, MSG.profileSaved(a.name!, link));
      } catch (saveErr) {
        console.error('Failed to save user profile:', saveErr);
        // Reset session so user can try again
        session.state   = 'ask_name';
        session.answers = {};
        session.markModified('answers');
        await session.save();
        await sendWhatsAppMessage(
          phone,
          `❌ Something went wrong saving your profile. Let's start over.\n\nWhat is your *full name*?`
        );
      }
      break;
    }

    // ── Returning user menu ──
    case 'menu':
    case 'complete': {
      const user = await User.findOne({ phone });
      if (!user) {
        // Profile somehow missing — restart
        session.state   = 'ask_name';
        session.answers = {};
        session.markModified('answers');
        await session.save();
        await sendWhatsAppMessage(phone, MSG.newUser());
        return;
      }

      switch (text) {
        case '1': {
          // Update profile — restart onboarding
          session.state   = 'ask_name';
          session.answers = {};
          session.markModified('answers');
          await session.save();
          await sendWhatsAppMessage(phone, MSG.profileReset());
          break;
        }
        case '2': {
          const link = await createSessionLink(user, 'schemes');
          await sendWhatsAppMessage(phone, MSG.schemeLink('Eligible Schemes', link));
          break;
        }
        case '3': {
          const link = await createSessionLink(user, 'insurance');
          await sendWhatsAppMessage(phone, MSG.schemeLink('Insurance Schemes', link));
          break;
        }
        case '4': {
          const link = await createSessionLink(user, 'financial');
          await sendWhatsAppMessage(phone, MSG.schemeLink('Financial Support', link));
          break;
        }
        default: {
          await sendWhatsAppMessage(phone, MSG.welcome(user.name));
          break;
        }
      }
      break;
    }

    default:
      break;
  }
}
