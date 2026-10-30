import mongoose from 'mongoose';

let cached = global.mongoose;
if (!cached) cached = global.mongoose = { conn: null, promise: null };

export async function connectDB() {
  if (!process.env.MONGODB_URI) throw new Error('Please define MONGODB_URI in your environment.');
  if (cached.conn) return cached.conn;
  if (!cached.promise) cached.promise = mongoose.connect(process.env.MONGODB_URI).then((m) => m);
  cached.conn = await cached.promise;
  return cached.conn;
}
