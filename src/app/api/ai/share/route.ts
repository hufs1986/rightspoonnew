import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

type ShareRequest = {
    title?: string;
    excerpt?: string;
    url?: string;
};

function fallbackShare({ title, excerpt, url }: ShareRequest) {
    const safeTitle = title?.trim() || "오른스푼 해설";
    const safeExcerpt = excerpt?.trim().replace(/\s+/g, " ").slice(0, 140) || "흘러가는 이슈를 오른쪽 시각으로 다시 정리했습니다.";
    const safeUrl = url?.trim() || "https://www.rightspoon.co.kr";

    return {
        caption: `[오른스푼]\n${safeTitle}\n\n${safeExcerpt}\n\n짧은 반응으로 끝내기 아까운 이슈라 글로 정리했습니다.\n전문은 오른스푼에서 읽어주세요.\n\n${safeUrl}\n\n#오른스푼 #드럼통119 #정치해설 #사회이슈`,
        story: `${safeTitle}\n\n짧게 지나간 이슈, 오른스푼에서 길게 정리했습니다.\n프로필 링크에서 확인`,
        pinnedComment: `전문은 오른스푼에 정리했습니다. 링크로 저장해두고 천천히 읽어보세요.\n${safeUrl}`,
    };
}

function extractOutputText(data: unknown) {
    if (!data || typeof data !== "object") return "";
    const record = data as { output_text?: unknown; output?: unknown };
    if (typeof record.output_text === "string") return record.output_text;

    if (!Array.isArray(record.output)) return "";
    return record.output
        .flatMap((item) => {
            if (!item || typeof item !== "object") return [];
            const content = (item as { content?: unknown }).content;
            if (!Array.isArray(content)) return [];
            return content
                .map((part) => {
                    if (!part || typeof part !== "object") return "";
                    const text = (part as { text?: unknown }).text;
                    return typeof text === "string" ? text : "";
                })
                .filter(Boolean);
        })
        .join("\n")
        .trim();
}

export async function POST(request: Request) {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
        return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 });
    }

    const body = (await request.json()) as ShareRequest;
    const apiKey = process.env.OPENAI_API_KEY;

    if (!body.title?.trim()) {
        return NextResponse.json({ error: "title is required" }, { status: 400 });
    }

    if (!apiKey) {
        return NextResponse.json({
            mode: "fallback",
            share: fallbackShare(body),
            message: "OPENAI_API_KEY가 없어 기본 공유 문구를 사용했습니다.",
        });
    }

    const prompt = `
너는 오른스푼(www.rightspoon.co.kr)의 SNS 편집자다.
정치·사회 해설 글을 인스타그램에서 사이트 유입으로 연결하는 문구를 만든다.

규칙:
- 한국어로 작성한다.
- 선정적 과장보다 클릭 후 읽을 이유를 분명히 쓴다.
- 기사 원문을 복사하지 않는다.
- 캡션은 줄바꿈을 포함해 인스타 게시물에 바로 붙여넣을 수 있게 쓴다.
- 스토리 문구는 짧고 강하게 쓴다.
- 고정 댓글은 사이트 전문으로 유도한다.
- 해시태그는 4~6개만 사용한다.

입력:
제목: ${body.title}
요약: ${body.excerpt || "미입력"}
URL: ${body.url || "https://www.rightspoon.co.kr"}

아래 JSON 형식만 출력한다.
{
  "caption": "인스타 캡션",
  "story": "스토리 문구",
  "pinnedComment": "고정 댓글"
}
`.trim();

    const response = await fetch("https://api.openai.com/v1/responses", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
            model: process.env.OPENAI_MODEL || "gpt-5.2",
            input: prompt,
            text: {
                format: {
                    type: "json_schema",
                    name: "rightspoon_share_copy",
                    schema: {
                        type: "object",
                        additionalProperties: false,
                        required: ["caption", "story", "pinnedComment"],
                        properties: {
                            caption: { type: "string" },
                            story: { type: "string" },
                            pinnedComment: { type: "string" },
                        },
                    },
                    strict: true,
                },
            },
        }),
    });

    if (!response.ok) {
        const detail = await response.text();
        return NextResponse.json({
            mode: "fallback",
            share: fallbackShare(body),
            message: `AI 공유 문구 생성에 실패해 기본 문구를 사용했습니다. ${detail.slice(0, 240)}`,
        });
    }

    const data = await response.json();
    const outputText = extractOutputText(data);

    try {
        const share = JSON.parse(outputText);
        return NextResponse.json({ mode: "ai", share });
    } catch {
        return NextResponse.json({
            mode: "fallback",
            share: fallbackShare(body),
            message: "AI 응답을 JSON으로 해석하지 못해 기본 공유 문구를 사용했습니다.",
        });
    }
}
