import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Trace — 분명 봤는데, 어디서 봤지?",
  description: "AI가 기억하는 나의 브라우징 기록",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
