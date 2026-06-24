import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";

export const metadata: Metadata = {
  title: "오른스푼 | 드럼통119의 정치·사회 해설 본진",
  description:
    "오른스푼은 드럼통119가 정치·사회 이슈를 오른쪽 시각으로 해설하고 기록하는 1인 미디어입니다. 뉴스 복사가 아닌 프레임 분석과 칼럼을 제공합니다.",
  keywords: "오른스푼, rightspoon, 드럼통119, 우파 칼럼, 정치 해설, 사회 이슈, 보수 미디어",
  authors: [{ name: "오른스푼" }],
  creator: "드럼통119",
  publisher: "오른스푼",
  openGraph: {
    type: "website",
    locale: "ko_KR",
    url: "https://www.rightspoon.co.kr",
    siteName: "오른스푼 - Right Spoon",
    title: "오른스푼 | 드럼통119의 정치·사회 해설 본진",
    description:
      "흘러가는 정치·사회 이슈를 드럼통119의 관점으로 정리하는 1인 미디어입니다.",
    images: [
      {
        url: "https://www.rightspoon.co.kr/api/og?title=%EC%98%A4%EB%A5%B8%EC%8A%A4%ED%91%BC&category=%EB%93%9C%EB%9F%BC%ED%86%B5119%EC%9D%98%20%EB%B3%B8%EC%A7%84",
        width: 1200,
        height: 630,
        alt: "오른스푼",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "오른스푼 | 드럼통119의 정치·사회 해설 본진",
    description: "흘러가는 정치·사회 이슈를 드럼통119의 관점으로 정리하는 1인 미디어입니다.",
    images: [
      "https://www.rightspoon.co.kr/api/og?title=%EC%98%A4%EB%A5%B8%EC%8A%A4%ED%91%BC&category=%EB%93%9C%EB%9F%BC%ED%86%B5119%EC%9D%98%20%EB%B3%B8%EC%A7%84",
    ],
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
        <meta name="naver-site-verification" content="861bf9eb615fee092a871e634ac6a0e144997697" />
        {process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION && (
          <meta name="google-site-verification" content={process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION} />
        )}
        <meta name="google-adsense-account" content="ca-pub-9599627662073241" />
        <link rel="alternate" type="application/rss+xml" title="오른스푼 RSS" href="https://www.rightspoon.co.kr/rss.xml" />
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
        {children}
      </body>
    </html>
  );
}
