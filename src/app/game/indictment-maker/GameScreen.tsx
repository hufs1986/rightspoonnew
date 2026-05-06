import { memo, useMemo, useState } from "react";
import CitizenVoice from "./CitizenVoice";
import DialogueSystem from "./DialogueSystem";
import GameOverlay from "./GameOverlay";
import StoreCta from "./StoreCta";
import { ACTION_DIALOGUES, EVENT_DIALOGUES, BG_IMAGES } from "./dialogueData";
import { GAME_ACTIONS, TRIALS, type GameAction, type GameStats, type RandomEvent } from "./gameData";
import type { EventForecast } from "./gameReducer";
import { getStatTone, MILESTONE_STAGES, STAT_LABELS } from "./gameLogic";
import type { ImpactCounters } from "./impactData";
import styles from "./game.module.css";

interface GameScreenProps {
    actions: GameAction[];
    characterEmoji: string;
    characterLevel: number;
    characterName: string;
    citizenComment: string | null;
    currentEvent: RandomEvent | null;
    eventForecast: EventForecast[];
    hasSavedGame: boolean;
    impactCounters: ImpactCounters;
    isActionDone: (action: GameAction) => boolean;
    isActionLocked: (action: GameAction) => boolean;
    milestones: string[];
    month: number;
    newsHistory: string[];
    onAction: (action: GameAction) => void;
    onDismissEvent: () => void;
    onMidGameShare: () => void;
    recentActions: string[];
    stats: GameStats;
    trialsCancelled: boolean;
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

// Phase별 가이드 힌트
function getPhaseHint(milestones: string[], actions: GameAction[]): string | null {
    const ms = new Set(milestones);
    if (!ms.has("frame_established")) return "📌 먼저 '언론 프레임 구축'으로 여론전을 시작하세요";
    if (!ms.has("investigation_launched")) return "📌 프레임이 깔렸습니다. '국정조사 개회'를 진행하세요";
    if (!ms.has("report_adopted")) return "📌 증거를 확보했습니다. '조사결과보고서 채택'으로 넘어가세요";
    if (!ms.has("bill_passed")) return "📌 보고서가 준비됐습니다. '특검법'을 발의하고 통과시키세요";
    if (!ms.has("counsel_appointed")) return "📌 특검법이 통과됐습니다. 특검을 임명하세요";
    if (!ms.has("prosecution_seized")) return "📌 특검이 임명됐습니다. 공소유지권을 장악하세요";
    if (!ms.has("indictment_cancelled")) return "⚠️ 모든 준비가 끝났습니다. '공소취소 버튼'을 누르세요";
    return null;
}

// 액션 효과에서 핵심 2~3개만 추출
function getActionCostSummary(action: GameAction): { gains: string[]; costs: string[] } {
    const gains: string[] = [];
    const costs: string[] = [];
    const entries = Object.entries(action.effects) as [keyof GameStats, number][];
    for (const [key, val] of entries) {
        const info = STAT_LABELS[key];
        if (!info) continue;
        if (key === "cancelProgress" && val > 0) {
            gains.push(`🔴+${val}`);
        } else if (key === "regimeShield" && val > 0) {
            gains.push(`🛡️+${val}`);
        } else if (val < 0 && (key === "lawRule" || key === "publicTrust" || key === "judicialIndep" || key === "separation")) {
            costs.push(`${info.emoji}${val}`);
        }
    }
    return { gains: gains.slice(0, 2), costs: costs.slice(0, 2) };
}

function GameScreenComponent({
    actions,
    characterEmoji,
    characterLevel,
    characterName,
    citizenComment,
    currentEvent,
    eventForecast,
    hasSavedGame,
    impactCounters,
    isActionDone,
    isActionLocked,
    milestones,
    month,
    newsHistory,
    onAction,
    onDismissEvent,
    onMidGameShare,
    recentActions,
    stats,
    trialsCancelled,
}: GameScreenProps) {
    const [overlay, setOverlay] = useState<OverlayState | null>(null);
    const [activeDialogue, setActiveDialogue] = useState<string | null>(null);
    const [showDetails, setShowDetails] = useState(false);
    const [seenDialogues, setSeenDialogues] = useState<Set<string>>(new Set());

    const bgUrl = getSceneBackground(milestones, month);
    const isLawRuleAlarm = stats.lawRule <= 30 && !trialsCancelled;
    const completedStages = new Set(milestones);
    const phaseHint = getPhaseHint(milestones, actions);

    // Latest action for character display
    const latestActionId = recentActions[recentActions.length - 1] ?? null;
    const latestAction = latestActionId ? GAME_ACTIONS.find((a) => a.id === latestActionId) ?? null : null;

    const handleAction = (action: GameAction) => {
        if (action.id === "cancel_indictment") {
            setOverlay({ type: "cancel_confirm", step: 1 });
            return;
        }

        onAction(action);

        let dialogueKey = action.id;

        // 동적으로 _1, _2 시나리오가 있는지 확인하고 순차 재생
        if (ACTION_DIALOGUES[`${action.id}_1`] || ACTION_DIALOGUES[`${action.id}_2`]) {
            if (!seenDialogues.has(`${action.id}_1`)) {
                dialogueKey = `${action.id}_1`;
            } else if (!seenDialogues.has(`${action.id}_2`)) {
                dialogueKey = `${action.id}_2`;
            } else {
                return; // 2번 다 봤으면 더 이상 출력 안 함
            }
        } else {
            // 단일 시나리오인 경우 (cancel_indictment 등)
            if (!ACTION_DIALOGUES[action.id] || seenDialogues.has(action.id)) {
                return;
            }
        }

        if (ACTION_DIALOGUES[dialogueKey]) {
            setSeenDialogues((prev) => new Set(prev).add(dialogueKey));
            setActiveDialogue(dialogueKey);
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

    const hasImpactCounters = impactCounters.intimidatedProsecutors > 0
        || impactCounters.silencedWitnesses > 0
        || impactCounters.unverifiedAmount > 0;

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
                        <button
                            className={styles.vnHudShareBtn}
                            onClick={onMidGameShare}
                            title="현재 상태 공유"
                        >
                            📤
                        </button>
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

                {/* Impact Counter HUD */}
                {hasImpactCounters && (
                    <div className={styles.impactHud}>
                        {impactCounters.intimidatedProsecutors > 0 && (
                            <span className={styles.impactHudItem}>😰 위축 {impactCounters.intimidatedProsecutors}</span>
                        )}
                        {impactCounters.silencedWitnesses > 0 && (
                            <span className={styles.impactHudItem}>🤐 침묵 {impactCounters.silencedWitnesses}</span>
                        )}
                        {impactCounters.unverifiedAmount > 0 && (
                            <span className={styles.impactHudItem}>💰 {impactCounters.unverifiedAmount.toLocaleString()}억</span>
                        )}
                    </div>
                )}

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

                {/* Citizen Voice */}
                <CitizenVoice message={citizenComment} />

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
                    {/* Phase 힌트 */}
                    {phaseHint && (
                        <div className={styles.phaseHint}>{phaseHint}</div>
                    )}
                    <div className={styles.vnActionsTitle}>🎯 이번 달 행동을 선택하세요</div>
                    <div className={styles.vnActionsGrid}>
                        {actions.map((action) => {
                            const locked = isActionLocked(action);
                            const done = isActionDone(action);
                            const isFinal = action.id === "cancel_indictment" && !locked;
                            const { gains, costs } = getActionCostSummary(action);

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
                                        {/* 대가 표시 */}
                                        {!locked && (gains.length > 0 || costs.length > 0) && (
                                            <div className={styles.vnActionCosts}>
                                                {gains.map((g, i) => (
                                                    <span key={`g${i}`} className={styles.vnActionGain}>{g}</span>
                                                ))}
                                                {costs.map((c, i) => (
                                                    <span key={`c${i}`} className={styles.vnActionCost}>{c}</span>
                                                ))}
                                            </div>
                                        )}
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
