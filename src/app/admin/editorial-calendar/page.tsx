"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import styles from "../page.module.css";

interface AuditResponse {
    total: number;
    categoryCounts: Record<string, number>;
    latestDaysOld: number | null;
}

const topicIdeas = [
    {
        category: "경제",
        format: "입문서",
        topic: "대출 규제가 집값을 잡지 못하는 이유",
        claim: "대출 규제는 서민 보호처럼 보이지만 실제로는 현금 부자의 진입 장벽을 낮추고 실수요자의 사다리를 줄일 수 있다.",
        frame: "주류 프레임은 대출 규제를 투기 억제와 시장 안정 장치로 설명한다.",
    },
    {
        category: "정치",
        format: "뉴스 해설",
        topic: "민주주의 다수결의 한계",
        claim: "다수결은 절차일 뿐 진실의 보증서가 아니며, 책임 없는 다수가 권력을 선택할 때 사회 전체가 비용을 치른다.",
        frame: "상대 프레임은 다수의 선택이 곧 민주적 정당성이라고 주장한다.",
    },
    {
        category: "역사",
        format: "입문서",
        topic: "586세대 권력화 과정 정리",
        claim: "운동권 세대의 문제는 과거 투쟁 경험이 아니라, 그 경험을 도덕적 면허로 바꿔 권력을 독점한 방식에 있다.",
        frame: "주류 프레임은 이들을 민주화의 주역이자 역사적 공로 세대로 설명한다.",
    },
    {
        category: "정치",
        format: "인스타 확장판",
        topic: "가짜 약자 팔이 정치가 반복되는 이유",
        claim: "약자를 말하는 정치가 실제 약자의 자립보다 정치 세력의 도덕적 우월감과 예산 권한을 키우는 경우가 많다.",
        frame: "상대 프레임은 복지 확대와 약자 보호를 반대하면 비정한 사람으로 몰아간다.",
    },
    {
        category: "경제",
        format: "뉴스 해설",
        topic: "최저임금 인상이 항상 선인가",
        claim: "임금의 선의가 일자리의 현실을 무시하면 가장 약한 고용부터 사라질 수 있다.",
        frame: "주류 프레임은 최저임금 인상을 노동 존중과 소득 개선의 상징으로 본다.",
    },
    {
        category: "역사",
        format: "입문서",
        topic: "사회주의가 반복해서 실패하는 이유",
        claim: "사회주의의 실패는 운용자의 도덕성 문제가 아니라 가격, 소유, 책임을 제거하는 구조의 문제다.",
        frame: "상대 프레임은 진짜 사회주의가 아직 제대로 실현되지 않았다고 말한다.",
    },
    {
        category: "정치",
        format: "뉴스 해설",
        topic: "언론 프레임을 읽는 법",
        claim: "뉴스는 사실의 나열이 아니라 무엇을 앞에 놓고 무엇을 지우는지에 따라 여론의 방향을 바꾼다.",
        frame: "주류 프레임은 언론 보도를 중립적 사실 전달로 포장한다.",
    },
    {
        category: "경제",
        format: "입문서",
        topic: "시장경제가 불편해도 필요한 이유",
        claim: "시장경제는 완벽해서가 아니라 실패 비용을 분산하고 책임을 남기기 때문에 필요하다.",
        frame: "상대 프레임은 시장을 탐욕의 장치로 보고 국가 개입을 정의로 설명한다.",
    },
    {
        category: "역사",
        format: "인스타 확장판",
        topic: "조선 사림 정치와 현대 진영정치의 닮은 점",
        claim: "도덕을 독점한 집단이 권력을 잡으면 반대파는 토론 상대가 아니라 제거 대상이 된다.",
        frame: "주류 프레임은 도덕적 명분을 가진 세력의 권력 행사를 개혁으로 포장한다.",
    },
];

function makeWriteHref(idea: typeof topicIdeas[number]) {
    const params = new URLSearchParams({
        category: idea.category,
        topic: idea.topic,
        claim: idea.claim,
        frame: idea.frame,
    });
    return `/admin/write?${params.toString()}`;
}

export default function EditorialCalendarPage() {
    const [audit, setAudit] = useState<AuditResponse | null>(null);

    useEffect(() => {
        fetch("/api/check-content")
            .then((res) => res.json())
            .then(setAudit)
            .catch(() => setAudit(null));
    }, []);

    const priority = useMemo(() => {
        if (!audit) return "경제";
        const counts = audit.categoryCounts || {};
        const targets = [
            ["경제", counts["경제"] || 0],
            ["역사", counts["역사"] || 0],
            ["정치", counts["정치"] || 0],
        ] as const;
        return [...targets].sort((a, b) => a[1] - b[1])[0][0];
    }, [audit]);

    const sortedIdeas = useMemo(() => {
        return [...topicIdeas].sort((a, b) => {
            if (a.category === priority && b.category !== priority) return -1;
            if (a.category !== priority && b.category === priority) return 1;
            return 0;
        });
    }, [priority]);

    return (
        <div className={styles.dashMain}>
            <Header />
            <div className={styles.dashContainer}>
                <div className={styles.dashHeader}>
                    <div>
                        <h1 className={styles.dashTitle}>편집 캘린더</h1>
                        <p className={styles.dashDesc}>
                            30개 글 확보를 위한 다음 발행 소재입니다. 부족한 카테고리부터 채우도록 정렬합니다.
                        </p>
                    </div>
                    <div className={styles.dashActions}>
                        <Link href="/admin/content-audit" className={styles.logoutBtn}>콘텐츠 감사</Link>
                        <Link href="/admin/write" className={styles.writeBtn}>+ 빈 글 작성</Link>
                    </div>
                </div>

                <div className={styles.dashStats}>
                    <div className={styles.statCard}>
                        <span className={styles.statNumber}>{audit?.total ?? "-"}</span>
                        <span className={styles.statLabel}>현재 글</span>
                    </div>
                    <div className={styles.statCard}>
                        <span className={styles.statNumber}>{audit ? Math.max(30 - audit.total, 0) : "-"}</span>
                        <span className={styles.statLabel}>30개까지 남은 글</span>
                    </div>
                    <div className={styles.statCard}>
                        <span className={styles.statNumber}>{priority}</span>
                        <span className={styles.statLabel}>우선 보강 카테고리</span>
                    </div>
                    <div className={styles.statCard}>
                        <span className={styles.statNumber}>{audit?.latestDaysOld ?? "-"}</span>
                        <span className={styles.statLabel}>최근 발행 후 경과일</span>
                    </div>
                </div>

                <section className={styles.auditPlan}>
                    <h2>이번 주 운영 원칙</h2>
                    <ul>
                        <li>뉴스 원문 복사 금지: 출처 링크 + 내 해석 + 결론으로 작성</li>
                        <li>인스타 반응 소재는 오른스푼에서 1,200자 이상으로 확장</li>
                        <li>경제·역사 글을 최소 5개까지 먼저 보강</li>
                    </ul>
                </section>

                <div className={styles.ideaGrid}>
                    {sortedIdeas.map((idea) => (
                        <article key={idea.topic} className={styles.ideaCard}>
                            <div className={styles.ideaMeta}>
                                <span>{idea.category}</span>
                                <span>{idea.format}</span>
                            </div>
                            <h2>{idea.topic}</h2>
                            <p>{idea.claim}</p>
                            <div className={styles.ideaFrame}>{idea.frame}</div>
                            <Link href={makeWriteHref(idea)} className={styles.writeBtn}>
                                이 소재로 쓰기
                            </Link>
                        </article>
                    ))}
                </div>
            </div>
            <Footer />
        </div>
    );
}

