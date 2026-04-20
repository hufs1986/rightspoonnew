import Header from "../components/Header";
import Footer from "../components/Footer";
import styles from "./about.module.css";

export const metadata = {
    title: "소개 | 오른스푼 by 드럼통119",
    description: "오른스푼 미디어의 소개 페이지입니다. 대한민국 오른 시각의 뉴스와 칼럼을 전합니다.",
};

export default function AboutPage() {
    return (
        <div className={styles.main}>
            <Header />

            <section className={styles.hero}>
                <div className={styles.heroInner}>
                    <img
                        src="/logo-character.jpg"
                        alt="드럼통119"
                        className={styles.heroLogo}
                    />
                    <h1 className={styles.heroTitle}>오른스푼 미디어</h1>
                    <p className={styles.heroSub}>by 드럼통119</p>
                    <p className={styles.heroDesc}>
                        "올바른 생각만 떠먹여 드립니다"<br />
                        유튜브 영상과 함께 깊이 있는 분석을 제공하는 미디어 플랫폼입니다.
                    </p>
                </div>
            </section>

            <section className={styles.content}>
                <div className={styles.grid}>
                    <div className={styles.card}>
                        <span className={styles.cardIcon}>📺</span>
                        <h3 className={styles.cardTitle}>유튜브 × 기사</h3>
                        <p className={styles.cardDesc}>
                            드럼통119 유튜브 채널의 영상을 기사 형태로 정리하여
                            더 깊이 있는 분석과 의견을 전달합니다.
                        </p>
                    </div>
                    <div className={styles.card}>
                        <span className={styles.cardIcon}>🎯</span>
                        <h3 className={styles.cardTitle}>오른의 시각</h3>
                        <p className={styles.cardDesc}>
                            정치, 경제, 역사 등 주요 이슈를 오른 관점에서 분석하며,
                            사실에 기반한 균형 잡힌 시각을 지향합니다.
                        </p>
                    </div>
                </div>

                <div className={styles.channels}>
                    <h2 className={styles.channelsTitle}>채널 안내</h2>
                    <div className={styles.channelGrid}>
                        <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className={styles.channelLink}>
                            ▶ YouTube
                        </a>
                        <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className={styles.channelLink}>
                            📷 Instagram
                        </a>
                        <a href="https://tiktok.com" target="_blank" rel="noopener noreferrer" className={styles.channelLink}>
                            🎵 TikTok
                        </a>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
}
