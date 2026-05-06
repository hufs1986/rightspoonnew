import { memo, useState } from "react";
import { MAX_MONTHS, type DefenseAction, type GameStats, type PoliticalAttack, type RandomEvent } from "./gameData";
import { getStatTone, STAT_LABELS } from "./gameLogic";
import ModalShell from "./ModalShell";
import styles from "./game.module.css";

interface DefenseActionWithMeta extends DefenseAction {
    available: boolean;
    cooldownLeft: number;
}

interface GameScreenProps {
    defenseActions: DefenseActionWithMeta[];
    currentEvent: RandomEvent | null;
    currentAttack: PoliticalAttack | null;
    month: number;
    recentDefenses: string[];
    newsHistory: string[];
    onDefend: (action: DefenseAction) => void;
    onDismissEvent: () => void;
    stats: GameStats;
    exhaustedTurns: number;
}

const STAT_ORDER: (keyof GameStats)[] = ["cancelProgress", "energy", "awareness", "democracy"];

function GameScreenComponent({
    defenseActions,
    currentEvent,
    currentAttack,
    month,
    newsHistory,
    onDefend,
    onDismissEvent,
    stats,
    exhaustedTurns,
}: GameScreenProps) {
    const [showEvent, setShowEvent] = useState(false);

    // Show event modal when there's a current event
    const handleDismissEvent = () => {
        setShowEvent(false);
        onDismissEvent();
    };

    // Show event after render if there's one
    if (currentEvent && !showEvent) {
        setShowEvent(true);
    }

    const progressPercent = ((month - 1) / MAX_MONTHS) * 100;
    const isEnergyLow = stats.energy <= 20;
    const isCancelHigh = stats.cancelProgress >= 70;

    return (
        <div className={`${styles.gameContainer} ${isCancelHigh ? styles["gameContainer--alarm"] : ""}`}>
            <div className={styles.vnGameLayout}>
                {/* HUD */}
                <div className={styles.vnHud}>
                    <div className={styles.vnHudLeft}>
                        <span className={styles.vnHudMonth}>{month}/{MAX_MONTHS}</span>
                    </div>
                    <div className={styles.vnHudCenter}>
                        <span className={styles.vnHudEmoji}>⚖️</span>
                        <span className={styles.vnHudName}>공소취소 방어전</span>
                    </div>
                    <div className={styles.vnHudRight}>
                        {exhaustedTurns > 0 && (
                            <span className={styles.exhaustedBadge}>⚠️ 소진 {exhaustedTurns}/5</span>
                        )}
                    </div>
                </div>

                {/* Progress Bar */}
                <div className={styles.defenseProgressBar}>
                    <div className={styles.defenseProgressFill} style={{ width: `${progressPercent}%` }} />
                    <span className={styles.defenseProgressLabel}>
                        {month <= MAX_MONTHS ? `${MAX_MONTHS - month + 1}개월 남음` : "완료!"}
                    </span>
                </div>

                {/* Political Attack Banner */}
                {currentAttack && (
                    <div className={styles.attackBanner}>
                        <div className={styles.attackBannerIcon}>{currentAttack.emoji}</div>
                        <div className={styles.attackBannerContent}>
                            <div className={styles.attackBannerLabel}>🔴 정치 머신의 공격</div>
                            <div className={styles.attackBannerTitle}>{currentAttack.name}</div>
                            <div className={styles.attackBannerDesc}>{currentAttack.description}</div>
                        </div>
                    </div>
                )}

                {/* News Ticker */}
                {newsHistory.length > 0 && (
                    <div className={styles.vnNewsTicker}>
                        <div className={styles.newsTickerBar}>
                            <div className={styles.newsLabel}>🔴 BREAKING</div>
                            <div className={styles.newsMarquee}>
                                <div className={styles.newsMarqueeTrack}>
                                    <span className={styles.newsMarqueeItem}>{newsHistory[0]}</span>
                                    <span className={styles.newsMarqueeDivider}>•</span>
                                    <span className={styles.newsMarqueeItem}>{newsHistory[0]}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Stats Bars */}
                <div className={styles.defenseStatsPanel}>
                    {STAT_ORDER.map((key) => {
                        const info = STAT_LABELS[key];
                        const val = stats[key];
                        const tone = getStatTone(key, val);
                        const color = tone === "good" ? "#5ee28d" : tone === "warning" ? "#ffd166" : tone === "danger" ? "#ff6b6b" : "#70a2ff";
                        const isCancel = key === "cancelProgress";

                        return (
                            <div key={key} className={`${styles.defenseStatItem} ${isCancel && isCancelHigh ? styles["defenseStatItem--danger"] : ""}`}>
                                <div className={styles.defenseStatLabel}>
                                    {info.emoji} {info.label}
                                </div>
                                <div className={styles.defenseStatBar}>
                                    <div
                                        className={styles.defenseStatFill}
                                        style={{
                                            width: `${val}%`,
                                            background: isCancel
                                                ? `linear-gradient(90deg, #ff6b6b, #ff3333)`
                                                : color,
                                        }}
                                    />
                                </div>
                                <div className={styles.defenseStatValue} style={{ color }}>
                                    {val}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Energy Warning */}
                {isEnergyLow && (
                    <div className={styles.phaseHint} style={{ background: "rgba(255,98,98,0.12)", borderColor: "rgba(255,98,98,0.3)", color: "#ffb3b3" }}>
                        ⚠️ 에너지가 부족합니다! '힘 모으기'로 회복하세요
                    </div>
                )}

                {/* Defense Actions */}
                <div className={styles.vnActionsPanel}>
                    <div className={styles.vnActionsTitle}>🛡️ 방어 행동을 선택하세요</div>
                    <div className={styles.vnActionsGrid}>
                        {defenseActions.map((action) => {
                            const isRest = action.id === "rest";
                            const onCooldown = action.cooldownLeft > 0;

                            return (
                                <button
                                    key={action.id}
                                    type="button"
                                    className={`${styles.vnActionBtn} ${!action.available ? styles["vnActionBtn--locked"] : ""} ${isRest ? styles["vnActionBtn--rest"] : ""}`}
                                    onClick={() => onDefend(action)}
                                    disabled={!action.available}
                                >
                                    <span className={styles.vnActionEmoji}>{action.emoji}</span>
                                    <div className={styles.vnActionInfo}>
                                        <div className={styles.vnActionName}>{action.name}</div>
                                        <div className={styles.vnActionPhase}>
                                            {isRest
                                                ? "⚡ +18 에너지"
                                                : `⚡ -${action.energyCost}`}
                                            {onCooldown && ` · ⏳ ${action.cooldownLeft}턴`}
                                            {!action.available && !onCooldown && !isRest && " · 에너지 부족"}
                                        </div>
                                        {!isRest && action.available && (
                                            <div className={styles.vnActionCosts}>
                                                {action.cancelReduction > 0 && (
                                                    <span className={styles.vnActionGain}>🔴-{action.cancelReduction}</span>
                                                )}
                                                {action.awarenessGain > 0 && (
                                                    <span className={styles.vnActionGain}>👁️+{action.awarenessGain}</span>
                                                )}
                                                {action.democracyGain > 0 && (
                                                    <span className={styles.vnActionGain}>🏛️+{action.democracyGain}</span>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Event Modal */}
            {currentEvent && showEvent && (
                <ModalShell
                    className={`${styles.eduModal} ${currentEvent.isPositive ? styles["eduModal--positive"] : styles["eduModal--negative"]}`}
                    labelledBy="event-modal"
                    onClose={handleDismissEvent}
                >
                    <div className={styles.eventEmoji}>{currentEvent.isPositive ? "🌟" : "⚡"}</div>
                    <h3 className={styles.eventTitle} id="event-modal">
                        {currentEvent.isPositive ? "긍정적 이벤트!" : "부정적 이벤트!"}
                    </h3>
                    <div className={styles.eventSubtitle}>{currentEvent.title}</div>
                    <p className={styles.eduText}>{currentEvent.description}</p>
                    <div className={styles.eventEffects}>
                        {currentEvent.cancelEffect !== 0 && (
                            <span>🔴 공소취소 {currentEvent.cancelEffect > 0 ? "+" : ""}{currentEvent.cancelEffect}</span>
                        )}
                        {currentEvent.energyEffect !== 0 && (
                            <span>⚡ 에너지 {currentEvent.energyEffect > 0 ? "+" : ""}{currentEvent.energyEffect}</span>
                        )}
                        {currentEvent.awarenessEffect !== 0 && (
                            <span>👁️ 인식 {currentEvent.awarenessEffect > 0 ? "+" : ""}{currentEvent.awarenessEffect}</span>
                        )}
                    </div>
                    <button className={styles.eventBtn} onClick={handleDismissEvent}>확인</button>
                </ModalShell>
            )}
        </div>
    );
}

const GameScreen = memo(GameScreenComponent);
export default GameScreen;
