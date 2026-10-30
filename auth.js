import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { connectDB } from './lib/mongodb.js';
import User from './models/User.js';
import { authConfig } from './auth.config.js';

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [Credentials({ credentials: { email: {}, password: {} }, async authorize(credentials) {
    await connectDB();
    const user = await User.findOne({ email: String(credentials.email).toLowerCase() });
    if (!user || !(await bcrypt.compare(String(credentials.password), user.password))) return null;
    return { id: user._id.toString(), name: user.name, email: user.email };
  } })]
});
