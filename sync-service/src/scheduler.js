'use strict';

/**
 * scheduler.js — Entry point for the YojanaMitra sync service
 *
 * Starts a node-cron job that fires every day at 02:00 IST.
 * The process keeps running indefinitely and handles graceful shutdown.
 *
 * Usage:
 *   node src/scheduler.js           — start the scheduler (keeps running)
 *   SYNC_ON_START=true node src/scheduler.js — also run immediately on boot
 */

// ── Load .env FIRST ───────────────────────────────────────────────────
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const cron   = require('node-cron');
const logger = require('./utils/logger');

// syncSchemes is imported after dotenv so env vars are available
const { syncSchemes } = require('./syncSchemes');

// ─────────────────────────────────────────────────────────────────────
//  Guard: ensure required env vars exist before doing anything
// ─────────────────────────────────────────────────────────────────────
const REQUIRED_ENV = ['MONGO_URI', 'API_KEY'];
const missing = REQUIRED_ENV.filter((k) => !process.env[k]);
if (missing.length > 0) {
  logger.error(`Missing required environment variables: ${missing.join(', ')}`);
  logger.error('Copy .env.example to .env and fill in all values.');
  process.exit(1);
}

// ─────────────────────────────────────────────────────────────────────
//  State
// ─────────────────────────────────────────────────────────────────────
let isSyncRunning = false;

// ─────────────────────────────────────────────────────────────────────
//  runSync — wrapper that prevents concurrent runs
// ─────────────────────────────────────────────────────────────────────
const runSync = async (trigger = 'scheduled') => {
  if (isSyncRunning) {
    logger.warn(`Sync already in progress — skipping ${trigger} trigger`);
    return;
  }

  isSyncRunning = true;
  logger.info(`Sync triggered by: ${trigger}`);

  try {
    await syncSchemes();
    logger.info(`Sync (${trigger}) completed successfully`);
  } catch (error) {
    logger.error(`Sync (${trigger}) failed: ${error.message}`);
  } finally {
    isSyncRunning = false;
  }
};

// ─────────────────────────────────────────────────────────────────────
//  Cron schedule:  0 2 * * *  =  every day at 02:00
// ─────────────────────────────────────────────────────────────────────
const CRON_SCHEDULE = '0 2 * * *';
const TIMEZONE      = 'Asia/Kolkata'; // IST — where Indian servers run

if (!cron.validate(CRON_SCHEDULE)) {
  logger.error(`Invalid cron expression: "${CRON_SCHEDULE}"`);
  process.exit(1);
}

const job = cron.schedule(
  CRON_SCHEDULE,
  () => runSync('cron'),
  {
    scheduled: true,
    timezone:  TIMEZONE,
  }
);

logger.info('═'.repeat(60));
logger.info('  YojanaMitra Sync Scheduler is running');
logger.info(`  Schedule : ${CRON_SCHEDULE}  (daily at 02:00 ${TIMEZONE})`);
logger.info(`  Node     : ${process.version}`);
logger.info(`  PID      : ${process.pid}`);
logger.info(`  Env      : ${process.env.NODE_ENV ?? 'development'}`);
logger.info('  Press Ctrl+C to stop');
logger.info('═'.repeat(60));

// ─────────────────────────────────────────────────────────────────────
//  Optional: run immediately on startup
// ─────────────────────────────────────────────────────────────────────
if (process.env.SYNC_ON_START === 'true') {
  logger.info('SYNC_ON_START=true — launching initial sync now…');
  runSync('startup');
}

// ─────────────────────────────────────────────────────────────────────
//  Graceful shutdown handlers
// ─────────────────────────────────────────────────────────────────────

/**
 * Attempt a clean shutdown:
 *  1. Stop accepting new cron triggers
 *  2. Wait for any in-flight sync to finish (up to 5 min)
 *  3. Exit
 */
const gracefulShutdown = async (signal) => {
  logger.info(`Received ${signal} — initiating graceful shutdown…`);

  job.stop();
  logger.info('Cron job stopped');

  if (isSyncRunning) {
    logger.info('Waiting for in-progress sync to finish (max 5 minutes)…');
    const deadline = Date.now() + 5 * 60 * 1000;

    await new Promise((resolve) => {
      const poll = setInterval(() => {
        if (!isSyncRunning || Date.now() > deadline) {
          clearInterval(poll);
          resolve();
        }
      }, 2000);
    });
  }

  logger.info('Shutdown complete — bye 👋');
  process.exit(0);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT',  () => gracefulShutdown('SIGINT'));

// ─────────────────────────────────────────────────────────────────────
//  Safety nets — log and survive unexpected errors
// ─────────────────────────────────────────────────────────────────────
process.on('uncaughtException', (error) => {
  logger.error('Uncaught exception — process will exit', {
    message: error.message,
    stack:   error.stack,
  });
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled promise rejection', {
    reason: reason instanceof Error ? reason.message : reason,
  });
  // Do NOT exit — the scheduler must stay alive
});
