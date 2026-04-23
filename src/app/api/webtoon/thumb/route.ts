import { createClient } from "@/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const path = searchParams.get("path");

    if (!path) {
        return NextResponse.json({ error: "path is required" }, { status: 400 });
    }

    const supabase = await createClient();

    // 단일 파일에 대한 서명된 URL 생성 (5분 만료)
    const { data, error } = await supabase.storage
        .from("webtoon-pages")
        .createSignedUrl(path, 300);

    if (error || !data?.signedUrl) {
        return NextResponse.json({ error: "Failed to generate signed URL" }, { status: 500 });
    }

    // 클라이언트의 <img> 태그가 올바르게 이미지를 로드할 수 있도록 서명된 URL로 리다이렉트
    return NextResponse.redirect(data.signedUrl);
}
