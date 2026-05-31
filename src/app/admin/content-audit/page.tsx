"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import styles from "../page.module.css";

interface AuditItem {
    id: string;
    slug?: string;
    title: string;
    category: string;
    createdAt: string;
    daysOld: number | null;
    charCount: number;
    headingCount: number;
    linkCount: number;
    hasSource: boolean;
    searchFriendlyTitle: boolean;
    viewCount: number;
    likeCount: number;
    score: number;
    status: string;
    issues: string[];
    recommendedAction: string;
    preview: string;
}

interface AuditResponse {
    total: number;
    readyCount: number;
    needsWorkCount: number;
    categoryCounts: Record<string, number>;
    latestPublishedAt: string | null;
    latestDaysOld: number | null;
    analysis: AuditItem[];
}

export default function ContentAuditPage() {
    const [data, setData] = useState<AuditResponse | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        fetch("/api/check-content")
            .then((res) => {
                if (!res.ok) throw new Error("콘텐츠 진단을 불러오지 못했습니다.");
                return res.json();
            })
            .then(setData)
            .catch((err) => setError(err.message))
            .finally(() => setIsLoading(false));
    }, []);

    const nextActions = useMemo(() => {
        if (!data) return [];
        const actions: string[] = [];
        if (data.total < 30) actions.push(`애드센스 재신청 전 최소 ${30 - data.total}개 글 추가`);
        if ((data.categoryCounts["경제"] || 0) < 5) actions.push("경제 카테고리 5개까지 보강");
        if ((data.categoryCounts["역사"] || 0) < 5) actions.push("역사 카테고리 5개까지 보강");
        if ((data.latestDaysOld ?? 999) > 7) actions.push("최근 7일 내 새 글 발행 필요");
        if (data.needsWorkCount > 0) actions.push(`보강 필요 글 ${data.needsWorkCount}개 리라이트`);
        return actions;
    }, [data]);

    return (
        <div className={styles.dashMain}>
            <Header />
            <div className={styles.dashContainer}>
                <div className={styles.dashHeader}>
                    <div>
                        <h1 className={styles.dashTitle}>콘텐츠 감사</h1>
                        <p className={styles.dashDesc}>
                            애드센스, 검색 유입, 인스타 유입 전환을 기준으로 기존 글의 보강 우선순위를 봅니다.
                        </p>
                    </div>
                    <div className={styles.dashActions}>
                        <Link href="/admin/write" className={styles.writeBtn}>
                            + 새 글 작성
                        </Link>
                        <Link href="/admin" className={styles.logoutBtn}>
                            대시보드
                        </Link>
                    </div>
                </div>

                {isLoading && <div className={styles.loading}>진단 중...</div>}
                {error && <div className={styles.empty}>{error}</div>}

                {data && (
                    <>
                        {data.analysis.length > 0 && (
                            <section className={styles.opsPanel}>
                                <div className={styles.opsLead}>
                                    <span>우선 보강 글</span>
                                    <h2>{data.analysis[0].title}</h2>
                                    <p>
                                        현재 가장 먼저 손봐야 할 글입니다. 수정 화면에서 AI 리라이트를 실행하고,
                                        출처와 사실관계를 확인한 뒤 저장하세요.
                                    </p>
                                </div>
                                <div className={styles.opsChecklist}>
                                    <div data-state={data.analysis[0].charCount >= 1200 ? "done" : "todo"}>
                                        <strong>본문 길이</strong>
                                        <span>{data.analysis[0].charCount.toLocaleString()}자</span>
                                    </div>
                                    <div data-state={data.analysis[0].headingCount >= 3 ? "done" : "todo"}>
                                        <strong>문단 구조</strong>
                                        <span>소제목 {data.analysis[0].headingCount}개</span>
                                    </div>
                                    <Link href={`/admin/edit/${data.analysis[0].id}`} className={styles.writeBtn}>
                                        AI 리라이트로 보강
                                    </Link>
                                </div>
                            </section>
                        )}

                        <div className={styles.dashStats}>
                            <div className={styles.statCard}>
                                <span className={styles.statNumber}>{data.total}</span>
                                <span className={styles.statLabel}>전체 글</span>
                            </div>
                            <div className={styles.statCard}>
                                <span className={styles.statNumber}>{data.readyCount}</span>
                                <span className={styles.statLabel}>품질 양호</span>
                            </div>
                            <div className={styles.statCard}>
                                <span className={styles.statNumber}>{data.needsWorkCount}</span>
                                <span className={styles.statLabel}>보강 필요</span>
                            </div>
                            <div className={styles.statCard}>
                                <span className={styles.statNumber}>{data.latestDaysOld ?? "-"}</span>
                                <span className={styles.statLabel}>최근 발행 후 경과일</span>
                            </div>
                        </div>

                        {nextActions.length > 0 && (
                            <section className={styles.auditPlan}>
                                <h2>다음 행동</h2>
                                <ul>
                                    {nextActions.map((action) => (
                                        <li key={action}>{action}</li>
                                    ))}
                                </ul>
                            </section>
                        )}

                        <div className={styles.tableWrap}>
                            <table className={styles.table}>
                                <thead>
                                    <tr>
                                        <th>글</th>
                                        <th>점수</th>
                                        <th>본문</th>
                                        <th>구조</th>
                                        <th>우선 조치</th>
                                        <th>관리</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {data.analysis.map((item) => (
                                        <tr key={item.id}>
                                            <td className={styles.titleCell}>
                                                <Link href={`/article/${item.slug || item.id}`}>{item.title}</Link>
                                                <p className={styles.auditPreview}>{item.preview}</p>
                                            </td>
                                            <td>
                                                <span className={styles.auditScore} data-score={item.score >= 85 ? "good" : item.score >= 65 ? "ok" : "bad"}>
                                                    {item.score}
                                                </span>
                                            </td>
                                            <td>{item.charCount.toLocaleString()}자</td>
                                            <td>
                                                <span className={styles.auditMeta}>
                                                    소제목 {item.headingCount} · 링크 {item.linkCount}
                                                </span>
                                            </td>
                                            <td>
                                                <strong className={styles.auditAction}>{item.recommendedAction}</strong>
                                                {item.issues.length > 1 && (
                                                    <span className={styles.auditIssueMore}> 외 {item.issues.length - 1}개</span>
                                                )}
                                            </td>
                                            <td className={styles.actionCell}>
                                                <Link href={`/admin/edit/${item.id}`} className={styles.editBtn}>
                                                    AI 리라이트
                                                </Link>
                                                <Link href={`/article/${item.slug || item.id}`} className={styles.editBtn}>
                                                    보기
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </>
                )}
            </div>
            <Footer />
        </div>
    );
}
