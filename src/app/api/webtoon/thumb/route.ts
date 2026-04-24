import { createClient } from "@/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const path = searchParams.get("path");
    const episodeId = searchParams.get("episodeId");

    const supabase = await createClient();
    let storagePath = path;

    // episodeId가 있으면 DB에서 첫 번째 페이지 경로를 가져옴
    if (!storagePath && episodeId) {
        const { data: ep } = await supabase
            .from("webtoon_episodes")
            .select("pages")
            .eq("id", episodeId)
            .single();

        const pages = ep?.pages as { path: string; order: number }[] | null;
        storagePath = pages?.[0]?.path || null;
    }

    if (!storagePath) {
        return NextResponse.json({ error: "path or episodeId is required" }, { status: 400 });
    }

    // 단일 파일에 대한 서명된 URL 생성 (5분 만료)
    const { data, error } = await supabase.storage
        .from("webtoon-pages")
        .createSignedUrl(storagePath, 300);

    if (error || !data?.signedUrl) {
        return NextResponse.json({ error: "Failed to generate signed URL" }, { status: 500 });
    }

    // 클라이언트의 <img> 태그가 올바르게 이미지를 로드할 수 있도록 서명된 URL로 리다이렉트
    return NextResponse.redirect(data.signedUrl);
}
