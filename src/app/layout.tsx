import type { Metadata } from "next";
import Script from "next/script";
import InstallBanner from "./components/InstallBanner";
import PushPermission from "./components/PushPermission";
import "./globals.css";

export const metadata: Metadata = {
  title: "오른스푼 | Right Spoon — 대한민국 오른 미디어",
  description:
    "오른스푼은 대한민국 오른 시각의 뉴스와 칼럼을 전합니다. 유튜브 영상과 함께 깊이 있는 분석을 제공합니다.",
  keywords: "오른스푼, rightspoon, 오른 미디어, 우파 뉴스, 정치, 경제, 역사",
  authors: [{ name: "오른스푼" }],
  openGraph: {
    type: "website",
    locale: "ko_KR",
    url: "https://www.rightspoon.co.kr",
    siteName: "오른스푼 - Right Spoon",
    title: "오른스푼 | 대한민국 오른 미디어",
    description:
      "대한민국 오른 시각의 뉴스와 칼럼. 유튜브 영상과 함께 깊이 있는 분석을 제공합니다.",
  },
  verification: {
    other: {
      "naver-site-verification": "b0bbf34223bfeb61046576d2510344bb30594cad",
    },
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
        <meta name="naver-site-verification" content="b0bbf34223bfeb61046576d2510344bb30594cad" />
        {/* AdSense: beforeInteractive → 크롤러가 HTML에서 바로 인식 가능 */}
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9599627662073241"
          crossOrigin="anonymous"
          strategy="beforeInteractive"
        />
        {/* Kakao JS SDK (Global Load) */}
        <Script
          src="https://t1.kakaocdn.net/kakao_js_sdk/2.7.4/kakao.min.js"
          strategy="lazyOnload"
          crossOrigin="anonymous"
        />
        <Script
          async
          src="https://www.googletagmanager.com/gtag/js?id=G-V3G7L9KHW7"
          strategy="lazyOnload"
        />
        <Script id="gtag-init" strategy="lazyOnload">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-V3G7L9KHW7');
          `}
        </Script>
        {/* Preconnect 힌트: 폰트 + Supabase API */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link rel="dns-prefetch" href="https://pagead2.googlesyndication.com" />
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
        {/* Google Fonts: 불필요한 500/900 weight 제거 → 로딩 약 50% 절감 */}
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;700&family=Bebas+Neue&display=swap"
          rel="stylesheet"
        />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#c81e1e" />
        <link rel="apple-touch-icon" href="/logo-v2.png" />
      </head>
      <body>
        <InstallBanner />
        {children}
        <PushPermission />
      </body>
    </html>
  );
}
