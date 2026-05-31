"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import styles from "../page.module.css";

type HealthItem = {
    key: string;
    label: string;
    status: "ok" | "warn" | "fail";
    detail: string;
};

type HealthResponse = {
    status: "ok" | "warn" | "fail";
    checkedAt: string;
    articleCount: number;
    latestPublishedAt: string | null;
    latestDaysOld: number | null;
    checks: HealthItem[];
};

const statusLabel = {
    ok: "정상",
    warn: "확인 필요",
    fail: "설정 필요",
};

export default function SiteHealthPage() {
    const [data, setData] = useState<HealthResponse | null>(null);
    const [error, setError] = useState("");

    useEffect(() => {
        fetch("/api/site-health")
            .then((res) => {
                if (!res.ok) throw new Error("운영 상태를 불러오지 못했습니다.");
                return res.json();
            })
            .then(setData)
            .catch((err) => setError(err.message));
    }, []);

    const grouped = useMemo(() => {
        if (!data) return { fail: [], warn: [], ok: [] } as Record<HealthItem["status"], HealthItem[]>;
        return data.checks.reduce((acc, item) => {
            acc[item.status].push(item);
            return acc;
        }, { fail: [], warn: [], ok: [] } as Record<HealthItem["status"], HealthItem[]>);
    }, [data]);

    return (
        <div className={styles.dashMain}>
            <Header />
            <div className={styles.dashContainer}>
                <div className={styles.dashHeader}>
                    <div>
                        <h1 className={styles.dashTitle}>운영 점검판</h1>
                        <p className={styles.dashDesc}>
                            AI, 푸시, 검색 배관, 애드센스, 콘텐츠 상태를 한 번에 확인합니다.
                        </p>
                    </div>
                    <div className={styles.dashActions}>
                        <Link href="/admin" className={styles.logoutBtn}>대시보드</Link>
                        <Link href="/admin/content-audit" className={styles.writeBtn}>콘텐츠 감사</Link>
                    </div>
                </div>

                {error && <div className={styles.empty}>{error}</div>}
                {!data && !error && <div className={styles.loading}>점검 중...</div>}

                {data && (
                    <>
                        <section className={styles.opsPanel}>
                            <div className={styles.opsLead}>
                                <span>Site Health</span>
                                <h2>
                                    {data.status === "ok"
                                        ? "운영 기본 설정이 정상입니다."
                                        : data.status === "warn"
                                            ? "운영은 가능하지만 보강할 설정이 있습니다."
                                            : "운영 전 필수 설정이 빠져 있습니다."}
                                </h2>
                                <p>
                                    마지막 점검: {new Date(data.checkedAt).toLocaleString("ko-KR")}
                                    <br />
                                    현재 글 {data.articleCount}개, 최근 발행 {data.latestDaysOld ?? "-"}일 전입니다.
                                </p>
                            </div>
                            <div className={styles.opsChecklist}>
                                <div data-state={data.articleCount >= 30 ? "done" : "todo"}>
                                    <strong>콘텐츠 기반</strong>
                                    <span>{data.articleCount}/30개, 애드센스 재도전 전 기준</span>
                                </div>
                                <div data-state={(data.latestDaysOld ?? 999) <= 7 ? "done" : "todo"}>
                                    <strong>발행 주기</strong>
                                    <span>{data.latestDaysOld === null ? "글 없음" : `${data.latestDaysOld}일 경과`}</span>
                                </div>
                                <div data-state={data.status === "ok" ? "done" : "todo"}>
                                    <strong>환경 설정</strong>
                                    <span>{statusLabel[data.status]}</span>
                                </div>
                            </div>
                        </section>

                        {(["fail", "warn", "ok"] as const).map((status) => (
                            grouped[status].length > 0 && (
                                <section key={status} className={styles.healthSection}>
                                    <h2>{statusLabel[status]}</h2>
                                    <div className={styles.healthGrid}>
                                        {grouped[status].map((item) => (
                                            <div key={item.key} className={styles.healthCard} data-status={item.status}>
                                                <strong>{item.label}</strong>
                                                <span>{item.detail}</span>
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            )
                        ))}
                    </>
                )}
            </div>
            <Footer />
        </div>
    );
}
