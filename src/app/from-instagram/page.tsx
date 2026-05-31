import Link from "next/link";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { ArticleCard } from "../components/ArticleCard";
import { createClient } from "@/utils/supabase/server";
import { formatArticle } from "@/utils/articleFormat";

export const metadata = {
    title: "처음 오신 분들께 | 오른스푼",
    description:
        "오른스푼은 정치·사회 이슈를 오른쪽 시각으로 정리하는 해설 미디어입니다. 처음 방문하신 분들을 위한 추천 글을 안내합니다.",
};

export const revalidate = 60;

export default async function FromInstagramPage() {
    const supabase = await createClient();
    const { data: dbArticles } = await supabase
        .from("articles")
        .select("*")
        .order("view_count", { ascending: false })
        .limit(6);

    const articles = (dbArticles || []).map(formatArticle);

    return (
        <div>
            <Header />
            <main style={{ maxWidth: "1120px", margin: "0 auto", padding: "48px 16px 72px" }}>
                <section
                    style={{
                        background: "linear-gradient(135deg, rgba(211,47,47,0.12), rgba(255,255,255,0.03))",
                        border: "1px solid rgba(211,47,47,0.22)",
                        borderRadius: "24px",
                        padding: "40px",
                        marginBottom: "28px",
                    }}
                >
                    <div style={{ color: "var(--color-accent)", fontWeight: 900, marginBottom: "14px" }}>
                        드럼통119
                    </div>
                    <h1
                        style={{
                            color: "var(--color-text-primary)",
                            fontSize: "clamp(2rem, 5vw, 4rem)",
                            lineHeight: 1.08,
                            marginBottom: "18px",
                            maxWidth: "820px",
                        }}
                    >
                        오른스푼에 오신 것을 환영합니다.
                    </h1>
                    <p
                        style={{
                            color: "var(--color-text-secondary)",
                            fontSize: "17px",
                            lineHeight: 1.8,
                            maxWidth: "760px",
                            marginBottom: "26px",
                        }}
                    >
                        오른스푼은 정치·사회 이슈를 오른쪽 시각으로 정리하는 해설 미디어입니다.
                        마음에 드는 글은 링크로 저장하고 공유해 주세요.
                    </p>
                    <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                        <Link href="/category/all" className="btn btn--primary">
                            전체 글 보기
                        </Link>
                        <Link href="/about" className="btn btn--outline">
                            운영자 소개
                        </Link>
                    </div>
                </section>

                {articles.length > 0 && (
                    <section>
                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                gap: "12px",
                                marginBottom: "22px",
                            }}
                        >
                            <h2 style={{ color: "var(--color-text-primary)", fontSize: "24px" }}>먼저 읽기 좋은 글</h2>
                            <Link href="/category/all" style={{ color: "var(--color-text-muted)", fontSize: "14px" }}>
                                전체보기
                            </Link>
                        </div>
                        <div
                            style={{
                                display: "grid",
                                gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                                gap: "20px",
                            }}
                        >
                            {articles.map((article) => (
                                <ArticleCard key={article.id} article={article} />
                            ))}
                        </div>
                    </section>
                )}
            </main>
            <Footer />
        </div>
    );
}
