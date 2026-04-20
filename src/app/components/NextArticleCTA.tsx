import Link from "next/link";

interface NextArticleCTAProps {
    nextArticle: {
        id: string;
        title: string;
        categoryLabel: string;
        thumbnailUrl: string;
    } | null;
}

export default function NextArticleCTA({ nextArticle }: NextArticleCTAProps) {
    if (!nextArticle) return null;

    return (
        <Link
            href={`/article/${nextArticle.id}`}
            style={{
                display: "block",
                margin: "0 auto",
                maxWidth: "800px",
                padding: "0 var(--space-6)",
            }}
        >
            <div
                style={{
                    background: "linear-gradient(135deg, rgba(211,47,47,0.08) 0%, rgba(211,47,47,0.02) 100%)",
                    border: "1px solid rgba(211,47,47,0.2)",
                    borderRadius: "16px",
                    padding: "20px 24px",
                    display: "flex",
                    alignItems: "center",
                    gap: "16px",
                    transition: "all 0.2s ease",
                    cursor: "pointer",
                }}
            >
                {/* 썸네일 */}
                {nextArticle.thumbnailUrl && (
                    <div style={{
                        width: "72px",
                        height: "72px",
                        borderRadius: "12px",
                        overflow: "hidden",
                        flexShrink: 0,
                        border: "1px solid rgba(255,255,255,0.06)",
                    }}>
                        <img
                            src={nextArticle.thumbnailUrl}
                            alt=""
                            style={{
                                width: "100%",
                                height: "100%",
                                objectFit: "cover",
                            }}
                        />
                    </div>
                )}

                {/* 텍스트 */}
                <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                        fontSize: "11px",
                        color: "#d32f2f",
                        fontWeight: 700,
                        textTransform: "uppercase",
                        letterSpacing: "0.5px",
                        marginBottom: "4px",
                    }}>
                        다음 기사 →
                    </div>
                    <div style={{
                        fontSize: "15px",
                        fontWeight: 700,
                        color: "var(--color-text-primary)",
                        lineHeight: 1.4,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                    }}>
                        {nextArticle.title}
                    </div>
                    <div style={{
                        fontSize: "12px",
                        color: "var(--color-text-muted)",
                        marginTop: "4px",
                    }}>
                        {nextArticle.categoryLabel}
                    </div>
                </div>

                {/* 화살표 */}
                <div style={{
                    fontSize: "24px",
                    color: "#d32f2f",
                    flexShrink: 0,
                    opacity: 0.7,
                }}>
                    ›
                </div>
            </div>
        </Link>
    );
}
