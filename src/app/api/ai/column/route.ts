import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { extractVideoId, fetchTranscript } from "@/lib/youtube";
import { generateColumn, publishColumn } from "@/lib/columnGenerator";

export const maxDuration = 120;

type ColumnRequest = {
    youtubeUrl?: string;
    transcript?: string;
    notes?: string;
    videoTitle?: string;
    memo?: string;
    publish?: boolean;
};

export async function POST(request: Request) {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
        return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 });
    }

    const body = (await request.json().catch(() => ({}))) as ColumnRequest;
    let transcript = body.transcript?.trim() || "";
    let videoTitle = body.videoTitle?.trim() || "";
    const notes = body.notes?.trim() || "";
    const videoId = body.youtubeUrl ? extractVideoId(body.youtubeUrl) : null;

    // 자막이 없으면 링크에서 가져온다. 기획 메모만 있으면 자막 없이도 진행한다.
    if (!transcript && videoId) {
        try {
            const fetched = await fetchTranscript(body.youtubeUrl!);
            transcript = fetched.transcript;
            videoTitle = videoTitle || fetched.title;
        } catch (err) {
            if (!notes) {
                return NextResponse.json(
                    { error: err instanceof Error ? err.message : "자막을 가져오지 못했습니다." },
                    { status: 422 }
                );
            }
        }
    }

    if (!transcript && !notes) {
        return NextResponse.json(
            { error: "유튜브 링크, 대본, 또는 기획 내용 메모 중 하나는 필요합니다." },
            { status: 400 }
        );
    }

    if ((transcript || notes).length < 50) {
        return NextResponse.json(
            { error: "입력이 너무 짧습니다. 기획 내용이나 대본을 조금 더 자세히 적어주세요." },
            { status: 422 }
        );
    }

    const { column, mode, message } = await generateColumn({
        transcript: transcript || undefined,
        notes: notes || undefined,
        videoTitle,
        memo: body.memo,
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
