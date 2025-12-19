import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import connectToDatabase from '@/lib/mongodb';
import User from '@/models/User';

// Extend the built-in session types
declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      email: string;
      name?: string;
      role: string;
      branch?: string;
      currentSemester: number;
      currentAcademicYear: string;
    };
  }

  interface User {
    id: string;
    email: string;
    name?: string;
    role: string;
    branch?: string;
    currentSemester: number;
    currentAcademicYear: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    role: string;
    branch?: string;
    currentSemester: number;
    currentAcademicYear: string;
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email and password are required');
        }

        await connectToDatabase();

        const user = await User.findOne({ email: credentials.email.toLowerCase() });

        if (!user) {
          throw new Error('No user found with this email');
        }

        const isPasswordValid = await bcrypt.compare(credentials.password, user.password);

        if (!isPasswordValid) {
          throw new Error('Invalid password');
        }

        return {
          id: user._id.toString(),
          email: user.email,
          name: user.name || user.fullName,
          role: user.role,
          branch: user.branch,
          currentSemester: user.currentSemester,
          currentAcademicYear: user.currentAcademicYear,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.branch = user.branch;
        token.currentSemester = user.currentSemester;
        token.currentAcademicYear = user.currentAcademicYear;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.branch = token.branch;
        session.user.currentSemester = token.currentSemester;
        session.user.currentAcademicYear = token.currentAcademicYear;
      }
      return session;
    },
  },
  pages: {
    signIn: '/sign-in',
    error: '/sign-in',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
};
