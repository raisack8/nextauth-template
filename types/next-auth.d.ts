// types/next-auth.d.ts
import NextAuth from "next-auth"

declare module "next-auth" {
  interface User {
    appUserId?: string
    username?: string
    isLinked?: boolean
  }

  interface Session {
    user: {
      name?: string | null
      email?: string | null
      image?: string | null
      appUserId: string
      username: string
      isLinked: boolean
    }
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    appUserId?: string
    username?: string
    isLinked?: boolean
  }
}
