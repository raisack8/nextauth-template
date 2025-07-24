'use client';

import { createContext, useContext, useEffect, useState } from "react";
import { createAnonymousUser } from "@/lib/actions";

interface AnonymousUserContextType {
  anonymousId: string | null;
  isInitialized: boolean;
}

const AnonymousUserContext = createContext<AnonymousUserContextType>({
  anonymousId: null,
  isInitialized: false,
});

export const useAnonymousUser = () => {
  return useContext(AnonymousUserContext);
};

interface AnonymousUserProviderProps {
  children: React.ReactNode;
}

export default function AnonymousUserProvider({ children }: AnonymousUserProviderProps) {
  const [anonymousId, setAnonymousId] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    initializeAnonymousUser();
  }, []);

  const initializeAnonymousUser = async () => {
    try {
      // Cookieから既存IDを取得
      let id = document.cookie
        .split('; ')
        .find(row => row.startsWith('anonymous-user-id='))
        ?.split('=')[1];
      
      // Cookieが存在しない場合、新しいIDを生成
      if (!id) {
        id = crypto.randomUUID();
        
        // Cookieにセット（1年間有効）
        document.cookie = `anonymous-user-id=${id}; path=/; max-age=${60 * 60 * 24 * 365}; SameSite=Lax`;
        console.log(`✨ Generated new anonymous ID: ${id}`);
      }
      
      // Stateを更新
      setAnonymousId(id);
      
      // DBに匿名ユーザーを作成（Server Action経由）
      await handleCreateAnonymousUser(id);
      
    } catch (error) {
      console.error('Failed to initialize anonymous user:', error);
    } finally {
      setIsInitialized(true);
    }
  };

  const handleCreateAnonymousUser = async (anonymousId: string) => {
    try {
      const result = await createAnonymousUser(anonymousId);
      if (result.success) {
        console.log(`Created anonymous user in DB: ${anonymousId}`);
      } else {
        console.error('Failed to create anonymous user:', result.error);
      }
    } catch (error) {
      console.error('Failed to create anonymous user:', error);
    }
  };

  const contextValue: AnonymousUserContextType = {
    anonymousId,
    isInitialized,
  };

  return (
    <AnonymousUserContext.Provider value={contextValue}>
      {children}
    </AnonymousUserContext.Provider>
  );
} 