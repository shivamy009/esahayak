import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      id: 'demo',
      name: 'Demo Login',
      credentials: {},
      async authorize() {
        return {
          id: 'demo-user-id',
          email: process.env.DEMO_EMAIL || 'demo@example.com',
          name: 'Demo User',
          role: 'admin',
        };
      },
    }),
  ],
  callbacks: {
    async session({ session, token }: any) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
        session.user.role = token.role as string;
      }
      return session;
    },
    async jwt({ token, user }: any) {
      if (user) {
        token.role = user.role;
      }
      return token;
    },
  },
  pages: {
    signIn: '/auth/signin',
  },
  session: {
    strategy: 'jwt' as const,
  },
});

export { handler as GET, handler as POST };