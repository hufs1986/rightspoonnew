import { createClient } from "@/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const episodeId = searchParams.get("episodeId");

    if (!episodeId) {
        return NextResponse.json({ error: "episodeId is required" }, { status: 400 });
    }

    const supabase = await createClient();

    // 에피소드 정보 가져오기
    const { data: episode, error } = await supabase
        .from("webtoon_episodes")
        .select("pages")
        .eq("id", episodeId)
        .single();

    if (error || !episode) {
        return NextResponse.json({ error: "Episode not found" }, { status: 404 });
    }

    const pages = episode.pages as { path: string; order: number }[];

    if (!pages || pages.length === 0) {
        return NextResponse.json({ signedUrls: [] });
    }

    // 각 페이지에 대해 서명된 URL 생성 (5분 만료)
    const paths = pages
        .sort((a, b) => a.order - b.order)
        .map((p) => p.path);

    const { data: signedData, error: signError } = await supabase.storage
        .from("webtoon-pages")
        .createSignedUrls(paths, 300); // 300초 = 5분

    if (signError) {
        return NextResponse.json({ error: "Failed to generate signed URLs" }, { status: 500 });
    }

    const signedUrls = (signedData || []).map((item) => item.signedUrl);

    return NextResponse.json({ signedUrls });
}
