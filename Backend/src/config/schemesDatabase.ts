/**
 * schemesDatabase.ts
 *
 * Lazy secondary Mongoose connection specifically for the `schemes` collection,
 * which is populated by the sync-service and lives in a separate database.
 *
 * Uses SCHEMES_DB_URI env var (falls back to MONGODB_URI if not set — for
 * deployments where both services share the same MongoDB cluster/database).
 */

import mongoose from 'mongoose';

let schemesConn: mongoose.Connection | null = null;

export async function getSchemesDb(): Promise<mongoose.mongo.Db> {
  if (schemesConn && schemesConn.readyState === 1) {
    return schemesConn.db!;
  }

  const uri = process.env.SCHEMES_DB_URI || process.env.MONGODB_URI;

  if (!uri) {
    throw new Error('SCHEMES_DB_URI (or MONGODB_URI) is not defined');
  }

  schemesConn = await mongoose.createConnection(uri).asPromise();
  console.log(`✅ Schemes DB connected: ${schemesConn.host} / ${schemesConn.name}`);

  schemesConn.on('error', (err) => console.error('❌ Schemes DB error:', err));
  schemesConn.on('disconnected', () => console.warn('⚠️  Schemes DB disconnected'));

  return schemesConn.db!;
}
