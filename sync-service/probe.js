require('dotenv').config();
const axios = require('axios');

const headers = {
  'x-api-key': process.env.API_KEY,
  'accept': 'application/json, text/plain, */*',
  'accept-language': 'en-GB,en-US;q=0.9,en;q=0.8',
  'origin': 'https://www.myscheme.gov.in',
  'referer': 'https://www.myscheme.gov.in/',
  'sec-ch-ua': '"Not:A-Brand";v="99", "Google Chrome";v="145", "Chromium";v="145"',
  'sec-ch-ua-mobile': '?1',
  'sec-ch-ua-platform': '"Android"',
  'sec-fetch-dest': 'empty',
  'sec-fetch-mode': 'cors',
  'sec-fetch-site': 'same-site',
  'user-agent': 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Mobile Safari/537.36',
};

axios.get('https://api.myscheme.gov.in/schemes/v6/public/schemes', {
  params: { slug: 'syss', lang: 'en' },
  headers,
  timeout: 10000,
}).then(r => {
  // Print only the top-level keys and the en language block (without rich-text arrays)
  const raw = r.data.data;
  console.log('=== TOP-LEVEL KEYS ===');
  console.log(Object.keys(raw));

  const en = raw.en;
  console.log('\n=== en.basicDetails ===');
  console.log(JSON.stringify(en.basicDetails, null, 2));

  console.log('\n=== en.schemeContent KEYS ===');
  console.log(Object.keys(en.schemeContent));

  console.log('\n=== en.schemeContent (md fields only) ===');
  const sc = en.schemeContent;
  const mdFields = Object.fromEntries(
    Object.entries(sc).filter(([k, v]) => typeof v === 'string' && k.includes('md') || k === 'briefDescription')
  );
  console.log(JSON.stringify(mdFields, null, 2));

  // Check for eligibility / applicationProcess at top level or in schemeContent
  console.log('\n=== en.eligibilityCriteria TYPE ===', typeof en.eligibilityCriteria, Array.isArray(en.eligibilityCriteria));
  if (Array.isArray(en.eligibilityCriteria)) {
    console.log('KEYS of first item:', Object.keys(en.eligibilityCriteria[0] || {}));
    const md = en.eligibilityCriteria[0];
    console.log(JSON.stringify(Object.fromEntries(Object.entries(md||{}).filter(([k,v])=>typeof v==='string')), null, 2));
  } else {
    console.log(JSON.stringify(en.eligibilityCriteria, null, 2));
  }

  console.log('\n=== en.applicationProcess TYPE ===', typeof en.applicationProcess, Array.isArray(en.applicationProcess));
  if (Array.isArray(en.applicationProcess)) {
    console.log('KEYS of first item:', Object.keys(en.applicationProcess[0] || {}));
    const ap = en.applicationProcess[0];
    console.log(JSON.stringify(Object.fromEntries(Object.entries(ap||{}).filter(([k,v])=>typeof v==='string')), null, 2));
  }

}).catch(e => {
  console.error('ERR', e?.response?.status, JSON.stringify(e?.response?.data ?? e.message, null, 2));
});
