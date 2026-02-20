'use strict';

/**
 * apiClient.js — Shared Axios instance for MyScheme API
 *
 * All service modules import this singleton so that:
 *  - Auth headers are set in one place
 *  - Timeouts are consistent
 *  - Request/response logging is centralised
 *  - The API key is never hardcoded
 */

const axios = require('axios');
const logger = require('../utils/logger');

const BASE_URL = 'https://api.myscheme.gov.in';
const TIMEOUT_MS = 10_000; // 10 seconds per API specification

/**
 * Build an Axios instance.
 * Called lazily so that process.env.API_KEY is loaded (via dotenv) before
 * this module is first evaluated.
 */
let _client = null;

const getClient = () => {
  if (_client) return _client;

  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error('API_KEY is not defined in environment variables');
  }

  _client = axios.create({
    baseURL: BASE_URL,
    timeout: TIMEOUT_MS,
    headers: {
      // ── Auth ────────────────────────────────────────────────────
      'x-api-key': apiKey,

      // ── Browser simulation headers (required by MyScheme API) ──
      // The API validates these and rejects plain server-side requests
      'accept':           'application/json, text/plain, */*',
      'accept-language':  'en-GB,en-US;q=0.9,en;q=0.8',
      'origin':           'https://www.myscheme.gov.in',
      'referer':          'https://www.myscheme.gov.in/',
      'priority':         'u=1, i',
      'sec-ch-ua':        '"Not:A-Brand";v="99", "Google Chrome";v="145", "Chromium";v="145"',
      'sec-ch-ua-mobile': '?1',
      'sec-ch-ua-platform': '"Android"',
      'sec-fetch-dest':   'empty',
      'sec-fetch-mode':   'cors',
      'sec-fetch-site':   'same-site',
      'user-agent':       'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Mobile Safari/537.36',
    },
  });

  // ── Request interceptor: log every outgoing call ──────────────────
  _client.interceptors.request.use((config) => {
    logger.debug(`→ ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`, {
      params: config.params,
    });
    return config;
  });

  // ── Response interceptor: log status & surface useful errors ──────
  _client.interceptors.response.use(
    (response) => {
      logger.debug(`← ${response.status} ${response.config.url}`);
      return response;
    },
    (error) => {
      const status = error?.response?.status;
      const url    = error?.config?.url ?? 'unknown';
      const msg    = error?.response?.data?.message ?? error.message;

      logger.error(`API error ${status ?? 'NETWORK'} on ${url}: ${msg}`);
      return Promise.reject(error);
    }
  );

  return _client;
};

/**
 * Convenience wrapper so callers can simply do:
 *   const { get } = require('./apiClient');
 *   const res = await get('/path', { params: {...} });
 */
const get = (url, config = {}) => getClient().get(url, config);

module.exports = { getClient, get };
