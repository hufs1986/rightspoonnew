import Header from "../components/Header";
import Footer from "../components/Footer";
import Link from "next/link";
import { createClient } from "@/utils/supabase/server";
import styles from "./page.module.css";

export const metadata = {
    title: "웹툰 | 오른스푼",
    description: "이승만 대통령의 독립정신을 만화로 만나보세요. 오른스푼이 전하는 역사 웹툰.",
};

export const revalidate = 60;

export default async function WebtoonListPage() {
    const supabase = await createClient();

    const { data: seriesList } = await supabase
        .from("webtoon_series")
        .select("*, webtoon_episodes(count)")
        .order("created_at", { ascending: false });

    return (
        <div className={styles.main}>
            <Header />

            <section className={styles.hero}>
                <div className={styles.hero__inner}>
                    <span className={styles.hero__badge}>📚 웹툰</span>
                    <h1 className={styles.hero__title}>
                        역사를 만화로 만나다
                    </h1>
                    <p className={styles.hero__desc}>
                        대한민국의 건국 정신과 역사를 생생한 만화로 전합니다.
                    </p>
                </div>
            </section>

            <section className={styles.section}>
                <div className={styles.grid}>
                    {seriesList && seriesList.length > 0 ? (
                        seriesList.map((series) => (
                            <Link
                                key={series.id}
                                href={`/webtoon/${series.id}`}
                                className={styles.card}
                            >
                                <div className={styles.card__cover}>
                                    {series.cover_image ? (
                                        <img
                                            src={series.cover_image}
                                            alt={series.title}
                                            className={styles.card__coverImg}
                                        />
                                    ) : (
                                        <div className={styles.card__coverPlaceholder}>
                                            <span>📖</span>
                                        </div>
                                    )}
                                    <div className={styles.card__status}>
                                        {series.status === "ongoing" ? "연재중" : "완결"}
                                    </div>
                                </div>
                                <div className={styles.card__body}>
                                    <span className="badge badge--history">{series.category}</span>
                                    <h2 className={styles.card__title}>{series.title}</h2>
                                    <p className={styles.card__desc}>
                                        {series.description || "만화로 보는 역사"}
                                    </p>
                                    <div className={styles.card__meta}>
                                        <span>✍️ {series.author}</span>
                                        <span>📄 {series.total_episodes}화</span>
                                    </div>
                                </div>
                            </Link>
                        ))
                    ) : (
                        <div className={styles.empty}>
                            <div className={styles.empty__icon}>📚</div>
                            <h2>웹툰이 준비 중입니다</h2>
                            <p>곧 역사 웹툰이 업로드됩니다. 기대해주세요!</p>
                        </div>
                    )}
                </div>
            </section>

            <Footer />
        </div>
    );
}
