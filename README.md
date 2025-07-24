# NextAuth Template - 匿名→認証済みユーザーフロー

このプロジェクトは、**匿名ユーザーから認証済みユーザーへのシームレスな移行**を実現するNext.js + NextAuth.js + Drizzle ORMのテンプレートです。

## 🎯 **アーキテクチャ概要**

```
匿名訪問 → Client Component(Cookie生成) → Server Action(DB保存) → Google認証 → アカウント連携
```

### **核心的な流れ**
1. **初回訪問**: AnonymousUserProviderで匿名IDを生成しCookieに保存
2. **DB作成**: Server Action経由で匿名ユーザーをDBに保存
3. **セッション管理**: React Context + Cookie + DB + NextAuthの組み合わせ
4. **認証**: Googleログインで匿名データを認証済みユーザーに移行

---

## 🍪 **Cookie処理の仕組み**

### **設定**
- **名前**: `anonymous-user-id`
- **有効期限**: 1年間（永続Cookie）
- **スコープ**: サイト全体（`path: '/'`）
- **セキュリティ**: 本番環境でSecure属性有効

### **生成場所**
- **`src/app/components/AnonymousUserProvider.tsx`**: Client Component環境でCookieの存在確認と生成

```typescript
// 匿名ユーザーIDが存在しない場合のみ生成
const initializeAnonymousUser = async () => {
  let id = document.cookie
    .split('; ')
    .find(row => row.startsWith('anonymous-user-id='))
    ?.split('=')[1];

  if (!id) {
    id = crypto.randomUUID();
    document.cookie = `anonymous-user-id=${id}; path=/; max-age=${60 * 60 * 24 * 365}; SameSite=Lax`;
  }
  
  setAnonymousId(id);
  await createAnonymousUser(id); // Server Action呼び出し
};
```

---

## 🔐 **セッション管理の仕組み**

### **JWT戦略採用**
- NextAuth.jsのJWT戦略を使用
- セッション情報はクライアントサイドのCookieに保存
- DB依存せずに高速なセッション取得

### **3層セッション管理**

1. **NextAuthセッション** (認証済みユーザー)
2. **匿名ユーザーセッション** (Cookie + DB)
3. **フォールバック** (セッションなし)

```typescript
// src/app/components/AnonymousUserProvider.tsx
export default function AnonymousUserProvider({ children }: Props) {
  const [anonymousId, setAnonymousId] = useState<string | null>(null);
  
  const initializeAnonymousUser = async () => {
    // Cookieから既存IDを取得
    let id = document.cookie.find(row => row.startsWith('anonymous-user-id='));
    
    if (!id) {
      id = crypto.randomUUID(); // 新規生成
      document.cookie = `anonymous-user-id=${id}; path=/; max-age=${60*60*24*365}`;
    }
    
    setAnonymousId(id);
    await createAnonymousUser(id); // Server Action呼び出し
  };
  
  return (
    <AnonymousUserContext.Provider value={{ anonymousId, isInitialized }}>
      {children}
    </AnonymousUserContext.Provider>
  );
}

// lib/actions.ts - Server Action
export async function createAnonymousUser(anonymousId: string) {
  await db.insert(appUsers).values({
    anonymousId,
    username: generateRandomUsername(), // AlexSmith42
    isLinked: false,
  });
}
```

---

## 📁 **ファイル構成と役割**

### **🚀 Core Files**

#### **`lib/utils.ts`**
- **役割**: 共通ユーティリティ関数
- **処理**: アメリカンな名前生成（FirstName + LastName + 数字）
- **重要**: 32×32×999 = 100万通り以上の組み合わせ

#### **`lib/auth.ts`**
- **役割**: NextAuth.js設定の中央管理
- **処理**: 
  - Google OAuth設定
  - JWT戦略設定
  - サインイン時の匿名→認証済み変換
- **重要**: `getServerSession`で再利用可能

#### **`lib/db.ts`**
- **役割**: Drizzle ORM接続設定
- **環境**: Node.js Runtime（API Routes, Server Components）
- **重要**: Edge環境では使用不可

#### **`lib/schema.ts`**
- **役割**: データベーススキーマ定義
- **テーブル**: `appUsers`（匿名・認証済み両方を管理）

### **🎨 UI Components**

#### **`src/app/page.tsx`**
- **役割**: メインページ（Server Component）
- **処理**: 
  - ClientSessionDisplayを直接配置
  - シンプルなレイアウト構成
- **重要**: AnonymousUserProviderはlayout.tsxで全体をラップ

#### **`src/app/ClientSessionDisplay.tsx`**
- **役割**: セッション表示（Client Component）
- **処理**:
  - NextAuth `useSession`フック使用
  - AnonymousUserContextから匿名ID取得
  - ログイン・ログアウトボタン

#### **`src/app/layout.tsx`**
- **役割**: アプリルートレイアウト
- **重要**: `Providers`（SessionProvider）と`AnonymousUserProvider`を配置
- **利点**: 全ページで匿名ユーザー状態が利用可能

#### **`src/app/providers.tsx`**
- **役割**: NextAuth SessionProviderのラッパー
- **重要**: Server ComponentとClient Component分離のため

### **🔌 API Routes**

#### **`src/app/api/auth/[...nextauth]/route.ts`**
- **役割**: NextAuth.jsのAPIエンドポイント
- **処理**: OAuth認証フローの処理

#### **`src/app/components/AnonymousUserProvider.tsx`**
- **役割**: 匿名ユーザーの状態管理とDB操作
- **処理**: Cookie生成、Server Action経由のDB登録、React Context提供
- **重要**: 認証関連処理の完全分離

#### **`lib/actions.ts`**
- **役割**: Server Actions（サーバーサイド処理）
- **処理**: 匿名ユーザーのDB作成、重複チェック、ランダム名前生成
- **重要**: API Routeの代替、型安全な実装

---

## 🔄 **データフロー詳細**

### **🚀 アーキテクチャ概要**
```
Layout (Server Component)
├── Providers (SessionProvider)
├── AnonymousUserProvider (Client Component)
│   ├── React Context: anonymousId, isInitialized
│   ├── Cookie管理: document.cookie操作
│   └── Server Action: createAnonymousUser()
└── Pages (Server Components)
    └── ClientSessionDisplay (Client Component)
        ├── NextAuth: useSession()
        └── Context: useAnonymousUser()
```

### **🔵 初回訪問時**
```
1. Layout → AnonymousUserProvider マウント（アプリ全体で利用可能）
2. useEffect → Cookie確認 (document.cookie)
3. Cookie無し → crypto.randomUUID() 生成
4. Cookie設定 → 1年間有効で保存
5. Server Action → createAnonymousUser(anonymousId) 呼び出し
6. DB登録 → appUsers テーブルに匿名ユーザー作成
7. Context更新 → 全ページで anonymousId 利用可能
8. UI表示 → 「匿名ユーザー」状態を表示
```

### **🔄 再訪問時**
```
1. AnonymousUserProvider → 既存Cookie検出
2. 重複チェック → DB内に既存ユーザー確認
3. Context提供 → 既存anonymousIdをClientSessionDisplayに渡す
4. NextAuth → getServerSession() でセッション確認
5. UI表示 → 適切な状態（匿名 or 認証済み）を表示
```

### **🔐 Google認証時**
```
1. ClientSessionDisplay → signIn('google') 実行
2. NextAuth → Google OAuth フロー開始
3. Google認証 → 認証成功後 signIn コールバック実行
4. Cookie取得 → anonymousId を取得
5. User連携 → getOrCreateAppUser(email, googleId, anonymousId)
6. DB更新 → 匿名ユーザーを認証済みに変換 (isLinked: true)
7. JWT生成 → appUserId, username, isLinked をトークンに保存
8. セッション → 認証済み状態でUI更新
```

### **📊 状態管理フロー**
```
AnonymousUserProvider (React Context)
├── anonymousId: string | null
├── isInitialized: boolean
└── Provider Value → ClientSessionDisplay

ClientSessionDisplay
├── useSession() → NextAuth状態
├── useAnonymousUser() → 匿名ユーザー状態
└── UI Rendering → 状態に応じた表示切り替え
```

---

## 🛠 **技術スタック**

- **Framework**: Next.js 15 (App Router)
- **認証**: NextAuth.js (JWT戦略)
- **ORM**: Drizzle ORM
- **DB**: PostgreSQL
- **状態管理**: React Context + Server Actions
- **Runtime**: Node.js (Server Actions + Server Components)
- **型安全**: TypeScript
- **UI**: Tailwind CSS v4
- **名前生成**: アメリカンネーム（100万通り以上）

---

## 🚀 **セットアップ**

### **1. 依存関係インストール**
```bash
pnpm install
```

### **2. 環境変数設定**
`.env.local`を作成：
```bash
# Database
DATABASE_URL="postgresql://username:password@localhost:5433/nextauth-db"

# NextAuth
NEXTAUTH_SECRET="your-secret-here"
NEXTAUTH_URL="http://localhost:3000"

# Google OAuth
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

### **3. データベース設定**
```bash
# マイグレーション生成
pnpm drizzle-kit generate

# マイグレーション実行
pnpm drizzle-kit migrate
```

### **4. 開発サーバー起動**
```bash
pnpm dev
```

---

## 📋 **重要な設計判断**

### **✅ 採用したアプローチ**
- **Client Component Cookie管理**: ブラウザ環境での直接的なCookie操作
- **Server Actions**: 型安全なサーバーサイド処理
- **JWT戦略**: スケーラブルなセッション管理
- **React Context**: 匿名ユーザー状態の統一管理
- **統合セッション**: 匿名・認証済みの一元管理

### **❌ 避けたアプローチ**
- MiddlewareでのDB操作（Edge制約）
- Database戦略（スケーラビリティ問題）
- Server ComponentでのSessionProvider（React Context制約）
- API Routesでの匿名ユーザー作成（Server Actionsでより型安全に実装）

---

## 🎯 **核心的な価値**

1. **シームレスUX**: 初回訪問から認証まで継続的な体験
2. **データ継続性**: 匿名時のデータが認証後も保持
3. **スケーラビリティ**: JWT + 適切な分散アーキテクチャ  
4. **型安全性**: 完全なTypeScript + Zod統合

このテンプレートは、**現代的なWebアプリケーションの認証フロー**のベストプラクティスを実装しています。

## Google OAuth情報をゲットする

スクショが以下になります。

![image](resources/image.png)
