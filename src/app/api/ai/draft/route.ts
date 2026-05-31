import { NextResponse } from "next/server";

type DraftRequest = {
    topic?: string;
    sourceUrl?: string;
    coreClaim?: string;
    opposingFrame?: string;
    category?: string;
};

function fallbackDraft({ topic, sourceUrl, coreClaim, opposingFrame, category }: DraftRequest) {
    const safeTopic = topic?.trim() || "오늘의 정치·사회 이슈";
    const safeClaim = coreClaim?.trim() || "이 사안은 겉으로 보이는 명분보다 실제로 어떤 결과를 만드는지 따져봐야 합니다.";
    const safeFrame = opposingFrame?.trim() || "주류 프레임은 명분과 감정에 초점을 맞추지만, 실제 책임과 권한의 이동은 흐리게 다룹니다.";
    const safeCategory = category?.trim() || "정치";

    return {
        title: `${safeTopic}: 왜 지금 다시 봐야 하나`,
        category: safeCategory,
        content: `
<h2>한 줄 요약</h2>
<p>${safeClaim}</p>
<h2>무슨 일이 있었나</h2>
<p>‘${safeTopic}’를 둘러싼 논란이 커지고 있습니다. 이 글은 원문을 반복하는 대신, 사건의 핵심 쟁점과 독자가 놓치기 쉬운 프레임을 정리합니다.</p>
${sourceUrl ? `<p><strong>출처:</strong> <a href="${sourceUrl}" target="_blank" rel="noopener noreferrer nofollow">${sourceUrl}</a></p>` : `<p><strong>출처:</strong> 원문 기사 또는 공식 자료 링크를 추가하세요.</p>`}
<h2>상대 프레임</h2>
<p>${safeFrame}</p>
<h2>오른스푼의 해석</h2>
<p>${safeClaim}</p>
<p>정치·사회 이슈는 좋은 말로 포장될 때가 많습니다. 그래서 명분만 볼 것이 아니라, 그 결과가 누구의 권한을 키우고 누구의 책임을 흐리게 만드는지 봐야 합니다.</p>
<h2>독자가 봐야 할 질문</h2>
<ul>
<li>이 사안에서 가장 이익을 보는 사람은 누구인가?</li>
<li>언론이 강조하는 명분과 실제 결과는 일치하는가?</li>
<li>반대 의견을 악마화하지 않고도 설명 가능한 근거가 있는가?</li>
</ul>
<h2>결론</h2>
<p>이 이슈는 단순한 하루짜리 뉴스가 아닙니다. 같은 프레임이 반복될 때 사회가 어떤 방향으로 밀려가는지 확인하는 사례입니다. 오른스푼은 짧은 분노보다 오래 남는 해설로 이 흐름을 기록하겠습니다.</p>
`.trim(),
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
    const body = (await request.json()) as DraftRequest;
    const apiKey = process.env.OPENAI_API_KEY;

    if (!body.topic?.trim() || !body.coreClaim?.trim()) {
        return NextResponse.json({ error: "topic and coreClaim are required" }, { status: 400 });
    }

    if (!apiKey) {
        return NextResponse.json({
            mode: "fallback",
            draft: fallbackDraft(body),
            message: "OPENAI_API_KEY가 없어 로컬 초안 생성기를 사용했습니다.",
        });
    }

    const prompt = `
너는 오른스푼(www.rightspoon.co.kr)의 편집 보조 AI다.
목표는 뉴스 원문을 베끼는 것이 아니라, 공개 이슈를 1인 정치·사회 해설 글의 초안으로 구조화하는 것이다.

규칙:
- 한국어로 작성한다.
- 특정 기사 문장을 길게 복사하지 않는다.
- 사실관계는 단정하지 말고, 사용자가 편집할 수 있는 초안으로 쓴다.
- 제목은 검색 가능한 형태로 만든다.
- 본문은 HTML 조각으로 작성한다. h2, p, ul, li, blockquote, a 태그만 사용한다.
- 반드시 출처 확인 문단을 넣는다.
- 최종 발행 전 운영자 검토가 필요하다는 전제로 쓴다.

입력:
카테고리: ${body.category || "정치"}
소재/이슈: ${body.topic}
출처 URL: ${body.sourceUrl || "미입력"}
오른스푼 핵심 주장: ${body.coreClaim}
상대/주류 프레임: ${body.opposingFrame || "미입력"}

아래 JSON 형식만 출력한다.
{
  "title": "검색형 제목",
  "category": "정치|경제|역사 중 하나",
  "content": "<h2>한 줄 요약</h2>..."
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
                    name: "rightspoon_draft",
                    schema: {
                        type: "object",
                        additionalProperties: false,
                        required: ["title", "category", "content"],
                        properties: {
                            title: { type: "string" },
                            category: { type: "string", enum: ["정치", "경제", "역사"] },
                            content: { type: "string" },
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
            draft: fallbackDraft(body),
            message: `AI 초안 생성에 실패해 로컬 초안을 사용했습니다. ${detail.slice(0, 240)}`,
        });
    }

    const data = await response.json();
    const outputText = extractOutputText(data);

    try {
        const draft = JSON.parse(outputText);
        return NextResponse.json({ mode: "ai", draft });
    } catch {
        return NextResponse.json({
            mode: "fallback",
            draft: fallbackDraft(body),
            message: "AI 응답을 JSON으로 해석하지 못해 로컬 초안을 사용했습니다.",
        });
    }
}
