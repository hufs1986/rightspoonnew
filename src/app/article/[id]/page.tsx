import Link from "next/link";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { ArticleCard } from "../../components/ArticleCard";
import ShareButtons from "../../components/ShareButtons";
import ViewCounter from "../../components/ViewCounter";
import LikeButton from "../../components/LikeButton";
import ReadingProgressBar from "../../components/ReadingProgressBar";
import NextArticleCTA from "../../components/NextArticleCTA";
import Comments from "../../components/Comments";
import styles from "./page.module.css";
import { createClient } from "@/utils/supabase/server";
import { Metadata } from "next";
import { formatArticle } from "@/utils/articleFormat";

interface ArticlePageProps {
    params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
    const { id } = await params;
    const supabase = await createClient();
    const { data } = await supabase.from('articles').select('*').eq('id', id).single();

    if (!data) return { title: '콘텐츠를 찾을 수 없습니다 | 오른스푼' };

    const article = formatArticle(data);

    return {
        title: `${article.title} | 오른스푼`,
        description: article.excerpt,
        openGraph: {
            title: article.title,
            description: article.excerpt,
            images: [article.thumbnailUrl || '/api/og?title=' + encodeURIComponent(article.title)],
            type: 'article',
        },
        twitter: {
            card: 'summary_large_image',
            title: article.title,
            description: article.excerpt,
            images: [article.thumbnailUrl || '/api/og?title=' + encodeURIComponent(article.title)],
        }
    };
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

    const article = formatArticle(dbArticle);

    const { data: relatedDb } = await supabase
        .from('articles')
        .select('*')
        .neq('id', id)
        .eq('category', dbArticle.category)
        .limit(3);

    const relatedArticles = (relatedDb || []).map(formatArticle);

    // 다음 기사 가져오기 (현재 기사보다 이전에 작성된 기사 중 가장 최신)
    const { data: nextDb } = await supabase
        .from('articles')
        .select('*')
        .lt('created_at', dbArticle.created_at)
        .order('created_at', { ascending: false })
        .limit(1);

    const nextArticle = nextDb && nextDb.length > 0 ? formatArticle(nextDb[0]) : null;

    const badgeClass = `badge--${article.category}`;

    return (
        <div className={styles.article}>
            <Header />
            <ReadingProgressBar />
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
                                <img src="/logo-character.webp" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} alt="드럼통119" />
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

                {/* Article Content */}
                <div
                    className={styles.article__body}
                    dangerouslySetInnerHTML={{
                        __html: article.content.includes('<p>') || article.content.includes('<h')
                            ? article.content
                            : article.content.replace(/\n/g, '<br/>')
                    }}
                />

                {/* Like Button */}
                <div style={{ display: 'flex', justifyContent: 'center', margin: '40px 0' }}>
                    <LikeButton articleId={article.id} initialLikes={article.likes} />
                </div>

                {/* Share */}
                <ShareButtons title={article.title} description={article.excerpt} thumbnailUrl={article.thumbnailUrl} />

                <Comments articleId={article.id} />
            </article>

            {/* Next Article CTA */}
            <NextArticleCTA nextArticle={nextArticle} />

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
