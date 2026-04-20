"use client";

import { useState } from "react";
import { ArticleCard } from "./ArticleCard";
import type { Article } from "../data/articles";
import styles from "./LoadMore.module.css";

interface LoadMoreProps {
    initialOffset: number;
    category: string;
}

export default function LoadMore({ initialOffset, category }: LoadMoreProps) {
    const [articles, setArticles] = useState<Article[]>([]);
    const [offset, setOffset] = useState(initialOffset);
    const [isLoading, setIsLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);

    const loadMoreArticles = async () => {
        setIsLoading(true);
        try {
            const res = await fetch(`/api/articles?category=${encodeURIComponent(category)}&offset=${offset}&limit=9`);
            const data = await res.json();

            if (data.articles) {
                setArticles(prev => [...prev, ...data.articles]);
                setOffset(prev => prev + 9);
                setHasMore(data.hasMore);
            }
        } catch (error) {
            console.error("Failed to load more articles:", error);
        } finally {
            setIsLoading(false);
        }
    };

    if (!hasMore && articles.length === 0) return null;

    return (
        <>
            {articles.map((article) => (
                <ArticleCard key={article.id} article={article} />
            ))}

            {hasMore ? (
                <div className={styles.loadMoreWrapper}>
                    <button
                        onClick={loadMoreArticles}
                        className={styles.loadMoreBtn}
                        disabled={isLoading}
                    >
                        {isLoading ? "불러오는 중..." : "더 보기 ▼"}
                    </button>
                </div>
            ) : (
                articles.length > 0 && (
                    <div className={styles.endMessage}>
                        모든 콘텐츠를 불러왔습니다.
                    </div>
                )
            )}
        </>
    );
}
