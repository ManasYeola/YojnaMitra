'use strict';

/**
 * fetchSearch.js — Fetch all scheme slugs from the MyScheme search API
 *
 * Endpoint:  GET /search/v6/schemes
 * Strategy:  Paginate (size=50) until all slugs are retrieved.
 *            Adds 800 ms delay between pages to respect rate limits.
 *
 * Confirmed response shape:
 *   data.summary.total          ← authoritative total count
 *   data.hits.page.total        ← same value, secondary reference
 *   data.hits.items[].fields.slug
 */

const { get } = require('./apiClient');
const { delay } = require('../utils/delay');
const logger = require('../utils/logger');

const PAGE_SIZE = 50;
const PAGE_DELAY_MS = 1000;

/**
 * Fetch a single search page.
 *
 * @param {number} from     - Zero-based offset
 * @param {string} category - Exact schemeCategory value from MyScheme API
 *                            e.g. "Agriculture,Rural & Environment"
 *                            Empty string = no filter (all categories)
 * @returns {Promise<object>} Raw API response data
 */
const fetchSearchPage = async (from, category = '') => {
  const params = {
    lang:    'en',
    from,
    size:    PAGE_SIZE,
    keyword: '',    // must be present but empty (as real browser sends)
    sort:    '',    // must be present but empty
  };

  // The API uses a structured `q` param — a JSON array of filter objects.
  // Format:  [{"identifier":"schemeCategory","value":"<exact category name>"}]
  if (category) {
    params.q = JSON.stringify([{ identifier: 'schemeCategory', value: category }]);
  }

  const response = await get('/search/v6/schemes', { params });
  return response.data;
};

/**
 * Fetch scheme slugs from the search API.
 *
 * @param {object} [options]
 * @param {number} [options.limit]    - Stop after collecting this many slugs.
 *                                     Undefined / 0 = fetch everything.
 * @param {string} [options.category] - Filter keyword (e.g. "Agriculture,Rural & Environment").
 *                                     Empty string = no filter.
 * @returns {Promise<string[]>} Collected slugs
 */
const fetchAllSlugs = async ({ limit = 0, category = '' } = {}) => {
  const filterLabel = category ? `category="${category}"` : 'no filter';
  const limitLabel  = limit    ? `limit=${limit}`          : 'no limit';
  logger.info(`──── Fetching slugs [${filterLabel}, ${limitLabel}] ────`);

  const allSlugs = [];
  let from  = 0;
  let total = null;

  do {
    logger.info(`  Fetching page: offset=${from}`);

    const data = await fetchSearchPage(from, category);

    // ── Parse total on first call ────────────────────────────────────
    // Use data.summary.total (authoritative) with data.hits.page.total as fallback
    if (total === null) {
      total =
        data?.data?.summary?.total ??
        data?.data?.hits?.page?.total ??
        0;

      if (total === 0) {
        logger.warn('Search API returned total=0. No schemes to sync.');
        return [];
      }

      logger.info(`  Total schemes reported by API: ${total}`);
    }

    // ── Extract slugs from this page ─────────────────────────────────
    const items = data?.data?.hits?.items ?? [];
    const slugsOnPage = items
      .map((item) => item?.fields?.slug)
      .filter(Boolean);

    if (slugsOnPage.length === 0) {
      logger.warn(`  Page offset=${from} returned 0 slugs — stopping early`);
      break;
    }

    // If a limit is set, only take as many as needed to reach it
    if (limit > 0 && allSlugs.length + slugsOnPage.length >= limit) {
      const needed = limit - allSlugs.length;
      allSlugs.push(...slugsOnPage.slice(0, needed));
      logger.info(`  Limit reached — collected ${allSlugs.length} slugs (stopped early)`);
      break;
    }

    allSlugs.push(...slugsOnPage);
    logger.info(`  Got ${slugsOnPage.length} slugs (running total: ${allSlugs.length}/${total})`);

    from += PAGE_SIZE;

    // Polite delay between pages — skip after last page
    if (from < total) {
      await delay(PAGE_DELAY_MS);
    }

  } while (from < total);

  logger.info(`──── Slug fetch complete: ${allSlugs.length} slugs collected ────`);
  return allSlugs;
};

module.exports = { fetchAllSlugs };
