// 영상 원고 → 드럼통119 문체 칼럼 생성/발행 공용 로직.
// /api/ai/column(관리자 UI)과 /api/cron/ingest(자동 발행)가 함께 쓴다.

import { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/utils/supabase/server";
import { buildColumnPrompt, estimateReadTime, fetchStyleAnchors } from "@/lib/columnStyle";
import { stripHtml } from "@/utils/articleFormat";
import { generateSlug } from "@/utils/slug";

export type GeneratedColumn = {
    title: string;
    category: string;
    content: string;
};

export type GenerateResult = {
    column: GeneratedColumn;
    mode: "ai" | "fallback";
    message: string;
};

const CATEGORIES = new Set(["정치", "경제", "역사"]);

/** 모델 출력을 실제 발행 형식으로 정규화: p/br/strong/em/blockquote만 허용. */
export function sanitizeContent(html: string): string {
    return html
        .replace(/<(?!\/?(?:p|br|strong|em|blockquote)\b)[^>]*>/gi, "")
        .replace(/<p[^>]*>/gi, "<p>")
        .replace(/<blockquote[^>]*>/gi, "<blockquote>")
        .replace(/\n{3,}/g, "\n\n")
        .trim();
}

export function fallbackColumn(source: string, videoTitle?: string): GeneratedColumn {
    // OPENAI_API_KEY가 없을 때: 입력 원고를 문단으로 나눈 손편집용 초안 제공
    const sentences = source.split(/(?<=[.?!다요까죠])\s+/);
    const paragraphs: string[] = [];
    let buf = "";
    for (const s of sentences) {
        buf += (buf ? " " : "") + s.trim();
        if (buf.length >= 260) {
            paragraphs.push(buf);
            buf = "";
        }
    }
    if (buf) paragraphs.push(buf);
    return {
        title: videoTitle ? `${videoTitle}` : "원고 초안",
        category: "정치",
        content: paragraphs.map((p) => `<p>${p}</p>`).join("\n"),
    };
}

async function callOpenAI(prompt: string): Promise<GeneratedColumn> {
    const response = await fetch("https://api.openai.com/v1/responses", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
            model: process.env.OPENAI_MODEL || "gpt-5.2",
            input: prompt,
            text: {
                format: {
                    type: "json_schema",
                    name: "rightspoon_column",
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
        throw new Error(`OpenAI 요청 실패: ${detail.slice(0, 240)}`);
    }

    const data = await response.json();
    const outputText = typeof data?.output_text === "string" ? data.output_text : "";
    if (!outputText) throw new Error("AI 응답이 비어 있습니다.");

    const parsed = JSON.parse(outputText) as GeneratedColumn;
    return {
        title: parsed.title.trim(),
        category: CATEGORIES.has(parsed.category) ? parsed.category : "정치",
        content: sanitizeContent(parsed.content),
    };
}

export async function generateColumn(input: {
    transcript?: string;
    notes?: string;
    videoTitle?: string;
    memo?: string;
}): Promise<GenerateResult> {
    const fallbackSource = input.transcript?.trim() || input.notes?.trim() || "";
    if (!process.env.OPENAI_API_KEY) {
        return {
            column: fallbackColumn(fallbackSource, input.videoTitle),
            mode: "fallback",
            message: "OPENAI_API_KEY가 없어 입력 원고를 문단만 나눠 제공합니다.",
        };
    }
    try {
        const anchors = await fetchStyleAnchors();
        const prompt = buildColumnPrompt({
            transcript: input.transcript,
            notes: input.notes,
            videoTitle: input.videoTitle,
            memo: input.memo,
            anchors,
        });
        return { column: await callOpenAI(prompt), mode: "ai", message: "" };
    } catch (err) {
        return {
            column: fallbackColumn(fallbackSource, input.videoTitle),
            mode: "fallback",
            message: `AI 생성에 실패해 원고 초안으로 대체했습니다. ${err instanceof Error ? err.message : ""}`,
        };
    }
}

export async function publishColumn(
    column: GeneratedColumn,
    videoId: string | null,
    client?: SupabaseClient
) {
    const supabase = client || (await createClient());
    let slug = generateSlug(column.title) || `column-${Date.now()}`;

    const { data: existing } = await supabase
        .from("articles")
        .select("id")
        .eq("slug", slug)
        .maybeSingle();
    if (existing) slug = `${slug}-${Date.now().toString(36)}`;

    const { data, error } = await supabase
        .from("articles")
        .insert([
            {
                title: column.title,
                slug,
                category: column.category,
                youtube_id: videoId || "",
                content: column.content,
                author: "드럼통119",
                read_time: estimateReadTime(column.content),
            },
        ])
        .select("id, slug")
        .single();

    if (error) throw new Error(`발행 실패: ${error.message}`);
    return { id: data.id, slug: data.slug, path: `/article/${data.slug || data.id}` };
}
