// lib/schema.ts
import { pgTable, text, timestamp, boolean } from 'drizzle-orm/pg-core'

const timestamps = {
  created_at: timestamp().defaultNow().notNull(),
  updated_at: timestamp(),
};

export const appUsers = pgTable('app_users', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  email: text('email').unique(), // 認証済みユーザーのみ
  username: text('username').notNull(),
  isLinked: boolean('is_linked').default(false).notNull(), // false=匿名, true=認証済み
  anonymousId: text('anonymous_id').unique(), // middlewareで生成されるID
  googleId: text('google_id').unique(), // Google認証のID
  ...timestamps,
})
