'use client';

import { useSession, signIn, signOut } from "next-auth/react";
import { useAnonymousUser } from "./components/AnonymousUserProvider";

export default function ClientSessionDisplay() {
  const { data: session, status } = useSession();
  const { anonymousId, isInitialized } = useAnonymousUser();

  const currentSession = session;
  const currentStatus = status;

  if (!isInitialized) {
    return (
      <div className="bg-gray-100 p-6 rounded-lg max-w-md w-full">
        <h2 className="text-xl font-semibold mb-4">セッション情報</h2>
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-100 p-6 rounded-lg max-w-md w-full">
      <h2 className="text-xl font-semibold mb-4">セッション情報</h2>
      
      {currentStatus === "loading" && (
        <p className="text-gray-600">Loading...</p>
      )}
      
      {currentStatus === "unauthenticated" && (
        <div className="space-y-2">
          <p className="text-sm">状態: <span className="font-mono bg-yellow-100 px-2 py-1 rounded">匿名ユーザー</span></p>
          {anonymousId && (
            <p className="text-sm">匿名ID: <span className="font-mono text-xs bg-gray-200 px-2 py-1 rounded">{anonymousId.slice(0, 8)}...</span></p>
          )}
          <button
            onClick={() => signIn("google")}
            className="w-full mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
          >
            Googleでログイン
          </button>
        </div>
      )}
      
      {currentStatus === "authenticated" && currentSession && (
        <div className="space-y-2">
          <p className="text-sm">状態: <span className="font-mono bg-green-100 px-2 py-1 rounded">認証済み</span></p>
          <p className="text-sm">Email: <span className="font-mono">{currentSession.user?.email}</span></p>
          <p className="text-sm">Name: <span className="font-mono">{currentSession.user?.name}</span></p>
          {(currentSession.user as any)?.appUserId && (
            <p className="text-sm">App User ID: <span className="font-mono text-xs bg-gray-200 px-2 py-1 rounded">{(currentSession.user as any).appUserId.slice(0, 8)}...</span></p>
          )}
          {(currentSession.user as any)?.username && (
            <p className="text-sm">Username: <span className="font-mono">{(currentSession.user as any).username}</span></p>
          )}
          {(currentSession.user as any)?.isLinked !== undefined && (
            <p className="text-sm">Linked: <span className="font-mono">{(currentSession.user as any).isLinked ? '✅' : '❌'}</span></p>
          )}
          <button
            onClick={() => signOut()}
            className="w-full mt-4 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors"
          >
            ログアウト
          </button>
        </div>
      )}
    </div>
  );
} 