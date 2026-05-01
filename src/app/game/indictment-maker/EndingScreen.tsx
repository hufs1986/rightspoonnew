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

const ENDING_PRESENTATION: Record<string, { kicker: string; accent: string; glow: string; summary: string }> = {
    shield_success: {
        kicker: "방탄은 성공했다",
        accent: "#ffb3b3",
        glow: "rgba(255, 73, 109, 0.38)",
        summary: "법정은 닫혔고, 권력만 살아남았습니다.",
    },
    constitutional_block: {
        kicker: "헌법이 마지막 문을 닫았다",
        accent: "#ffe29f",
        glow: "rgba(255, 209, 102, 0.28)",
        summary: "제동은 늦었지만, 법의 선은 아직 남아 있습니다.",
    },
    public_rage: {
        kicker: "거리의 온도가 먼저 폭발했다",
        accent: "#ffb38d",
        glow: "rgba(255, 125, 64, 0.34)",
        summary: "정권은 버텼지만 시민 신뢰는 붕괴했습니다.",
    },
    law_collapse: {
        kicker: "다음 권력도 이 방식을 배웠다",
        accent: "#d2b3ff",
        glow: "rgba(180, 113, 255, 0.34)",
        summary: "이제 재판은 제도가 아니라 정치 기술이 되었습니다.",
    },
    term_ended: {
        kicker: "시계는 멈춘 듯했지만 끝내 다시 갔다",
        accent: "#a7d7ff",
        glow: "rgba(86, 172, 255, 0.28)",
        summary: "유예는 끝났고, 판단은 다시 법정으로 돌아갑니다.",
    },
};

export default function EndingScreen({ discoveredEndingIds, endingData, onRestart, onShare, stats }: EndingScreenProps) {
    const isCollected = discoveredEndingIds.includes(endingData.id);
    const presentation = ENDING_PRESENTATION[endingData.id] ?? ENDING_PRESENTATION.term_ended;

    return (
        <div className={styles.gameContainer}>
            <div
                className={styles.endingScreen}
                style={
                    {
                        "--ending-accent": presentation.accent,
                        "--ending-glow": presentation.glow,
                    } as React.CSSProperties
                }
            >
                <div className={styles.endingHero}>
                    <div className={styles.endingEmoji}>{endingData.emoji}</div>
                    <div className={styles.endingLabel}>— ENDING —</div>
                    <div className={styles.endingKicker}>{presentation.kicker}</div>
                </div>
                <h2 className={styles.endingTitle}>{endingData.title}</h2>
                {isCollected && <div className={styles.newEndingBadge}>COLLECTED</div>}
                <p className={styles.endingSummary}>{presentation.summary}</p>
                <p className={styles.endingDesc}>{endingData.description}</p>

                <div className={styles.endingStats}>
                    {ENDING_STATS.map(({ key, label }) => {
                        const value = stats[key];

                        return (
                            <div key={label} className={styles.endingStat}>
                                <div className={styles.endingStatLabel}>{label}</div>
                                <div
                                    className={`${styles.endingStatValue} ${value >= 50 ? styles["endingStatValue--good"] : styles["endingStatValue--bad"]}`}
                                >
                                    {value}
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className={styles.collectionPanel}>
                    <div className={styles.collectionHeader}>
                        <div className={styles.collectionTitle}>엔딩 컬렉션</div>
                        <div className={styles.collectionMeta}>
                            {discoveredEndingIds.length}/{GAME_ENDINGS.length} 해금
                        </div>
                    </div>
                    <div className={styles.collectionGrid}>
                        {GAME_ENDINGS.map((ending) => {
                            const unlocked = discoveredEndingIds.includes(ending.id);

                            return (
                                <div
                                    key={ending.id}
                                    className={`${styles.collectionBadge} ${unlocked ? styles["collectionBadge--unlocked"] : ""}`}
                                >
                                    <span className={styles.collectionEmoji}>{unlocked ? ending.emoji : "❔"}</span>
                                    <span className={styles.collectionName}>{unlocked ? ending.name : "잠김"}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className={styles.endingActions}>
                    <button className={styles.restartBtn} onClick={onRestart}>
                        ↻ 다시 시작
                    </button>
                    <button className={styles.shareBtn} onClick={onShare}>
                        📤 결과 공유하기
                    </button>
                </div>

                <StoreCta variant="ending" />

                <div className={styles.titleCredits} style={{ marginTop: '24px' }}>정치 풍자 육성 시뮬레이션 · 오른스푼 × 드럼통119 제작</div>
                <div className={styles.socialLinks}>
                    <a href="https://www.youtube.com/@drumtong119" target="_blank" rel="noopener noreferrer" className={styles.socialLink}>
                        ▶ 드럼통119 유튜브
                    </a>
                    <a href="https://www.instagram.com/drumtong119" target="_blank" rel="noopener noreferrer" className={styles.socialLink}>
                        📸 드럼통119 인스타그램
                    </a>
                </div>
            </div>
        </div>
    );
}
