"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import Header from "../../../components/Header";
import Footer from "../../../components/Footer";
import RichEditor from "../../../components/RichEditor";
import styles from "../../write/page.module.css"; // 글쓰기 스타일 재사용

interface EditPageProps {
    params: Promise<{ id: string }>;
}

export default function AdminEditPage({ params }: EditPageProps) {
    const [title, setTitle] = useState("");
    const [category, setCategory] = useState("정치");
    const [youtubeUrl, setYoutubeUrl] = useState("");
    const [content, setContent] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [articleId, setArticleId] = useState("");

    const supabase = createClient();

    useEffect(() => {
        const loadArticle = async () => {
            const { id } = await params;
            setArticleId(id);

            const { data, error } = await supabase
                .from("articles")
                .select("*")
                .eq("id", id)
                .single();

            if (data && !error) {
                setTitle(data.title);
                setCategory(data.category);
                setYoutubeUrl(data.youtube_id ? `https://www.youtube.com/watch?v=${data.youtube_id}` : "");
                setContent(data.content);
            }
            setIsLoading(false);
        };
        loadArticle();
    }, []);

    const getYoutubeId = (url: string) => {
        if (!url) return null;
        const match = url.match(/[?&]v=([^&#]+)/) || url.match(/youtu\.be\/([^?#\/]+)/) || url.match(/shorts\/([^?#\/]+)/);
        return match ? match[1] : null;
    };
    const videoId = getYoutubeId(youtubeUrl);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        const { error } = await supabase
            .from("articles")
            .update({
                title,
                category,
                youtube_id: videoId || "",
                content,
            })
            .eq("id", articleId);

        setIsSubmitting(false);

        if (error) {
            alert("수정에 실패했습니다: " + error.message);
        } else {
            alert("성공적으로 수정되었습니다!");
            window.location.href = "/admin";
        }
    };

    if (isLoading) {
        return (
            <div className={styles.adminMain}>
                <Header />
                <div style={{ textAlign: "center", padding: "150px 20px", color: "var(--color-text-muted)" }}>
                    기사 정보를 불러오는 중...
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <div className={styles.adminMain}>
            <Header />

            <div className={styles.adminContainer}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <h1 className={styles.adminTitle}>기사 수정</h1>
                    <a href="/admin" style={{
                        padding: "8px 16px",
                        fontSize: "var(--text-sm)",
                        background: "var(--color-surface)",
                        border: "1px solid var(--color-border)",
                        borderRadius: "var(--radius-md)",
                        color: "var(--color-text-secondary)",
                        textDecoration: "none"
                    }}>
                        ← 대시보드로
                    </a>
                </div>
                <p className={styles.adminDesc}>
                    기사의 내용을 수정하고 저장합니다.
                </p>

                <div className={styles.adminLayout}>
                    <form className={styles.adminForm} onSubmit={handleSubmit}>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>제목</label>
                            <input
                                type="text"
                                className={styles.input}
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                required
                            />
                        </div>

                        <div className={styles.formGroupRow}>
                            <div className={styles.formGroup}>
                                <label className={styles.label}>카테고리</label>
                                <select
                                    className={styles.select}
                                    value={category}
                                    onChange={(e) => setCategory(e.target.value)}
                                >
                                    <option value="정치">정치</option>
                                    <option value="경제">경제</option>
                                    <option value="역사">역사</option>
                                </select>
                            </div>

                            <div className={styles.formGroup}>
                                <label className={styles.label}>유튜브 URL</label>
                                <input
                                    type="url"
                                    className={styles.input}
                                    value={youtubeUrl}
                                    onChange={(e) => setYoutubeUrl(e.target.value)}
                                    placeholder="https://www.youtube.com/watch?v=..."
                                />
                            </div>
                        </div>

                        <div className={styles.formGroup} style={{ marginBottom: "60px" }}>
                            <label className={styles.label}>기사 본문</label>
                            <RichEditor
                                value={content}
                                onChange={setContent}
                            />
                        </div>

                        <button type="submit" className={styles.submitBtn} disabled={isSubmitting}>
                            {isSubmitting ? "저장 중..." : "수정 저장"}
                        </button>
                    </form>

                    {/* Preview Panel */}
                    <div className={styles.adminPreview}>
                        <h2 className={styles.previewTitle}>미리보기</h2>
                        <div className={styles.previewBox}>
                            <span className={styles.previewCategory}>{category}</span>
                            <h3 className={styles.previewArticleTitle}>
                                {title || "제목이 여기에 표시됩니다"}
                            </h3>
                            <div className={styles.previewVideo}>
                                {videoId ? (
                                    <img
                                        src={`https://img.youtube.com/vi/${videoId}/hqdefault.jpg`}
                                        alt="YouTube Thumbnail"
                                        className={styles.previewThumb}
                                    />
                                ) : (
                                    <div className={styles.previewVideoPlaceholder}>
                                        유튜브 URL을 입력하면 썸네일이 나타납니다.
                                    </div>
                                )}
                            </div>
                            <div className={styles.previewContent}>
                                {content ? (
                                    <div dangerouslySetInnerHTML={{ __html: content }} />
                                ) : (
                                    <p className={styles.previewEmptyText}>본문 내용이 여기에 표시됩니다.</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
}
