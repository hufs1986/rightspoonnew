import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

type HealthItem = {
    key: string;
    label: string;
    status: "ok" | "warn" | "fail";
    detail: string;
};

function envStatus(key: string, label: string, required = true): HealthItem {
    const value = process.env[key];
    if (value) {
        return { key, label, status: "ok", detail: "설정됨" };
    }
    return {
        key,
        label,
        status: required ? "fail" : "warn",
        detail: required ? "운영 전 설정 필요" : "선택 설정 없음",
    };
}

export async function GET() {
    const checks: HealthItem[] = [
        envStatus("NEXT_PUBLIC_SUPABASE_URL", "Supabase URL"),
        envStatus("NEXT_PUBLIC_SUPABASE_ANON_KEY", "Supabase Anon Key"),
        envStatus("OPENAI_API_KEY", "OpenAI API Key", false),
        envStatus("NEXT_PUBLIC_VAPID_PUBLIC_KEY", "Push Public Key", false),
        envStatus("VAPID_PRIVATE_KEY", "Push Private Key", false),
    ];

    let articleCount = 0;
    let latestPublishedAt: string | null = null;
    let latestDaysOld: number | null = null;
    let databaseStatus: HealthItem = {
        key: "database",
        label: "Supabase articles",
        status: "fail",
        detail: "데이터베이스 확인 실패",
    };

    try {
        const supabase = await createClient();
        const { count, data, error } = await supabase
            .from("articles")
            .select("created_at", { count: "exact" })
            .order("created_at", { ascending: false })
            .limit(1);

        if (error) throw error;

        articleCount = count || 0;
        latestPublishedAt = data?.[0]?.created_at || null;
        latestDaysOld = latestPublishedAt
            ? Math.floor((Date.now() - new Date(latestPublishedAt).getTime()) / (1000 * 60 * 60 * 24))
            : null;

        databaseStatus = {
            key: "database",
            label: "Supabase articles",
            status: articleCount > 0 ? "ok" : "warn",
            detail: articleCount > 0 ? `${articleCount}개 글 연결됨` : "글 없음",
        };
    } catch {
        databaseStatus = {
            key: "database",
            label: "Supabase articles",
            status: "fail",
            detail: "데이터베이스 확인 실패",
        };
    }

    checks.push(
        databaseStatus,
        {
            key: "adsense",
            label: "AdSense meta",
            status: "ok",
            detail: "ca-pub-9599627662073241",
        },
        {
            key: "rss",
            label: "RSS feed",
            status: "ok",
            detail: "/rss.xml 활성",
        },
        {
            key: "sitemap",
            label: "Sitemap",
            status: "ok",
            detail: "/sitemap.xml 활성",
        },
        {
            key: "editorial-policy",
            label: "편집 원칙",
            status: "ok",
            detail: "/editorial-policy 공개",
        }
    );

    const failCount = checks.filter((item) => item.status === "fail").length;
    const warnCount = checks.filter((item) => item.status === "warn").length;

    return NextResponse.json({
        status: failCount > 0 ? "fail" : warnCount > 0 ? "warn" : "ok",
        checkedAt: new Date().toISOString(),
        articleCount,
        latestPublishedAt,
        latestDaysOld,
        checks,
    });
}
