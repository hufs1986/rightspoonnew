import Link from "next/link";
import { createClient } from "@/utils/supabase/server";
import { formatArticle } from "@/utils/articleFormat";

export default async function PopularArticles() {
    const supabase = await createClient();

    const { data: articles } = await supabase
        .from("articles")
        .select("*")
        .order("view_count", { ascending: false })
        .limit(5);

    if (!articles || articles.length === 0) return null;

    const formatted = articles.map(formatArticle);

    return (
        <section
            style={{
                maxWidth: "var(--max-width)",
                margin: "0 auto",
                padding: "var(--space-6) var(--space-4) 0",
            }}
        >
            {/* Section Header */}
            <div style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "var(--space-6)",
            }}>
                <h2 style={{
                    fontSize: "var(--text-2xl)",
                    fontWeight: 900,
                    display: "flex",
                    alignItems: "center",
                    gap: "var(--space-3)",
                }}>
                    <span style={{
                        width: "4px",
                        height: "28px",
                        background: "#ff6659",
                        borderRadius: "9999px",
                        display: "inline-block",
                    }} />
                    🔥 인기 콘텐츠
                </h2>
            </div>

            {/* Ranking List */}
            <div style={{
                display: "flex",
                flexDirection: "column",
                gap: "8px",
            }}>
                {formatted.map((article, index) => (
                    <Link
                        key={article.id}
                        href={`/article/${article.id}`}
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "14px",
                            padding: "14px 16px",
                            background: index === 0
                                ? "linear-gradient(135deg, rgba(211,47,47,0.12) 0%, rgba(211,47,47,0.04) 100%)"
                                : "var(--color-bg-card)",
                            borderRadius: "12px",
                            border: index === 0
                                ? "1px solid rgba(211,47,47,0.25)"
                                : "1px solid var(--color-border)",
                            transition: "all 0.2s ease",
                            textDecoration: "none",
                        }}
                    >
                        {/* Rank Number */}
                        <div style={{
                            fontSize: index < 3 ? "22px" : "18px",
                            fontWeight: 900,
                            fontFamily: "var(--font-display)",
                            color: index < 3 ? "#d32f2f" : "var(--color-text-muted)",
                            width: "32px",
                            textAlign: "center",
                            flexShrink: 0,
                        }}>
                            {index + 1}
                        </div>

                        {/* Thumbnail */}
                        {article.thumbnailUrl && (
                            <div style={{
                                width: "52px",
                                height: "52px",
                                borderRadius: "8px",
                                overflow: "hidden",
                                flexShrink: 0,
                                border: "1px solid rgba(255,255,255,0.06)",
                            }}>
                                <img
                                    src={article.thumbnailUrl}
                                    alt=""
                                    style={{
                                        width: "100%",
                                        height: "100%",
                                        objectFit: "cover",
                                    }}
                                    loading="lazy"
                                />
                            </div>
                        )}

                        {/* Text */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{
                                fontSize: "14px",
                                fontWeight: 700,
                                color: "var(--color-text-primary)",
                                lineHeight: 1.4,
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                            }}>
                                {article.title}
                            </div>
                            <div style={{
                                fontSize: "12px",
                                color: "var(--color-text-muted)",
                                marginTop: "4px",
                            }}>
                                👁 {article.views.toLocaleString()} · ❤️ {article.likes.toLocaleString()}
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </section>
    );
}
