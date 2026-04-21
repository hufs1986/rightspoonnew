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
                        src="/logo-character.webp"
                        alt="드럼통119"
                        className={styles.heroLogo}
                    />
                    <h1 className={styles.heroTitle}>오른스푼 미디어</h1>
                    <p className={styles.heroSub}>by 드럼통119</p>
                    <p className={styles.heroDesc}>
                        대한민국 오른 시각을 담다<br />
                        유튜브 영상과 함께 깊이 있는 분석을 제공하는 미디어 플랫폼입니다.
                    </p>
                </div>
            </section>

            <section className={styles.content}>
                {/* 운영자 소개 */}
                <div style={{ maxWidth: "700px", margin: "0 auto 48px", padding: "0 20px" }}>
                    <h2 style={{ fontSize: "22px", fontWeight: "bold", color: "var(--color-text-primary)", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
                        <span style={{ width: "4px", height: "24px", background: "#d32f2f", borderRadius: "9999px", display: "inline-block" }} />
                        운영자 소개
                    </h2>
                    <div style={{ background: "var(--color-bg-card)", border: "1px solid var(--color-border)", borderRadius: "16px", padding: "28px", lineHeight: 1.8 }}>
                        <p style={{ color: "var(--color-text-secondary)", fontSize: "15px", marginBottom: "16px" }}>
                            <strong style={{ color: "var(--color-text-primary)" }}>드럼통119</strong>은 정치·경제·역사 분야를 깊이 있게 분석하는 유튜브 크리에이터이자 1인 미디어 운영자입니다.
                        </p>
                        <p style={{ color: "var(--color-text-secondary)", fontSize: "15px", marginBottom: "16px" }}>
                            주류 언론이 다루지 않는 시각, 데이터에 기반한 논리적 분석, 그리고 대한민국의 과거와 현재를 잇는 역사적 맥락을 콘텐츠에 담고 있습니다.
                            &ldquo;올바른 시각이 올바른 판단을 만든다&rdquo;는 신념 아래, 복잡한 이슈를 누구나 이해할 수 있도록 쉽고 명쾌하게 전달하는 것을 목표로 합니다.
                        </p>
                        <p style={{ color: "var(--color-text-secondary)", fontSize: "15px" }}>
                            오른스푼은 유튜브 채널의 영상 콘텐츠를 텍스트 기사로 재구성하여, 영상을 볼 시간이 없는 분들도 핵심 내용을 빠르게 파악할 수 있도록 서비스하고 있습니다.
                        </p>
                    </div>
                </div>

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
                    <div className={styles.card}>
                        <span className={styles.cardIcon}>🔍</span>
                        <h3 className={styles.cardTitle}>근거 있는 분석</h3>
                        <p className={styles.cardDesc}>
                            감정이 아닌 논리와 근거로 말합니다.
                            공식 자료에 기반한 분석으로 신뢰를 쌓아갑니다.
                        </p>
                    </div>
                </div>

                <div className={styles.channels}>
                    <h2 className={styles.channelsTitle}>채널 안내</h2>
                    <div className={styles.channelGrid}>
                        <a href="https://youtube.com/channel/UCzoap467OGtjhLk5qmU53OA?si=qKPByMpqOz1bq44J" target="_blank" rel="noopener noreferrer" className={styles.channelLink}>
                            ▶ YouTube
                        </a>
                    </div>
                </div>

                {/* 연락처 */}
                <div style={{ maxWidth: "700px", margin: "32px auto 0", padding: "0 20px", textAlign: "center" }}>
                    <div style={{ background: "var(--color-bg-card)", border: "1px solid var(--color-border)", borderRadius: "12px", padding: "20px" }}>
                        <p style={{ color: "var(--color-text-tertiary)", fontSize: "13px", marginBottom: "6px" }}>문의 및 제보</p>
                        <a href="mailto:drumtong119@gmail.com" style={{ color: "#d32f2f", fontSize: "16px", fontWeight: "600", textDecoration: "none" }}>
                            📧 drumtong119@gmail.com
                        </a>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
}
