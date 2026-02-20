'use strict';

/**
 * retry.js — Configurable async retry utility
 *
 * Retries a failing async function up to `maxAttempts` times.
 * Special cases:
 *  - 429 Too Many Requests: always retry after honouring Retry-After header
 *  - Other 4xx: do NOT retry (client error, won't change)
 *  - 5xx / network: retry with linear back-off
 */

const logger = require('./logger');
const { delay } = require('./delay');

/** Default wait when the API returns 429 but no Retry-After header */
const DEFAULT_RATE_LIMIT_DELAY_MS = 10_000; // 10 seconds

/**
 * Parse the Retry-After header (seconds integer or HTTP-date) into ms.
 * Returns DEFAULT_RATE_LIMIT_DELAY_MS if the header is absent/unparseable.
 *
 * @param {object} response - Axios response object
 * @returns {number} milliseconds to wait
 */
const parseRetryAfterMs = (response) => {
  const header = response?.headers?.['retry-after'];
  if (!header) return DEFAULT_RATE_LIMIT_DELAY_MS;

  const seconds = parseInt(header, 10);
  if (!isNaN(seconds)) return seconds * 1000;

  // HTTP-date format
  const date = new Date(header);
  if (!isNaN(date.getTime())) {
    const ms = date.getTime() - Date.now();
    return ms > 0 ? ms : DEFAULT_RATE_LIMIT_DELAY_MS;
  }

  return DEFAULT_RATE_LIMIT_DELAY_MS;
};

/**
 * Execute `fn` and retry on failure.
 *
 * @param {Function} fn           - Async function to attempt
 * @param {object}   [options]
 * @param {number}   [options.maxAttempts=2]    - Total attempts (1 = no retry)
 * @param {number}   [options.baseDelayMs=1500] - Delay before first non-429 retry
 * @param {string}   [options.context='']       - Label for log messages
 * @returns {Promise<*>} Resolves with `fn`'s return value
 * @throws  Last error after all attempts are exhausted
 */
const withRetry = async (fn, { maxAttempts = 2, baseDelayMs = 1500, context = '' } = {}) => {
  let lastError;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      const statusCode = error?.response?.status;

      // ── 429 Too Many Requests — always retry after honouring Retry-After ──
      if (statusCode === 429) {
        if (attempt < maxAttempts) {
          const waitMs = parseRetryAfterMs(error.response);
          logger.warn(
            `Rate limited (429) for ${context} — waiting ${waitMs}ms before retry ` +
              `(attempt ${attempt}/${maxAttempts})`
          );
          await delay(waitMs);
          continue;
        }
        // Exhausted retries on 429
        logger.error(`Rate limit retries exhausted for ${context}`);
        throw error;
      }

      // ── Other 4xx — do NOT retry (client error, won't change) ──────
      if (statusCode && statusCode >= 400 && statusCode < 500) {
        logger.warn(`Non-retryable HTTP ${statusCode} for ${context}: ${error.message}`);
        throw error;
      }

      // ── 5xx / network — retry with linear back-off ──────────────────
      if (attempt < maxAttempts) {
        const waitMs = baseDelayMs * attempt;
        logger.warn(
          `Attempt ${attempt}/${maxAttempts} failed for ${context}: ${error.message}. ` +
            `Retrying in ${waitMs}ms…`
        );
        await delay(waitMs);
      }
    }
  }

  logger.error(`All ${maxAttempts} attempts failed for ${context}: ${lastError.message}`);
  throw lastError;
};

module.exports = { withRetry };
