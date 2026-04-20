"use client";

import { useState } from "react";
import styles from "./page.module.css";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { createClient } from "@/utils/supabase/client";

export default function AdminWritePage() {
    const [title, setTitle] = useState("");
    const [category, setCategory] = useState("정치");
    const [youtubeUrl, setYoutubeUrl] = useState("");
    const [content, setContent] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleLogout = async () => {
        const supabase = createClient();
        await supabase.auth.signOut();
        window.location.href = "/";
    };

    // Preview YouTube ID extraction
    const getYoutubeId = (url: string) => {
        if (!url) return null;
        const match = url.match(/[?&]v=([^&]+)/) || url.match(/youtu\.be\/([^?]+)/);
        return match ? match[1] : null;
    };
    const videoId = getYoutubeId(youtubeUrl);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        // Supabase 연동 코드
        const supabase = createClient();

        const { error } = await supabase
            .from('articles')
            .insert([
                {
                    title,
                    category,
                    youtube_id: videoId || "",
                    content,
                    author: '드럼통119'
                }
            ]);

        setIsSubmitting(false);

        if (error) {
            alert("등록에 실패했습니다: " + error.message);
        } else {
            alert("성공적으로 등록되었습니다!");
            setTitle("");
            setYoutubeUrl("");
            setContent("");
        }
    };

    return (
        <div className={styles.adminMain}>
            <Header />

            <div className={styles.adminContainer}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <h1 className={styles.adminTitle}>새 콘텐츠 작성 (관리자)</h1>
                    <button onClick={handleLogout} style={{
                        padding: "8px 16px",
                        fontSize: "var(--text-sm)",
                        background: "var(--color-surface)",
                        border: "1px solid var(--color-border)",
                        borderRadius: "var(--radius-md)",
                        cursor: "pointer",
                        color: "var(--color-text-secondary)"
                    }}>
                        로그아웃
                    </button>
                </div>
                <p className={styles.adminDesc}>
                    유튜브 영상 URL과 기사 본문을 입력하여 새로운 콘텐츠를 발행합니다.
                </p>

                <div className={styles.adminLayout}>
                    {/* Write Form */}
                    <form className={styles.adminForm} onSubmit={handleSubmit}>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>제목</label>
                            <input
                                type="text"
                                className={styles.input}
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="기사 제목을 입력하세요"
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
                                    required
                                />
                            </div>
                        </div>

                        <div className={styles.formGroup}>
                            <label className={styles.label}>기사 본문</label>
                            <textarea
                                className={styles.textarea}
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                placeholder="유튜브 영상에 대한 설명, 의견 또는 기사 내용을 적어주세요. 마크다운이나 일반 텍스트로 작성합니다."
                                required
                            />
                        </div>

                        <button type="submit" className={styles.submitBtn} disabled={isSubmitting}>
                            {isSubmitting ? "발행 중..." : "발행하기"}
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
                                    <p>{content}</p>
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
