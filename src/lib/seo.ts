import type { Metadata } from "next";
import { naverClamp } from "./naver-markup";

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.rightspoon.co.kr";
export const SITE_NAME = "오른스푼";

export const DEFAULT_DESCRIPTION = naverClamp("흘러가는 정치·사회 이슈를 드럼통119의 관점으로 정리하는 1인 미디어입니다.");
export const DEFAULT_TITLE = "오른스푼 | 드럼통119의 정치·사회 해설 본진";

export interface SEOProps {
  title: string;
  description: string;
  urlPath: string;
  imageUrl?: string;
  publishedTime?: string;
  modifiedTime?: string;
  author?: string;
}

export function generatePageMetadata({
  title,
  description,
  urlPath,
  imageUrl,
  publishedTime,
  modifiedTime,
  author = "드럼통119"
}: SEOProps): Metadata {
  const fullTitle = `${title} | ${SITE_NAME}`;
  const clampedDesc = naverClamp(description);
  const canonicalUrl = `${SITE_URL}${urlPath.startsWith('/') ? urlPath : '/' + urlPath}`;

  const metadata: Metadata = {
    title: fullTitle,
    description: clampedDesc,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      type: publishedTime ? "article" : "website",
      locale: "ko_KR",
      url: canonicalUrl,
      siteName: SITE_NAME,
      title: title,
      description: clampedDesc,
      images: imageUrl ? [{ url: imageUrl, width: 1200, height: 630, alt: title }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: title,
      description: clampedDesc,
      images: imageUrl ? [imageUrl] : undefined,
    },
  };

  if (publishedTime && metadata.openGraph && (metadata.openGraph as any).type === "article") {
    // Cast to any to safely append article-specific fields in Next.js metadata format
    (metadata.openGraph as any).publishedTime = publishedTime;
    if (modifiedTime) {
      (metadata.openGraph as any).modifiedTime = modifiedTime;
    }
    (metadata.openGraph as any).authors = [author];
  }

  return metadata;
}
