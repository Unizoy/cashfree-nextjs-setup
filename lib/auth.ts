import authConfig from "@/auth.config"
import { PrismaAdapter } from "@auth/prisma-adapter"
import NextAuth from "next-auth"

import { getAccountByUserId } from "@/lib/account"
import { db } from "@/lib/db"
import { getUserById } from "@/lib/user"

export const { auth, handlers, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(db),
  session: {
    strategy: "jwt",
  },

  callbacks: {
    async session({ token, session }) {
      if (token.sub && session.user) {
        session.user.id = token.sub
      }

      if (session.user) {
        session.user.name = token.name
      }

      return session
    },
    async jwt({ token }) {
      if (!token.sub) return token

      const existingUser = await getUserById(token.sub)

      if (!existingUser) return token

      const existingAccount = await getAccountByUserId(existingUser.id)
      token.isOAuth = !!existingAccount

      token.name = existingUser.name
      token.email = existingUser.email

      return token
    },
  },
  ...authConfig,

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
})
