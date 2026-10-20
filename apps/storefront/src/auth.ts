import NextAuth from 'next-auth';
import type { NextAuthConfig } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import Google from 'next-auth/providers/google';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { compare } from 'bcryptjs';
import { prisma } from '@/lib/prisma';

const providers: NextAuthConfig['providers'] = [
  Credentials({
    name: 'Email e senha',
    credentials: {
      email: { label: 'E-mail', type: 'email' },
      password: { label: 'Senha', type: 'password' },
    },
    async authorize(credentials) {
      const email = String(credentials?.email ?? '')
        .trim()
        .toLowerCase();
      const password = String(credentials?.password ?? '');
      if (!email || !password) return null;

      const user = await prisma.user.findUnique({ where: { email } });
      if (
        !user?.passwordHash ||
        !(await compare(password, user.passwordHash))
      ) {
        return null;
      }
      if (user.role !== 'ADMIN' && user.role !== 'INVENTORY_MANAGER') {
        return null;
      }

      return {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      };
    },
  }),
];

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  providers.push(
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    })
  );
}

export const googleLoginEnabled = Boolean(
  process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
);

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers,
  session: { strategy: 'jwt' },
  pages: { signIn: '/restrict/admin/login' },
  callbacks: {
    async signIn({ user, account }) {
      const record = user.id
        ? await prisma.user.findUnique({
            where: { id: user.id },
            select: { role: true },
          })
        : null;
      if (record) {
        return record.role === 'ADMIN' || record.role === 'INVENTORY_MANAGER';
      }
      const bootstrapEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
      return (
        account?.provider === 'google' &&
        (!bootstrapEmail || user.email?.toLowerCase() === bootstrapEmail) &&
        (await prisma.user.count()) === 0
      );
    },
    async jwt({ token, user }) {
      if (user?.id) {
        const record = await prisma.user.findUnique({
          where: { id: user.id },
          select: { role: true },
        });
        token.role = record?.role ?? 'USER';
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub ?? '';
        session.user.role = token.role as
          | 'ADMIN'
          | 'INVENTORY_MANAGER'
          | 'USER';
      }
      return session;
    },
  },
  events: {
    async createUser({ user }) {
      const userCount = await prisma.user.count();
      if (userCount === 1 && user.id) {
        await prisma.user.update({
          where: { id: user.id },
          data: { role: 'ADMIN' },
        });
      }
    },
  },
  trustHost: true,
});
