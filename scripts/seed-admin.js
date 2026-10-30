import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { connectDB } from '../lib/mongodb.js';
import User from '../models/User.js';

for (const key of ['ADMIN_NAME', 'ADMIN_EMAIL', 'ADMIN_PASSWORD', 'MONGODB_URI']) {
  if (!process.env[key]) throw new Error(`Missing ${key} environment variable`);
}
await connectDB();
const password = await bcrypt.hash(process.env.ADMIN_PASSWORD, 12);
await User.findOneAndUpdate({ email: process.env.ADMIN_EMAIL.toLowerCase() }, { name: process.env.ADMIN_NAME, email: process.env.ADMIN_EMAIL.toLowerCase(), password }, { upsert: true, new: true, setDefaultsOnInsert: true });
console.log(`Admin account ready for ${process.env.ADMIN_EMAIL}`);
await (await import('mongoose')).default.disconnect();
