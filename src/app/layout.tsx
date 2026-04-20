import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "오른스푼 | Right Spoon — 대한민국 보수 미디어",
  description:
    "대한민국 보수 시각의 뉴스와 칼럼. 유튜브 영상과 함께 깊이 있는 분석을 제공합니다.",
  keywords: "오른스푼, rightspoon, 보수 미디어, 우파 뉴스, 정치, 경제",
  authors: [{ name: "오른스푼" }],
  openGraph: {
    type: "website",
    locale: "ko_KR",
    url: "https://www.rightspoon.co.kr",
    siteName: "오른스푼 - Right Spoon",
    title: "오른스푼 | 대한민국 보수 미디어",
    description:
      "대한민국 보수 시각의 뉴스와 칼럼. 유튜브 영상과 함께 깊이 있는 분석을 제공합니다.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;500;700;900&family=Bebas+Neue&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
