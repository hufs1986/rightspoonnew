import Header from "../../components/Header";
import Footer from "../../components/Footer";
import Link from "next/link";
import { createClient } from "@/utils/supabase/server";
import styles from "./page.module.css";
import { Metadata } from "next";

interface EpisodeListProps {
    params: Promise<{ seriesId: string }>;
}

export async function generateMetadata({ params }: EpisodeListProps): Promise<Metadata> {
    const { seriesId } = await params;
    const supabase = await createClient();
    const { data: series } = await supabase
        .from("webtoon_series")
        .select("title")
        .eq("id", seriesId)
        .single();

    return {
        title: series ? `${series.title} | 오른스푼 웹툰` : "웹툰 | 오른스푼",
    };
}

export const revalidate = 60;

export default async function EpisodeListPage({ params }: EpisodeListProps) {
    const { seriesId } = await params;
    const supabase = await createClient();

    const { data: series } = await supabase
        .from("webtoon_series")
        .select("*")
        .eq("id", seriesId)
        .single();

    if (!series) {
        return (
            <div className={styles.main}>
                <Header />
                <div style={{ padding: "150px 20px", textAlign: "center" }}>
                    <h2>존재하지 않는 시리즈입니다.</h2>
                    <br />
                    <Link href="/webtoon" className="btn btn--primary">웹툰 목록으로</Link>
                </div>
                <Footer />
            </div>
        );
    }

    const { data: episodes } = await supabase
        .from("webtoon_episodes")
        .select("*")
        .eq("series_id", seriesId)
        .eq("is_published", true)
        .order("episode_number", { ascending: true });

    return (
        <div className={styles.main}>
            <Header />

            {/* Series Hero */}
            <section className={styles.hero}>
                <div className={styles.hero__inner}>
                    {series.cover_image && (
                        <img
                            src={series.cover_image}
                            alt={series.title}
                            className={styles.hero__cover}
                        />
                    )}
                    <div className={styles.hero__info}>
                        <span className="badge badge--history">{series.category}</span>
                        <h1 className={styles.hero__title}>{series.title}</h1>
                        <p className={styles.hero__desc}>{series.description}</p>
                        <div className={styles.hero__meta}>
                            <span>✍️ {series.author}</span>
                            <span>📄 {series.total_episodes}화</span>
                            <span className={styles.hero__status}>
                                {series.status === "ongoing" ? "🟢 연재중" : "✅ 완결"}
                            </span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Episode List */}
            <section className={styles.section}>
                <h2 className={styles.section__title}>
                    <span className={styles.section__accent} />
                    전체 회차
                    <span className={styles.section__count}>{episodes?.length || 0}화</span>
                </h2>

                <div className={styles.episodeList}>
                    {episodes && episodes.length > 0 ? (
                        episodes.map((ep) => {
                            const pages = ep.pages as { path: string; order: number }[];
                            const thumbUrl = pages?.[0]?.path
                                ? `/api/webtoon/signed-urls?episodeId=${ep.id}`
                                : null;

                            // Check if episode is new (within 7 days)
                            const isNew = new Date(ep.created_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

                            return (
                                <Link
                                    key={ep.id}
                                    href={`/webtoon/${seriesId}/${ep.id}`}
                                    className={styles.episode}
                                >
                                    <div className={styles.episode__number}>
                                        {ep.episode_number}
                                    </div>
                                    <div className={styles.episode__info}>
                                        <div className={styles.episode__titleRow}>
                                            <h3 className={styles.episode__title}>{ep.title}</h3>
                                            {isNew && <span className={styles.episode__new}>NEW</span>}
                                        </div>
                                        <div className={styles.episode__meta}>
                                            <span>👁 {ep.view_count.toLocaleString()}</span>
                                            <span>❤️ {ep.like_count}</span>
                                            <span>{new Date(ep.created_at).toLocaleDateString("ko-KR")}</span>
                                        </div>
                                    </div>
                                    <div className={styles.episode__arrow}>→</div>
                                </Link>
                            );
                        })
                    ) : (
                        <div className={styles.empty}>
                            <p>아직 공개된 에피소드가 없습니다.</p>
                        </div>
                    )}
                </div>
            </section>

            <Footer />
        </div>
    );
}
