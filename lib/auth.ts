import { NextAuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import { eq, or } from 'drizzle-orm'
import { appUsers } from './schema'
import { db } from './db'
import { cookies } from 'next/headers'
import { generateRandomUsername } from './utils'

// ヘルパー関数
async function getOrCreateAppUser(email: string, googleId: string, anonymousId?: string) {
  // 既存の認証済みユーザーを検索（emailまたはgoogleIdで）
  const [existingUser] = await db
    .select()
    .from(appUsers)
    .where(
      or(
        eq(appUsers.email, email),
        eq(appUsers.googleId, googleId)
      )
    )
  
  if (existingUser && existingUser.isLinked) {
    return existingUser
  }
  
  // 匿名ユーザーからの変換処理
  if (anonymousId) {
    const [anonymousUser] = await db
      .select()
      .from(appUsers)
      .where(eq(appUsers.anonymousId, anonymousId))
    
    if (anonymousUser && !anonymousUser.isLinked) {
      // 匿名ユーザーを認証済みユーザーに変換
      const [updatedUser] = await db
        .update(appUsers)
        .set({
          email,
          googleId,
          isLinked: true,
          updated_at: new Date()
        })
        .where(eq(appUsers.id, anonymousUser.id))
        .returning()
      
      return updatedUser
    }
  }
  
  // 初回ログイン時のみ作成
  const [newUser] = await db
    .insert(appUsers)
    .values({
      email,
      googleId,
      username: generateRandomUsername(),
      isLinked: true,
    })
    .returning()
  
  return newUser
}



export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    signIn: async ({ user, profile, account }) => {
      try {
        console.log('signIn', { user, profile, account })
        
        // Google IDを取得
        const googleId = account?.providerAccountId || profile?.sub
        if (!googleId) {
          console.error('Google ID not found')
          return false
        }
        
        // Cookieから匿名ユーザーIDを取得
        const cookieStore = await cookies()
        const anonymousIdCookie = cookieStore.get('anonymous-user-id')
        const anonymousId = anonymousIdCookie?.value
        
        const appUser = await getOrCreateAppUser(
          profile?.email || user.email!,
          googleId,
          anonymousId
        )
        
        // userオブジェクトにアプリ独自データを設定
        user.appUserId = appUser.id
        user.username = appUser.username
        user.isLinked = appUser.isLinked
        
        return true
      } catch (error) {
        console.error('SignIn callback error:', error)
        return false
      }
    },
    jwt: ({ token, user }) => {
      // signInで設定されたデータをJWTに保存
      if (user) {
        token.appUserId = user.appUserId
        token.username = user.username
        token.isLinked = user.isLinked
      }
      return token
    },
    session: ({ session, token }) => {
      // JWT戦略では常にtokenからデータを取得
      return {
        ...session,
        user: {
          ...session.user,
          appUserId: token.appUserId as string,
          username: token.username as string,
          isLinked: token.isLinked as boolean,
        }
      }
    }
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
} 