import { createClient } from "@/utils/supabase/server";
import { stripHtml, cleanYoutubeId } from "@/utils/articleFormat";

function cdata(value: string | null | undefined) {
    return `<![CDATA[${(value || "").replaceAll("]]>", "]]]]><![CDATA[>")}]]>`;
}

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
            const link = encodeURI(`https://www.rightspoon.co.kr/article/${a.slug || a.id}`);
            const excerpt = stripHtml(a.content).substring(0, 200) + "…";
            const thumb = yId
                ? `https://img.youtube.com/vi/${yId}/0.jpg`
                : `https://www.rightspoon.co.kr/api/og?title=${encodeURIComponent(a.title)}&category=${encodeURIComponent(a.category)}`;
            const thumbType = yId ? "image/jpeg" : "image/png";
            const pubDate = new Date(a.created_at).toUTCString();

            return `    <item>
      <title>${cdata(a.title)}</title>
      <link>${link}</link>
      <guid isPermaLink="true">${link}</guid>
      <description>${cdata(excerpt)}</description>
      <author>drumtong119@gmail.com (드럼통119)</author>
      <category>${cdata(a.category)}</category>
      <pubDate>${pubDate}</pubDate>${thumb ? `\n      <enclosure url="${thumb}" type="${thumbType}" length="0" />` : ""}
    </item>`;
        })
        .join("\n");

    const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>오른스푼 | 드럼통119의 정치·사회 해설 본진</title>
    <link>https://www.rightspoon.co.kr</link>
    <description>흘러가는 정치·사회 이슈를 드럼통119의 관점으로 정리하는 1인 해설 미디어입니다.</description>
    <language>ko-KR</language>
    <copyright>© 2026 오른스푼(Right Spoon)</copyright>
    <managingEditor>drumtong119@gmail.com (드럼통119)</managingEditor>
    <webMaster>drumtong119@gmail.com (오른스푼)</webMaster>
    <ttl>60</ttl>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="https://www.rightspoon.co.kr/rss.xml" rel="self" type="application/rss+xml" />
    <image>
      <url>https://www.rightspoon.co.kr/logo-v2.png</url>
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
