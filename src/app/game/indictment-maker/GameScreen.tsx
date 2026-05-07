import { memo, useCallback, useEffect, useRef, useState } from "react";
import { MAX_MONTHS, type DefenseAction, type GameStats, type PoliticalAttack, type RandomEvent } from "./gameData";
import { getStatTone, STAT_LABELS } from "./gameLogic";
import { ACTION_EDUCATION } from "./educationData";
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
                            position: 'absolute',
                            top: '50%',
                            left: 0,
                            right: 0,
                            transform: 'translateY(-50%)',
                            background: 'rgba(0, 0, 0, 0.85)',
                            borderTop: '2px solid #d32f2f',
                            borderBottom: '2px solid #d32f2f',
                            padding: '40px 20px',
                            zIndex: 50,
                            boxShadow: '0 10px 40px rgba(0,0,0,0.8), inset 0 0 20px rgba(211, 47, 47, 0.15)',
                            animation: 'slideInRight 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                                <span style={{ color: '#d32f2f', fontWeight: 900, fontSize: '0.85rem', letterSpacing: '2px' }}>
                                    [ 권력의 묵살 ]
                                </span>
                            </div>
                            <div style={{
                                color: '#ffffff',
                                fontSize: '1.2rem',
                                lineHeight: '1.6',
                                fontStyle: 'italic',
                                textAlign: 'center',
                                textShadow: '0 2px 10px rgba(0,0,0,0.8)',
                                wordBreak: 'keep-all',
                                maxWidth: '80%'
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
                <div className={styles.attackOverlay} onClick={handleDismissAttack} style={{ background: 'rgba(10, 0, 0, 0.92)' }}>
                    <div className={styles.attackOverlayCard} onClick={(e) => e.stopPropagation()} style={{ 
                        border: '1px solid #ff3333', 
                        boxShadow: '0 0 50px rgba(255, 0, 0, 0.25)',
                        padding: '30px 20px',
                        background: 'linear-gradient(180deg, #1a0505 0%, #0a0000 100%)',
                        display: 'flex',
                        flexDirection: 'column',
                        maxHeight: '90vh',
                        overflowY: 'auto'
                    }}>
                        <div style={{ color: '#ff4444', fontWeight: 900, fontSize: '1.1rem', letterSpacing: '3px', textAlign: 'center', marginBottom: '16px' }}>
                            [ 헌정 위기 발생 ]
                        </div>
                        <h3 style={{ fontSize: '1.6rem', color: '#ffffff', textAlign: 'center', marginBottom: '12px', wordBreak: 'keep-all', lineHeight: '1.3' }}>
                            {pendingAttack.name}
                        </h3>
                        <p style={{ color: '#ffaaaa', textAlign: 'center', marginBottom: '24px', fontSize: '0.95rem' }}>
                            {pendingAttack.description}
                        </p>
                        
                        {pendingAttack.educationKey && ACTION_EDUCATION[pendingAttack.educationKey] && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
                                {/* 헌법적 문제점 */}
                                <div style={{ background: 'rgba(255,255,255,0.05)', padding: '16px', borderRadius: '8px', borderLeft: '4px solid #d32f2f' }}>
                                    <div style={{ color: '#d32f2f', fontSize: '0.8rem', fontWeight: 700, marginBottom: '8px', letterSpacing: '1px' }}>⚖️ 무엇이 문제인가</div>
                                    <div style={{ color: '#e0e0e0', fontSize: '0.95rem', lineHeight: '1.6', wordBreak: 'keep-all' }}>
                                        {ACTION_EDUCATION[pendingAttack.educationKey].legalComment}
                                    </div>
                                </div>
                                
                                {/* 역사적 전례 */}
                                {ACTION_EDUCATION[pendingAttack.educationKey].historicalNote && (
                                    <div style={{ background: 'rgba(255,255,255,0.03)', padding: '16px', borderRadius: '8px', borderLeft: '4px solid #8b949e' }}>
                                        <div style={{ color: '#8b949e', fontSize: '0.8rem', fontWeight: 700, marginBottom: '8px', letterSpacing: '1px' }}>📜 역사적 전례</div>
                                        <div style={{ color: '#c9d1d9', fontSize: '0.9rem', lineHeight: '1.6', wordBreak: 'keep-all' }}>
                                            {ACTION_EDUCATION[pendingAttack.educationKey].historicalNote}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        <div className={styles.attackOverlayEffects} style={{ borderTop: '1px solid #333', paddingTop: '20px', marginTop: 'auto', display: 'flex', justifyContent: 'center' }}>
                            <span className={styles.attackEffectBad} style={{ background: 'rgba(255,0,0,0.2)', color: '#ff8888', border: '1px solid rgba(255,0,0,0.4)' }}>
                                🔴 사법 붕괴 임계점 +{pendingAttack.cancelIncrease}
                            </span>
                        </div>
                        <button className={styles.attackOverlayBtn} onClick={handleDismissAttack} style={{ background: '#d32f2f', color: 'white', marginTop: '20px', fontSize: '1.1rem', padding: '16px' }}>
                            상황 직시 및 대응하기
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
