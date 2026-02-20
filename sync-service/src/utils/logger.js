'use strict';

/**
 * logger.js — Winston-based structured logger
 *
 * Features:
 *  - Coloured console output in development
 *  - JSON file output for production log aggregation
 *  - Rotating daily log files (error + combined)
 *  - Automatic `logs/` directory creation
 */

const winston = require('winston');
const DailyRotateFile = require('winston-daily-rotate-file');
const path = require('path');
const fs = require('fs');

// ── Ensure logs directory exists ─────────────────────────────────────
const logsDir = path.join(__dirname, '../../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// ── Custom console format (human-readable) ───────────────────────────
const consoleFormat = winston.format.combine(
  winston.format.colorize({ all: true }),
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    const metaStr = Object.keys(meta).length
      ? `  ${JSON.stringify(meta, null, 0)}`
      : '';
    return `[${timestamp}] ${level}: ${message}${metaStr}`;
  })
);

// ── JSON format for log files ─────────────────────────────────────────
const fileFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

// ── Transports ────────────────────────────────────────────────────────
const transports = [
  // Console — always active
  new winston.transports.Console({
    format: consoleFormat,
    silent: process.env.NODE_ENV === 'test',
  }),

  // Rotating combined log — keeps 14 days
  new DailyRotateFile({
    filename: path.join(logsDir, 'sync-%DATE%.log'),
    datePattern: 'YYYY-MM-DD',
    maxFiles: '14d',
    maxSize: '20m',
    format: fileFormat,
  }),

  // Rotating error-only log — keeps 30 days
  new DailyRotateFile({
    filename: path.join(logsDir, 'error-%DATE%.log'),
    datePattern: 'YYYY-MM-DD',
    level: 'error',
    maxFiles: '30d',
    maxSize: '10m',
    format: fileFormat,
  }),
];

// ── Create logger ─────────────────────────────────────────────────────
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  defaultMeta: { service: 'yojanamitra-sync' },
  transports,
  exitOnError: false,
});

module.exports = logger;
