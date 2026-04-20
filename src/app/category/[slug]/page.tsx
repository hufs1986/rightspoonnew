import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { ArticleCard } from "../../components/ArticleCard";
import styles from "./page.module.css";
import { createClient } from "@/utils/supabase/server";
import { getCategoryValue } from "../../data/articles";

import { Metadata } from "next";
import { formatArticle } from "@/utils/articleFormat";

export const revalidate = 60; // Cache for 60 seconds

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const { slug } = await params;
    let categoryName = "전체";
    if (slug === "politics") categoryName = "정치";
    else if (slug === "economy") categoryName = "경제";
    else if (slug === "history") categoryName = "역사";

    return {
        title: `${categoryName} | 오른스푼 - 대한민국 오른 미디어`,
        description: `오른스푼 미디어의 ${categoryName} 콘텐츠 모아보기. 올바른 시각으로 세상을 분석합니다.`,
        openGraph: {
            title: `${categoryName} | 오른스푼`,
            description: `오른스푼 미디어의 ${categoryName} 분야 최신 소식 및 전문적인 분석`,
            images: ['/logo-character.jpg'],
        }
    };
}

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;

    let categoryName = "전체";
    if (slug === "politics") categoryName = "정치";
    else if (slug === "economy") categoryName = "경제";
    else if (slug === "history") categoryName = "역사";

    const supabase = await createClient();

    let query = supabase.from("articles").select("*").order("created_at", { ascending: false });

    if (categoryName !== "전체") {
        query = query.eq("category", categoryName);
    }

    const { data: dbArticles, error } = await query;

    if (error) {
        console.error("카테고리 불러오기 실패:", error);
    }

    const formattedArticles = (dbArticles || []).map(formatArticle);

    return (
        <div className={styles.main}>
            <Header />

            <div className={styles.categoryHeader}>
                <div className={styles.categoryContainer}>
                    <h1 className={styles.categoryTitle}>{categoryName}</h1>
                    <p className={styles.categoryDesc}>
                        {categoryName === "전체"
                            ? "깊이 있는 오른 시각의 전체 뉴스 및 기사를 만나보세요."
                            : `${categoryName} 분야의 최신 소식과 전문적인 깊이 있는 분석을 제공합니다.`}
                    </p>
                </div>
            </div>

            <section className={styles.section}>
                {formattedArticles.length === 0 ? (
                    <div className={styles.emptyState}>
                        <p>해당 카테고리에 등록된 기사가 없습니다.</p>
                    </div>
                ) : (
                    <div className={`${styles.grid} stagger`}>
                        {formattedArticles.map((article) => (
                            <ArticleCard key={article.id} article={article} />
                        ))}
                    </div>
                )}
            </section>

            <Footer />
        </div>
    );
}
