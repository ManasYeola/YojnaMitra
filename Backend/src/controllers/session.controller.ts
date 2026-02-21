import { Request, Response } from 'express';
import crypto from 'crypto';
import UserSession from '../models/UserSession';
import schemesDb from '../config/schemesDb';
import { matchSchemes, UserProfile } from '../services/matchingEngine';

/**
 * GET /api/session/:token
 *
 * Validates the session token, then returns the full scheme documents
 * for every scheme ID stored in the session's `eligibleSchemeIds` array.
 *
 * Response:
 * {
 *   success: true,
 *   view: 'schemes' | 'insurance' | 'financial' | 'all',
 *   count: number,
 *   schemes: SyncedScheme[]
 * }
 */
export const getSession = async (req: Request, res: Response): Promise<void> => {
  try {
    const { token } = req.params;

    if (!token) {
      res.status(400).json({ success: false, message: 'Token is required' });
      return;
    }

    // ── Look up session ────────────────────────────────────────────────────
    const session = await UserSession.findOne({ token });

    if (!session) {
      res.status(404).json({ success: false, message: 'Session not found or expired' });
      return;
    }

    if (session.expiresAt < new Date()) {
      // Shouldn't normally reach here (TTL index removes it), but guard anyway
      await UserSession.deleteOne({ token });
      res.status(401).json({ success: false, message: 'Session has expired' });
      return;
    }

    if (!session.eligibleSchemeIds || session.eligibleSchemeIds.length === 0) {
      res.status(200).json({
        success: true,
        view: session.view,
        count: 0,
        schemes: [],
        message: 'No eligible schemes found for your profile. Try updating your profile for better matches.',
      });
      return;
    }

    // ── Fetch scheme documents from the synced schemes collection ──────────
    // Scheme _id is a string slug (set by sync-service), not an ObjectId
    const col = schemesDb.db!.collection<{ _id: string }>('schemes');

    const schemes = await col
      .find(
        { _id: { $in: session.eligibleSchemeIds } } as any,
        {
          projection: {
            _id: 1,
            name: 1,
            level: 1,
            state: 1,
            category: 1,
            tags: 1,
            description_md: 1,
            benefits_md: 1,
            eligibility_md: 1,
            applicationProcess_md: 1,
            documentsRequired_md: 1,
            documents: 1,
            basicDetails: 1,
          },
        },
      )
      .toArray();

    res.status(200).json({
      success: true,
      view:    session.view,
      count:   schemes.length,
      schemes,
    });
  } catch (error) {
    console.error('Session controller error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

/**
 * POST /api/session/create
 *
 * Manually create a session for a given user profile — bypasses WhatsApp.
 * Useful for testing the full matching → session → scheme-fetch pipeline.
 *
 * Body (all optional except state):
 * {
 *   phone?:           string   (stored in session for reference)
 *   state:            string   e.g. "Maharashtra"
 *   farmerType?:      "crop_farmer"|"dairy"|"fisherman"|"labourer"|"entrepreneur"|"other"
 *   ageRange?:        "below_18"|"18_40"|"41_60"|"above_60"
 *   incomeRange?:     "below_1L"|"1_3L"|"3_8L"|"above_8L"
 *   caste?:           "general"|"sc"|"st"|"obc"|"not_disclosed"
 *   landOwnership?:   "owned"|"leased"|"none"
 *   isBPL?:           boolean
 *   specialCategory?: string[]   e.g. ["woman","youth"]
 *   view?:            "schemes"|"insurance"|"financial"|"all"  (default: "all")
 * }
 *
 * Response:
 * {
 *   success: true,
 *   token: string,
 *   sessionUrl: string,
 *   matchedCount: number,
 *   expiresAt: string
 * }
 */
export const createSession = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      phone = 'test',
      state,
      farmerType,
      ageRange,
      incomeRange,
      caste,
      landOwnership,
      isBPL,
      specialCategory,
      view = 'all',
    } = req.body;

    if (!state) {
      res.status(400).json({ success: false, message: '"state" is required' });
      return;
    }

    const profile: UserProfile = {
      state,
      farmerType,
      ageRange,
      incomeRange,
      caste,
      landOwnership,
      isBPL,
      specialCategory,
    };

    const eligibleSchemeIds = await matchSchemes(profile);

    const token     = crypto.randomBytes(32).toString('hex');
    const ttlHours  = parseInt(process.env.SESSION_TTL_HOURS || '24');
    const expiresAt = new Date(Date.now() + ttlHours * 60 * 60 * 1000);

    await UserSession.create({ token, phone, eligibleSchemeIds, view, expiresAt });

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

    res.status(201).json({
      success:      true,
      token,
      sessionUrl:   `${frontendUrl}/session/${token}`,
      fetchUrl:     `/api/session/${token}`,
      matchedCount: eligibleSchemeIds.length,
      expiresAt:    expiresAt.toISOString(),
    });
  } catch (error) {
    console.error('createSession error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

