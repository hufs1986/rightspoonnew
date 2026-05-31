import Link from "next/link";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { ArticleCard } from "../components/ArticleCard";
import { createClient } from "@/utils/supabase/server";
import { formatArticle } from "@/utils/articleFormat";

export const metadata = {
    title: "인스타에서 오신 분들께 | 오른스푼",
    description:
        "드럼통119 인스타그램에서 오른스푼으로 오신 분들을 위한 안내입니다. 짧은 이슈를 긴 해설과 저장 가능한 글로 이어갑니다.",
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
                        드럼통119의 본진
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
                        인스타에서 짧게 본 이슈, 여기서 길게 정리합니다.
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
                        인스타그램은 반응이 빠르지만 글이 쉽게 흘러갑니다. 오른스푼은 그중 오래 남길 가치가 있는
                        정치·사회 이슈를 운영자의 관점으로 다시 정리하는 저장소입니다.
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

                <section
                    style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                        gap: "14px",
                        marginBottom: "42px",
                    }}
                >
                    {[
                        ["짧은 반응", "인스타에서는 이슈의 핵심 문장과 문제 제기를 먼저 던집니다."],
                        ["긴 해설", "오른스푼에서는 배경, 쟁점, 운영자의 해석을 더 길게 남깁니다."],
                        ["저장과 공유", "흘러가는 피드가 아니라 링크로 다시 찾고 공유할 수 있는 글로 축적합니다."],
                    ].map(([title, desc]) => (
                        <div
                            key={title}
                            style={{
                                background: "var(--color-bg-card)",
                                border: "1px solid var(--color-border)",
                                borderRadius: "16px",
                                padding: "22px",
                            }}
                        >
                            <strong style={{ display: "block", color: "var(--color-text-primary)", fontSize: "18px", marginBottom: "10px" }}>
                                {title}
                            </strong>
                            <p style={{ color: "var(--color-text-secondary)", lineHeight: 1.65, fontSize: "14px" }}>{desc}</p>
                        </div>
                    ))}
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

