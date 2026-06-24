import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

type RewriteRequest = {
    title?: string;
    category?: string;
    content?: string;
};

function stripHtml(html: string) {
    return html.replace(/<[^>]*>/g, " ").replace(/&nbsp;/g, " ").replace(/\s+/g, " ").trim();
}

function fallbackRewrite({ title, category, content }: RewriteRequest) {
    const safeTitle = title?.trim() || "오른스푼 기존 글";
    const safeCategory = category?.trim() || "정치";
    const plainText = stripHtml(content || "");
    const excerpt = plainText.slice(0, 700) || "기존 글의 핵심 문제의식을 여기에 정리하세요.";
    const searchTitle = /이유|문제|전망|해설|정리|논란|뜻|쟁점|비판|비교|왜|어떻게/.test(safeTitle)
        ? safeTitle
        : `${safeTitle}: 왜 지금 다시 봐야 하나`;

    return {
        title: searchTitle,
        category: safeCategory,
        content: `
<h2>한 줄 요약</h2>
<p>이 글은 ‘${safeTitle}’를 둘러싼 쟁점을 오른스푼의 관점으로 다시 정리한 해설입니다.</p>
<h2>왜 이 이슈가 중요한가</h2>
<p>정치·사회 이슈는 하루짜리 분노로 소비되기 쉽습니다. 하지만 반복되는 프레임과 권한의 이동을 보면, 이 사안이 단순한 사건이 아니라 판단 기준의 문제라는 점이 드러납니다.</p>
<h2>기존 글의 핵심 문제의식</h2>
<p>${excerpt}</p>
<h2>근거와 맥락</h2>
<p><strong>출처:</strong> 관련 기사, 공식 자료, 통계, 발언 원문 링크를 추가하세요. 기존 글의 주장과 연결되는 사실관계를 이 문단에서 보강해야 합니다.</p>
<h2>오른스푼의 해석</h2>
<p>핵심은 겉으로 보이는 명분과 실제 결과를 분리해서 보는 것입니다. 누가 도덕적 명분을 가져가고, 누가 책임을 회피하며, 그 비용을 누가 부담하는지 확인해야 합니다.</p>
<h2>독자가 봐야 할 질문</h2>
<ul>
<li>이 사안에서 가장 이익을 보는 집단은 누구인가?</li>
<li>언론이 강조한 명분과 실제 결과는 일치하는가?</li>
<li>반대 의견을 단순히 악마화하지 않고도 설명할 수 있는 근거가 있는가?</li>
</ul>
<h2>함께 읽을 글</h2>
<ul>
<li><a href="/category/politics">정치 해설 더 보기</a></li>
<li><a href="/from-instagram">인스타에서 오신 분들을 위한 안내</a></li>
</ul>
<h2>결론</h2>
<p>이 글의 목적은 분노를 키우는 것이 아니라 판단 기준을 남기는 것입니다. 오른스푼은 흘러가는 이슈를 다시 꺼내 읽을 수 있는 해설로 축적하겠습니다.</p>
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
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
        return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 });
    }

    const body = (await request.json()) as RewriteRequest;
    const apiKey = process.env.OPENAI_API_KEY;

    if (!body.title?.trim() || !body.content?.trim()) {
        return NextResponse.json({ error: "title and content are required" }, { status: 400 });
    }

    if (!apiKey) {
        return NextResponse.json({
            mode: "fallback",
            draft: fallbackRewrite(body),
            message: "OPENAI_API_KEY가 없어 로컬 리라이트 구조를 사용했습니다.",
        });
    }

    const prompt = `
너는 오른스푼(www.rightspoon.co.kr)의 리라이트 편집 AI다.
목표는 기존 글을 검색 유입과 애드센스 심사에 더 적합한 정치·사회 해설 글로 재구성하는 것이다.

규칙:
- 한국어로 작성한다.
- 기존 글의 문제의식과 관점은 유지하되, 표현을 더 구조화한다.
- 원문을 단순히 반복하지 말고 요약, 쟁점, 근거 확인, 결론으로 재배열한다.
- 본문은 1,200자 이상을 목표로 한다.
- h2, p, ul, li, a 태그만 사용한다.
- 반드시 "한 줄 요약", "근거와 맥락", "오른스푼의 해석", "함께 읽을 글", "결론" 섹션을 포함한다.
- 사실관계는 확정적으로 꾸며내지 말고, 운영자가 출처를 채울 수 있는 자리로 남긴다.
- 함께 읽을 글에는 /category/politics 또는 /from-instagram 내부 링크를 포함한다.

입력:
제목: ${body.title}
카테고리: ${body.category || "정치"}
기존 본문:
${stripHtml(body.content).slice(0, 5000)}

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
                    name: "rightspoon_rewrite",
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
            draft: fallbackRewrite(body),
            message: `AI 리라이트에 실패해 로컬 구조를 사용했습니다. ${detail.slice(0, 240)}`,
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
            draft: fallbackRewrite(body),
            message: "AI 응답을 JSON으로 해석하지 못해 로컬 리라이트 구조를 사용했습니다.",
        });
    }
}
