import { NextResponse } from "next/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import { fetchTranscript } from "@/lib/youtube";
import { generateColumn, publishColumn } from "@/lib/columnGenerator";

export const maxDuration = 300;

// 새 유튜브 영상 → 자동 칼럼 발행 파이프라인.
// 필요한 환경변수:
//   CRON_SECRET                 — 크론 호출 인증 (Vercel cron이 Authorization 헤더로 전달)
//   AUTO_PUBLISH_ENABLED=true   — 이 값일 때만 실제 발행. 없으면 검출만 하고 종료
//   SUPABASE_SERVICE_ROLE_KEY   — 발행 insert에 필요 (RLS: authenticated only)
//   OPENAI_API_KEY              — 칼럼 생성에 필요
//   YOUTUBE_CHANNEL_ID          — 없으면 기본값으로 드럼통119 채널 사용
const DEFAULT_CHANNEL_ID = "UCzoap467OGtjhLk5qmU53OA";
const MAX_PER_RUN = 3;

type FeedEntry = { videoId: string; title: string; published: string };

function parseFeed(xml: string): FeedEntry[] {
    const entries: FeedEntry[] = [];
    for (const m of xml.matchAll(/<entry>([\s\S]*?)<\/entry>/g)) {
        const block = m[1];
        const videoId = block.match(/<yt:videoId>([\w-]{11})<\/yt:videoId>/)?.[1];
        const title = block.match(/<title>([\s\S]*?)<\/title>/)?.[1]?.trim() || "";
        const published = block.match(/<published>([^<]+)<\/published>/)?.[1] || "";
        if (videoId) entries.push({ videoId, title, published });
    }
    return entries.sort((a, b) => b.published.localeCompare(a.published));
}

export async function GET(request: Request) {
    const cronSecret = process.env.CRON_SECRET;
    const auth = request.headers.get("authorization");
    if (!cronSecret || auth !== `Bearer ${cronSecret}`) {
        return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }

    if (process.env.AUTO_PUBLISH_ENABLED !== "true") {
        return NextResponse.json({
            skipped: true,
            reason: "AUTO_PUBLISH_ENABLED=true 가 아닙니다. 검출만 하려면 enabled 확인을 켜세요.",
        });
    }
    if (!process.env.OPENAI_API_KEY) {
        return NextResponse.json({ skipped: true, reason: "OPENAI_API_KEY 미설정" });
    }
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!serviceKey) {
        return NextResponse.json({ skipped: true, reason: "SUPABASE_SERVICE_ROLE_KEY 미설정" });
    }

    const channelId = process.env.YOUTUBE_CHANNEL_ID || DEFAULT_CHANNEL_ID;
    const feedRes = await fetch(
        `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`,
        { cache: "no-store" }
    );
    if (!feedRes.ok) {
        return NextResponse.json({ error: "채널 피드를 읽지 못했습니다." }, { status: 502 });
    }
    const entries = parseFeed(await feedRes.text());
    if (!entries.length) {
        return NextResponse.json({ processed: 0, reason: "피드에 영상이 없습니다." });
    }

    const supabase = createServiceClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        serviceKey,
        { auth: { persistSession: false } }
    );

    const { data: existing } = await supabase
        .from("articles")
        .select("youtube_id")
        .in("youtube_id", entries.map((e) => e.videoId));
    const done = new Set((existing || []).map((r) => r.youtube_id));
    const fresh = entries.filter((e) => !done.has(e.videoId)).slice(0, MAX_PER_RUN);

    const results: { videoId: string; status: string; path?: string; error?: string }[] = [];
    for (const entry of fresh) {
        try {
            const t = await fetchTranscript(entry.videoId);
            if (t.transcript.length < 200) {
                results.push({ videoId: entry.videoId, status: "skipped", error: "자막이 너무 짧음" });
                continue;
            }
            const { column, mode } = await generateColumn({
                source: `[영상 자막]\n${t.transcript}`,
                videoTitle: entry.title || t.title,
            });
            if (mode !== "ai") {
                results.push({ videoId: entry.videoId, status: "skipped", error: "AI 생성 실패" });
                continue;
            }
            const published = await publishColumn(column, entry.videoId, supabase);
            results.push({ videoId: entry.videoId, status: "published", path: published.path });
        } catch (err) {
            results.push({
                videoId: entry.videoId,
                status: "error",
                error: err instanceof Error ? err.message : "unknown",
            });
        }
    }

    return NextResponse.json({ checked: entries.length, fresh: fresh.length, results });
}
