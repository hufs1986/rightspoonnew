"use client";

import { useEffect, useState } from "react";
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

export default function AdminDashboardPage() {
    const [articles, setArticles] = useState<Article[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const supabase = createClient();

    const fetchArticles = async () => {
        const { data, error } = await supabase
            .from("articles")
            .select("id, title, category, created_at, view_count")
            .order("created_at", { ascending: false });

        if (!error && data) {
            setArticles(data);
        }
        setIsLoading(false);
    };

    useEffect(() => {
        fetchArticles();
    }, []);

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
                        <h1 className={styles.dashTitle}>관리자 대시보드</h1>
                        <p className={styles.dashDesc}>
                            등록된 콘텐츠를 관리하고 새 글을 작성하세요.
                        </p>
                    </div>
                    <div className={styles.dashActions}>
                        <Link href="/admin/write" className={styles.writeBtn}>
                            + 새 글 작성
                        </Link>
                        <button onClick={handleLogout} className={styles.logoutBtn}>
                            로그아웃
                        </button>
                    </div>
                </div>

                <div className={styles.dashStats}>
                    <div className={styles.statCard}>
                        <span className={styles.statNumber}>{articles.length}</span>
                        <span className={styles.statLabel}>전체 기사</span>
                    </div>
                    <div className={styles.statCard}>
                        <span className={styles.statNumber}>
                            {articles.filter((a) => a.category === "정치").length}
                        </span>
                        <span className={styles.statLabel}>정치</span>
                    </div>
                    <div className={styles.statCard}>
                        <span className={styles.statNumber}>
                            {articles.filter((a) => a.category === "경제").length}
                        </span>
                        <span className={styles.statLabel}>경제</span>
                    </div>
                    <div className={styles.statCard}>
                        <span className={styles.statNumber}>
                            {articles.filter((a) => a.category === "역사").length}
                        </span>
                        <span className={styles.statLabel}>역사</span>
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
