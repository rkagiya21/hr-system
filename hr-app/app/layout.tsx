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
        {/* Sidebar */}
        <aside className="w-48 bg-gray-900 text-white flex flex-col shrink-0">
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
            <Link href="/search" className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-colors">
              <span>🔍</span> 検索
            </Link>
          </nav>
          <div className="px-4 py-3 border-t border-gray-700 text-xs text-gray-500">
            © 2026 HRシステム
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </body>
    </html>
  );
}
