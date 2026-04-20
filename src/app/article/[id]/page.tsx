import { notFound } from "next/navigation";
import Link from "next/link";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { ArticleCard } from "../../components/ArticleCard";
import { mockArticles } from "../../data/articles";
import styles from "./page.module.css";

interface ArticlePageProps {
    params: Promise<{ id: string }>;
}

export default async function ArticlePage({ params }: ArticlePageProps) {
    const { id } = await params;
    const article = mockArticles.find((a) => a.id === id);

    if (!article) {
        notFound();
    }

    const relatedArticles = mockArticles
        .filter((a) => a.id !== article.id && a.category === article.category)
        .slice(0, 3);

    const badgeClass =
        article.category === "politics" ? "badge--politics" : "badge--economy";

    return (
        <div className={styles.article}>
            <Header />

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
                    <p className={styles.article__excerpt}>{article.excerpt}</p>

                    <div className={styles.article__meta}>
                        <div className={styles.article__author}>
                            <span className={styles["article__author-avatar"]}>R</span>
                            <span className={styles["article__author-name"]}>
                                {article.author}
                            </span>
                        </div>
                        <span>{article.publishedAt}</span>
                        <span>{article.readTime} 읽기</span>
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

                {/* Article Content */}
                <div
                    className={styles.article__body}
                    dangerouslySetInnerHTML={{ __html: article.content }}
                />

                {/* Share */}
                <div className={styles.article__share}>
                    <span className={styles["article__share-label"]}>공유하기</span>
                    <button className={styles["article__share-btn"]} aria-label="카카오톡 공유">
                        💬
                    </button>
                    <button className={styles["article__share-btn"]} aria-label="X 공유">
                        𝕏
                    </button>
                    <button className={styles["article__share-btn"]} aria-label="링크 복사">
                        🔗
                    </button>
                </div>
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
