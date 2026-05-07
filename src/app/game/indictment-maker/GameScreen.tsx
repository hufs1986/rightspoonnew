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
    lastDefense?: DefenseAction | null;
    turnPhase: "show_dialogue" | "show_attack" | "pick_defense" | "apply_defense" | "idle";
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
    lastDefense,
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
        <div className={`${styles.gameContainer} ${isCancelHigh ? styles["gameContainer--alarm"] : ""} ${screenShake ? styles["gameContainer--shake"] : ""}`}
             style={{ height: '100dvh', display: 'flex', flexDirection: 'column', overflow: 'hidden', paddingBottom: 0 }}
        >
            {/* Screen flash overlay */}
            {flashColor && (
                <div className={styles.screenFlash} style={{ background: flashColor }} />
            )}

            {/* === COMPACT HUD === */}
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

            {/* === COMPACT STATS (horizontal inline) === */}
            <div style={{ display: 'flex', gap: '8px', padding: '6px 12px', background: 'rgba(9,11,20,0.9)', flexWrap: 'wrap', justifyContent: 'center', fontSize: '0.75rem' }}>
                {STAT_ORDER.map((key) => {
                    const info = STAT_LABELS[key];
                    const val = stats[key];
                    const tone = getStatTone(key, val);
                    const color = tone === "good" ? "#5ee28d" : tone === "warning" ? "#ffd166" : tone === "danger" ? "#ff6b6b" : "#70a2ff";
                    return (
                        <span key={key} style={{ color, fontWeight: 700 }}>
                            {info.emoji} {info.label} {val}
                        </span>
                    );
                })}
            </div>

            {/* Cancel Critical Warning */}
            {isCancelCritical && (
                <div className={styles.criticalWarning} style={{ margin: '0', padding: '6px 12px', fontSize: '0.78rem' }}>
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
                <div className={styles.energyWarning} style={{ margin: '0 12px', padding: '6px 10px', fontSize: '0.75rem' }}>
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

            {/* === CARD AREA (fills remaining space, scrolls internally) === */}
            {showDefenseActions && (
                <div style={{ flex: 1, overflow: 'auto', padding: '8px 12px', WebkitOverflowScrolling: 'touch' }}>
                    <div className={styles.vnActionsTitle} style={{ marginBottom: '10px' }}>
                        🃏 덱에서 4장을 뽑았습니다 — 카드를 선택하세요
                    </div>
                    <div className={styles.vnActionsGrid}>
                        {(currentHand || []).map((id) => {
                            const action = defenseActions.find(a => a.id === id);
                            if (!action) return null;

                            const isRest = action.id === "rest";
                            const onCooldown = action.cooldownLeft > 0;

                            return (
                                <button
                                    key={`${action.id}-${month}`}
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
                    
                    {/* 여론 결집 (Rest) 버튼 */}
                    {(() => {
                        const restAction = defenseActions.find(a => a.id === "rest");
                        if (!restAction) return null;
                        return (
                            <div style={{ marginTop: '10px', display: 'flex', justifyContent: 'center', paddingBottom: '20px' }}>
                                <button
                                    type="button"
                                    className={`${styles.vnActionBtn} ${styles["vnActionBtn--rest"]} ${!restAction.available ? styles["vnActionBtn--locked"] : ""}`}
                                    style={{ width: '100%', maxWidth: '400px', flexDirection: 'row', gap: '10px' }}
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

            {/* When not in defense phase, show empty space or reaction */}
            {!showDefenseActions && turnPhase !== "show_attack" && (
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
                    {turnPhase === "apply_defense" && lastDefense?.reactionText ? (
                        <div style={{
                            background: 'rgba(255, 68, 68, 0.1)',
                            border: '1px solid rgba(255, 68, 68, 0.4)',
                            borderRadius: '16px',
                            padding: '20px',
                            maxWidth: '400px',
                            width: '100%',
                            boxShadow: '0 10px 30px rgba(255, 0, 0, 0.15)',
                            animation: 'slideUpFade 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
                            position: 'relative'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                                <span style={{ fontSize: '1.5rem' }}>
                                    {lastDefense.reactionCharacter === "politician" ? "👔" : "👤"}
                                </span>
                                <span style={{ color: '#ff9999', fontWeight: 700, fontSize: '0.9rem' }}>
                                    {lastDefense.reactionCharacter === "politician" ? "정치 머신의 반응" : "여론의 반응"}
                                </span>
                            </div>
                            <div style={{
                                color: '#fff',
                                fontSize: '1rem',
                                lineHeight: '1.5',
                                fontStyle: 'italic',
                                textShadow: '0 2px 4px rgba(0,0,0,0.5)'
                            }}>
                                "{lastDefense.reactionText}"
                            </div>
                        </div>
                    ) : (
                        <div className={styles.phaseHint}>
                            정치 머신이 다음 공격을 준비하고 있습니다...
                        </div>
                    )}
                </div>
            )}

            {/* ===== ATTACK OVERLAY — shown during show_attack phase ===== */}
            {turnPhase === "show_attack" && pendingAttack && (
                <div className={styles.attackOverlay} onClick={handleDismissAttack}>
                    <div className={styles.attackOverlayCard} onClick={(e) => e.stopPropagation()}>
                        <div className={styles.attackOverlayLabel}>⚠️ 정치 머신의 공격</div>
                        <div className={styles.attackOverlayEmoji}>{pendingAttack.emoji}</div>
                        <h3 className={styles.attackOverlayTitle}>{pendingAttack.name}</h3>
                        <p className={styles.attackOverlayDesc}>{pendingAttack.description}</p>
                        
                        {/* 감정적 텍스트 */}
                        <div style={{
                            margin: '12px 0',
                            padding: '10px 14px',
                            background: 'rgba(255, 68, 68, 0.08)',
                            borderLeft: '3px solid rgba(255, 68, 68, 0.6)',
                            borderRadius: '0 8px 8px 0',
                            fontSize: '0.85rem',
                            lineHeight: '1.5',
                            color: '#ffcccc',
                            fontStyle: 'italic',
                        }}>
                            {pendingAttack.emotionalText}
                        </div>

                        {/* 피해자 목소리 */}
                        {pendingAttack.victimVoice && (
                            <div style={{
                                margin: '8px 0',
                                padding: '10px 14px',
                                background: 'rgba(255, 255, 255, 0.04)',
                                borderRadius: '8px',
                                fontSize: '0.8rem',
                                lineHeight: '1.5',
                                color: '#aab3d0',
                            }}>
                                <span style={{ fontSize: '0.7rem', color: '#888', display: 'block', marginBottom: '4px' }}>💬 피해자의 목소리</span>
                                &ldquo;{pendingAttack.victimVoice}&rdquo;
                            </div>
                        )}

                        <div className={styles.attackOverlayNews}>
                            📰 {pendingAttack.newsHeadline}
                        </div>
                        <div className={styles.attackOverlayEffects}>
                            <span className={styles.attackEffectBad}>🔴 공소취소 +{pendingAttack.cancelIncrease}</span>
                            <span className={styles.attackEffectBad}>🏛️ 민주주의 -{pendingAttack.democracyDamage}</span>
                        </div>
                        <button className={styles.attackOverlayBtn} onClick={handleDismissAttack}>
                            ✊ 맞서 싸우기 →
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
