// 드럼통119 문체 엔진.
// 발행된 실제 기사를 문체 앵커(few-shot)로 프롬프트에 넣어
// "AI가 쓴 글"이 아니라 "드럼통119가 다듬은 글"이 나오게 한다.

import { createClient } from "@/utils/supabase/server";
import { stripHtml } from "@/utils/articleFormat";

export type StyleAnchor = {
    title: string;
    text: string;
};

/** 영상 원고에서 만든 글(youtube_id 있음)을 우선으로 문체 샘플을 가져온다. */
export async function fetchStyleAnchors(limit = 3): Promise<StyleAnchor[]> {
    const supabase = await createClient();
    const { data } = await supabase
        .from("articles")
        .select("title, content, youtube_id")
        .order("created_at", { ascending: false })
        .limit(40);

    if (!data?.length) return [];

    const sorted = [...data].sort((a, b) =>
        (b.youtube_id ? 1 : 0) - (a.youtube_id ? 1 : 0)
    );

    return sorted.slice(0, limit).map((row) => ({
        title: row.title || "",
        text: stripHtml(row.content).slice(0, 3500),
    }));
}

export function buildColumnPrompt(input: {
    transcript?: string;
    notes?: string;
    videoTitle?: string;
    memo?: string;
    anchors: StyleAnchor[];
}) {
    const { transcript, notes, videoTitle, memo, anchors } = input;

    const anchorBlock = anchors.length
        ? anchors
              .map(
                  (a, i) => `[참고 글 ${i + 1}]\n제목: ${a.title}\n본문:\n${a.text}`
              )
              .join("\n\n")
        : "(참고 글 없음)";

    const hasTranscript = !!transcript?.trim();
    const hasNotes = !!notes?.trim();

    const sourceBlock = [
        notes?.trim() ? `[영상 기획 내용 / 핵심 주장 메모]\n${notes.trim()}` : "",
        transcript?.trim()
            ? `[영상 자막 원고]\n${transcript.slice(0, 20000)}`
            : "",
    ]
        .filter(Boolean)
        .join("\n\n");

    return `
너는 정치·사회 해설 사이트 '오른스푼'(www.rightspoon.co.kr) 운영자 드럼통119의 편집자다.
아래 입력은 드럼통119 본인의 영상 기획 메모 또는 영상 자막 원고다.
네 임무는 새 글을 창작하는 것이 아니다. 그가 이미 갖고 있는 주장과 시선을 그의 문체 그대로 읽기 좋은 칼럼으로 완성하는 것이다.

[문체 규칙 — 반드시 지킬 것]
- 아래 [참고 글]들이 실제 발행된 드럼통119의 글이다. 문장 길이, 어조, 비유 방식, 글의 리듬을 이 글들과 동일하게 맞춘다.
- 종결은 "~이다/~했다/~던진다"체를 기본으로 한다. "~입니다/합니다"는 인용이나 강조 외에 쓰지 않는다.
- 짧고 단호한 단문 위주. 한 문단에 감정을 응축한 한 줄짜리 문장("여기서부터 이상하다." "정책은 마법이 아니다.")을 살린다.
- 상대 프레임을 먼저 인정한 뒤 "그런데"로 비용·권한·책임의 빈틈을 찌르는 전개를 유지한다.
- 그 특유의 일상 비유(아파트 주민회의, 버스 좌석, 식당 외상 등)와 수사적 질문("누가 돈 내고 있나?" "왜일까?")을 자연스럽게 쓴다.
- 제목은 그의 패턴을 따른다: 도발적 은유 + 콜론 부제("~: ~의 소름 돋는 민낯"), 또는 서술형 질문("~ 그런데 누가 돈 내고 있나?"). 검색 키워드를 자연스럽게 포함한다.

[작성 규칙]
${hasNotes ? "- [영상 기획 내용]이 이 글의 뼈다. 메모가 거칠고 짧아도 그 핵심 주장과 관점을 그대로 살려 완성된 칼럼으로 확장한다. 메모의 주장 순서를 따르되 문장과 비유는 참고 글의 문체로 새로 쓴다." : ""}
${hasTranscript ? "- 자동자막 오류(음절 오인, 조사 누락, 어색한 띄어쓰기)는 문맥에 맞게 교정한다. 예: '기계한' → '기괴한', '제뇌' → '세뇌'. 영상 특유의 서두 인사, 구독 유도, 잡담은 버린다." : ""}
- 입력에 없는 새로운 사실, 수치, 인용, 사례를 지어내지 않는다. 없는 근거를 꾸미지 말고 그의 논법으로 주장을 편다.
- 본문은 오직 <p> 태그로만 작성한다. h2/h3 소제목, 목록, 인용 태그를 만들지 않는다. 문단 사이는 자연스럽게 끊는다.
- "결론적으로", "요약하면", "~에 대해 알아보겠습니다" 같은 AI 상투어 금지. 뉴스 기사체·보고서체 금지.
- 마지막 문단은 여운이 남는 단호한 문장이나 질문으로 닫는다.
- 분량은 입력 분량과 주제의 무게에 비례한다. 대략 1,000~2,500자. 억지로 늘리지 않는다.

${memo ? `[운영자 추가 지시]\n${memo}\n(이 지시를 우선 반영하되 문체 규칙은 지킨다.)\n` : ""}
[영상 제목]
${videoTitle || "미입력"}

${sourceBlock}

[참고 글 — 이 사람의 실제 글이다. 내용을 베끼지 말고 문체만 흡수한다]
${anchorBlock}

아래 JSON만 출력한다.
{
  "title": "드럼통119식 제목",
  "category": "정치|경제|역사 중 하나",
  "content": "<p>...</p><p>...</p>"
}
`.trim();
}

/** 본문 길이로 읽기 시간(분)을 추정. 한국어 기준 분당 약 500자. */
export function estimateReadTime(htmlContent: string): number {
    const len = stripHtml(htmlContent).length;
    return Math.max(1, Math.min(15, Math.round(len / 500)));
}
