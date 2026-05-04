import type { Metadata } from "next";
import "./globals.css";
import Link from "next/link";

export const metadata: Metadata = {
  title: "HRシステム v3.0",
  description: "外国人労働者向け人事管理システム",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body className="flex min-h-screen bg-gray-50">

        {/* サイドバー（PC表示のみ） */}
        <aside className="hidden md:flex w-48 bg-gray-900 text-white flex-col shrink-0">
          <div className="px-4 py-5 border-b border-gray-700">
            <div className="text-sm text-gray-400">HRシステム</div>
            <div className="text-lg font-bold">v3.0</div>
          </div>
          <nav className="flex-1 py-4 space-y-1">
            <Link href="/employees" className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-colors">
              <span>👥</span> 社員管理
            </Link>
            <Link href="/ocr-results" className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-colors">
              <span>📋</span> 勤怠OCR
            </Link>
            <Link href="/attendance" className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-colors">
              <span>🕐</span> 勤怠管理
            </Link>
            <Link href="/shifts" className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-colors">
              <span>📅</span> シフト管理
            </Link>
            <Link href="/payroll" className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-colors">
              <span>💰</span> 給与計算
            </Link>
            <Link href="/portal" className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-colors">
              <span>👤</span> スタッフポータル
            </Link>
            <Link href="/fax" className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-colors">
              <span>📠</span> FAX読み取り
            </Link>
            <Link href="/search" className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-colors">
              <span>🔍</span> 検索
            </Link>
          </nav>
          <div className="px-4 py-3 border-t border-gray-700 text-xs text-gray-500">
            © 2026 HRシステム
          </div>
        </aside>

        {/* モバイル上部バー */}
        <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-gray-900 text-white flex items-center justify-between px-4 py-3 shadow">
          <div>
            <span className="text-xs text-gray-400">HRシステム</span>
            <span className="ml-2 text-sm font-bold">v3.0</span>
          </div>
          <span className="text-lg">👤</span>
        </div>

        {/* メインコンテンツ */}
        <main className="flex-1 overflow-auto pt-12 md:pt-0 pb-16 md:pb-0">
          {children}
        </main>

        {/* モバイル下部ナビ */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 flex justify-around items-center py-2 shadow-lg">
          <Link href="/employees" className="flex flex-col items-center gap-0.5 text-gray-600 hover:text-gray-900">
            <span className="text-xl">👥</span>
            <span className="text-xs">社員</span>
          </Link>
          <Link href="/attendance" className="flex flex-col items-center gap-0.5 text-gray-600 hover:text-gray-900">
            <span className="text-xl">🕐</span>
            <span className="text-xs">勤怠</span>
          </Link>
          <Link href="/shifts" className="flex flex-col items-center gap-0.5 text-gray-600 hover:text-gray-900">
            <span className="text-xl">📅</span>
            <span className="text-xs">シフト</span>
          </Link>
          <Link href="/payroll" className="flex flex-col items-center gap-0.5 text-gray-600 hover:text-gray-900">
            <span className="text-xl">💰</span>
            <span className="text-xs">給与</span>
          </Link>
          <Link href="/search" className="flex flex-col items-center gap-0.5 text-gray-600 hover:text-gray-900">
            <span className="text-xl">🔍</span>
            <span className="text-xs">検索</span>
          </Link>
        </nav>

      </body>
    </html>
  );
}
