import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { connectDB } from '../db/config.js';
import { logInfo, logError } from '../utils/logger.js';
import migration001 from '../migrations/001-backfill-card-deck-id.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const migrations = [migration001];
const collectionName = 'migration_state';

async function ensureCollection() {
  const collections = await mongoose.connection.db.listCollections({ name: collectionName }).toArray();
  if (collections.length === 0) {
    await mongoose.connection.db.createCollection(collectionName);
    await mongoose.connection.db.collection(collectionName).createIndex({ id: 1 }, { unique: true });
  }
}

async function hasRun(migrationId) {
  const found = await mongoose.connection.db.collection(collectionName).findOne({ id: migrationId });
  return Boolean(found);
}

async function markRun(migration, result) {
  await mongoose.connection.db.collection(collectionName).insertOne({
    id: migration.id,
    description: migration.description,
    ranAt: new Date(),
    result,
  });
}

async function run() {
  await connectDB();
  await ensureCollection();

  for (const migration of migrations) {
    if (await hasRun(migration.id)) {
      logInfo({ event: 'migration.skipped', migrationId: migration.id });
      continue;
    }

    logInfo({ event: 'migration.start', migrationId: migration.id, description: migration.description });
    const result = await migration.up();
    await markRun(migration, result);
    logInfo({ event: 'migration.done', migrationId: migration.id, result });
  }
}

run()
  .then(async () => {
    await mongoose.disconnect();
  })
  .catch(async (error) => {
    logError({ event: 'migration.error', message: error.message });
    await mongoose.disconnect();
    process.exit(1);
  });
