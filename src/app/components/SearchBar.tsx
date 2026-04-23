"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface SearchResult {
    id: string;
    slug?: string;
    title: string;
    categoryLabel: string;
    thumbnailUrl: string;
    excerpt: string;
}

export default function SearchBar() {
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<SearchResult[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const debounceRef = useRef<NodeJS.Timeout | null>(null);
    const router = useRouter();

    // 검색창 열릴 때 포커스
    useEffect(() => {
        if (isOpen && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isOpen]);

    // 외부 클릭 시 닫기
    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClick);
        return () => document.removeEventListener("mousedown", handleClick);
    }, []);

    // ESC 키로 닫기
    useEffect(() => {
        const handleKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") setIsOpen(false);
        };
        document.addEventListener("keydown", handleKey);
        return () => document.removeEventListener("keydown", handleKey);
    }, []);

    const handleSearch = (value: string) => {
        setQuery(value);

        if (debounceRef.current) clearTimeout(debounceRef.current);

        if (value.trim().length < 2) {
            setResults([]);
            return;
        }

        debounceRef.current = setTimeout(async () => {
            setIsLoading(true);
            try {
                const res = await fetch(`/api/search?q=${encodeURIComponent(value.trim())}`);
                const data = await res.json();
                setResults(data.articles || []);
            } catch {
                setResults([]);
            }
            setIsLoading(false);
        }, 300);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (query.trim().length >= 2) {
            setIsOpen(false);
            router.push(`/search?q=${encodeURIComponent(query.trim())}`);
        }
    };

    return (
        <div ref={containerRef} style={{ position: "relative" }}>
            {/* 검색 아이콘 버튼 */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                aria-label="검색"
                style={{
                    background: "none",
                    border: "none",
                    color: "var(--color-text-secondary)",
                    fontSize: "18px",
                    cursor: "pointer",
                    padding: "6px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                }}
            >
                🔍
            </button>

            {/* 검색 드롭다운 */}
            {isOpen && (
                <div
                    style={{
                        position: "fixed",
                        top: 0,
                        left: 0,
                        right: 0,
                        zIndex: 10001,
                        background: "var(--color-bg)",
                        borderBottom: "1px solid var(--color-border)",
                        padding: "12px 16px",
                        boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
                        animation: "searchSlide 0.2s ease-out",
                    }}
                >
                    <form onSubmit={handleSubmit} style={{ display: "flex", gap: "8px", maxWidth: "600px", margin: "0 auto" }}>
                        <input
                            ref={inputRef}
                            type="text"
                            value={query}
                            onChange={(e) => handleSearch(e.target.value)}
                            placeholder="기사 제목 또는 내용 검색..."
                            style={{
                                flex: 1,
                                padding: "12px 16px",
                                background: "var(--color-bg-alt)",
                                border: "1px solid var(--color-border)",
                                borderRadius: "12px",
                                color: "var(--color-text-primary)",
                                fontSize: "15px",
                                outline: "none",
                            }}
                        />
                        <button
                            type="button"
                            onClick={() => setIsOpen(false)}
                            style={{
                                background: "none",
                                border: "none",
                                color: "var(--color-text-muted)",
                                fontSize: "14px",
                                cursor: "pointer",
                                padding: "0 8px",
                                whiteSpace: "nowrap",
                            }}
                        >
                            취소
                        </button>
                    </form>

                    {/* 검색 결과 */}
                    {(results.length > 0 || isLoading || (query.length >= 2 && !isLoading)) && (
                        <div style={{
                            maxWidth: "600px",
                            margin: "12px auto 0",
                            maxHeight: "60vh",
                            overflowY: "auto",
                        }}>
                            {isLoading && (
                                <div style={{ textAlign: "center", padding: "20px", color: "var(--color-text-muted)", fontSize: "14px" }}>
                                    검색 중...
                                </div>
                            )}

                            {!isLoading && query.length >= 2 && results.length === 0 && (
                                <div style={{ textAlign: "center", padding: "24px", color: "var(--color-text-muted)", fontSize: "14px" }}>
                                    &quot;{query}&quot;에 대한 검색 결과가 없습니다
                                </div>
                            )}

                            {results.map((article) => (
                                <Link
                                    key={article.id}
                                    href={`/article/${article.slug || article.id}`}
                                    onClick={() => setIsOpen(false)}
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "12px",
                                        padding: "12px",
                                        borderRadius: "10px",
                                        textDecoration: "none",
                                        transition: "background 0.15s",
                                    }}
                                    onMouseEnter={(e) => (e.currentTarget.style.background = "var(--color-bg-card-hover)")}
                                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                                >
                                    {article.thumbnailUrl && (
                                        <div style={{
                                            width: "48px",
                                            height: "48px",
                                            borderRadius: "8px",
                                            overflow: "hidden",
                                            flexShrink: 0,
                                            border: "1px solid rgba(255,255,255,0.06)",
                                        }}>
                                            <img
                                                src={article.thumbnailUrl}
                                                alt=""
                                                style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                            />
                                        </div>
                                    )}
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{
                                            fontSize: "14px",
                                            fontWeight: 600,
                                            color: "var(--color-text-primary)",
                                            overflow: "hidden",
                                            textOverflow: "ellipsis",
                                            whiteSpace: "nowrap",
                                        }}>
                                            {article.title}
                                        </div>
                                        <div style={{
                                            fontSize: "12px",
                                            color: "var(--color-text-muted)",
                                            marginTop: "2px",
                                        }}>
                                            {article.categoryLabel}
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            )}

            <style>{`
                @keyframes searchSlide {
                    0% { opacity: 0; transform: translateY(-10px); }
                    100% { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
}
