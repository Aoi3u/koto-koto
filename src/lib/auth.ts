import NextAuth, { type NextAuthOptions } from 'next-auth';
import { PrismaAdapter } from '@auth/prisma-adapter';
import CredentialsProvider from 'next-auth/providers/credentials';

import GoogleProvider from 'next-auth/providers/google';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';

/**
 * Validates that required environment variables are set for authentication
 * This should only be called at runtime, not during build time
 * @throws Error if NEXTAUTH_SECRET is not configured
 */
function validateAuthEnv() {
  if (!process.env.NEXTAUTH_SECRET) {
    throw new Error(
      'NEXTAUTH_SECRET is not configured. Please set NEXTAUTH_SECRET in your .env file.'
    );
  }
}

/**
 * Check if Google OAuth is configured with required credentials
 * Safe to call at build time - only logs, doesn't throw
 */
function isGoogleOAuthConfigured(): boolean {
  const hasClientId = !!process.env.GOOGLE_CLIENT_ID;
  const hasClientSecret = !!process.env.GOOGLE_CLIENT_SECRET;

  if (hasClientId !== hasClientSecret) {
    console.warn(
      'Google OAuth is not fully configured. Both GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET must be set.'
    );
    return false;
  }

  if (!hasClientId) {
    console.info(
      'Google OAuth is not configured. Users will only be able to sign in with email/password.'
    );
    return false;
  }

  return true;
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: { strategy: 'jwt' },
  callbacks: {
    jwt: async ({ token, user, trigger, session }) => {
      // Validate environment on first auth request
      if (user) {
        validateAuthEnv();
        token.id = user.id;
        token.name = user.name;
        token.email = user.email;
      }
      // Handle session update from client
      if (trigger === 'update' && session?.user?.name) {
        token.name = session.user.name;
      }
      return token;
    },
    session: async ({ session, token }) => {
      if (session.user && token.sub) {
        session.user.id = token.sub;
        session.user.name = token.name as string | null;
        session.user.email = token.email as string;
      }
      return session;
    },
  },
  providers: [
    // Google OAuth provider - only included if credentials are configured
    ...(isGoogleOAuthConfigured()
      ? [
          GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID as string,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
          }),
        ]
      : []),
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const email = credentials?.email;
        const password = credentials?.password;
        if (!email || !password) return null;

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user || !user.password) return null;

        const ok = await bcrypt.compare(password, user.password);
        if (!ok) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
        };
      },
    }),
  ],
};

export default NextAuth(authOptions);
