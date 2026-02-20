'use strict';

/**
 * fetchFaqs.js — Fetch Frequently Asked Questions for a scheme
 *
 * Endpoint:  GET /schemes/v6/public/schemes/{schemeId}/faqs?lang=en
 *
 * Confirmed response shape:
 *   data._id
 *   data.schemeId
 *   data.en.faqs[]
 *     .question   ← plain string
 *     .answer     ← rich-text array (skip — use answer_md)
 *     .answer_md  ← plain markdown string
 */

const { get } = require('./apiClient');
const logger = require('../utils/logger');

/**
 * Fetch FAQs for the given scheme ID.
 *
 * @param {string} schemeId - The scheme's `_id` from the API
 * @returns {Promise<Array<{ question: string, answer_md: string }>>}
 */
const fetchFaqs = async (schemeId) => {
  const response = await get(
    `/schemes/v6/public/schemes/${schemeId}/faqs`,
    { params: { lang: 'en' } }
  );

  // Actual path: response.data.data.en.faqs
  const rawFaqs = response.data?.data?.en?.faqs ?? [];

  const faqs = rawFaqs
    .filter((item) => item?.question)          // drop empty entries
    .map((item) => ({
      question:  item.question,
      answer_md: item.answer_md ?? '',         // answer[] is rich-text — use _md variant
    }));

  logger.debug(`  FAQs fetched for ${schemeId}: ${faqs.length} items`);

  return faqs;
};

module.exports = { fetchFaqs };
