import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Poker Analysis Pro - Phân tích bài Poker thông minh",
  description: "Công cụ phân tích poker hiện đại cho người mới và người chơi có kinh nghiệm. Tính toán equity, đưa ra gợi ý hành động với Monte Carlo simulation.",
  keywords: ["poker", "texas holdem", "equity calculator", "poker analysis", "monte carlo", "poker strategy"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className} suppressHydrationWarning>
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900">
          {children}
        </div>
      </body>
    </html>
  );
}
