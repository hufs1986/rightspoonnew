import { GAME_ENDINGS, type GameEnding, type GameStats } from "./gameData";
import StoreCta from "./StoreCta";
import styles from "./game.module.css";

interface EndingScreenProps {
    discoveredEndingIds: string[];
    endingData: GameEnding;
    onRestart: () => void;
    onShare: () => void;
    stats: GameStats;
}

const ENDING_STATS = [
    { key: "lawRule", label: "법치주의" },
    { key: "separation", label: "삼권분립" },
    { key: "judicialIndep", label: "사법독립" },
    { key: "publicTrust", label: "국민신뢰" },
    { key: "regimeShield", label: "정권방탄" },
    { key: "cancelProgress", label: "공소취소" },
] as const;

const ENDING_PRESENTATION: Record<string, { kicker: string; accent: string; glow: string; summary: string; bg: string; charImg: string }> = {
    shield_success: {
        kicker: "방탄은 성공했다",
        accent: "#ffb3b3",
        glow: "rgba(255, 73, 109, 0.38)",
        summary: "법정은 닫혔고, 권력만 살아남았습니다.",
        bg: "/game/bg-courtroom.png",
        charImg: "/game/politician.png",
    },
    constitutional_block: {
        kicker: "헌법이 마지막 문을 닫았다",
        accent: "#ffe29f",
        glow: "rgba(255, 209, 102, 0.28)",
        summary: "제동은 늦었지만, 법의 선은 아직 남아 있습니다.",
        bg: "/game/bg-courtroom.png",
        charImg: "/game/judge.png",
    },
    public_rage: {
        kicker: "거리의 온도가 먼저 폭발했다",
        accent: "#ffb38d",
        glow: "rgba(255, 125, 64, 0.34)",
        summary: "정권은 버텼지만 시민 신뢰는 붕괴했습니다.",
        bg: "/game/bg-protest.png",
        charImg: "/game/citizen.png",
    },
    law_collapse: {
        kicker: "다음 권력도 이 방식을 배웠다",
        accent: "#d2b3ff",
        glow: "rgba(180, 113, 255, 0.34)",
        summary: "이제 재판은 제도가 아니라 정치 기술이 되었습니다.",
        bg: "/game/bg-parliament.png",
        charImg: "/game/prosecutor.png",
    },
    term_ended: {
        kicker: "시계는 멈춘 듯했지만 끝내 다시 갔다",
        accent: "#a7d7ff",
        glow: "rgba(86, 172, 255, 0.28)",
        summary: "유예는 끝났고, 판단은 다시 법정으로 돌아갑니다.",
        bg: "/game/bg-courtroom.png",
        charImg: "/game/judge.png",
    },
};

export default function EndingScreen({ discoveredEndingIds, endingData, onRestart, onShare, stats }: EndingScreenProps) {
    const isCollected = discoveredEndingIds.includes(endingData.id);
    const p = ENDING_PRESENTATION[endingData.id] ?? ENDING_PRESENTATION.term_ended;

    return (
        <div className={styles.gameContainer}>
            <div
                className={styles.vnEndingScene}
                style={{ "--ending-accent": p.accent, "--ending-glow": p.glow } as React.CSSProperties}
            >
                {/* Background */}
                <div className={styles.vnEndingBg} style={{ backgroundImage: `url(${p.bg})` }} />
                <div className={styles.vnBgOverlay} />

                {/* Character */}
                {p.charImg && (
                    <div style={{
                        position: "absolute", bottom: "40%", left: "50%",
                        transform: "translateX(-50%)", zIndex: 1, opacity: 0.25,
                        maxWidth: "300px", width: "60%", pointerEvents: "none",
                    }}>
                        <img src={p.charImg} alt="" style={{ width: "100%", filter: "grayscale(0.5)" }} />
                    </div>
                )}

                <div className={styles.vnEndingContent}>
                    <div className={styles.vnEndingEmoji}>{endingData.emoji}</div>
                    <div className={styles.endingLabel}>— ENDING —</div>
                    <div className={styles.vnEndingKicker}>{p.kicker}</div>
                    <h2 className={styles.vnEndingTitle}>{endingData.title}</h2>
                    {isCollected && <div className={styles.newEndingBadge}>COLLECTED</div>}
                    <p className={styles.vnEndingSummary}>{p.summary}</p>
                    <p className={styles.vnEndingDesc}>{endingData.description}</p>

                    <div className={styles.vnEndingStatsGrid}>
                        {ENDING_STATS.map(({ key, label }) => {
                            const value = stats[key];
                            return (
                                <div key={label} className={styles.vnEndingStatCard}>
                                    <div className={styles.vnEndingStatLabel}>{label}</div>
                                    <div className={`${styles.vnEndingStatValue} ${value >= 50 ? styles["vnEndingStatValue--good"] : styles["vnEndingStatValue--bad"]}`}>
                                        {value}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <div className={styles.collectionPanel}>
                        <div className={styles.collectionHeader}>
                            <div className={styles.collectionTitle}>엔딩 컬렉션</div>
                            <div className={styles.collectionMeta}>{discoveredEndingIds.length}/{GAME_ENDINGS.length} 해금</div>
                        </div>
                        <div className={styles.collectionGrid}>
                            {GAME_ENDINGS.map((ending) => {
                                const unlocked = discoveredEndingIds.includes(ending.id);
                                return (
                                    <div key={ending.id} className={`${styles.collectionBadge} ${unlocked ? styles["collectionBadge--unlocked"] : ""}`}>
                                        <span className={styles.collectionEmoji}>{unlocked ? ending.emoji : "❔"}</span>
                                        <span className={styles.collectionName}>{unlocked ? ending.name : "잠김"}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div className={styles.endingActions} style={{ marginTop: "24px" }}>
                        <button className={styles.restartBtn} onClick={onRestart}>↻ 다시 시작</button>
                        <button className={styles.shareBtn} onClick={onShare}>📤 결과 공유하기</button>
                    </div>

                    <StoreCta variant="ending" />

                    <div className={styles.titleCredits} style={{ marginTop: "24px" }}>정치 풍자 육성 시뮬레이션 · 오른스푼 × 드럼통119 제작</div>
                    <div className={styles.socialLinks}>
                        <a href="https://www.youtube.com/@drumtong119" target="_blank" rel="noopener noreferrer" className={styles.socialLink}>▶ 드럼통119 유튜브</a>
                        <a href="https://www.instagram.com/drumtong119" target="_blank" rel="noopener noreferrer" className={styles.socialLink}>📸 드럼통119 인스타그램</a>
                    </div>
                </div>
            </div>
        </div>
    );
}
