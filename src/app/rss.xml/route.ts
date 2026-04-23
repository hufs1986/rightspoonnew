import { createClient } from "@/utils/supabase/server";
import { stripHtml, cleanYoutubeId } from "@/utils/articleFormat";

export async function GET() {
    const supabase = await createClient();

    const { data: articles } = await supabase
        .from("articles")
        .select("id, slug, title, content, category, author, created_at, youtube_id")
        .order("created_at", { ascending: false })
        .limit(20);

    const items = (articles || [])
        .map((a) => {
            const yId = cleanYoutubeId(a.youtube_id);
            const link = `https://www.rightspoon.co.kr/article/${a.slug || a.id}`;
            const excerpt = stripHtml(a.content).substring(0, 200) + "…";
            const thumb = yId ? `https://img.youtube.com/vi/${yId}/0.jpg` : "";
            const pubDate = new Date(a.created_at).toUTCString();

            return `    <item>
      <title><![CDATA[${a.title}]]></title>
      <link>${link}</link>
      <guid isPermaLink="true">${link}</guid>
      <description><![CDATA[${excerpt}]]></description>
      <author>drumtong119@gmail.com (드럼통119)</author>
      <category>${a.category}</category>
      <pubDate>${pubDate}</pubDate>${thumb ? `\n      <enclosure url="${thumb}" type="image/jpeg" length="0" />` : ""}
    </item>`;
        })
        .join("\n");

    const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>오른스푼 | Right Spoon</title>
    <link>https://www.rightspoon.co.kr</link>
    <description>대한민국 오른 시각의 뉴스와 칼럼. 유튜브 영상과 함께 깊이 있는 분석을 제공합니다.</description>
    <language>ko</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="https://www.rightspoon.co.kr/rss.xml" rel="self" type="application/rss+xml" />
    <image>
      <url>https://www.rightspoon.co.kr/logo-character.webp</url>
      <title>오른스푼</title>
      <link>https://www.rightspoon.co.kr</link>
    </image>
${items}
  </channel>
</rss>`;

    return new Response(rss, {
        headers: {
            "Content-Type": "application/xml; charset=utf-8",
            "Cache-Control": "s-maxage=3600, stale-while-revalidate",
        },
    });
}
