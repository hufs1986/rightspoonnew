import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { ArticleCard } from "../../components/ArticleCard";
import styles from "./page.module.css";
import { createClient } from "@/utils/supabase/server";

export const revalidate = 0; // Disable cache for immediate refresh

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;

    let categoryName = "전체";
    if (slug === "politics") categoryName = "정치";
    else if (slug === "economy") categoryName = "경제";

    const supabase = await createClient();

    let query = supabase.from("articles").select("*").order("created_at", { ascending: false });

    if (categoryName !== "전체") {
        query = query.eq("category", categoryName);
    }

    const { data: dbArticles, error } = await query;

    if (error) {
        console.error("카테고리 불러오기 실패:", error);
    }

    const cleanYid = (id: string) => {
        if (!id) return '';
        const match = id.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))([\w-]{11})/);
        return match ? match[1] : id.replace(/[\/\\?#]+$/, '');
    };
    const stripHtml = (html: string) => html ? html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim() : '';

    const formattedArticles = (dbArticles || []).map((a) => ({
        id: a.id,
        title: a.title,
        excerpt: stripHtml(typeof a.content === 'string' ? a.content : '').substring(0, 100) + '...',
        category: (a.category === "정치" ? "politics" : "economy") as "politics" | "economy",
        categoryLabel: a.category,
        content: a.content,
        author: a.author,
        youtubeId: cleanYid(a.youtube_id),
        thumbnailUrl: cleanYid(a.youtube_id) ? `https://img.youtube.com/vi/${cleanYid(a.youtube_id)}/0.jpg` : "",
        publishedAt: new Date(a.created_at).toLocaleDateString(),
        readTime: a.read_time,
        views: a.view_count,
    }));

    return (
        <div className={styles.main}>
            <Header />

            <div className={styles.categoryHeader}>
                <div className={styles.categoryContainer}>
                    <h1 className={styles.categoryTitle}>{categoryName}</h1>
                    <p className={styles.categoryDesc}>
                        {categoryName === "전체"
                            ? "깊이 있는 보수 시각의 전체 뉴스 및 기사를 만나보세요."
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
