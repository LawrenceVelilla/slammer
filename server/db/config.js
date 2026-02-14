
import mongoose from 'mongoose';

let hasConnected = false;

async function connectDB() {
  if (hasConnected) return mongoose.connection;

  const mongoUri = process.env.MONGODB_URI || process.env.DATABASE_URL;

  if (!mongoUri) {
    throw new Error('Missing MONGODB_URI (or DATABASE_URL) environment variable');
  }

  await mongoose.connect(mongoUri);
  hasConnected = true;

  return mongoose.connection;
}

export { connectDB };
