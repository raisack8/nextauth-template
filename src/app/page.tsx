import ClientSessionDisplay from './ClientSessionDisplay';

export default function Home() {
  return (
    <div className="font-sans min-h-screen p-8 flex flex-col items-center justify-center gap-8">
      <h1 className="text-4xl font-bold text-center">
        NextAuth Template
      </h1>
      
      <ClientSessionDisplay />
      
      <div className="text-sm text-gray-600 max-w-md text-center">
        <p>🔄 フロー: 初回訪問時に匿名ユーザーが作成されます</p>
        <p>📧 Googleログインで匿名データが認証済みユーザーに移行されます</p>
      </div>
    </div>
  );
}
