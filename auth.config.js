import NextAuth from 'next-auth';

export const authConfig = {
  trustHost: true,
  secret: process.env.AUTH_SECRET,
  session: { strategy: 'jwt' },
  pages: { signIn: '/login' },
  providers: [],
  callbacks: { authorized: ({ auth, request }) => request.nextUrl.pathname.startsWith('/login') || Boolean(auth?.user) }
};
