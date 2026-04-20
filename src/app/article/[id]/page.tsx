import Link from "next/link";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { ArticleCard } from "../../components/ArticleCard";
import AdSlot from "../../components/AdSlot";
import ShareButtons from "../../components/ShareButtons";
import ViewCounter from "../../components/ViewCounter";
import styles from "./page.module.css";
import { createClient } from "@/utils/supabase/server";

interface ArticlePageProps {
    params: Promise<{ id: string }>;
}

export default async function ArticlePage({ params }: ArticlePageProps) {
    const { id } = await params;
    const supabase = await createClient();

    const { data: dbArticle, error } = await supabase
        .from('articles')
        .select('*')
        .eq('id', id)
        .single();

    if (!dbArticle || error) {
        return (
            <div className={styles.article}>
                <Header />
                <div style={{ padding: "150px 20px", textAlign: "center" }}>
                    <h2>존재하지 않거나 삭제된 콘텐츠입니다.</h2>
                    <br />
                    <Link href="/" className="btn btn--primary">홈으로 돌아가기</Link>
                </div>
                <Footer />
            </div>
        );
    }

    const cleanYid = (id: string) => id ? id.replace(/[\/\\?#]+$/, '') : '';
    const stripHtml = (html: string) => html ? html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim() : '';

    const article = {
        id: dbArticle.id,
        title: dbArticle.title,
        excerpt: stripHtml(typeof dbArticle.content === 'string' ? dbArticle.content : '').substring(0, 100) + '...',
        category: (dbArticle.category === "정치" ? "politics" : "economy") as "politics" | "economy",
        categoryLabel: dbArticle.category,
        content: dbArticle.content,
        author: dbArticle.author,
        youtubeId: cleanYid(dbArticle.youtube_id),
        thumbnailUrl: cleanYid(dbArticle.youtube_id) ? `https://img.youtube.com/vi/${cleanYid(dbArticle.youtube_id)}/mqdefault.jpg` : "",
        publishedAt: new Date(dbArticle.created_at).toLocaleDateString(),
        readTime: dbArticle.read_time,
        views: dbArticle.view_count,
    };

    const { data: relatedDb } = await supabase
        .from('articles')
        .select('*')
        .neq('id', id)
        .eq('category', dbArticle.category)
        .limit(3);

    const relatedArticles = (relatedDb || []).map((a) => ({
        id: a.id,
        title: a.title,
        excerpt: stripHtml(typeof a.content === 'string' ? a.content : '').substring(0, 100) + '...',
        category: (a.category === "정치" ? "politics" : "economy") as "politics" | "economy",
        categoryLabel: a.category,
        content: a.content,
        author: a.author,
        youtubeId: cleanYid(a.youtube_id),
        thumbnailUrl: cleanYid(a.youtube_id) ? `https://img.youtube.com/vi/${cleanYid(a.youtube_id)}/mqdefault.jpg` : "",
        publishedAt: new Date(a.created_at).toLocaleDateString(),
        readTime: a.read_time,
        views: a.view_count,
    }));

    const badgeClass =
        article.category === "politics" ? "badge--politics" : "badge--economy";

    return (
        <div className={styles.article}>
            <Header />
            <ViewCounter articleId={article.id} />

            <article className={styles.article__container}>
                {/* Breadcrumb */}
                <nav className={styles.article__breadcrumb}>
                    <Link href="/">홈</Link>
                    <span>›</span>
                    <Link href={`/category/${article.category}`}>
                        {article.categoryLabel}
                    </Link>
                    <span>›</span>
                    <span>{article.title.slice(0, 20)}...</span>
                </nav>

                {/* Header */}
                <header className={styles.article__header}>
                    <div className={styles.article__category}>
                        <span className={`badge ${badgeClass}`}>
                            {article.categoryLabel}
                        </span>
                    </div>

                    <h1 className={styles.article__title}>{article.title}</h1>

                    <div className={styles.article__meta}>
                        <div className={styles.article__author}>
                            <span className={styles["article__author-avatar"]}>
                                <img src="/drumtong119-logo.png" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} alt="드럼통119" />
                            </span>
                            <span className={styles["article__author-name"]}>
                                {article.author}
                            </span>
                        </div>
                        <span>{article.publishedAt}</span>
                        <span>{article.readTime}분 읽기</span>
                        <span>👁 {article.views.toLocaleString()}</span>
                    </div>
                </header>

                {/* YouTube Video */}
                {article.youtubeId && (
                    <div className={styles.article__video}>
                        <iframe
                            src={`https://www.youtube.com/embed/${article.youtubeId}`}
                            title={article.title}
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                        />
                    </div>
                )}

                {/* AdSlot Top */}
                <AdSlot />

                {/* Article Content */}
                <div
                    className={styles.article__body}
                    dangerouslySetInnerHTML={{
                        __html: article.content.includes('<p>') || article.content.includes('<h')
                            ? article.content
                            : article.content.replace(/\n/g, '<br/>')
                    }}
                />

                {/* AdSlot Bottom */}
                <AdSlot />

                {/* Share */}
                <ShareButtons title={article.title} />
            </article>

            {/* Related Articles */}
            {relatedArticles.length > 0 && (
                <section className={styles.article__related}>
                    <h2 className={styles["article__related-title"]}>
                        <span style={{ width: 4, height: 28, background: "var(--color-accent)", borderRadius: "9999px", display: "inline-block" }} />
                        관련 콘텐츠
                    </h2>
                    <div className={styles["article__related-grid"]}>
                        {relatedArticles.map((a) => (
                            <ArticleCard key={a.id} article={a} />
                        ))}
                    </div>
                </section>
            )}

            <Footer />
        </div>
    );
}
