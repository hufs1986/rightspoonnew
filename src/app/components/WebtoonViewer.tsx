"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import styles from "./WebtoonViewer.module.css";
import Link from "next/link";

interface WebtoonViewerProps {
    episodeId: string;
    seriesId: string;
    episodeTitle: string;
    episodeNumber: number;
    prevEpisodeId?: string | null;
    nextEpisodeId?: string | null;
    totalPages: number;
}

export default function WebtoonViewer({
    episodeId,
    seriesId,
    episodeTitle,
    episodeNumber,
    prevEpisodeId,
    nextEpisodeId,
    totalPages,
}: WebtoonViewerProps) {
    const [signedUrls, setSignedUrls] = useState<string[]>([]);
    const [loadedPages, setLoadedPages] = useState<Set<number>>(new Set());
    const [scrollProgress, setScrollProgress] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const containerRef = useRef<HTMLDivElement>(null);
    const pageRefs = useRef<(HTMLDivElement | null)[]>([]);

    // Fetch signed URLs
    useEffect(() => {
        async function fetchUrls() {
            setIsLoading(true);
            try {
                const res = await fetch(`/api/webtoon/signed-urls?episodeId=${episodeId}`);
                const data = await res.json();
                if (data.signedUrls) {
                    setSignedUrls(data.signedUrls);
                }
            } catch (err) {
                console.error("Failed to load webtoon pages:", err);
            } finally {
                setIsLoading(false);
            }
        }
        fetchUrls();
    }, [episodeId]);

    useEffect(() => {
        (async () => {
            try {
                const { createClient } = await import("@/utils/supabase/client");
                const supabase = createClient();
                await supabase.rpc("increment_episode_view", { episode_id: episodeId });
            } catch { /* ignore */ }
        })();
    }, [episodeId]);

    // Block right-click
    useEffect(() => {
        const handleContextMenu = (e: MouseEvent) => {
            e.preventDefault();
            return false;
        };

        const handleKeyDown = (e: KeyboardEvent) => {
            // Block Ctrl+S, Ctrl+P, Ctrl+Shift+I, PrintScreen
            if (
                (e.ctrlKey && e.key === "s") ||
                (e.ctrlKey && e.key === "p") ||
                (e.ctrlKey && e.shiftKey && e.key === "I") ||
                e.key === "PrintScreen"
            ) {
                e.preventDefault();
                return false;
            }
        };

        // Block drag
        const handleDragStart = (e: DragEvent) => {
            e.preventDefault();
            return false;
        };

        document.addEventListener("contextmenu", handleContextMenu);
        document.addEventListener("keydown", handleKeyDown);
        document.addEventListener("dragstart", handleDragStart);

        return () => {
            document.removeEventListener("contextmenu", handleContextMenu);
            document.removeEventListener("keydown", handleKeyDown);
            document.removeEventListener("dragstart", handleDragStart);
        };
    }, []);

    // Scroll progress tracking
    useEffect(() => {
        const handleScroll = () => {
            const scrollTop = window.scrollY;
            const docHeight = document.documentElement.scrollHeight - window.innerHeight;
            if (docHeight > 0) {
                setScrollProgress((scrollTop / docHeight) * 100);
            }
        };

        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const handleShare = async () => {
        const shareData = {
            title: `[오른스푼 웹툰] ${episodeTitle}`,
            text: `${episodeTitle} - 제${episodeNumber}화를 확인해보세요!`,
            url: window.location.href,
        };
        try {
            if (navigator.share) {
                await navigator.share(shareData);
            } else {
                await navigator.clipboard.writeText(window.location.href);
                alert("링크가 복사되었습니다.");
            }
        } catch (err) {
            console.error("공유 실패:", err);
        }
    };

    // Lazy load images using IntersectionObserver
    useEffect(() => {
        const observers: IntersectionObserver[] = [];

        pageRefs.current.forEach((ref, index) => {
            if (!ref) return;
            const observer = new IntersectionObserver(
                (entries) => {
                    entries.forEach((entry) => {
                        if (entry.isIntersecting) {
                            setLoadedPages((prev) => new Set([...prev, index]));
                            observer.unobserve(entry.target);
                        }
                    });
                },
                { rootMargin: "600px" } // Load a bit earlier
            );
            observer.observe(ref);
            observers.push(observer);
        });

        return () => observers.forEach((o) => o.disconnect());
    }, [signedUrls]);

    return (
        <div className={styles.viewer} ref={containerRef}>
            {/* Sticky Episode Header */}
            <div className={styles.viewer__header}>
                <div>
                    <div className={styles.viewer__title}>{episodeTitle}</div>
                    <div className={styles.viewer__episode}>제{episodeNumber}화</div>
                </div>
                <div className={styles.viewer__nav}>
                    {prevEpisodeId ? (
                        <Link
                            href={`/webtoon/${seriesId}/${prevEpisodeId}`}
                            className={styles.viewer__navBtn}
                        >
                            ← 이전
                        </Link>
                    ) : (
                        <span className={`${styles.viewer__navBtn} ${styles["viewer__navBtn--disabled"]}`}>
                            ← 이전
                        </span>
                    )}
                    <Link
                        href={`/webtoon/${seriesId}`}
                        className={styles.viewer__navBtn}
                    >
                        목록
                    </Link>
                    {nextEpisodeId ? (
                        <Link
                            href={`/webtoon/${seriesId}/${nextEpisodeId}`}
                            className={styles.viewer__navBtn}
                        >
                            다음 →
                        </Link>
                    ) : (
                        <span className={`${styles.viewer__navBtn} ${styles["viewer__navBtn--disabled"]}`}>
                            다음 →
                        </span>
                    )}
                </div>
            </div>

            {/* Webtoon Pages */}
            {isLoading ? (
                Array.from({ length: totalPages || 3 }).map((_, i) => (
                    <div key={i} className={styles.page}>
                        <div className={styles.page__loading} style={{ minHeight: "600px" }} />
                    </div>
                ))
            ) : (
                signedUrls.map((url, index) => (
                    <div
                        key={index}
                        className={styles.page}
                        ref={(el) => { pageRefs.current[index] = el; }}
                    >
                        {/* Render as native img but disabled pointer events */}
                        {loadedPages.has(index) ? (
                            <img 
                                src={url} 
                                alt={`Page ${index + 1}`} 
                                className={styles.page__image} 
                                onContextMenu={(e) => e.preventDefault()}
                                onDragStart={(e) => e.preventDefault()}
                            />
                        ) : (
                            <div className={styles.page__loading} style={{ minHeight: "600px" }} />
                        )}
                        {/* Transparent watermark overlay intercepts all clicks/long-presses */}
                        <div className={styles.page__watermark} />
                    </div>
                ))
            )}

            {/* Actions Bar (Share, Like, etc) */}
            <div className={styles.viewer__actions}>
                <button onClick={handleShare} className={styles.viewer__actionBtn}>
                    <span className={styles.viewer__actionIcon}>📤</span>
                    <span>공유하기</span>
                </button>
            </div>

            {/* Bottom Navigation */}
            <div className={styles.viewer__footer}>
                {prevEpisodeId ? (
                    <Link
                        href={`/webtoon/${seriesId}/${prevEpisodeId}`}
                        className={styles.viewer__navBtn}
                    >
                        ← 이전화
                    </Link>
                ) : (
                    <span className={`${styles.viewer__navBtn} ${styles["viewer__navBtn--disabled"]}`}>
                        ← 이전화
                    </span>
                )}

                <Link href={`/webtoon/${seriesId}`} className={styles.viewer__navBtn}>
                    목록으로
                </Link>

                {nextEpisodeId ? (
                    <Link
                        href={`/webtoon/${seriesId}/${nextEpisodeId}`}
                        className={styles.viewer__navBtn}
                    >
                        다음화 →
                    </Link>
                ) : (
                    <span className={`${styles.viewer__navBtn} ${styles["viewer__navBtn--disabled"]}`}>
                        다음화 →
                    </span>
                )}
            </div>

            {/* Scroll Progress Bar */}
            <div className={styles.progress}>
                <div
                    className={styles.progress__bar}
                    style={{ width: `${scrollProgress}%` }}
                />
            </div>
        </div>
    );
}
