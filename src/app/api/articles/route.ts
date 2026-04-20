import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { formatArticle } from "@/utils/articleFormat";

export const revalidate = 60; // Cache for 60 seconds

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get("category") || "전체";
    const offset = parseInt(searchParams.get("offset") || "0", 10);
    const limit = parseInt(searchParams.get("limit") || "9", 10);

    try {
        const supabase = await createClient();

        let query = supabase
            .from("articles")
            .select("*")
            .order("created_at", { ascending: false })
            .range(offset, offset + limit - 1);

        if (category !== "전체") {
            query = query.eq("category", category);
        }

        const { data: dbArticles, error } = await query;

        if (error) {
            console.error("데이터 불러오기 실패:", error);
            return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
        }

        const formattedArticles = (dbArticles || []).map(formatArticle);

        return NextResponse.json({ articles: formattedArticles, hasMore: formattedArticles.length === limit });
    } catch (err) {
        console.error("API Error:", err);
        return NextResponse.json({ error: "Server Error" }, { status: 500 });
    }
}
