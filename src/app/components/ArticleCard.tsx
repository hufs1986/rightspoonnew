import Link from "next/link";
import styles from "./ArticleCard.module.css";
import type { Article } from "../data/articles";

interface ArticleCardProps {
    article: Article;
}

export function ArticleCard({ article }: ArticleCardProps) {
    const badgeClass =
        article.category === "politics" ? "badge--politics" : "badge--economy";

    return (
        <Link href={`/article/${article.id}`} className={styles.card}>
            <div className={styles.card__thumbnail}>
                {article.thumbnailUrl ? (
                    <img src={article.thumbnailUrl} alt={article.title} loading="lazy" />
                ) : (
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--color-bg-card)' }}>
                        <img src="/logo-character.jpg" alt="logo placeholder" style={{ width: '40%', opacity: 0.2, objectFit: 'contain' }} />
                    </div>
                )}
                {article.youtubeId && (
                    <div className={styles["card__play-icon"]}>▶</div>
                )}
                <div className={styles.card__badge}>
                    <span className={`badge ${badgeClass}`}>{article.categoryLabel}</span>
                </div>
            </div>
            <div className={styles.card__body}>
                <h3 className={styles.card__title}>{article.title}</h3>
                <p className={styles.card__excerpt}>{article.excerpt}</p>
                <div className={styles.card__meta}>
                    <span className={styles["card__meta-left"]}>
                        <span>{article.publishedAt}</span>
                        <span className={styles["card__meta-dot"]}>·</span>
                        <span>{article.readTime} 읽기</span>
                    </span>
                    <span>👁 {article.views.toLocaleString()}</span>
                </div>
            </div>
        </Link>
    );
}

export function HeroArticle({ article }: ArticleCardProps) {
    return (
        <Link href={`/article/${article.id}`} className={styles.hero}>
            <div className={styles["hero__img-wrapper"]}>
                {article.thumbnailUrl ? (
                    <img
                        src={article.thumbnailUrl}
                        alt={article.title}
                        className={styles.hero__img}
                    />
                ) : (
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--color-bg-card)' }}>
                        <img src="/logo-character.jpg" alt="logo placeholder" style={{ width: '20%', opacity: 0.1, objectFit: 'contain' }} />
                    </div>
                )}
            </div>
            <div className={styles.hero__overlay} />
            {article.youtubeId && (
                <div className={styles["hero__play-btn"]}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M8 5v14l11-7z" />
                    </svg>
                </div>
            )}
            <div className={styles.hero__content}>
                <div className={styles.hero__label}>
                    {article.categoryLabel} · 최신 콘텐츠
                </div>
                <h2 className={styles.hero__title}>{article.title}</h2>
                <p className={styles.hero__excerpt}>{article.excerpt}</p>
                <div className={styles.hero__meta}>
                    <span>{article.author}</span>
                    <span>·</span>
                    <span>{article.publishedAt}</span>
                    <span>·</span>
                    <span>{article.readTime} 읽기</span>
                </div>
            </div>
        </Link>
    );
}
