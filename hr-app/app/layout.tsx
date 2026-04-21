import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "HRシステム v3.0",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body style={{ margin: "0", fontFamily: "sans-serif", display: "flex" }}>
        <nav style={{ width: "200px", background: "#111827", minHeight: "100vh", padding: "24px 0", position: "fixed", top: 0, left: 0 }}>
          <div style={{ padding: "0 16px 24px" }}>
            <p style={{ color: "#9ca3af", fontSize: "11px", margin: "0" }}>HRシステム</p>
            <p style={{ color: "#fff", fontSize: "16px", fontWeight: "500", margin: "4px 0 0" }}>v3.0</p>
          </div>
          <a href="/employees" style={{ display: "block", padding: "10px 16px", color: "#d1d5db", textDecoration: "none", fontSize: "14px" }}>👥 社員管理</a>
          <a href="/attendance" style={{ display: "block", padding: "10px 16px", color: "#d1d5db", textDecoration: "none", fontSize: "14px" }}>📅 勤怠OCR</a>
          <a href="/shifts" style={{ display: "block", padding: "10px 16px", color: "#d1d5db", textDecoration: "none", fontSize: "14px" }}>📅 シフト管理</a><a href="/payroll" style={{ display: "block", padding: "10px 16px", color: "#d1d5db", textDecoration: "none", fontSize: "14px" }}>💰 給与計算</a>
          <a href="/" style={{ display: "block", padding: "10px 16px", color: "#d1d5db", textDecoration: "none", fontSize: "14px" }}>👤 スタッフポータル</a>
        </nav>
        <main style={{ marginLeft: "200px", flex: 1, minHeight: "100vh" }}>
          {children}
        </main>
      </body>
    </html>
  );
}
