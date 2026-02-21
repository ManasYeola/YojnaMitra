// WhatsApp chatbot configuration

export const STATES = [
  { id: 1, name: 'Maharashtra', value: 'maharashtra' },
  { id: 2, name: 'Gujarat', value: 'gujarat' },
  { id: 3, name: 'Karnataka', value: 'karnataka' },
  { id: 4, name: 'Punjab', value: 'punjab' },
  { id: 5, name: 'Rajasthan', value: 'rajasthan' },
  { id: 6, name: 'Uttar Pradesh', value: 'uttar pradesh' },
  { id: 7, name: 'Madhya Pradesh', value: 'madhya pradesh' },
  { id: 8, name: 'Tamil Nadu', value: 'tamil nadu' },
];

export const OCCUPATION_TYPES = [
  { id: 1, name: 'Farmer (Crop)', value: 'crop_farmer' },
  { id: 2, name: 'Dairy Farmer', value: 'dairy_farmer' },
  { id: 3, name: 'Fisherman', value: 'fisherman' },
  { id: 4, name: 'Agriculture Labourer', value: 'agri_labourer' },
  { id: 5, name: 'Agri Entrepreneur', value: 'agri_entrepreneur' },
  { id: 6, name: 'Other', value: 'other' },
];

export const LAND_OWNERSHIP = [
  { id: 1, name: 'Yes (Own Land)', value: 'owned' },
  { id: 2, name: 'No (Landless)', value: 'landless' },
  { id: 3, name: 'On Lease', value: 'leased' },
];

export const AGE_RANGES = [
  { id: 1, name: 'Below 18', value: 'below_18' },
  { id: 2, name: '18-40', value: '18_40' },
  { id: 3, name: '41-60', value: '41_60' },
  { id: 4, name: 'Above 60', value: 'above_60' },
];

export const CASTE_CATEGORIES = [
  { id: 1, name: 'General', value: 'general' },
  { id: 2, name: 'SC', value: 'sc' },
  { id: 3, name: 'ST', value: 'st' },
  { id: 4, name: 'OBC', value: 'obc' },
  { id: 5, name: 'Prefer not to say', value: 'not_specified' },
];

export const INCOME_RANGES = [
  { id: 1, name: 'Below ₹1 Lakh', value: 'below_1l' },
  { id: 2, name: '₹1-3 Lakh', value: '1l_3l' },
  { id: 3, name: '₹3-8 Lakh', value: '3l_8l' },
  { id: 4, name: 'Above ₹8 Lakh', value: 'above_8l' },
];

export const BPL_OPTIONS = [
  { id: 1, name: 'Yes', value: 'yes' },
  { id: 2, name: 'No', value: 'no' },
];

export const SPECIAL_CATEGORIES = [
  { id: 1, name: 'Person with Disability', value: 'pwd' },
  { id: 2, name: 'Woman Farmer', value: 'woman' },
  { id: 3, name: 'Youth (18-35)', value: 'youth' },
  { id: 4, name: 'None', value: 'none' },
];

export const MESSAGES = {
  GREETING: `🙏 *Namaste! Welcome to YojnaMitra*

Let's find the best government schemes for you!

*1️⃣ Which state do you live in?*

${STATES.map(s => `${s.id}. ${s.name}`).join('\n')}

Reply with the number (e.g., 1)`,

  OCCUPATION: `👨‍🌾 *2️⃣ What best describes you?*

${OCCUPATION_TYPES.map(o => `${o.id}. ${o.name}`).join('\n')}

Reply with the number`,

  LAND_OWNERSHIP: `🌾 *3️⃣ Do you own agricultural land?*

${LAND_OWNERSHIP.map(l => `${l.id}. ${l.name}`).join('\n')}

Reply with the number`,

  AGE: `📅 *4️⃣ Your age?*

${AGE_RANGES.map(a => `${a.id}. ${a.name}`).join('\n')}

Reply with the number`,

  CASTE: `📋 *5️⃣ Caste Category (Optional but helpful)*

${CASTE_CATEGORIES.map(c => `${c.id}. ${c.name}`).join('\n')}

Reply with the number`,

  INCOME: `💰 *6️⃣ Annual Family Income?*

${INCOME_RANGES.map(i => `${i.id}. ${i.name}`).join('\n')}

Reply with the number`,

  BPL: `🏠 *7️⃣ Are you a BPL card holder?*

${BPL_OPTIONS.map(b => `${b.id}. ${b.name}`).join('\n')}

Reply with the number`,

  SPECIAL_CATEGORY: `⭐ *8️⃣ Do you belong to any special category?*

${SPECIAL_CATEGORIES.map(s => `${s.id}. ${s.name}`).join('\n')}

You can select multiple (e.g., 2,3)
Or reply 4 for None`,

  PROCESSING: '⏳ Analyzing your profile and finding best schemes...',

  NO_SCHEMES: `❌ *No matching schemes found*

This could be because:
• No schemes available for your profile
• Very specific eligibility didn't match

Type *restart* to try again.`,

  ERROR: '⚠️ Sorry, something went wrong. Type *restart* to try again.',

  INVALID_INPUT: '❌ Invalid input. Please reply with numbers only (e.g., 1 or 2,3)',

  RESTART: "🔄 Starting fresh! Let's find schemes for you.",
};
