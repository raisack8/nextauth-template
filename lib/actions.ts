'use server'

import { db } from './db'
import { appUsers } from './schema'
import { generateRandomUsername } from './utils'

export async function createAnonymousUser(anonymousId: string) {
  try {
    if (!anonymousId) {
      throw new Error('Anonymous ID is required')
    }

    // 既存ユーザーが存在するかチェック
    const existingUser = await db.query.appUsers.findFirst({
      where: (users, { eq }) => eq(users.anonymousId, anonymousId)
    })

    if (existingUser) {
      console.log(`Anonymous user already exists: ${anonymousId}`)
      return { success: true, exists: true }
    }

    // DBに匿名ユーザーを作成（ランダム名前で）
    await db.insert(appUsers).values({
      anonymousId,
      username: generateRandomUsername(),
      isLinked: false,
    })

    console.log(`Created anonymous user in DB: ${anonymousId}`)
    
    return { success: true, exists: false }
  } catch (error) {
    console.error('Failed to create anonymous user:', error)
    return { success: false, error: 'Failed to create anonymous user' }
  }
} 