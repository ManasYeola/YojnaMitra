'use strict';

/**
 * fetchScheme.js — Fetch and transform a single scheme's detail
 *
 * Endpoint:  GET /schemes/v6/public/schemes?slug={slug}&lang=en
 *
 * Actual API response shape (confirmed by live probe):
 *   data._id                                      ← scheme ID
 *   data.slug                                     ← slug
 *   data.en.basicDetails.schemeName               ← name
 *   data.en.basicDetails.level.label              ← level (object, not string)
 *   data.en.basicDetails.state.label              ← state (object, not string)
 *   data.en.basicDetails.schemeCategory[].label   ← categories
 *   data.en.basicDetails.tags[]                   ← plain string array
 *   data.en.schemeContent.detailedDescription_md  ← description
 *   data.en.schemeContent.benefits_md             ← benefits
 *   data.en.schemeContent.exclusions_md           ← exclusions
 *   data.en.eligibilityCriteria.eligibilityDescription_md
 *   data.en.applicationProcess[].process_md       ← array; joined
 */

const { get } = require('./apiClient');
const logger = require('../utils/logger');

/**
 * Fetch raw scheme data for the given slug.
 *
 * @param {string} slug
 * @returns {Promise<object>} Raw scheme object: { _id, slug, en: {...} }
 */
const fetchSchemeBySlug = async (slug) => {
  const response = await get('/schemes/v6/public/schemes', {
    params: { slug, lang: 'en' },
  });

  // Response: { status, data: { _id, slug, en: { basicDetails, ... } } }
  const rawData = response.data?.data;

  if (!rawData) {
    throw new Error(`API returned no data for slug: "${slug}"`);
  }

  if (!rawData._id) {
    throw new Error(`API data for slug "${slug}" is missing _id`);
  }

  return rawData; // { _id, slug, en: { basicDetails, schemeContent, ... } }
};

/**
 * Join process_md strings from the applicationProcess array into one block.
 * @param {Array} processList
 * @returns {string}
 */
const joinProcessMd = (processList) => {
  if (!Array.isArray(processList) || processList.length === 0) return '';
  return processList
    .map((p) => p?.process_md || '')
    .filter(Boolean)
    .join('\n\n');
};

/**
 * Transform the raw API scheme object into the structure expected by
 * the `schemes` MongoDB collection.
 *
 * @param {object} rawScheme - Full scheme object: { _id, slug, en }
 * @param {string} slug      - The slug used to fetch this scheme
 * @returns {object} Transformed scheme document ready for upsert
 */
const transformScheme = (rawScheme, slug) => {
  const { _id: apiId, en = {} } = rawScheme;

  const {
    basicDetails        = {},
    schemeContent       = {},
    eligibilityCriteria = {},
    applicationProcess  = [],
  } = en;

  return {
    _id:   slug,   // slug is the guaranteed-unique MongoDB key
    apiId,         // API's internal _id — used for documents/FAQs sub-calls
    slug,

    // ── Core display fields ───────────────────────────────────────────
    name: basicDetails.schemeName || '',

    // level and state come as { value, label } objects — extract the label
    level: basicDetails.level?.label || basicDetails.level || '',
    state: basicDetails.state?.label || basicDetails.state || '',

    // schemeCategory is [{ value, label }] — flatten to label strings
    category: (basicDetails.schemeCategory || [])
      .map((c) => c?.label)
      .filter(Boolean),

    // tags is a plain string array
    tags: Array.isArray(basicDetails.tags) ? basicDetails.tags : [],

    // ── Raw block (kept for downstream queries) ───────────────────────
    basicDetails,

    // ── Markdown content fields ───────────────────────────────────────
    description_md:        schemeContent.detailedDescription_md          || '',
    benefits_md:           schemeContent.benefits_md                     || '',
    exclusions_md:         schemeContent.exclusions_md                   || '',
    eligibility_md:        eligibilityCriteria.eligibilityDescription_md || '',
    // process_md lives in schemeContent directly; applicationProcess[] is a fallback
    applicationProcess_md: schemeContent.process_md || joinProcessMd(applicationProcess),

    // ── Placeholders — populated by fetchDocuments / fetchFaqs ────────
    documents:            [],
    documentsRequired_md: '',
    faqs:                 [],

    // ── Sync metadata ─────────────────────────────────────────────────
    lastSyncedAt:  new Date(),
    sourceVersion: 'v6',
    // isActive is NOT set here — computed from tag matching in syncSchemes.js
  };
};

module.exports = { fetchSchemeBySlug, transformScheme };
