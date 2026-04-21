"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";

interface CardArticle {
    id: string;
    title: string;
    excerpt: string;
    category: string;
}

const CATEGORY_META: Record<string, { emoji: string; accent: string; label: string }> = {
    politics: { emoji: "🏛️", accent: "#d32f2f", label: "정치" },
    economy: { emoji: "📊", accent: "#FF6B35", label: "경제" },
    history: { emoji: "📖", accent: "#1976d2", label: "역사" },
};

const DEFAULT_META = { emoji: "📰", accent: "#7B1FA2", label: "기사" };

export default function CardNewsSwiper() {
    const [cards, setCards] = useState<CardArticle[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const touchStartX = useRef(0);

    useEffect(() => {
        const fetchArticles = async () => {
            const supabase = createClient();
            const { data, error } = await supabase
                .from("articles")
                .select("id, title, content, category")
                .order("created_at", { ascending: false })
                .limit(5);

            if (!error && data) {
                setCards(data.map((a: any) => ({
                    id: a.id,
                    title: a.title,
                    // HTML 태그 제거 후 앞 80자만 추출
                    excerpt: a.content.replace(/<[^>]+>/g, "").substring(0, 80) + "…",
                    category: a.category || "politics",
                })));
            }
        };
        fetchArticles();
    }, []);

    const handleTouchStart = (e: React.TouchEvent) => {
        touchStartX.current = e.changedTouches[0].screenX;
    };

    const handleTouchEnd = (e: React.TouchEvent) => {
        const diff = touchStartX.current - e.changedTouches[0].screenX;
        if (Math.abs(diff) > 50) {
            if (diff > 0 && currentIndex < cards.length - 1) {
                setCurrentIndex(currentIndex + 1);
            } else if (diff < 0 && currentIndex > 0) {
                setCurrentIndex(currentIndex - 1);
            }
        }
    };

    if (cards.length === 0) return null;

    const card = cards[currentIndex];
    const meta = CATEGORY_META[card.category] || DEFAULT_META;

    return (
        <section style={{
            maxWidth: "1100px",
            margin: "0 auto",
            padding: "0 20px 32px"
        }}>
            {/* 섹션 헤더 */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
                <h2 style={{ fontSize: "20px", fontWeight: "bold", color: "var(--color-text-primary)", display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ width: "4px", height: "24px", background: "var(--color-primary)", borderRadius: "9999px", display: "inline-block" }} />
                    한눈에 보기
                </h2>
                <span style={{ fontSize: "13px", color: "var(--color-text-tertiary)" }}>
                    좌우로 넘겨보세요 →
                </span>
            </div>

            {/* 카드 영역 */}
            <Link href={`/article/${card.id}`} style={{ textDecoration: "none" }}>
                <div
                    onTouchStart={handleTouchStart}
                    onTouchEnd={handleTouchEnd}
                    style={{
                        position: "relative",
                        borderRadius: "20px",
                        overflow: "hidden",
                        background: `linear-gradient(135deg, ${meta.accent}22 0%, #0d111700 60%)`,
                        border: `1px solid ${meta.accent}33`,
                        padding: "32px 28px",
                        minHeight: "200px",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                        cursor: "pointer",
                        transition: "background 0.4s ease",
                        userSelect: "none"
                    }}
                >
                    {/* 카드 번호 + 카테고리 */}
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
                        <span style={{ fontSize: "12px", color: meta.accent, fontWeight: "700", letterSpacing: "2px" }}>
                            {String(currentIndex + 1).padStart(2, "0")} / {String(cards.length).padStart(2, "0")}
                        </span>
                        <span style={{ fontSize: "11px", color: meta.accent, background: `${meta.accent}18`, padding: "2px 8px", borderRadius: "4px", fontWeight: "600" }}>
                            {meta.label}
                        </span>
                    </div>

                    {/* 이모지 */}
                    <div style={{ fontSize: "36px", marginBottom: "10px" }}>
                        {meta.emoji}
                    </div>

                    {/* 타이틀 */}
                    <h3 style={{
                        fontSize: "20px", fontWeight: "800", color: "#f0f6fc", lineHeight: 1.3, marginBottom: "10px",
                    }}>
                        {card.title}
                    </h3>

                    {/* 요약 본문 */}
                    <p style={{
                        fontSize: "14px", color: "#8b949e", lineHeight: 1.5,
                    }}>
                        {card.excerpt}
                    </p>

                    {/* 읽기 유도 */}
                    <span style={{ fontSize: "13px", color: meta.accent, fontWeight: "600", marginTop: "12px" }}>
                        자세히 읽기 →
                    </span>
                </div>
            </Link>

            {/* 인디케이터 도트 + 화살표 버튼 */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "16px", marginTop: "16px" }}>
                <button
                    onClick={() => currentIndex > 0 && setCurrentIndex(currentIndex - 1)}
                    style={{
                        background: "none", border: "none", color: currentIndex > 0 ? "#f0f6fc" : "#333",
                        fontSize: "18px", cursor: currentIndex > 0 ? "pointer" : "default", padding: "4px 8px"
                    }}
                    aria-label="이전 카드"
                >◂</button>

                <div style={{ display: "flex", gap: "8px" }}>
                    {cards.map((_, i) => (
                        <button
                            key={i}
                            onClick={() => setCurrentIndex(i)}
                            style={{
                                width: i === currentIndex ? "24px" : "8px",
                                height: "8px",
                                borderRadius: "4px",
                                background: i === currentIndex ? meta.accent : "rgba(255,255,255,0.15)",
                                border: "none",
                                cursor: "pointer",
                                transition: "all 0.3s ease",
                                padding: 0,
                            }}
                            aria-label={`카드 ${i + 1}`}
                        />
                    ))}
                </div>

                <button
                    onClick={() => currentIndex < cards.length - 1 && setCurrentIndex(currentIndex + 1)}
                    style={{
                        background: "none", border: "none",
                        color: currentIndex < cards.length - 1 ? "#f0f6fc" : "#333",
                        fontSize: "18px", cursor: currentIndex < cards.length - 1 ? "pointer" : "default", padding: "4px 8px"
                    }}
                    aria-label="다음 카드"
                >▸</button>
            </div>
        </section>
    );
}
