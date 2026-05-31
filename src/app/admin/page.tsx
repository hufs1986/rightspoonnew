"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { createClient } from "@/utils/supabase/client";
import styles from "./page.module.css";

interface Article {
    id: string;
    title: string;
    category: string;
    created_at: string;
    view_count: number;
}

const quickDrafts = [
    {
        label: "뉴스 해설",
        category: "정치",
        topic: "오늘 가장 크게 논쟁이 된 정치 이슈",
        claim: "이 사안은 겉으로 보이는 명분보다 실제 권한과 책임이 어디로 이동하는지 봐야 한다.",
        frame: "주류 프레임은 이 사안을 상식과 정의의 문제로 단순화한다.",
    },
    {
        label: "인스타 확장판",
        category: "정치",
        topic: "인스타에서 반응이 온 짧은 문장",
        claim: "짧은 반응으로 끝낼 문제가 아니라, 반복되는 정치 프레임의 사례로 정리할 필요가 있다.",
        frame: "상대 프레임은 반대 의견을 비상식 또는 혐오로 몰아간다.",
    },
    {
        label: "검색형 입문서",
        category: "경제",
        topic: "시장경제가 불편해도 필요한 이유",
        claim: "시장경제는 완벽해서가 아니라 실패 비용과 책임을 분산하기 때문에 필요하다.",
        frame: "상대 프레임은 시장을 탐욕으로, 국가 개입을 정의로 설명한다.",
    },
];

function makeWriteHref(draft: typeof quickDrafts[number]) {
    const params = new URLSearchParams({
        category: draft.category,
        topic: draft.topic,
        claim: draft.claim,
        frame: draft.frame,
    });
    return `/admin/write?${params.toString()}`;
}

export default function AdminDashboardPage() {
    const [articles, setArticles] = useState<Article[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const supabase = useMemo(() => createClient(), []);

    const fetchArticles = useCallback(async () => {
        const { data, error } = await supabase
            .from("articles")
            .select("id, title, category, created_at, view_count")
            .order("created_at", { ascending: false });

        if (!error && data) {
            setArticles(data);
        }
        setIsLoading(false);
    }, [supabase]);

    useEffect(() => {
        fetchArticles();
    }, [fetchArticles]);

    const latestArticle = articles[0] || null;
    const latestDaysOld = latestArticle
        ? Math.floor((Date.now() - new Date(latestArticle.created_at).getTime()) / (1000 * 60 * 60 * 24))
        : null;
    const needsPublish = latestDaysOld === null || latestDaysOld >= 2;
    const totalViews = articles.reduce((sum, article) => sum + (article.view_count || 0), 0);
    const weakCategories = ["경제", "역사", "정치"]
        .map((category) => ({
            category,
            count: articles.filter((article) => article.category === category).length,
        }))
        .sort((a, b) => a.count - b.count);

    const handleDelete = async (id: string, title: string) => {
        if (!confirm(`정말 "${title}" 기사를 삭제하시겠습니까?`)) return;

        const { error } = await supabase.from("articles").delete().eq("id", id);
        if (error) {
            alert("삭제에 실패했습니다: " + error.message);
        } else {
            setArticles((prev) => prev.filter((a) => a.id !== id));
        }
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        window.location.href = "/";
    };

    return (
        <div className={styles.dashMain}>
            <Header />
            <div className={styles.dashContainer}>
                <div className={styles.dashHeader}>
                    <div>
                        <h1 className={styles.dashTitle}>오른스푼 운영판</h1>
                        <p className={styles.dashDesc}>
                            인스타 반응과 뉴스 소재를 오른스푼 해설 자산으로 바꾸는 작업 공간입니다.
                        </p>
                    </div>
                    <div className={styles.dashActions}>
                        <Link href="/admin/editorial-calendar" className={styles.logoutBtn}>
                            편집 캘린더
                        </Link>
                        <Link href="/admin/content-audit" className={styles.logoutBtn}>
                            콘텐츠 감사
                        </Link>
                        <Link href="/admin/site-health" className={styles.logoutBtn}>
                            운영 점검
                        </Link>
                        <Link href="/admin/write" className={styles.writeBtn}>
                            + 새 글 작성
                        </Link>
                        <button onClick={handleLogout} className={styles.logoutBtn}>
                            로그아웃
                        </button>
                    </div>
                </div>

                <section className={styles.opsPanel}>
                    <div className={styles.opsLead}>
                        <span>오늘의 핵심 작업</span>
                        <h2>{needsPublish ? "오늘은 새 해설 1개를 발행해야 합니다." : "최근 발행 흐름은 유지되고 있습니다."}</h2>
                        <p>
                            소재를 고르고, AI 초안으로 구조를 잡고, 드럼통119의 관점과 결론을 보강해 발행하세요.
                            자동발행보다 중요한 것은 매일 쌓이는 신뢰 가능한 해설입니다.
                        </p>
                    </div>
                    <div className={styles.opsChecklist}>
                        <div data-state={articles.length >= 30 ? "done" : "todo"}>
                            <strong>글 30개 기반</strong>
                            <span>{articles.length}/30개, 애드센스 재도전 전 기본 체력</span>
                        </div>
                        <div data-state={!needsPublish ? "done" : "todo"}>
                            <strong>발행 주기</strong>
                            <span>{latestDaysOld === null ? "아직 글 없음" : `최근 발행 ${latestDaysOld}일 전`}</span>
                        </div>
                        <div data-state={weakCategories[0]?.count >= 5 ? "done" : "todo"}>
                            <strong>카테고리 균형</strong>
                            <span>{weakCategories[0]?.category} 보강 우선, 현재 {weakCategories[0]?.count ?? 0}개</span>
                        </div>
                    </div>
                </section>

                <section className={styles.quickDesk}>
                    <div>
                        <h2>바로 쓰기</h2>
                        <p>자주 쓰는 3가지 포맷을 AI 소재 작업대에 바로 넣습니다.</p>
                    </div>
                    <div className={styles.quickDraftGrid}>
                        {quickDrafts.map((draft) => (
                            <Link key={draft.label} href={makeWriteHref(draft)} className={styles.quickDraftCard}>
                                <span>{draft.category}</span>
                                <strong>{draft.label}</strong>
                                <p>{draft.topic}</p>
                            </Link>
                        ))}
                    </div>
                </section>

                <div className={styles.dashStats}>
                    <div className={styles.statCard}>
                        <span className={styles.statNumber}>{articles.length}</span>
                        <span className={styles.statLabel}>전체 기사</span>
                    </div>
                    <div className={styles.statCard}>
                        <span className={styles.statNumber}>{totalViews.toLocaleString()}</span>
                        <span className={styles.statLabel}>누적 조회</span>
                    </div>
                    <div className={styles.statCard}>
                        <span className={styles.statNumber}>
                            {articles.filter((a) => a.category === "정치").length}
                        </span>
                        <span className={styles.statLabel}>정치</span>
                    </div>
                    <div className={styles.statCard}>
                        <span className={styles.statNumber}>
                            {weakCategories[0]?.category || "-"}
                        </span>
                        <span className={styles.statLabel}>우선 보강</span>
                    </div>
                </div>

                {isLoading ? (
                    <div className={styles.loading}>불러오는 중...</div>
                ) : articles.length === 0 ? (
                    <div className={styles.empty}>
                        <p>아직 등록된 기사가 없습니다.</p>
                        <Link href="/admin/write" className={styles.writeBtn}>
                            첫 번째 기사 작성하기
                        </Link>
                    </div>
                ) : (
                    <div className={styles.tableWrap}>
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th>제목</th>
                                    <th>카테고리</th>
                                    <th>작성일</th>
                                    <th>조회</th>
                                    <th>관리</th>
                                </tr>
                            </thead>
                            <tbody>
                                {articles.map((article) => (
                                    <tr key={article.id}>
                                        <td className={styles.titleCell}>
                                            <Link href={`/article/${article.id}`}>
                                                {article.title}
                                            </Link>
                                        </td>
                                        <td>
                                            <span
                                                className={`${styles.catBadge} ${article.category === "정치"
                                                    ? styles.catPolitics
                                                    : article.category === "경제"
                                                        ? styles.catEconomy
                                                        : styles.catHistory
                                                    }`}
                                            >
                                                {article.category}
                                            </span>
                                        </td>
                                        <td className={styles.dateCell}>
                                            {new Date(article.created_at).toLocaleDateString()}
                                        </td>
                                        <td>{article.view_count}</td>
                                        <td className={styles.actionCell}>
                                            <Link
                                                href={`/admin/edit/${article.id}`}
                                                className={styles.editBtn}
                                            >
                                                수정
                                            </Link>
                                            <button
                                                onClick={() =>
                                                    handleDelete(article.id, article.title)
                                                }
                                                className={styles.deleteBtn}
                                            >
                                                삭제
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
            <Footer />
        </div>
    );
}
