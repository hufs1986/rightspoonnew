"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import Header from "../../../components/Header";
import Footer from "../../../components/Footer";
import RichEditor from "../../../components/RichEditor";
import styles from "../../write/page.module.css"; // 글쓰기 스타일 재사용

interface EditPageProps {
    params: Promise<{ id: string }>;
}

function stripHtml(html: string) {
    return html.replace(/<[^>]*>/g, " ").replace(/&nbsp;/g, " ").replace(/\s+/g, " ").trim();
}

export default function AdminEditPage({ params }: EditPageProps) {
    const [title, setTitle] = useState("");
    const [category, setCategory] = useState("정치");
    const [youtubeUrl, setYoutubeUrl] = useState("");
    const [content, setContent] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isRewriting, setIsRewriting] = useState(false);
    const [rewriteMessage, setRewriteMessage] = useState("");
    const [articleId, setArticleId] = useState("");
    const [articleSlug, setArticleSlug] = useState("");

    const supabase = useMemo(() => createClient(), []);

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
                setArticleSlug(data.slug || "");
            }
            setIsLoading(false);
        };
        loadArticle();
    }, [params, supabase]);

    const getYoutubeId = (url: string) => {
        if (!url) return null;
        const match = url.match(/[?&]v=([^&#]+)/) || url.match(/youtu\.be\/([^?#\/]+)/) || url.match(/shorts\/([^?#\/]+)/);
        return match ? match[1] : null;
    };
    const videoId = getYoutubeId(youtubeUrl);
    const plainText = stripHtml(content);
    const charCount = plainText.length;
    const headingCount = (content.match(/<h2|<h3/g) || []).length;
    const hasSource = /출처|source|http/i.test(content);
    const internalLinkCount = (content.match(/rightspoon\.co\.kr|href="\/|href='\/|\/article\//gi) || []).length;
    const hasSummary = /한 줄 요약|핵심 요약|요약/.test(content);
    const titleSearchReady = /이유|문제|전망|해설|정리|논란|뜻|쟁점|비판|비교|왜|어떻게/.test(title) && title.length >= 18;
    const qualityStatus =
        charCount >= 1200 && headingCount >= 3 && hasSource && titleSearchReady
            ? "발행 적합"
            : charCount >= 800
                ? "보강 권장"
                : "초안 단계";

    const suggestSearchTitle = useCallback(() => {
        const cleanTitle = title.replace(/['"“”‘’]/g, "").replace(/\s+/g, " ").trim();
        if (!cleanTitle) return;
        if (titleSearchReady) return;
        setTitle(`${cleanTitle}: 왜 지금 다시 봐야 하나`);
    }, [title, titleSearchReady]);

    const addInternalLinkBlock = useCallback(() => {
        if (content.includes("함께 읽을 글")) {
            alert("이미 함께 읽을 글 섹션이 있습니다.");
            return;
        }

        const nextContent = `${content.trim()}

<h2>함께 읽을 글</h2>
<ul>
<li><a href="/category/politics">정치 해설 더 보기</a></li>
<li><a href="/from-instagram">인스타에서 오신 분들을 위한 안내</a></li>
</ul>`.trim();
        setContent(nextContent);
    }, [content]);

    const addSummaryBlock = useCallback(() => {
        if (!content.trim()) {
            alert("기존 본문이 없습니다.");
            return;
        }
        if (hasSummary) {
            alert("이미 요약 섹션이 있습니다.");
            return;
        }

        setContent(`
<h2>한 줄 요약</h2>
<p>이 글의 핵심 주장을 1~2문장으로 정리하세요. 검색으로 들어온 독자가 바로 이해할 수 있어야 합니다.</p>
${content}
`.trim());
    }, [content, hasSummary]);

    const makeRewriteContent = useCallback(() => {
        return `
<h2>한 줄 요약</h2>
<p>이 글의 핵심 주장을 1~2문장으로 다시 정리하세요. 검색으로 들어온 독자가 바로 이해할 수 있어야 합니다.</p>
<h2>왜 이 이슈가 중요한가</h2>
<p>단순 분노가 아니라, 이 사안이 정치·사회적으로 어떤 흐름을 보여주는지 설명하세요.</p>
<h2>기존 글의 문제의식</h2>
${content}
<h2>근거와 맥락</h2>
<p><strong>출처:</strong> 관련 기사, 공식 자료, 통계, 발언 원문 링크를 여기에 추가하세요.</p>
<h2>오른스푼의 결론</h2>
<p>마지막에는 독자가 공유할 수 있는 문장으로 결론을 정리하세요. 감정 표현보다 판단 기준을 남기는 것이 중요합니다.</p>
`.trim();
    }, [content]);

    const applyLocalRewrite = useCallback(() => {
        setContent(makeRewriteContent());
        suggestSearchTitle();
    }, [makeRewriteContent, suggestSearchTitle]);

    const wrapForRewrite = () => {
        if (!content.trim()) {
            alert("기존 본문이 없습니다.");
            return;
        }
        if (!confirm("기존 본문을 보존하면서 리라이트 구조를 앞뒤로 추가할까요?")) return;
        applyLocalRewrite();
    };

    const rewriteWithAi = async () => {
        if (!title.trim() || !content.trim()) {
            alert("제목과 본문이 있어야 AI 리라이트를 실행할 수 있습니다.");
            return;
        }
        if (!confirm("현재 제목/본문을 AI 리라이트 초안으로 교체할까요? 저장 전까지는 DB에 반영되지 않습니다.")) return;

        setIsRewriting(true);
        setRewriteMessage("기존 글을 검색형 해설 구조로 재정리하는 중입니다.");

        try {
            const res = await fetch("/api/ai/rewrite", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ title, category, content }),
            });
            const data = await res.json();

            if (!res.ok) {
                throw new Error(data?.error || "AI 리라이트에 실패했습니다.");
            }

            if (data?.draft?.title) setTitle(data.draft.title);
            if (data?.draft?.category) setCategory(data.draft.category);
            if (data?.draft?.content) setContent(data.draft.content);

            setRewriteMessage(
                data?.mode === "ai"
                    ? "AI 리라이트 초안을 만들었습니다. 출처와 사실관계를 확인한 뒤 저장하세요."
                    : data?.message || "로컬 리라이트 구조를 적용했습니다. OPENAI_API_KEY 설정 후 AI 리라이트가 활성화됩니다."
            );
        } catch (err) {
            console.error("AI rewrite failed:", err);
            applyLocalRewrite();
            setRewriteMessage("AI 리라이트에 실패해 로컬 리라이트 구조를 적용했습니다.");
        } finally {
            setIsRewriting(false);
        }
    };

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
            alert("성공적으로 수정되었습니다. 공개 글에서 인스타 유입 키트를 바로 사용하세요.");
            window.location.href = `/article/${articleSlug || articleId}`;
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
                    기존 글을 검색형 제목, 소제목, 출처, 결론이 있는 해설 글로 보강합니다.
                </p>

                <div className={styles.adminLayout}>
                    <form className={styles.adminForm} onSubmit={handleSubmit}>
                        <div className={styles.templatePanel}>
                            <div>
                                <strong>기존 글 리라이트</strong>
                                <p>현재 글을 검색 제목, 요약, 근거, 내부 링크가 있는 해설 구조로 재정리합니다.</p>
                            </div>
                            <div className={styles.templateButtons}>
                                <button
                                    type="button"
                                    className={styles.aiDraftBtn}
                                    onClick={rewriteWithAi}
                                    disabled={isRewriting}
                                >
                                    {isRewriting ? "AI 리라이트 중..." : "AI 리라이트"}
                                </button>
                                <button type="button" className={styles.templateBtn} onClick={suggestSearchTitle}>
                                    검색형 제목 제안
                                </button>
                                <button type="button" className={styles.templateBtn} onClick={addSummaryBlock}>
                                    요약 추가
                                </button>
                                <button type="button" className={styles.templateBtn} onClick={wrapForRewrite}>
                                    리라이트 구조 추가
                                </button>
                                <button type="button" className={styles.templateBtn} onClick={addInternalLinkBlock}>
                                    내부 링크 추가
                                </button>
                            </div>
                        </div>
                        {rewriteMessage && (
                            <div className={styles.draftMessage}>
                                {rewriteMessage}
                            </div>
                        )}

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
                            <div className={styles.editorHeader}>
                                <label className={styles.label}>기사 본문</label>
                                <span className={styles.qualityBadge} data-status={qualityStatus}>
                                    {qualityStatus} · {charCount.toLocaleString()}자
                                </span>
                            </div>
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
                        <div className={styles.checklistBox}>
                            <h3>보강 체크</h3>
                            <ul>
                                <li data-ok={charCount >= 1200}>본문 1,200자 이상</li>
                                <li data-ok={headingCount >= 3}>소제목 3개 이상</li>
                                <li data-ok={hasSource}>출처/근거 링크 포함</li>
                                <li data-ok={hasSummary}>요약 섹션 포함</li>
                                <li data-ok={internalLinkCount >= 1}>내부 링크 포함</li>
                                <li data-ok={titleSearchReady}>검색형 제목</li>
                                <li data-ok={plainText.length > 0 && plainText.slice(-120).includes("다")}>결론 문단 작성</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
}
