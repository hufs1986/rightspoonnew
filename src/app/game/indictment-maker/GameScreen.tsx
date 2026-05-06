import { memo, useCallback, useEffect, useRef, useState } from "react";
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

type TurnPhase = "idle" | "attack_in" | "attack_show" | "defense_pick" | "result_show";

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
    const [turnPhase, setTurnPhase] = useState<TurnPhase>("defense_pick");
    const [showEvent, setShowEvent] = useState(false);
    const [prevStats, setPrevStats] = useState<GameStats>(stats);
    const [screenShake, setScreenShake] = useState(false);
    const [flashColor, setFlashColor] = useState<string | null>(null);
    const [statFlash, setStatFlash] = useState<Record<string, "up" | "down" | null>>({});
    const [lastActionName, setLastActionName] = useState<string>("");
    const [showAttackOverlay, setShowAttackOverlay] = useState(false);
    const prevMonthRef = useRef(month);
    const attackTimerRef = useRef<number | null>(null);

    // Detect stat changes and trigger animations
    useEffect(() => {
        const flashes: Record<string, "up" | "down" | null> = {};
        let hasChange = false;

        for (const key of STAT_ORDER) {
            if (stats[key] > prevStats[key]) {
                flashes[key] = "up";
                hasChange = true;
            } else if (stats[key] < prevStats[key]) {
                flashes[key] = "down";
                hasChange = true;
            } else {
                flashes[key] = null;
            }
        }

        if (hasChange) {
            setStatFlash(flashes);
            const timer = window.setTimeout(() => setStatFlash({}), 800);
            return () => clearTimeout(timer);
        }
    }, [stats, prevStats]);

    // Track month changes to show attack overlay
    useEffect(() => {
        if (month !== prevMonthRef.current && currentAttack) {
            prevMonthRef.current = month;
            setPrevStats(stats);
        }
    }, [month, currentAttack, stats]);

    // Show attack overlay when we get a new attack
    useEffect(() => {
        if (currentAttack && turnPhase === "defense_pick") {
            setShowAttackOverlay(true);
            setScreenShake(true);

            // Red flash for strong attacks
            if (currentAttack.cancelIncrease >= 7) {
                setFlashColor("rgba(255,50,50,0.15)");
            }

            attackTimerRef.current = window.setTimeout(() => {
                setScreenShake(false);
                setFlashColor(null);
            }, 600);

            return () => {
                if (attackTimerRef.current) clearTimeout(attackTimerRef.current);
            };
        }
    }, [currentAttack, turnPhase]);

    // Show event modal when there's a current event
    useEffect(() => {
        if (currentEvent && !showEvent) setShowEvent(true);
    }, [currentEvent, showEvent]);

    const handleDefend = useCallback((action: DefenseAction) => {
        setLastActionName(action.name);
        setPrevStats(stats);
        setShowAttackOverlay(false);

        // Green flash for defense
        setFlashColor("rgba(94,226,141,0.12)");
        setTimeout(() => setFlashColor(null), 400);

        onDefend(action);
    }, [onDefend, stats]);

    const handleDismissEvent = () => {
        setShowEvent(false);
        onDismissEvent();
    };

    const handleDismissAttack = () => {
        setShowAttackOverlay(false);
    };

    const progressPercent = ((month - 1) / MAX_MONTHS) * 100;
    const isEnergyLow = stats.energy <= 20;
    const isCancelHigh = stats.cancelProgress >= 70;
    const isCancelCritical = stats.cancelProgress >= 85;

    return (
        <div className={`${styles.gameContainer} ${isCancelHigh ? styles["gameContainer--alarm"] : ""} ${screenShake ? styles["gameContainer--shake"] : ""}`}>
            {/* Screen flash overlay */}
            {flashColor && (
                <div className={styles.screenFlash} style={{ background: flashColor }} />
            )}

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

                {/* Stats Bars */}
                <div className={styles.defenseStatsPanel}>
                    {STAT_ORDER.map((key) => {
                        const info = STAT_LABELS[key];
                        const val = stats[key];
                        const tone = getStatTone(key, val);
                        const color = tone === "good" ? "#5ee28d" : tone === "warning" ? "#ffd166" : tone === "danger" ? "#ff6b6b" : "#70a2ff";
                        const isCancel = key === "cancelProgress";
                        const flash = statFlash[key];
                        const diff = val - (prevStats[key] ?? val);

                        return (
                            <div key={key} className={`${styles.defenseStatItem} ${isCancel && isCancelHigh ? styles["defenseStatItem--danger"] : ""} ${flash ? styles[`defenseStatItem--${flash}`] : ""}`}>
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
                                {/* Stat change indicator */}
                                {flash && diff !== 0 && (
                                    <span className={`${styles.statDelta} ${flash === "up" ? styles["statDelta--up"] : styles["statDelta--down"]}`}>
                                        {diff > 0 ? `+${diff}` : diff}
                                    </span>
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* Cancel Progress Warning */}
                {isCancelCritical && (
                    <div className={styles.criticalWarning}>
                        🚨 공소취소 임박! 즉시 강력한 방어가 필요합니다!
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

                {/* Energy Warning */}
                {isEnergyLow && (
                    <div className={styles.energyWarning}>
                        <span className={styles.energyWarningIcon}>⚡</span>
                        <span>에너지 부족! &apos;힘 모으기&apos;로 회복하세요</span>
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
                                    onClick={() => handleDefend(action)}
                                    disabled={!action.available}
                                >
                                    <span className={styles.vnActionEmoji}>{action.emoji}</span>
                                    <div className={styles.vnActionInfo}>
                                        <div className={styles.vnActionName}>{action.name}</div>
                                        <div className={styles.vnActionPhase}>
                                            {isRest ? "⚡ +18 에너지" : `⚡ -${action.energyCost}`}
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

            {/* ===== ATTACK OVERLAY ===== */}
            {showAttackOverlay && currentAttack && (
                <div className={styles.attackOverlay} onClick={handleDismissAttack}>
                    <div className={styles.attackOverlayCard}>
                        <div className={styles.attackOverlayLabel}>⚠️ 정치 머신의 공격</div>
                        <div className={styles.attackOverlayEmoji}>{currentAttack.emoji}</div>
                        <h3 className={styles.attackOverlayTitle}>{currentAttack.name}</h3>
                        <p className={styles.attackOverlayDesc}>{currentAttack.description}</p>
                        <div className={styles.attackOverlayNews}>
                            📰 {currentAttack.newsHeadline}
                        </div>
                        <div className={styles.attackOverlayEffects}>
                            <span className={styles.attackEffectBad}>🔴 공소취소 +{currentAttack.cancelIncrease}</span>
                            <span className={styles.attackEffectBad}>🏛️ 민주주의 -{currentAttack.democracyDamage}</span>
                        </div>
                        <button className={styles.attackOverlayBtn} onClick={handleDismissAttack}>
                            방어 행동 선택하기 →
                        </button>
                    </div>
                </div>
            )}

            {/* ===== EVENT MODAL ===== */}
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
