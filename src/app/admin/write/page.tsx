"use client";

import { useEffect, useState } from "react";
import styles from "./page.module.css";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import RichEditor from "../../components/RichEditor";
import Image from "next/image";
import { createClient } from "@/utils/supabase/client";
import { generateSlug } from "@/utils/slug";

const articleTemplates = [
    {
        id: "news-brief",
        label: "뉴스 해설",
        category: "정치",
        title: "검색형 제목: 이슈의 핵심 키워드와 왜 중요한가",
        content: `
<h2>한 줄 요약</h2>
<p>오늘의 이슈를 한 문장으로 정리합니다. 독자가 이 글을 왜 읽어야 하는지 먼저 말합니다.</p>
<h2>무슨 일이 있었나</h2>
<p>기사 원문을 베끼지 말고, 사건의 사실관계를 3~5문장으로 요약합니다.</p>
<p><strong>출처:</strong> 원문 기사 또는 공식 자료 링크를 여기에 남깁니다.</p>
<h2>쟁점은 무엇인가</h2>
<ul>
<li>겉으로 보이는 주장과 실제 이해관계를 분리합니다.</li>
<li>언론이 강조한 프레임과 빠뜨린 부분을 나눕니다.</li>
<li>독자가 판단해야 할 질문을 제시합니다.</li>
</ul>
<h2>오른스푼의 해석</h2>
<p>드럼통119의 관점으로 이 사안을 해석합니다. 감정만 쓰지 말고, 왜 그렇게 보는지 논리를 붙입니다.</p>
<h2>결론</h2>
<p>이 이슈가 앞으로 어디로 이어질지, 독자가 무엇을 봐야 하는지 정리합니다.</p>
`.trim(),
    },
    {
        id: "instagram-expand",
        label: "인스타 확장판",
        category: "정치",
        title: "인스타에서 반응 온 주제: 짧은 문장을 긴 해설로 풀기",
        content: `
<h2>인스타에서 던진 문제</h2>
<p>인스타 피드나 릴스에서 던진 핵심 문장을 먼저 적습니다.</p>
<blockquote><p>여기에 인스타에서 반응이 있었던 문장 또는 요지를 넣습니다.</p></blockquote>
<h2>왜 이 말이 중요한가</h2>
<p>짧은 문장만으로는 오해될 수 있는 배경과 맥락을 설명합니다.</p>
<h2>반대편은 어떻게 말하는가</h2>
<p>상대 프레임을 먼저 공정하게 정리합니다. 그다음 어디가 약한지 짚습니다.</p>
<h2>내가 보는 핵심</h2>
<p>운영자의 관점을 분명하게 씁니다. 독자가 공유하고 싶은 문장 1~2개를 의식해서 작성합니다.</p>
<h2>공유용 결론</h2>
<p>마지막 3문장은 인스타 캡션으로 다시 가져갈 수 있게 짧고 강하게 정리합니다.</p>
`.trim(),
    },
    {
        id: "evergreen",
        label: "입문서",
        category: "역사",
        title: "검색형 입문서: 사람들이 계속 검색할 주제",
        content: `
<h2>이 글의 결론</h2>
<p>처음 읽는 사람도 바로 이해할 수 있게 결론을 먼저 씁니다.</p>
<h2>기본 개념</h2>
<p>용어와 배경을 쉽게 설명합니다. 검색 유입을 노리는 글이므로 처음 보는 독자를 기준으로 씁니다.</p>
<h2>왜 반복해서 문제가 되는가</h2>
<p>정치·사회·역사적 맥락을 3단락 이상으로 정리합니다.</p>
<h2>대표 사례</h2>
<ul>
<li>사례 1: 사건과 의미</li>
<li>사례 2: 사건과 의미</li>
<li>사례 3: 사건과 의미</li>
</ul>
<h2>오른스푼의 관점</h2>
<p>단순 설명에서 끝내지 말고, 운영자의 판단과 관점을 명확히 남깁니다.</p>
<h2>함께 읽을 주제</h2>
<p>사이트 안의 관련 글 제목을 언급하고 내부 링크를 걸어줍니다.</p>
`.trim(),
    },
];

function stripHtml(html: string) {
    return html.replace(/<[^>]*>/g, " ").replace(/&nbsp;/g, " ").replace(/\s+/g, " ").trim();
}

export default function AdminWritePage() {
    const [title, setTitle] = useState("");
    const [category, setCategory] = useState("정치");
    const [youtubeUrl, setYoutubeUrl] = useState("");
    const [content, setContent] = useState("");
    const [sourceUrl, setSourceUrl] = useState("");
    const [sourceTopic, setSourceTopic] = useState("");
    const [coreClaim, setCoreClaim] = useState("");
    const [opposingFrame, setOpposingFrame] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isGeneratingDraft, setIsGeneratingDraft] = useState(false);
    const [draftMessage, setDraftMessage] = useState("");

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const topic = params.get("topic");
        const claim = params.get("claim");
        const frame = params.get("frame");
        const source = params.get("source");
        const nextCategory = params.get("category");

        if (topic) setSourceTopic(topic);
        if (claim) setCoreClaim(claim);
        if (frame) setOpposingFrame(frame);
        if (source) setSourceUrl(source);
        if (nextCategory) setCategory(nextCategory);
    }, []);

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
    const plainText = stripHtml(content);
    const charCount = plainText.length;
    const headingCount = (content.match(/<h2|<h3/g) || []).length;
    const hasSource = /출처|source|http/i.test(content);
    const qualityStatus =
        charCount >= 1200 && headingCount >= 3 && hasSource
            ? "발행 적합"
            : charCount >= 800
                ? "보강 권장"
                : "초안 단계";

    const applyTemplate = (template: typeof articleTemplates[number]) => {
        const hasDraft = title.trim() || content.trim();
        if (hasDraft && !confirm("현재 작성 중인 제목/본문을 템플릿으로 교체할까요?")) return;
        setTitle(template.title);
        setCategory(template.category);
        setContent(template.content);
    };

    const buildDraftFromSource = () => {
        const topic = sourceTopic.trim();
        const claim = coreClaim.trim();
        const frame = opposingFrame.trim();
        const url = sourceUrl.trim();

        if (!topic || !claim) {
            alert("소재 제목/이슈와 오른스푼의 핵심 주장을 먼저 입력해 주세요.");
            return;
        }

        const hasDraft = title.trim() || content.trim();
        if (hasDraft && !confirm("현재 작성 중인 제목/본문을 소재 기반 초안으로 교체할까요?")) return;

        const nextTitle = `${topic}: 왜 지금 이 이슈를 봐야 하나`;
        const nextContent = `
<h2>한 줄 요약</h2>
<p>${claim}</p>
<h2>무슨 일이 있었나</h2>
<p>‘${topic}’를 둘러싼 논란이 다시 커지고 있습니다. 이 글은 원문을 반복하는 대신, 사건의 핵심 쟁점과 독자가 놓치기 쉬운 프레임을 정리합니다.</p>
${url ? `<p><strong>출처:</strong> <a href="${url}" target="_blank" rel="noopener noreferrer nofollow">${url}</a></p>` : `<p><strong>출처:</strong> 원문 기사 또는 공식 자료 링크를 추가하세요.</p>`}
<h2>상대 프레임</h2>
<p>${frame || "상대 진영 또는 주류 언론이 이 사안을 어떻게 설명하는지 먼저 정리하세요."}</p>
<h2>오른스푼의 해석</h2>
<p>${claim}</p>
<p>핵심은 겉으로 보이는 명분과 실제로 작동하는 이해관계를 분리해서 보는 것입니다. 정치 이슈는 늘 좋은 말로 포장되지만, 그 결과가 누구의 권한을 키우고 누구의 책임을 흐리게 만드는지 봐야 합니다.</p>
<h2>독자가 봐야 할 질문</h2>
<ul>
<li>이 사안에서 가장 이익을 보는 사람은 누구인가?</li>
<li>언론이 강조하는 명분과 실제 결과는 일치하는가?</li>
<li>반대 의견을 악마화하지 않고도 설명 가능한 근거가 있는가?</li>
</ul>
<h2>결론</h2>
<p>이 이슈는 단순한 하루짜리 뉴스가 아닙니다. 같은 프레임이 반복될 때 사회가 어떤 방향으로 밀려가는지 확인하는 사례입니다. 오른스푼은 앞으로도 짧은 분노보다 오래 남는 해설로 이 흐름을 기록하겠습니다.</p>
`.trim();

        setTitle(nextTitle);
        setCategory(category || "정치");
        setContent(nextContent);
        setDraftMessage("로컬 초안을 만들었습니다. 발행 전 사실관계와 출처를 반드시 확인하세요.");
    };

    const buildAiDraftFromSource = async () => {
        const topic = sourceTopic.trim();
        const claim = coreClaim.trim();

        if (!topic || !claim) {
            alert("소재 제목/이슈와 오른스푼의 핵심 주장을 먼저 입력해 주세요.");
            return;
        }

        const hasDraft = title.trim() || content.trim();
        if (hasDraft && !confirm("현재 작성 중인 제목/본문을 AI 초안으로 교체할까요?")) return;

        setIsGeneratingDraft(true);
        setDraftMessage("AI가 이슈를 해설 구조로 정리하는 중입니다.");

        try {
            const res = await fetch("/api/ai/draft", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    topic,
                    sourceUrl: sourceUrl.trim(),
                    coreClaim: claim,
                    opposingFrame: opposingFrame.trim(),
                    category,
                }),
            });
            const data = await res.json();

            if (!res.ok) {
                throw new Error(data?.error || "AI 초안 생성에 실패했습니다.");
            }

            if (data?.draft?.title) setTitle(data.draft.title);
            if (data?.draft?.category) setCategory(data.draft.category);
            if (data?.draft?.content) setContent(data.draft.content);

            setDraftMessage(
                data?.mode === "ai"
                    ? "AI 초안을 만들었습니다. 문체, 사실관계, 출처를 확인한 뒤 발행하세요."
                    : data?.message || "로컬 초안을 만들었습니다. OPENAI_API_KEY 설정 후 AI 초안이 활성화됩니다."
            );
        } catch (err) {
            console.error("AI draft generation failed:", err);
            buildDraftFromSource();
            setDraftMessage("AI 초안 생성에 실패해 로컬 초안으로 대체했습니다.");
        } finally {
            setIsGeneratingDraft(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        // Supabase 연동 코드
        const supabase = createClient();
        const slug = generateSlug(title);

        const { data, error } = await supabase
            .from('articles')
            .insert([
                {
                    title,
                    slug,
                    category,
                    youtube_id: videoId || "",
                    content,
                    author: '드럼통119'
                }
            ])
            .select("id, slug")
            .single();

        setIsSubmitting(false);

        if (error) {
            alert("등록에 실패했습니다: " + error.message);
        } else {
            const articlePath = `/article/${data?.slug || data?.id || slug}`;
            // 푸시 알림 전송 (실패해도 글 등록은 성공)
            try {
                await fetch("/api/push/send", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        title: "🔔 오른스푼 새 글",
                        body: title,
                        url: articlePath,
                    }),
                });
            } catch (pushErr) {
                console.error("푸시 알림 전송 실패:", pushErr);
            }
            alert("성공적으로 등록되었습니다. 공개 글에서 인스타 유입 키트를 바로 사용하세요.");
            window.location.href = articlePath;
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
                    뉴스 복제가 아니라 해설과 관점을 축적하는 글을 발행합니다. 템플릿으로 시작하면 방치 확률이 줄어듭니다.
                </p>

                <div className={styles.adminLayout}>
                    {/* Write Form */}
                    <form className={styles.adminForm} onSubmit={handleSubmit}>
                        <div className={styles.templatePanel}>
                            <div>
                                <strong>작성 템플릿</strong>
                                <p>뉴스 해설, 인스타 확장판, 검색형 입문서 중 하나로 빠르게 시작하세요.</p>
                            </div>
                            <div className={styles.templateButtons}>
                                {articleTemplates.map((template) => (
                                    <button
                                        type="button"
                                        key={template.id}
                                        className={styles.templateBtn}
                                        onClick={() => applyTemplate(template)}
                                    >
                                        {template.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className={styles.sourceDesk}>
                            <div className={styles.sourceDeskHeader}>
                                <div>
                                    <strong>AI 소재 작업대</strong>
                                    <p>뉴스 링크나 인스타 반응 소재를 AI 초안으로 구조화합니다. 자동발행이 아니라 운영자 편집 발행 전제입니다.</p>
                                </div>
                                <div className={styles.sourceActions}>
                                    <button
                                        type="button"
                                        className={styles.aiDraftBtn}
                                        onClick={buildAiDraftFromSource}
                                        disabled={isGeneratingDraft}
                                    >
                                        {isGeneratingDraft ? "AI 작성 중..." : "AI 초안 만들기"}
                                    </button>
                                    <button type="button" className={styles.templateBtn} onClick={buildDraftFromSource}>
                                        로컬 초안
                                    </button>
                                </div>
                            </div>
                            {draftMessage && (
                                <div className={styles.draftMessage}>
                                    {draftMessage}
                                </div>
                            )}
                            <div className={styles.sourceGrid}>
                                <div className={styles.formGroup}>
                                    <label className={styles.label}>소재 제목 / 이슈</label>
                                    <input
                                        type="text"
                                        className={styles.input}
                                        value={sourceTopic}
                                        onChange={(e) => setSourceTopic(e.target.value)}
                                        placeholder="예: 대출 규제 논란, 586세대 특권 논쟁"
                                    />
                                </div>
                                <div className={styles.formGroup}>
                                    <label className={styles.label}>출처 URL</label>
                                    <input
                                        type="url"
                                        className={styles.input}
                                        value={sourceUrl}
                                        onChange={(e) => setSourceUrl(e.target.value)}
                                        placeholder="뉴스 원문 또는 공식 자료 링크"
                                    />
                                </div>
                            </div>
                            <div className={styles.formGroup}>
                                <label className={styles.label}>오른스푼의 핵심 주장</label>
                                <input
                                    type="text"
                                    className={styles.input}
                                    value={coreClaim}
                                    onChange={(e) => setCoreClaim(e.target.value)}
                                    placeholder="예: 이 정책은 약자 보호가 아니라 시장 진입 사다리를 줄이는 방식이다"
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label className={styles.label}>상대/주류 프레임</label>
                                <input
                                    type="text"
                                    className={styles.input}
                                    value={opposingFrame}
                                    onChange={(e) => setOpposingFrame(e.target.value)}
                                    placeholder="예: 정부는 서민 보호와 시장 안정이라는 명분을 내세운다"
                                />
                            </div>
                        </div>

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
                                <label className={styles.label}>유튜브 URL (선택)</label>
                                <input
                                    type="url"
                                    className={styles.input}
                                    value={youtubeUrl}
                                    onChange={(e) => setYoutubeUrl(e.target.value)}
                                    placeholder="https://www.youtube.com/watch?v=... (없으면 비워두기)"
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
                                    <div dangerouslySetInnerHTML={{ __html: content }} />
                                ) : (
                                    <p className={styles.previewEmptyText}>본문 내용이 여기에 표시됩니다.</p>
                                )}
                            </div>
                        </div>
                        <div className={styles.checklistBox}>
                            <h3>발행 전 체크</h3>
                            <ul>
                                <li data-ok={charCount >= 1200}>본문 1,200자 이상</li>
                                <li data-ok={headingCount >= 3}>소제목 3개 이상</li>
                                <li data-ok={hasSource}>출처/근거 링크 포함</li>
                                <li data-ok={title.length >= 18}>검색형 제목 18자 이상</li>
                                <li data-ok={plainText.length > 0 && plainText.slice(-80).includes("다")}>결론 문단 작성</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
}
