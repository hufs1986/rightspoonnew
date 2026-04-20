"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";

interface Comment {
    id: string;
    nickname: string;
    content: string;
    created_at: string;
}

export default function Comments({ articleId }: { articleId: string }) {
    const [comments, setComments] = useState<Comment[]>([]);
    const [nickname, setNickname] = useState("");
    const [content, setContent] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        // 기본 닉네임 생성 (익명_랜덤4자리)
        const randomNum = Math.floor(1000 + Math.random() * 9000);
        setNickname(`익명_${randomNum}`);

        fetchComments();
    }, [articleId]);

    const fetchComments = async () => {
        const supabase = createClient();
        const { data, error } = await supabase
            .from("comments")
            .select("*")
            .eq("article_id", articleId)
            .order("created_at", { ascending: false });

        if (!error && data) {
            setComments(data);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!content.trim()) return;

        setIsSubmitting(true);
        const supabase = createClient();

        const newComment = {
            article_id: articleId,
            nickname: nickname.trim() || "익명",
            content: content.trim(),
        };

        const { data, error } = await supabase
            .from("comments")
            .insert(newComment)
            .select()
            .single();

        if (!error && data) {
            setComments([data, ...comments]);
            setContent("");
        } else {
            console.error("댓글 작성 실패:", error);
            alert("댓글 작성에 실패했습니다. 다시 시도해주세요.");
        }
        setIsSubmitting(false);
    };

    return (
        <div style={{ marginTop: "40px", borderTop: "1px solid var(--color-border)", paddingTop: "32px" }}>
            <h3 style={{ fontSize: "20px", fontWeight: "bold", marginBottom: "20px", display: "flex", alignItems: "center", gap: "8px" }}>
                <span>한 줄 의견</span>
                <span style={{ fontSize: "14px", color: "var(--color-text-secondary)", fontWeight: "normal", background: "rgba(255,255,255,0.05)", padding: "2px 8px", borderRadius: "12px" }}>
                    {comments.length}
                </span>
            </h3>

            {/* 댓글 작성 폼 */}
            <form onSubmit={handleSubmit} style={{ marginBottom: "32px", display: "flex", flexDirection: "column", gap: "12px" }}>
                <div style={{ display: "flex", gap: "12px" }}>
                    <input
                        type="text"
                        value={nickname}
                        onChange={(e) => setNickname(e.target.value)}
                        placeholder="닉네임"
                        maxLength={12}
                        style={{
                            width: "120px",
                            padding: "12px 14px",
                            borderRadius: "12px",
                            border: "1px solid var(--color-border)",
                            background: "var(--color-bg-card)",
                            color: "var(--color-text-primary)",
                            fontSize: "14px"
                        }}
                    />
                    <input
                        type="text"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="기사에 대한 생각을 남겨주세요 (150자 이내)"
                        maxLength={150}
                        style={{
                            flex: 1,
                            padding: "12px 14px",
                            borderRadius: "12px",
                            border: "1px solid var(--color-border)",
                            background: "var(--color-bg-card)",
                            color: "var(--color-text-primary)",
                            fontSize: "14px"
                        }}
                    />
                    <button
                        type="submit"
                        disabled={isSubmitting || !content.trim()}
                        style={{
                            padding: "0 24px",
                            borderRadius: "12px",
                            border: "none",
                            background: content.trim() ? "var(--color-primary)" : "rgba(255,255,255,0.1)",
                            color: content.trim() ? "#fff" : "rgba(255,255,255,0.4)",
                            fontWeight: "bold",
                            cursor: content.trim() ? "pointer" : "not-allowed",
                            transition: "background 0.2s"
                        }}
                    >
                        등록
                    </button>
                </div>
                <div style={{ fontSize: "12px", color: "var(--color-text-tertiary)", textAlign: "right", paddingRight: "4px" }}>
                    {content.length}/150
                </div>
            </form>

            {/* 댓글 리스트 */}
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                {comments.length === 0 ? (
                    <div style={{ textAlign: "center", padding: "32px 0", color: "var(--color-text-tertiary)", fontSize: "14px" }}>
                        가장 먼저 의견을 남겨보세요!
                    </div>
                ) : (
                    comments.map((comment) => (
                        <div key={comment.id} style={{ padding: "16px", borderRadius: "12px", background: "rgba(255,255,255,0.02)", display: "flex", flexDirection: "column", gap: "8px" }}>
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                <span style={{ fontWeight: "600", fontSize: "14px", color: "var(--color-text-secondary)" }}>
                                    {comment.nickname}
                                </span>
                                <span style={{ fontSize: "12px", color: "var(--color-text-tertiary)" }}>
                                    {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true, locale: ko })}
                                </span>
                            </div>
                            <div style={{ fontSize: "15px", color: "var(--color-text-primary)", lineHeight: 1.5, wordBreak: "break-all" }}>
                                {comment.content}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
