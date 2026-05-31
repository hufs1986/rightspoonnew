"use client";

import { useMemo, useState } from "react";

type ShareCopy = {
    caption: string;
    story: string;
    pinnedComment: string;
};

type InstagramShareKitProps = {
    title: string;
    excerpt: string;
    url: string;
};

function makeFallbackCopy(title: string, excerpt: string, url: string): ShareCopy {
    const shortExcerpt = excerpt.replace(/\s+/g, " ").slice(0, 140);
    return {
        caption: `[오른스푼]\n${title}\n\n${shortExcerpt}\n\n짧은 반응으로 끝내기 아까운 이슈라 글로 정리했습니다.\n전문은 오른스푼에서 읽어주세요.\n\n${url}\n\n#오른스푼 #드럼통119 #정치해설 #사회이슈`,
        story: `${title}\n\n짧게 지나간 이슈, 오른스푼에서 길게 정리했습니다.\n프로필 링크에서 확인`,
        pinnedComment: `전문은 오른스푼에 정리했습니다. 링크로 저장해두고 천천히 읽어보세요.\n${url}`,
    };
}

export default function InstagramShareKit({ title, excerpt, url }: InstagramShareKitProps) {
    const fallback = useMemo(() => makeFallbackCopy(title, excerpt, url), [title, excerpt, url]);
    const [shareCopy, setShareCopy] = useState<ShareCopy>(fallback);
    const [isGenerating, setIsGenerating] = useState(false);
    const [copiedKey, setCopiedKey] = useState<keyof ShareCopy | null>(null);
    const [message, setMessage] = useState("");

    const generateCopy = async () => {
        setIsGenerating(true);
        setMessage("공유 문구를 만드는 중입니다.");

        try {
            const res = await fetch("/api/ai/share", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ title, excerpt, url }),
            });
            const data = await res.json();

            if (!res.ok) {
                throw new Error(data?.error || "공유 문구 생성에 실패했습니다.");
            }

            if (data?.share) {
                setShareCopy(data.share);
            }
            setMessage(
                data?.mode === "ai"
                    ? "AI 공유 문구를 만들었습니다."
                    : data?.message || "기본 공유 문구를 사용합니다."
            );
        } catch (err) {
            console.error("Share copy generation failed:", err);
            setShareCopy(fallback);
            setMessage("공유 문구 생성에 실패해 기본 문구를 사용합니다.");
        } finally {
            setIsGenerating(false);
        }
    };

    const copyText = async (key: keyof ShareCopy) => {
        await navigator.clipboard.writeText(shareCopy[key]);
        setCopiedKey(key);
        setTimeout(() => setCopiedKey(null), 1800);
    };

    return (
        <section style={{
            margin: "32px 0",
            padding: "24px",
            border: "1px solid var(--color-border)",
            borderRadius: "12px",
            background: "var(--color-bg-card)",
        }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: "16px", alignItems: "flex-start", marginBottom: "18px", flexWrap: "wrap" }}>
                <div>
                    <p style={{ color: "var(--color-accent)", fontSize: "12px", fontWeight: 900, marginBottom: "6px" }}>
                        인스타 유입 키트
                    </p>
                    <h2 style={{ fontSize: "20px", lineHeight: 1.3, marginBottom: "8px" }}>
                        이 글을 인스타에서 다시 끌어오세요.
                    </h2>
                    <p style={{ color: "var(--color-text-secondary)", fontSize: "14px", lineHeight: 1.6 }}>
                        캡션, 스토리, 고정 댓글 문구를 복사해 인스타에서 오른스푼 링크로 유입을 만듭니다.
                    </p>
                </div>
                <button
                    type="button"
                    onClick={generateCopy}
                    disabled={isGenerating}
                    style={{
                        padding: "10px 14px",
                        borderRadius: "8px",
                        border: "1px solid var(--color-accent)",
                        background: "var(--color-accent)",
                        color: "white",
                        fontWeight: 800,
                        cursor: isGenerating ? "wait" : "pointer",
                        opacity: isGenerating ? 0.7 : 1,
                    }}
                >
                    {isGenerating ? "생성 중..." : "AI 문구 생성"}
                </button>
            </div>

            {message && (
                <p style={{ color: "var(--color-text-muted)", fontSize: "13px", marginBottom: "14px" }}>
                    {message}
                </p>
            )}

            <div style={{ display: "grid", gap: "12px" }}>
                {([
                    ["caption", "게시물 캡션"],
                    ["story", "스토리 문구"],
                    ["pinnedComment", "고정 댓글"],
                ] as const).map(([key, label]) => (
                    <div key={key} style={{
                        border: "1px solid var(--color-border)",
                        borderRadius: "10px",
                        padding: "14px",
                        background: "var(--color-white)",
                    }}>
                        <div style={{ display: "flex", justifyContent: "space-between", gap: "12px", alignItems: "center", marginBottom: "10px" }}>
                            <strong style={{ fontSize: "14px" }}>{label}</strong>
                            <button
                                type="button"
                                onClick={() => copyText(key)}
                                style={{
                                    padding: "7px 10px",
                                    borderRadius: "8px",
                                    border: "1px solid var(--color-border)",
                                    background: "var(--color-surface)",
                                    color: "var(--color-text-primary)",
                                    fontSize: "12px",
                                    fontWeight: 800,
                                }}
                            >
                                {copiedKey === key ? "복사됨" : "복사"}
                            </button>
                        </div>
                        <pre style={{
                            whiteSpace: "pre-wrap",
                            wordBreak: "break-word",
                            color: "var(--color-text-secondary)",
                            fontFamily: "inherit",
                            fontSize: "13px",
                            lineHeight: 1.6,
                            margin: 0,
                        }}>
                            {shareCopy[key]}
                        </pre>
                    </div>
                ))}
            </div>
        </section>
    );
}
