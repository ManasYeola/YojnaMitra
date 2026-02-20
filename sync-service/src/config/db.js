'use strict';

/**
 * db.js — MongoDB connection manager
 *
 * Provides a singleton connection to MongoDB via Mongoose.
 * Handles reconnection, graceful disconnect, and connection events.
 */

const mongoose = require('mongoose');
const logger = require('../utils/logger');

/** Track connection state to avoid duplicate connections */
let _isConnected = false;

/**
 * Connect to MongoDB.
 * Safe to call multiple times — only opens one connection.
 */
const connectDB = async () => {
  if (_isConnected) {
    logger.debug('MongoDB already connected — reusing existing connection');
    return;
  }

  const uri = process.env.MONGO_URI;
  if (!uri) {
    throw new Error('MONGO_URI is not defined in environment variables');
  }

  try {
    const conn = await mongoose.connect(uri, {
      // Database name is taken from the URI path (e.g. /yojanamitra_schemes).
      // Do NOT hardcode dbName here — let the URI be the single source of truth.
      serverSelectionTimeoutMS: 15000,
      socketTimeoutMS: 45000,
      maxPoolSize: 10,
      minPoolSize: 2,
    });

    _isConnected = true;

    logger.info(`MongoDB connected: ${conn.connection.host} / ${conn.connection.name}`);

    // ── Connection event listeners ──────────────────────────────────
    mongoose.connection.on('error', (err) => {
      logger.error(`MongoDB connection error: ${err.message}`);
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB disconnected');
      _isConnected = false;
    });

    mongoose.connection.on('reconnected', () => {
      logger.info('MongoDB reconnected');
      _isConnected = true;
    });

  } catch (error) {
    logger.error(`Failed to connect to MongoDB: ${error.message}`);
    throw error;
  }
};

/**
 * Gracefully close the MongoDB connection.
 */
const disconnectDB = async () => {
  if (!_isConnected) return;

  try {
    await mongoose.disconnect();
    _isConnected = false;
    logger.info('MongoDB connection closed');
  } catch (error) {
    logger.error(`Error closing MongoDB connection: ${error.message}`);
    throw error;
  }
};

/** Returns true if the DB connection is currently open */
const isConnected = () => _isConnected;

module.exports = { connectDB, disconnectDB, isConnected };
