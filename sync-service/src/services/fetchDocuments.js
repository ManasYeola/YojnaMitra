'use strict';

/**
 * fetchDocuments.js — Fetch required documents for a scheme
 *
 * Endpoint:  GET /schemes/v6/public/schemes/{schemeId}/documents?lang=en
 *
 * Confirmed response shape:
 *   data._id
 *   data.schemeId
 *   data.en.documents_required   ← structured rich-text array
 *   data.en.documentsRequired_md ← plain markdown string
 */

const { get } = require('./apiClient');
const logger = require('../utils/logger');

/**
 * Fetch documents required for the given scheme ID.
 *
 * @param {string} schemeId - The scheme's `_id` from the API
 * @returns {Promise<{ documents_required: Array, documentsRequired_md: string }>}
 */
const fetchDocuments = async (schemeId) => {
  const response = await get(
    `/schemes/v6/public/schemes/${schemeId}/documents`,
    { params: { lang: 'en' } }
  );

  // Actual path: response.data.data.en
  const en = response.data?.data?.en ?? {};

  const documents_required  = Array.isArray(en.documents_required) ? en.documents_required : [];
  const documentsRequired_md = en.documentsRequired_md ?? '';

  logger.debug(`  Documents fetched for ${schemeId}: ${documents_required.length} items`);

  return { documents_required, documentsRequired_md };
};

module.exports = { fetchDocuments };
