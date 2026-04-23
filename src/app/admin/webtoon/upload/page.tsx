"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Header from "../../../components/Header";
import Footer from "../../../components/Footer";
import { createClient } from "@/utils/supabase/client";
import styles from "./page.module.css";

interface PageFile {
    id: string;
    file: File;
    preview: string;
    order: number;
}

export default function WebtoonUploadPage() {
    const searchParams = useSearchParams();
    const seriesIdParam = searchParams.get("seriesId") || "";

    const [seriesId, setSeriesId] = useState(seriesIdParam);
    const [seriesList, setSeriesList] = useState<{ id: string; title: string }[]>([]);
    const [episodeNumber, setEpisodeNumber] = useState(1);
    const [episodeTitle, setEpisodeTitle] = useState("");
    const [pages, setPages] = useState<PageFile[]>([]);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
    const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const supabase = createClient();

    // Load series list
    useEffect(() => {
        supabase
            .from("webtoon_series")
            .select("id, title")
            .order("created_at", { ascending: false })
            .then(({ data }) => {
                if (data) setSeriesList(data);
            });
    }, []);

    // Auto-increment episode number
    useEffect(() => {
        if (!seriesId) return;
        supabase
            .from("webtoon_episodes")
            .select("episode_number")
            .eq("series_id", seriesId)
            .order("episode_number", { ascending: false })
            .limit(1)
            .then(({ data }) => {
                if (data && data.length > 0) {
                    setEpisodeNumber(data[0].episode_number + 1);
                } else {
                    setEpisodeNumber(1);
                }
            });
    }, [seriesId]);

    // Handle file selection
    const handleFilesSelected = useCallback((files: FileList | File[]) => {
        const fileArray = Array.from(files).filter((f) =>
            f.type.startsWith("image/")
        );

        const newPages: PageFile[] = fileArray.map((file, index) => ({
            id: `${Date.now()}-${index}-${Math.random().toString(36).slice(2)}`,
            file,
            preview: URL.createObjectURL(file),
            order: pages.length + index,
        }));

        setPages((prev) => [...prev, ...newPages]);
    }, [pages.length]);

    // Drop zone handlers
    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.dataTransfer.files.length > 0) {
            handleFilesSelected(e.dataTransfer.files);
        }
    }, [handleFilesSelected]);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
    }, []);

    // Reorder pages (drag & drop)
    const handlePageDragStart = (index: number) => {
        setDraggedIndex(index);
    };

    const handlePageDragEnter = (index: number) => {
        setDragOverIndex(index);
    };

    const handlePageDragEnd = () => {
        if (draggedIndex !== null && dragOverIndex !== null && draggedIndex !== dragOverIndex) {
            setPages((prev) => {
                const newPages = [...prev];
                const [dragged] = newPages.splice(draggedIndex, 1);
                newPages.splice(dragOverIndex, 0, dragged);
                return newPages.map((p, i) => ({ ...p, order: i }));
            });
        }
        setDraggedIndex(null);
        setDragOverIndex(null);
    };

    // Remove a page
    const removePage = (id: string) => {
        setPages((prev) => {
            const filtered = prev.filter((p) => p.id !== id);
            return filtered.map((p, i) => ({ ...p, order: i }));
        });
    };

    // Upload and save
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!seriesId || !episodeTitle || pages.length === 0) {
            alert("시리즈, 제목, 페이지 이미지를 모두 입력해주세요.");
            return;
        }

        setIsUploading(true);
        setUploadProgress(0);

        try {
            const uploadedPages: { path: string; order: number }[] = [];
            const totalPages = pages.length;

            for (let i = 0; i < totalPages; i++) {
                const page = pages[i];
                const ext = page.file.name.split(".").pop() || "jpg";
                const filePath = `${seriesId}/ep${episodeNumber}/${String(i + 1).padStart(3, "0")}.${ext}`;

                const { error: uploadError } = await supabase.storage
                    .from("webtoon-pages")
                    .upload(filePath, page.file, {
                        cacheControl: "3600",
                        upsert: true,
                    });

                if (uploadError) {
                    throw new Error(`페이지 ${i + 1} 업로드 실패: ${uploadError.message}`);
                }

                uploadedPages.push({ path: filePath, order: i });
                setUploadProgress(Math.round(((i + 1) / totalPages) * 100));
            }

            // Save episode to database
            const { error: dbError } = await supabase
                .from("webtoon_episodes")
                .insert([{
                    series_id: seriesId,
                    episode_number: episodeNumber,
                    title: episodeTitle,
                    pages: uploadedPages,
                    is_published: true,
                }]);

            if (dbError) {
                throw new Error("에피소드 저장 실패: " + dbError.message);
            }

            // Update series total_episodes count
            await supabase
                .from("webtoon_series")
                .update({ total_episodes: episodeNumber })
                .eq("id", seriesId);

            alert(`✅ 제${episodeNumber}화 업로드 완료!`);

            // Reset form
            setEpisodeTitle("");
            setPages([]);
            setEpisodeNumber((prev) => prev + 1);
            setUploadProgress(0);
        } catch (err) {
            alert((err as Error).message);
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className={styles.main}>
            <Header />

            <div className={styles.container}>
                <h1 className={styles.title}>📤 에피소드 업로드</h1>
                <p className={styles.subtitle}>웹툰 페이지 이미지를 순서대로 업로드하세요.</p>

                <form className={styles.form} onSubmit={handleSubmit}>
                    {/* Series selector */}
                    <div className={styles.formRow}>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>시리즈</label>
                            <select
                                className={styles.select}
                                value={seriesId}
                                onChange={(e) => setSeriesId(e.target.value)}
                                required
                            >
                                <option value="">시리즈 선택</option>
                                {seriesList.map((s) => (
                                    <option key={s.id} value={s.id}>{s.title}</option>
                                ))}
                            </select>
                        </div>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>회차 번호</label>
                            <input
                                type="number"
                                className={styles.input}
                                value={episodeNumber}
                                onChange={(e) => setEpisodeNumber(Number(e.target.value))}
                                min={1}
                                required
                            />
                        </div>
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.label}>에피소드 제목</label>
                        <input
                            type="text"
                            className={styles.input}
                            value={episodeTitle}
                            onChange={(e) => setEpisodeTitle(e.target.value)}
                            placeholder="예: 제1화 - 서론: 독립의 씨앗"
                            required
                        />
                    </div>

                    {/* Drop zone */}
                    <div className={styles.formGroup}>
                        <label className={styles.label}>페이지 이미지 ({pages.length}장)</label>
                        <div
                            className={styles.dropzone}
                            onDrop={handleDrop}
                            onDragOver={handleDragOver}
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <div className={styles.dropzone__icon}>🖼️</div>
                            <p className={styles.dropzone__text}>
                                이미지를 드래그하여 놓거나 클릭하여 선택하세요
                            </p>
                            <p className={styles.dropzone__hint}>
                                JPG, PNG, WebP 지원 · 여러 파일 동시 선택 가능
                            </p>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={(e) => {
                                    if (e.target.files) handleFilesSelected(e.target.files);
                                    e.target.value = "";
                                }}
                                className={styles.dropzone__input}
                            />
                        </div>
                    </div>

                    {/* Page previews with reorder */}
                    {pages.length > 0 && (
                        <div className={styles.pageGrid}>
                            {pages.map((page, index) => (
                                <div
                                    key={page.id}
                                    className={`${styles.pageCard} ${
                                        draggedIndex === index ? styles["pageCard--dragging"] : ""
                                    } ${
                                        dragOverIndex === index ? styles["pageCard--dragOver"] : ""
                                    }`}
                                    draggable
                                    onDragStart={() => handlePageDragStart(index)}
                                    onDragEnter={() => handlePageDragEnter(index)}
                                    onDragEnd={handlePageDragEnd}
                                    onDragOver={(e) => e.preventDefault()}
                                >
                                    <div className={styles.pageCard__number}>{index + 1}</div>
                                    <img
                                        src={page.preview}
                                        alt={`페이지 ${index + 1}`}
                                        className={styles.pageCard__img}
                                    />
                                    <button
                                        type="button"
                                        className={styles.pageCard__remove}
                                        onClick={() => removePage(page.id)}
                                    >
                                        ✕
                                    </button>
                                    <div className={styles.pageCard__drag}>⠿</div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Upload progress */}
                    {isUploading && (
                        <div className={styles.progressBar}>
                            <div
                                className={styles.progressBar__fill}
                                style={{ width: `${uploadProgress}%` }}
                            />
                            <span className={styles.progressBar__text}>
                                업로드 중... {uploadProgress}%
                            </span>
                        </div>
                    )}

                    {/* Submit */}
                    <button
                        type="submit"
                        className={styles.submitBtn}
                        disabled={isUploading || pages.length === 0}
                    >
                        {isUploading
                            ? `업로드 중... (${uploadProgress}%)`
                            : `제${episodeNumber}화 발행하기 (${pages.length}페이지)`
                        }
                    </button>
                </form>
            </div>

            <Footer />
        </div>
    );
}
