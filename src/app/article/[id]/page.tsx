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
import ArticlePushBar from "../../components/ArticlePushBar";
import InstagramShareKit from "../../components/InstagramShareKit";
import styles from "./page.module.css";
import { createClient } from "@/utils/supabase/server";
import { Metadata } from "next";
import { formatArticle } from "@/utils/articleFormat";
import AdSlot from "../../components/AdSlot";
import { generatePageMetadata } from "@/lib/seo";

interface ArticlePageProps {
    params: Promise<{ id: string }>;
}

// slug 또는 UUID로 기사 조회하는 헬퍼 함수
async function fetchArticleByIdOrSlug(idOrSlug: string) {
    const supabase = await createClient();
    const decoded = decodeURIComponent(idOrSlug);

    // UUID 패턴 체크
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(decoded);

    if (isUUID) {
        const { data } = await supabase.from('articles').select('*').eq('id', decoded).single();
        return data;
    }

    // slug로 조회
    const { data } = await supabase.from('articles').select('*').eq('slug', decoded).single();
    return data;
}

export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
    const { id } = await params;
    const data = await fetchArticleByIdOrSlug(id);

    if (!data) return { title: '콘텐츠를 찾을 수 없습니다 | 오른스푼' };

    const article = formatArticle(data);
    const ogImage = article.youtubeId
        ? article.thumbnailUrl
        : `https://www.rightspoon.co.kr/api/og?title=${encodeURIComponent(article.title)}&category=${encodeURIComponent(article.categoryLabel)}`;

    return generatePageMetadata({
        title: article.title,
        description: article.excerpt,
        urlPath: `/article/${article.linkId}`,
        imageUrl: ogImage,
        publishedTime: data.created_at,
        modifiedTime: data.updated_at || data.created_at,
    });
}

export default async function ArticlePage({ params }: ArticlePageProps) {
    const { id } = await params;
    const supabase = await createClient();

    const dbArticle = await fetchArticleByIdOrSlug(id);

    if (!dbArticle) {
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
    const articleUrl = `https://www.rightspoon.co.kr/article/${article.linkId}`;

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

    // JSON-LD 구조화 데이터 (구글 검색 리치 결과용)
    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "NewsArticle",
        "headline": article.title,
        "description": article.excerpt,
        "image": article.thumbnailUrl || `https://www.rightspoon.co.kr/logo-character.webp`,
        "datePublished": dbArticle.created_at,
        "dateModified": dbArticle.updated_at || dbArticle.created_at,
        "author": {
            "@type": "Person",
            "name": article.author || "드럼통119",
            "url": "https://www.rightspoon.co.kr/about"
        },
        "publisher": {
            "@type": "Organization",
            "name": "오른스푼",
            "logo": {
                "@type": "ImageObject",
                "url": "https://www.rightspoon.co.kr/logo-character.webp"
            }
        },
        "mainEntityOfPage": {
            "@type": "WebPage",
            "@id": `https://www.rightspoon.co.kr/article/${article.linkId}`
        },
        "articleSection": article.categoryLabel,
        "wordCount": article.content.replace(/<[^>]+>/g, '').length,
        "isAccessibleForFree": true,
        "inLanguage": "ko-KR",
    };

    return (
        <div className={styles.article}>
            <Header />
            <ReadingProgressBar />
            <ViewCounter articleId={article.id} />

            {/* JSON-LD 구조화 데이터 */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />

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

                {/* 핵심 요약 (GEO/AI 검색 최적화) */}
                {(() => {
                    const plainText = article.content.replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').trim();
                    const sentences = plainText.match(/[^.!?。]+[.!?。]+/g) || [];
                    const summary = sentences.slice(0, 3).join(' ').trim();
                    if (!summary || summary.length < 30) return null;
                    return (
                        <div style={{
                            background: 'linear-gradient(135deg, rgba(211,47,47,0.06) 0%, rgba(211,47,47,0.02) 100%)',
                            border: '1px solid rgba(211,47,47,0.15)',
                            borderLeft: '4px solid #d32f2f',
                            borderRadius: '12px',
                            padding: '20px 24px',
                            margin: '24px 0 32px',
                            lineHeight: 1.8,
                        }}>
                            <div style={{
                                fontSize: '12px',
                                fontWeight: 700,
                                color: '#d32f2f',
                                textTransform: 'uppercase',
                                letterSpacing: '1px',
                                marginBottom: '10px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                            }}>
                                📌 핵심 요약
                            </div>
                            <p style={{
                                fontSize: '14.5px',
                                color: 'var(--color-text-secondary)',
                                margin: 0,
                            }}>
                                {summary}
                            </p>
                        </div>
                    );
                })()}

                {/* AdSlot Top */}
                <AdSlot slot="article-top" format="auto" style={{ display: 'block', margin: '24px 0' }} />

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
                <AdSlot slot="article-bottom" format="auto" style={{ display: 'block', margin: '24px 0' }} />

                {/* Like Button */}
                <div style={{ display: 'flex', justifyContent: 'center', margin: '40px 0' }}>
                    <LikeButton articleId={article.id} initialLikes={article.likes} />
                </div>

                {/* Share */}
                <ShareButtons title={article.title} description={article.excerpt} thumbnailUrl={article.thumbnailUrl} />

                <InstagramShareKit title={article.title} excerpt={article.excerpt} url={articleUrl} />

                <section className={styles.article__bridge}>
                    <div>
                        <p className={styles.article__bridge_kicker}>오른스푼 활용법</p>
                        <h2>이 글은 흘러가는 피드가 아니라, 다시 꺼내 읽는 기록입니다.</h2>
                        <p>
                            인스타에서 짧게 본 이슈는 오른스푼에서 맥락과 근거를 붙여 보관합니다.
                            처음 방문했다면 안내 페이지에서 읽는 순서를 확인하고, 괜찮았다면 글 주소를 저장해두세요.
                        </p>
                    </div>
                    <div className={styles.article__bridge_actions}>
                        <Link href="/from-instagram">처음 오신 분 안내</Link>
                        <Link href="/category/all">다른 해설 읽기</Link>
                    </div>
                </section>

                {/* Push Subscription Bar */}
                <ArticlePushBar />

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
