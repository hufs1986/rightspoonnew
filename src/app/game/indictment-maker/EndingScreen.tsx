import { GAME_ENDINGS, type GameEnding, type GameStats } from "./gameData";
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

export default function EndingScreen({ discoveredEndingIds, endingData, onRestart, onShare, stats }: EndingScreenProps) {
    const isCollected = discoveredEndingIds.includes(endingData.id);

    return (
        <div className={styles.gameContainer}>
            <div className={styles.endingScreen}>
                <div className={styles.endingEmoji}>{endingData.emoji}</div>
                <div className={styles.endingLabel}>— ENDING —</div>
                <h2 className={styles.endingTitle}>{endingData.title}</h2>
                {isCollected && <div className={styles.newEndingBadge}>COLLECTED</div>}
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

                <a 
                    href="https://influencers.coupang.com/s/drumtong119" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className={styles.sponsorBanner}
                >
                    <div className={styles.sponsorIcon}>💖</div>
                    <div className={styles.sponsorText}>
                        <strong>게임이 유익하셨나요?</strong>
                        <span>클릭 한 번으로 제작자를 응원해주세요 (쿠팡 방문)</span>
                    </div>
                </a>
            </div>
        </div>
    );
}
