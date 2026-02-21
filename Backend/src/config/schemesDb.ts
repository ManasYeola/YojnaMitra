/**
 * schemesDb.ts
 *
 * A dedicated Mongoose connection to the MongoDB database
 * where the sync-service stores scheme documents.
 *
 * This is intentionally SEPARATE from the main Backend connection
 * (MONGODB_URI) which holds Users, Applications, Sessions, etc.
 *
 * Set SCHEMES_MONGO_URI in .env to the same value as
 * sync-service's MONGO_URI.
 */

import mongoose from 'mongoose';

const schemesDb = mongoose.createConnection();

export async function connectSchemesDb(): Promise<void> {
  const uri = process.env.SCHEMES_MONGO_URI;

  if (!uri) {
    console.warn(
      '⚠  SCHEMES_MONGO_URI not set — scheme matching & session endpoints will return empty results.',
    );
    return;
  }

  try {
    await schemesDb.openUri(uri);
    console.log('✅ Connected to Schemes MongoDB');
  } catch (err) {
    console.error('❌ Schemes MongoDB connection failed:', err);
    // Don't crash the server — other endpoints still work
  }
}

export default schemesDb;
