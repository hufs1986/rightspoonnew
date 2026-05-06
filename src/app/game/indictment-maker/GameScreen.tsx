import { memo, useCallback, useEffect, useRef, useState } from "react";
import { MAX_MONTHS, type DefenseAction, type GameStats, type PoliticalAttack, type RandomEvent } from "./gameData";
import { getStatTone, STAT_LABELS } from "./gameLogic";
import { initAudio, playSfx } from "./audioUtils";
import ModalShell from "./ModalShell";
import styles from "./game.module.css";

interface DefenseActionWithMeta extends DefenseAction {
    available: boolean;
    cooldownLeft: number;
}

interface GameScreenProps {
    defenseActions: DefenseActionWithMeta[];
    currentEvent: RandomEvent | null;
    pendingAttack: PoliticalAttack | null;
    turnPhase: "show_dialogue" | "show_attack" | "pick_defense" | "idle";
    month: number;
    recentDefenses: string[];
    newsHistory: string[];
    onDefend: (action: DefenseAction) => void;
    onDismissAttack: () => void;
    onDismissEvent: () => void;
    stats: GameStats;
    exhaustedTurns: number;
    currentHand: string[];
}

const STAT_ORDER: (keyof GameStats)[] = ["cancelProgress", "energy", "awareness", "democracy"];

function GameScreenComponent({
    defenseActions,
    currentEvent,
    pendingAttack,
    turnPhase,
    month,
    newsHistory,
    onDefend,
    onDismissAttack,
    onDismissEvent,
    stats,
    exhaustedTurns,
    currentHand,
}: GameScreenProps) {
    const [prevStats, setPrevStats] = useState<GameStats>(stats);
    const [screenShake, setScreenShake] = useState(false);
    const [flashColor, setFlashColor] = useState<string | null>(null);
    const [statFlash, setStatFlash] = useState<Record<string, "up" | "down" | null>>({});
    const [showEventModal, setShowEventModal] = useState(false);
    const prevStatsRef = useRef(stats);

    // Detect stat changes → trigger animations
    useEffect(() => {
        const prev = prevStatsRef.current;
        const flashes: Record<string, "up" | "down" | null> = {};
        let hasChange = false;

        for (const key of STAT_ORDER) {
            if (stats[key] > prev[key]) {
                flashes[key] = "up";
                hasChange = true;
            } else if (stats[key] < prev[key]) {
                flashes[key] = "down";
                hasChange = true;
            } else {
                flashes[key] = null;
            }
        }

        if (hasChange) {
            setPrevStats(prev);
            setStatFlash(flashes);
            const timer = window.setTimeout(() => setStatFlash({}), 900);
            return () => clearTimeout(timer);
        }

        prevStatsRef.current = stats;
    }, [stats]);

    // Update prevStatsRef after flash animation
    useEffect(() => {
        const timer = window.setTimeout(() => {
            prevStatsRef.current = stats;
        }, 1000);
        return () => clearTimeout(timer);
    }, [stats]);

    // Screen shake when attack overlay appears
    useEffect(() => {
        if (turnPhase === "show_attack" && pendingAttack) {
            setScreenShake(true);
            playSfx("hit");

            if (pendingAttack.cancelIncrease >= 7) {
                setFlashColor("rgba(255,50,50,0.2)");
            } else {
                setFlashColor("rgba(255,50,50,0.1)");
            }

            const timer = window.setTimeout(() => {
                setScreenShake(false);
                setFlashColor(null);
            }, 700);
            return () => clearTimeout(timer);
        }
    }, [turnPhase, pendingAttack]);

    // Show event modal
    useEffect(() => {
        if (currentEvent) setShowEventModal(true);
    }, [currentEvent]);

    const handleDefend = useCallback((action: DefenseAction) => {
        initAudio();
        playSfx("defend");
        // Green flash for defense
        setFlashColor("rgba(94,226,141,0.15)");
        setTimeout(() => setFlashColor(null), 500);
        onDefend(action);
    }, [onDefend]);

    const handleDismissEvent = () => {
        initAudio();
        playSfx("click");
        setShowEventModal(false);
        onDismissEvent();
    };

    const handleDismissAttack = () => {
        initAudio();
        playSfx("click");
        onDismissAttack();
    };

    const progressPercent = ((month - 1) / MAX_MONTHS) * 100;
    const isEnergyLow = stats.energy <= 20;
    const isCancelHigh = stats.cancelProgress >= 70;
    const isCancelCritical = stats.cancelProgress >= 85;
    const showDefenseActions = turnPhase === "pick_defense";

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
                        const prev = prevStats[key] ?? val;
                        const diff = val - prev;

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
                                {flash && diff !== 0 && (
                                    <span className={`${styles.statDelta} ${flash === "up" ? styles["statDelta--up"] : styles["statDelta--down"]}`}>
                                        {diff > 0 ? `+${diff}` : diff}
                                    </span>
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* Cancel Critical Warning */}
                {isCancelCritical && (
                    <div className={styles.criticalWarning}>
                        🚨 재판 회피 임박! 강력한 심판 촉구가 필요합니다!
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
                        <span>에너지 부족! &apos;여론 결집&apos;으로 회복하세요</span>
                    </div>
                )}

                {/* Waiting for attack message */}
                {turnPhase === "show_attack" && !pendingAttack && (
                    <div className={styles.phaseHint}>
                        정치 머신이 다음 공격을 준비하고 있습니다...
                    </div>
                )}

                {/* Defense Actions - only visible during pick_defense phase */}
                {showDefenseActions && (
                    <div className={styles.vnActionsPanel}>
                        <div className={styles.vnActionsTitle}>⚖️ 심판을 위한 행동 카드 (무작위 4장 드로우)</div>
                        <div className={styles.vnActionsGrid}>
                            {(currentHand || []).map((id, index) => {
                                const action = defenseActions.find(a => a.id === id);
                                if (!action) return null;

                                const isRest = action.id === "rest";
                                const onCooldown = action.cooldownLeft > 0;

                                return (
                                    <button
                                        key={`${action.id}-${month}`} // month를 키에 넣어 턴마다 애니메이션 재실행
                                        type="button"
                                        className={`${styles.vnActionBtn} ${!action.available ? styles["vnActionBtn--locked"] : ""} ${isRest ? styles["vnActionBtn--rest"] : ""}`}
                                        onClick={() => handleDefend(action)}
                                        disabled={!action.available}
                                    >
                                        <span className={styles.vnActionEmoji}>{action.emoji}</span>
                                        <div className={styles.vnActionInfo}>
                                            <div className={styles.vnActionName}>{action.name}</div>
                                            <div className={styles.vnActionPhase}>
                                                {isRest ? "⚡ +30 에너지" : `⚡ -${action.energyCost}`}
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
                        
                        {/* 여론 결집 (Rest) 버튼을 항상 하단에 고정 배치 */}
                        {(() => {
                            const restAction = defenseActions.find(a => a.id === "rest");
                            if (!restAction) return null;
                            return (
                                <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'center' }}>
                                    <button
                                        type="button"
                                        className={`${styles.vnActionBtn} ${!restAction.available ? styles["vnActionBtn--locked"] : ""}`}
                                        style={{ width: '100%', maxWidth: '400px' }}
                                        onClick={() => handleDefend(restAction)}
                                        disabled={!restAction.available}
                                    >
                                        <span className={styles.vnActionEmoji}>{restAction.emoji}</span>
                                        <div className={styles.vnActionInfo}>
                                            <div className={styles.vnActionName}>{restAction.name}</div>
                                            <div className={styles.vnActionPhase}>⚡ +30 에너지 회복 (턴 소모)</div>
                                        </div>
                                    </button>
                                </div>
                            );
                        })()}
                    </div>
                )}
            </div>

            {/* ===== ATTACK OVERLAY — shown during show_attack phase ===== */}
            {turnPhase === "show_attack" && pendingAttack && (
                <div className={styles.attackOverlay} onClick={handleDismissAttack}>
                    <div className={styles.attackOverlayCard} onClick={(e) => e.stopPropagation()}>
                        <div className={styles.attackOverlayLabel}>⚠️ 정치 머신의 공격</div>
                        <div className={styles.attackOverlayEmoji}>{pendingAttack.emoji}</div>
                        <h3 className={styles.attackOverlayTitle}>{pendingAttack.name}</h3>
                        <p className={styles.attackOverlayDesc}>{pendingAttack.description}</p>
                        <div className={styles.attackOverlayNews}>
                            📰 {pendingAttack.newsHeadline}
                        </div>
                        <div className={styles.attackOverlayEffects}>
                            <span className={styles.attackEffectBad}>🔴 공소취소 +{pendingAttack.cancelIncrease}</span>
                            <span className={styles.attackEffectBad}>🏛️ 민주주의 -{pendingAttack.democracyDamage}</span>
                        </div>
                        <button className={styles.attackOverlayBtn} onClick={handleDismissAttack}>
                            심판 촉구 행동 선택하기 →
                        </button>
                    </div>
                </div>
            )}

            {/* ===== EVENT MODAL ===== */}
            {currentEvent && showEventModal && (
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
