import type { GameEnding, GameStats } from "./gameData";
import styles from "./game.module.css";

interface EndingScreenProps {
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

export default function EndingScreen({ endingData, onRestart, onShare, stats }: EndingScreenProps) {
    return (
        <div className={styles.gameContainer}>
            <div className={styles.endingScreen}>
                <div className={styles.endingEmoji}>{endingData.emoji}</div>
                <div className={styles.endingLabel}>— ENDING —</div>
                <h2 className={styles.endingTitle}>{endingData.title}</h2>
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

                <div className={styles.endingActions}>
                    <button className={styles.restartBtn} onClick={onRestart}>
                        ↻ 다시 시작
                    </button>
                    <button className={styles.shareBtn} onClick={onShare}>
                        📤 결과 공유하기
                    </button>
                </div>
            </div>
        </div>
    );
}

