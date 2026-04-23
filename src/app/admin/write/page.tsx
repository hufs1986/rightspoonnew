"use client";

import { useState } from "react";
import styles from "./page.module.css";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import RichEditor from "../../components/RichEditor";
import Image from "next/image";
import { createClient } from "@/utils/supabase/client";
import { generateSlug } from "@/utils/slug";

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
        const match = url.match(/[?&]v=([^&#]+)/) || url.match(/youtu\.be\/([^?#\/]+)/) || url.match(/shorts\/([^?#\/]+)/);
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
                    slug: generateSlug(title),
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
            // 푸시 알림 전송 (실패해도 글 등록은 성공)
            try {
                await fetch("/api/push/send", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        title: "🔔 오른스푼 새 글",
                        body: title,
                        url: "/",
                    }),
                });
            } catch (pushErr) {
                console.error("푸시 알림 전송 실패:", pushErr);
            }
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
                                    required
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
                                    <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden', borderRadius: 'var(--radius-md)' }}>
                                        <Image
                                            src={`https://img.youtube.com/vi/${videoId}/hqdefault.jpg`}
                                            alt="YouTube Thumbnail"
                                            fill
                                            style={{ objectFit: 'cover' }}
                                        />
                                    </div>
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
