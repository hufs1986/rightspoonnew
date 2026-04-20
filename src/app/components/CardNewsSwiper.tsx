"use client";

import { useState, useRef } from "react";
import Link from "next/link";

interface CardSlide {
    emoji: string;
    title: string;
    body: string;
    accent?: string;
}

const WEEKLY_CARDS: CardSlide[] = [
    {
        emoji: "📊",
        title: "이번 주 핵심 숫자",
        body: "586세대가 차지하는 국회의원 비율 42%. 세금으로 운영되는 공공기관 낙하산 비율은?",
        accent: "#d32f2f"
    },
    {
        emoji: "🔥",
        title: "뜨거운 이슈",
        body: "좌파 언론이 절대 보도하지 않는 통계 3가지. 팩트로 무장하세요.",
        accent: "#FF6B35"
    },
    {
        emoji: "📖",
        title: "역사에서 배우기",
        body: "대한민국 건국의 진실 — 교과서가 가르치지 않는 이승만의 업적.",
        accent: "#1976d2"
    },
    {
        emoji: "💡",
        title: "오른스푼 한 줄 정리",
        body: "복잡한 뉴스, 한 줄이면 충분합니다. 매주 핵심만 골라 전해드립니다.",
        accent: "#7B1FA2"
    },
];

export default function CardNewsSwiper() {
    const [currentIndex, setCurrentIndex] = useState(0);
    const touchStartX = useRef(0);
    const touchEndX = useRef(0);

    const handleTouchStart = (e: React.TouchEvent) => {
        touchStartX.current = e.changedTouches[0].screenX;
    };

    const handleTouchEnd = (e: React.TouchEvent) => {
        touchEndX.current = e.changedTouches[0].screenX;
        const diff = touchStartX.current - touchEndX.current;
        if (Math.abs(diff) > 50) {
            if (diff > 0 && currentIndex < WEEKLY_CARDS.length - 1) {
                setCurrentIndex(currentIndex + 1);
            } else if (diff < 0 && currentIndex > 0) {
                setCurrentIndex(currentIndex - 1);
            }
        }
    };

    const card = WEEKLY_CARDS[currentIndex];

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
                    주간 카드뉴스
                </h2>
                <span style={{ fontSize: "13px", color: "var(--color-text-tertiary)" }}>
                    좌우로 넘겨보세요 →
                </span>
            </div>

            {/* 카드 영역 */}
            <div
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
                style={{
                    position: "relative",
                    borderRadius: "20px",
                    overflow: "hidden",
                    background: `linear-gradient(135deg, ${card.accent || "#d32f2f"}22 0%, #0d111700 60%)`,
                    border: `1px solid ${card.accent || "#d32f2f"}33`,
                    padding: "32px 28px",
                    minHeight: "220px",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    cursor: "grab",
                    transition: "background 0.4s ease",
                    userSelect: "none"
                }}
            >
                {/* 카드 번호 */}
                <div style={{ fontSize: "12px", color: card.accent || "#d32f2f", fontWeight: "700", letterSpacing: "2px", marginBottom: "12px" }}>
                    {String(currentIndex + 1).padStart(2, "0")} / {String(WEEKLY_CARDS.length).padStart(2, "0")}
                </div>

                {/* 이모지 */}
                <div style={{ fontSize: "40px", marginBottom: "12px" }}>
                    {card.emoji}
                </div>

                {/* 타이틀 */}
                <h3 style={{
                    fontSize: "22px", fontWeight: "800", color: "#f0f6fc", lineHeight: 1.3, marginBottom: "12px",
                    transition: "all 0.3s ease"
                }}>
                    {card.title}
                </h3>

                {/* 본문 */}
                <p style={{
                    fontSize: "15px", color: "#c9d1d9", lineHeight: 1.6,
                    transition: "all 0.3s ease"
                }}>
                    {card.body}
                </p>
            </div>

            {/* 인디케이터 도트 + 화살표 버튼 */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "16px", marginTop: "16px" }}>
                {/* 왼쪽 화살표 */}
                <button
                    onClick={() => currentIndex > 0 && setCurrentIndex(currentIndex - 1)}
                    style={{
                        background: "none", border: "none", color: currentIndex > 0 ? "#f0f6fc" : "#333",
                        fontSize: "18px", cursor: currentIndex > 0 ? "pointer" : "default", padding: "4px 8px"
                    }}
                    aria-label="이전 카드"
                >◂</button>

                {/* 도트 */}
                <div style={{ display: "flex", gap: "8px" }}>
                    {WEEKLY_CARDS.map((_, i) => (
                        <button
                            key={i}
                            onClick={() => setCurrentIndex(i)}
                            style={{
                                width: i === currentIndex ? "24px" : "8px",
                                height: "8px",
                                borderRadius: "4px",
                                background: i === currentIndex ? (card.accent || "#d32f2f") : "rgba(255,255,255,0.15)",
                                border: "none",
                                cursor: "pointer",
                                transition: "all 0.3s ease",
                                padding: 0,
                            }}
                            aria-label={`카드 ${i + 1}`}
                        />
                    ))}
                </div>

                {/* 오른쪽 화살표 */}
                <button
                    onClick={() => currentIndex < WEEKLY_CARDS.length - 1 && setCurrentIndex(currentIndex + 1)}
                    style={{
                        background: "none", border: "none",
                        color: currentIndex < WEEKLY_CARDS.length - 1 ? "#f0f6fc" : "#333",
                        fontSize: "18px", cursor: currentIndex < WEEKLY_CARDS.length - 1 ? "pointer" : "default", padding: "4px 8px"
                    }}
                    aria-label="다음 카드"
                >▸</button>
            </div>
        </section>
    );
}
