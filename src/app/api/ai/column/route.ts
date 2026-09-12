import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { extractVideoId, fetchTranscript } from "@/lib/youtube";
import { generateColumn, publishColumn } from "@/lib/columnGenerator";

export const maxDuration = 120;

type ColumnRequest = {
    youtubeUrl?: string;
    source?: string;
    videoTitle?: string;
    publish?: boolean;
};

export async function POST(request: Request) {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
        return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 });
    }

    const body = (await request.json().catch(() => ({}))) as ColumnRequest;
    let source = body.source?.trim() || "";
    let videoTitle = body.videoTitle?.trim() || "";
    const videoId = body.youtubeUrl ? extractVideoId(body.youtubeUrl) : null;

    // 재료가 없고 영상 링크만 있으면 자막이라도 가져와 재료로 쓴다.
    if (!source && videoId) {
        try {
            const fetched = await fetchTranscript(body.youtubeUrl!);
            source = fetched.transcript;
            videoTitle = videoTitle || fetched.title;
        } catch (err) {
            return NextResponse.json(
                { error: err instanceof Error ? err.message : "자막을 가져오지 못했습니다." },
                { status: 422 }
            );
        }
    }

    if (!source) {
        return NextResponse.json(
            { error: "기획안이나 원기사를 붙여넣어 주세요." },
            { status: 400 }
        );
    }

    if (source.length < 50) {
        return NextResponse.json(
            { error: "입력이 너무 짧습니다. 기획안이나 원기사를 조금 더 자세히 붙여넣어 주세요." },
            { status: 422 }
        );
    }

    const { column, mode, message } = await generateColumn({
        source,
        videoTitle,
    });

    if (body.publish) {
        try {
            const published = await publishColumn(column, videoId);
            return NextResponse.json({ mode, message, published, draft: column });
        } catch (err) {
            return NextResponse.json(
                { error: err instanceof Error ? err.message : "발행에 실패했습니다.", draft: column },
                { status: 500 }
            );
        }
    }

    return NextResponse.json({
        mode,
        message,
        draft: column,
        videoId,
        videoTitle,
    });
}
