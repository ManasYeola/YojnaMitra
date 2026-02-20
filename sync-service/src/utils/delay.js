'use strict';

/**
 * delay.js — Simple async delay utility
 *
 * Used to throttle API requests and avoid hitting rate limits.
 */

/**
 * Pause execution for `ms` milliseconds.
 * @param {number} ms - Duration in milliseconds
 * @returns {Promise<void>}
 */
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

module.exports = { delay };
