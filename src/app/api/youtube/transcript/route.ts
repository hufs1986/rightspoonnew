import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { extractVideoId, fetchTranscript } from "@/lib/youtube";

export const maxDuration = 30;

export async function POST(request: Request) {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
        return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 });
    }

    const body = (await request.json().catch(() => ({}))) as { url?: string };
    const url = body.url?.trim() || "";
    const videoId = extractVideoId(url);

    if (!videoId) {
        return NextResponse.json({ error: "유효한 유튜브 링크가 아닙니다." }, { status: 400 });
    }

    try {
        const result = await fetchTranscript(url);
        return NextResponse.json(result);
    } catch (err) {
        const message = err instanceof Error ? err.message : "자막을 가져오지 못했습니다.";
        return NextResponse.json({ error: message, videoId }, { status: 422 });
    }
}
