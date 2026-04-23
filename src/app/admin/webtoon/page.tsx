"use client";

import { useState, useEffect } from "react";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import styles from "./page.module.css";

interface Series {
    id: string;
    title: string;
    description: string;
    author: string;
    status: string;
    total_episodes: number;
    cover_image: string | null;
}

export default function AdminWebtoonPage() {
    const [seriesList, setSeriesList] = useState<Series[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [newTitle, setNewTitle] = useState("");
    const [newDesc, setNewDesc] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const supabase = createClient();

    const loadSeries = async () => {
        const { data } = await supabase
            .from("webtoon_series")
            .select("*")
            .order("created_at", { ascending: false });
        if (data) setSeriesList(data);
    };

    useEffect(() => {
        loadSeries();
    }, []);

    const handleCreateSeries = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        const { error } = await supabase
            .from("webtoon_series")
            .insert([{
                title: newTitle,
                description: newDesc,
                author: "드럼통119",
                category: "역사",
            }]);

        setIsSubmitting(false);

        if (error) {
            alert("시리즈 생성 실패: " + error.message);
        } else {
            alert("시리즈가 생성되었습니다!");
            setNewTitle("");
            setNewDesc("");
            setShowForm(false);
            loadSeries();
        }
    };

    return (
        <div className={styles.main}>
            <Header />

            <div className={styles.container}>
                <div className={styles.header}>
                    <h1 className={styles.title}>📚 웹툰 관리</h1>
                    <button
                        className={styles.addBtn}
                        onClick={() => setShowForm(!showForm)}
                    >
                        {showForm ? "취소" : "+ 새 시리즈"}
                    </button>
                </div>

                {/* Create Series Form */}
                {showForm && (
                    <form className={styles.form} onSubmit={handleCreateSeries}>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>시리즈 제목</label>
                            <input
                                type="text"
                                className={styles.input}
                                value={newTitle}
                                onChange={(e) => setNewTitle(e.target.value)}
                                placeholder="예: 독립정신"
                                required
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>시리즈 설명</label>
                            <textarea
                                className={styles.textarea}
                                value={newDesc}
                                onChange={(e) => setNewDesc(e.target.value)}
                                placeholder="이승만 대통령의 독립정신을 만화로 만나보세요."
                                rows={3}
                            />
                        </div>
                        <button type="submit" className={styles.submitBtn} disabled={isSubmitting}>
                            {isSubmitting ? "생성 중..." : "시리즈 생성"}
                        </button>
                    </form>
                )}

                {/* Series List */}
                <div className={styles.seriesList}>
                    {seriesList.length === 0 ? (
                        <div className={styles.empty}>
                            <p>등록된 시리즈가 없습니다. 새 시리즈를 만들어주세요.</p>
                        </div>
                    ) : (
                        seriesList.map((series) => (
                            <div key={series.id} className={styles.seriesCard}>
                                <div className={styles.seriesCard__info}>
                                    <h2 className={styles.seriesCard__title}>{series.title}</h2>
                                    <p className={styles.seriesCard__desc}>{series.description}</p>
                                    <div className={styles.seriesCard__meta}>
                                        <span>{series.status === "ongoing" ? "🟢 연재중" : "✅ 완결"}</span>
                                        <span>📄 {series.total_episodes}화</span>
                                    </div>
                                </div>
                                <div className={styles.seriesCard__actions}>
                                    <Link
                                        href={`/admin/webtoon/upload?seriesId=${series.id}`}
                                        className={styles.actionBtn}
                                    >
                                        + 에피소드 업로드
                                    </Link>
                                    <Link
                                        href={`/webtoon/${series.id}`}
                                        className={styles.actionBtnOutline}
                                        target="_blank"
                                    >
                                        미리보기 →
                                    </Link>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            <Footer />
        </div>
    );
}
