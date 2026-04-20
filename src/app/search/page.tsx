import Header from "../components/Header";
import Footer from "../components/Footer";
import { ArticleCard } from "../components/ArticleCard";
import { createClient } from "@/utils/supabase/server";
import { formatArticle } from "@/utils/articleFormat";
import { Metadata } from "next";

interface SearchPageProps {
    searchParams: Promise<{ q?: string }>;
}

export async function generateMetadata({ searchParams }: SearchPageProps): Promise<Metadata> {
    const { q } = await searchParams;
    return {
        title: q ? `"${q}" 검색 결과 | 오른스푼` : "검색 | 오른스푼",
    };
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
    const { q } = await searchParams;
    const query = q?.trim() || "";

    let articles: ReturnType<typeof formatArticle>[] = [];

    if (query.length >= 2) {
        const supabase = await createClient();
        const { data } = await supabase
            .from("articles")
            .select("*")
            .or(`title.ilike.%${query}%,content.ilike.%${query}%`)
            .order("created_at", { ascending: false })
            .limit(20);

        articles = (data || []).map(formatArticle);
    }

    return (
        <div style={{ minHeight: "100vh" }}>
            <Header />
            <div style={{
                maxWidth: "var(--max-width)",
                margin: "0 auto",
                padding: "var(--space-8) var(--space-4)",
            }}>
                {/* 제목 */}
                <h1 style={{
                    fontSize: "var(--text-2xl)",
                    fontWeight: 900,
                    marginBottom: "var(--space-2)",
                    display: "flex",
                    alignItems: "center",
                    gap: "var(--space-3)",
                }}>
                    <span style={{
                        width: "4px",
                        height: "28px",
                        background: "var(--color-accent)",
                        borderRadius: "9999px",
                        display: "inline-block",
                    }} />
                    {query ? `"${query}" 검색 결과` : "검색"}
                </h1>

                {query && (
                    <p style={{
                        color: "var(--color-text-muted)",
                        fontSize: "var(--text-sm)",
                        marginBottom: "var(--space-8)",
                    }}>
                        {articles.length}개의 결과를 찾았습니다
                    </p>
                )}

                {/* 결과 그리드 */}
                {articles.length > 0 ? (
                    <div style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                        gap: "var(--space-6)",
                    }}>
                        {articles.map((article) => (
                            <ArticleCard key={article.id} article={article} />
                        ))}
                    </div>
                ) : query.length >= 2 ? (
                    <div style={{
                        textAlign: "center",
                        padding: "80px 20px",
                        background: "var(--color-bg-card)",
                        borderRadius: "var(--radius-lg)",
                        border: "1px solid var(--color-border)",
                    }}>
                        <div style={{ fontSize: "48px", marginBottom: "16px" }}>🔍</div>
                        <h3 style={{ fontSize: "18px", fontWeight: 700, marginBottom: "8px" }}>
                            검색 결과가 없습니다
                        </h3>
                        <p style={{ color: "var(--color-text-muted)", fontSize: "14px" }}>
                            다른 키워드로 검색해 보세요
                        </p>
                    </div>
                ) : (
                    <div style={{
                        textAlign: "center",
                        padding: "80px 20px",
                        color: "var(--color-text-muted)",
                        fontSize: "14px",
                    }}>
                        2글자 이상 입력해 주세요
                    </div>
                )}
            </div>
            <Footer />
        </div>
    );
}
