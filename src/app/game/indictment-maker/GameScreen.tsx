import { memo, useMemo, useState } from "react";
import DialogueSystem from "./DialogueSystem";
import GameOverlay from "./GameOverlay";
import StoreCta from "./StoreCta";
import { ACTION_DIALOGUES, EVENT_DIALOGUES, BG_IMAGES } from "./dialogueData";
import { GAME_ACTIONS, TRIALS, type GameAction, type GameStats, type RandomEvent } from "./gameData";
import type { EventForecast } from "./gameReducer";
import { getStatTone, MILESTONE_STAGES, STAT_LABELS } from "./gameLogic";
import styles from "./game.module.css";

interface GameScreenProps {
    actions: GameAction[];
    characterEmoji: string;
    characterLevel: number;
    characterName: string;
    currentEvent: RandomEvent | null;
    eventForecast: EventForecast[];
    month: number;
    recentActions: string[];
    newsHistory: string[];
    onAction: (action: GameAction) => void;
    onDismissEvent: () => void;
    stats: GameStats;
    trialsCancelled: boolean;
    hasSavedGame: boolean;
    milestones: string[];
    isActionDone: (action: GameAction) => boolean;
    isActionLocked: (action: GameAction) => boolean;
}

type OverlayState =
    | { type: "education"; actionId: string }
    | { type: "trial"; trialId: number }
    | { type: "cancel_confirm"; step: number };

// Key stats to show in mini bar
const MINI_STATS: { key: keyof GameStats; label: string; emoji: string }[] = [
    { key: "lawRule", label: "법치주의", emoji: "⚖️" },
    { key: "publicTrust", label: "국민신뢰", emoji: "👥" },
    { key: "cancelProgress", label: "공소취소", emoji: "🔴" },
    { key: "regimeShield", label: "정권방탄", emoji: "🛡️" },
];

// Determine background for current game state
function getSceneBackground(milestones: string[], month: number): string {
    const ms = new Set(milestones);
    if (ms.has("prosecution_seized") || ms.has("counsel_appointed")) return BG_IMAGES.courtroom;
    if (ms.has("bill_passed") || ms.has("investigation_launched")) return BG_IMAGES.parliament;
    if (month > 20) return BG_IMAGES.parliament;
    return BG_IMAGES.courtroom;
}

function GameScreenComponent({
    actions,
    characterEmoji,
    characterLevel,
    characterName,
    currentEvent,
    eventForecast,
    month,
    recentActions,
    newsHistory,
    onAction,
    onDismissEvent,
    stats,
    trialsCancelled,
    hasSavedGame,
    milestones,
    isActionDone,
    isActionLocked,
}: GameScreenProps) {
    const [overlay, setOverlay] = useState<OverlayState | null>(null);
    const [activeDialogue, setActiveDialogue] = useState<string | null>(null);
    const [showDetails, setShowDetails] = useState(false);
    const [seenDialogues, setSeenDialogues] = useState<Set<string>>(new Set());

    const bgUrl = getSceneBackground(milestones, month);
    const isLawRuleAlarm = stats.lawRule <= 30 && !trialsCancelled;
    const completedStages = new Set(milestones);

    // Latest action for character display
    const latestActionId = recentActions[recentActions.length - 1] ?? null;
    const latestAction = latestActionId ? GAME_ACTIONS.find((a) => a.id === latestActionId) ?? null : null;

    const handleAction = (action: GameAction) => {
        if (action.id === "cancel_indictment") {
            setOverlay({ type: "cancel_confirm", step: 1 });
            return;
        }

        onAction(action);

        // Show VN dialogue only the FIRST time an action is used (reduce fatigue)
        // cancel_indictment always shows (handled separately above)
        if (ACTION_DIALOGUES[action.id] && !seenDialogues.has(action.id)) {
            setSeenDialogues((prev) => new Set(prev).add(action.id));
            setActiveDialogue(action.id);
        }
    };

    const confirmCancelAction = () => {
        const action = actions.find((a) => a.id === "cancel_indictment");
        if (action) {
            setOverlay(null);
            onAction(action);
            if (ACTION_DIALOGUES[action.id]) {
                setActiveDialogue(action.id);
            }
        }
    };

    const handleDialogueComplete = () => {
        setActiveDialogue(null);
    };

    // Handle event dialogue
    const handleEventDialogue = () => {
        if (currentEvent) {
            const seq = EVENT_DIALOGUES[currentEvent.id];
            if (seq) {
                setActiveDialogue(`event:${currentEvent.id}`);
                return;
            }
        }
        onDismissEvent();
    };

    const activeOverlay = useMemo(() => {
        if (overlay) return overlay;
        if (currentEvent && !activeDialogue) return { type: "event", event: currentEvent } as const;
        return null;
    }, [currentEvent, overlay, activeDialogue]);

    // If dialogue is active, show VN dialogue system
    if (activeDialogue) {
        const isEvent = activeDialogue.startsWith("event:");
        const dialogueId = isEvent ? activeDialogue.slice(6) : activeDialogue;
        const seq = isEvent ? EVENT_DIALOGUES[dialogueId] : ACTION_DIALOGUES[dialogueId];

        if (seq) {
            return (
                <div className={styles.gameContainer}>
                    <DialogueSystem
                        sequence={seq}
                        onComplete={() => {
                            handleDialogueComplete();
                            if (isEvent) onDismissEvent();
                        }}
                    />
                </div>
            );
        }
    }

    return (
        <div className={`${styles.gameContainer} ${isLawRuleAlarm ? styles["gameContainer--alarm"] : ""}`}>
            <div className={styles.vnGameLayout}>
                {/* Mini HUD */}
                <div className={styles.vnHud}>
                    <div className={styles.vnHudLeft}>
                        <span className={styles.vnHudMonth}>{month}/60</span>
                    </div>
                    <div className={styles.vnHudCenter}>
                        <span className={styles.vnHudEmoji}>{characterEmoji}</span>
                        <span className={styles.vnHudName}>{characterName}</span>
                    </div>
                    <div className={styles.vnHudRight}>
                        <span className={styles.vnHudProgress}>{stats.cancelProgress}%</span>
                        {hasSavedGame && <span className={styles.vnHudSave}>💾</span>}
                    </div>
                </div>

                {/* Visual Scene Area */}
                <div className={styles.vnSceneArea}>
                    {bgUrl && (
                        <div className={styles.vnSceneBg} style={{ backgroundImage: `url(${bgUrl})` }} />
                    )}
                    <div className={styles.vnSceneOverlay} />

                    {/* Character in scene */}
                    <div className={styles.vnSceneChars}>
                        {latestAction && (
                            <img
                                src={
                                    latestAction.phase >= 4 ? "/game/judge.png"
                                    : latestAction.id === "do_nothing" ? "/game/citizen.png"
                                    : "/game/politician.png"
                                }
                                alt="character"
                                className={styles.vnSceneCharImg}
                            />
                        )}
                    </div>

                    {/* Stage progress overlay */}
                    <div style={{ position: "relative", zIndex: 5, padding: "12px 16px" }}>
                        <div style={{ display: "flex", gap: "4px", justifyContent: "center" }}>
                            {MILESTONE_STAGES.map((stage) => {
                                const done = completedStages.has(stage.id);
                                return (
                                    <div
                                        key={stage.id}
                                        style={{
                                            padding: "4px 8px",
                                            borderRadius: "8px",
                                            fontSize: "0.7rem",
                                            background: done ? "rgba(94,226,141,0.15)" : "rgba(255,255,255,0.05)",
                                            border: `1px solid ${done ? "rgba(94,226,141,0.3)" : "rgba(255,255,255,0.08)"}`,
                                            color: done ? "#b6f5ca" : "rgba(255,255,255,0.3)",
                                        }}
                                    >
                                        {stage.emoji}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* News ticker */}
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

                {/* Mini Stats Bar */}
                <div className={styles.vnStatsBar}>
                    {MINI_STATS.map(({ key, label, emoji }) => {
                        const val = stats[key];
                        const tone = getStatTone(key, val);
                        const color = tone === "good" ? "#5ee28d" : tone === "warning" ? "#ffd166" : tone === "danger" ? "#ff6b6b" : "#70a2ff";
                        return (
                            <div key={key} className={styles.vnStatMini}>
                                <div className={styles.vnStatMiniLabel}>{emoji} {label}</div>
                                <div className={styles.vnStatMiniBar}>
                                    <div className={styles.vnStatMiniFill} style={{ width: `${val}%`, background: color }} />
                                </div>
                                <div className={styles.vnStatMiniValue} style={{ color }}>{val}</div>
                            </div>
                        );
                    })}
                </div>

                {/* Details toggle - shows full stats, trials, etc */}
                <div className={styles.vnDetailsToggle}>
                    <button className={styles.vnDetailsBtn} onClick={() => setShowDetails(!showDetails)}>
                        {showDetails ? "△ 상세 접기" : "▽ 상세 보기 (스탯/재판파일)"}
                    </button>
                </div>

                {showDetails && (
                    <>
                        <section className={styles.statsPanel} aria-label="게임 수치">
                            {(Object.entries(STAT_LABELS) as [keyof GameStats, (typeof STAT_LABELS)[keyof GameStats]][]).map(
                                ([key, info]) => (
                                    <div key={key} className={styles.statItem}>
                                        <span className={styles.statLabel}>{info.emoji} {info.label}</span>
                                        <div className={styles.statBarOuter}>
                                            <div
                                                className={`${styles.statBarInner} ${styles[`statTone--${getStatTone(key, stats[key])}`]}`}
                                                style={{ width: `${stats[key]}%` }}
                                            />
                                        </div>
                                        <span className={styles.statValue}>{stats[key]}</span>
                                    </div>
                                ),
                            )}
                        </section>

                        <section className={styles.trialsPanel} aria-label="재판 목록">
                            <div className={styles.trialsHeader}>
                                <span className={styles.trialsTitle}>📂 기밀 사건 파일</span>
                            </div>
                            <div className={styles.trialsScroll}>
                                {TRIALS.map((trial) => (
                                    <button
                                        type="button"
                                        key={trial.id}
                                        className={`${styles.trialDossierTab} ${trialsCancelled ? styles["trialDossierTab--cancelled"] : ""}`}
                                        onClick={() => setOverlay({ type: "trial", trialId: trial.id })}
                                    >
                                        <span className={styles.dossierBadge}>TOP SECRET</span>
                                        <div className={styles.dossierTitle}>{trial.emoji} {trial.name}</div>
                                    </button>
                                ))}
                            </div>
                        </section>

                        <section className={styles.storeCtaSection}>
                            <StoreCta variant="inGame" />
                        </section>
                    </>
                )}

                {/* Action Selection - VN style choices */}
                <div className={styles.vnActionsPanel}>
                    <div className={styles.vnActionsTitle}>🎯 이번 달 행동을 선택하세요</div>
                    <div className={styles.vnActionsGrid}>
                        {actions.map((action) => {
                            const locked = isActionLocked(action);
                            const done = isActionDone(action);
                            const isFinal = action.id === "cancel_indictment" && !locked;

                            return (
                                <button
                                    key={action.id}
                                    type="button"
                                    className={`${styles.vnActionBtn} ${locked ? styles["vnActionBtn--locked"] : ""} ${done ? styles["vnActionBtn--done"] : ""} ${isFinal ? styles["vnActionBtn--final"] : ""}`}
                                    onClick={() => handleAction(action)}
                                    disabled={locked}
                                >
                                    <span className={styles.vnActionEmoji}>{action.emoji}</span>
                                    <div className={styles.vnActionInfo}>
                                        <div className={styles.vnActionName}>
                                            {action.name}
                                            {done && " ✓"}
                                        </div>
                                        <div className={styles.vnActionPhase}>
                                            PHASE {action.phase}
                                            {locked && " · 🔒 잠김"}
                                        </div>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            <GameOverlay
                actions={actions}
                overlay={activeOverlay}
                onClose={() => {
                    if (overlay) { setOverlay(null); return; }
                    // For events, try VN dialogue first
                    if (currentEvent) {
                        const seq = EVENT_DIALOGUES[currentEvent.id];
                        if (seq) {
                            setActiveDialogue(`event:${currentEvent.id}`);
                            return;
                        }
                    }
                    onDismissEvent();
                }}
                onConfirmCancel={confirmCancelAction}
                onNextCancelStep={() =>
                    setOverlay((current) =>
                        current?.type === "cancel_confirm"
                            ? { type: "cancel_confirm", step: current.step + 1 }
                            : current,
                    )
                }
                trialsCancelled={trialsCancelled}
            />
        </div>
    );
}

const GameScreen = memo(GameScreenComponent);
export default GameScreen;
