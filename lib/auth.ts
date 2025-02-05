import authConfig from "@/auth.config"
import { PrismaAdapter } from "@auth/prisma-adapter"
import NextAuth from "next-auth"

import { db } from "@/lib/db"

export const { auth, handlers, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(db),
  session: {
    strategy: "jwt",
  },

  // callbacks: {
  //   async session({ token, session }) {
  //     if (token) {
  //       session.user.id = token.id as string
  //       session.user.name = token.name || null
  //       session.user.email = token.email || null
  //       session.user.image = token.picture || null
  //     }
  //     return session
  //   },
  //   async jwt({ token, user }) {
  //     const dbUser = await db.user.findFirst({
  //       where: {
  //         email: token.email || undefined,
  //       },
  //     })

  //     if (!dbUser) {
  //       if (user) {
  //         token.id = user.id
  //       }
  //       return token
  //     }

  //     return {
  //       id: dbUser.id,
  //       name: dbUser.name,
  //       email: dbUser.email,
  //       picture: dbUser.image,
  //     }
  //   },
  // },
  ...authConfig,
})
