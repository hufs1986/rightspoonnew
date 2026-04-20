import Link from "next/link";
import Image from "next/image";
import styles from "./ArticleCard.module.css";
import type { Article } from "../data/articles";

interface ArticleCardProps {
    article: Article;
}

export function ArticleCard({ article }: ArticleCardProps) {
    const badgeClass = `badge--${article.category}`;

    return (
        <Link href={`/article/${article.id}`} className={styles.card}>
            <div className={styles.card__thumbnail}>
                {article.thumbnailUrl ? (
                    <Image src={article.thumbnailUrl} alt={article.title} fill sizes="(max-width: 768px) 100vw, 33vw" />
                ) : (
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--color-bg-card)' }}>
                        <Image src="/logo-character.jpg" alt="logo placeholder" width={100} height={100} style={{ width: '40%', height: 'auto', opacity: 0.2, objectFit: 'contain' }} />
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
                    <span style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                        <span>👁 {article.views.toLocaleString()}</span>
                        <span style={{ color: "rgba(230, 57, 70, 0.9)" }}>❤️ {article.likes.toLocaleString()}</span>
                    </span>
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
                    <Image
                        src={article.thumbnailUrl}
                        alt={article.title}
                        fill
                        sizes="100vw"
                        priority
                        className={styles.hero__img}
                    />
                ) : (
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--color-bg-card)' }}>
                        <Image src="/logo-character.jpg" alt="logo placeholder" width={200} height={200} style={{ width: '20%', height: 'auto', opacity: 0.1, objectFit: 'contain' }} />
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
                    <span>·</span>
                    <span style={{ color: "rgba(230, 57, 70, 0.9)" }}>❤️ {article.likes.toLocaleString()}</span>
                </div>
            </div>
        </Link>
    );
}
