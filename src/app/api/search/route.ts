import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { formatArticle } from "@/utils/articleFormat";

export async function GET(request: NextRequest) {
    const q = request.nextUrl.searchParams.get("q")?.trim();

    if (!q || q.length < 2) {
        return NextResponse.json({ articles: [], query: q || "" });
    }

    try {
        const supabase = await createClient();

        // 제목 또는 본문에서 검색 (ilike = 대소문자 무시)
        const { data, error } = await supabase
            .from("articles")
            .select("*")
            .or(`title.ilike.%${q}%,content.ilike.%${q}%`)
            .order("created_at", { ascending: false })
            .limit(20);

        if (error) {
            console.error("검색 에러:", error);
            return NextResponse.json({ error: "검색 실패" }, { status: 500 });
        }

        const articles = (data || []).map(formatArticle);

        return NextResponse.json({ articles, query: q });
    } catch (err) {
        console.error("Search API Error:", err);
        return NextResponse.json({ error: "서버 오류" }, { status: 500 });
    }
}
