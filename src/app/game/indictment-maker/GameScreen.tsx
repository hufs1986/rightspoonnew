import { memo, useMemo, useState } from "react";
import GameOverlay from "./GameOverlay";
import StoreCta from "./StoreCta";
import { GAME_ACTIONS, TRIALS, type GameAction, type GameStats, type RandomEvent } from "./gameData";
import type { EventForecast } from "./gameReducer";
import { getActionEffects, getStatTone, MILESTONE_STAGES, STAT_LABELS } from "./gameLogic";
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

type ActionCategory = "media" | "institution" | "judicial" | "support" | "restraint" | "final";

const ACTION_CATEGORY_META: Record<
    ActionCategory,
    { label: string; className: string }
> = {
    media: { label: "여론전", className: "actionBadge--media" },
    institution: { label: "입법", className: "actionBadge--institution" },
    judicial: { label: "사법개입", className: "actionBadge--judicial" },
    support: { label: "방탄", className: "actionBadge--support" },
    restraint: { label: "완화", className: "actionBadge--restraint" },
    final: { label: "최종행동", className: "actionBadge--final" },
};

const ACTION_RISK_META = [
    { max: 5, label: "보통", className: "actionBadge--riskLow", cardClassName: "actionCard--riskLow" },
    { max: 15, label: "높음", className: "actionBadge--riskMedium", cardClassName: "actionCard--riskMedium" },
    { max: 25, label: "위험", className: "actionBadge--riskHigh", cardClassName: "actionCard--riskHigh" },
    { max: Number.POSITIVE_INFINITY, label: "치명적", className: "actionBadge--riskCritical", cardClassName: "actionCard--riskCritical" },
] as const;

function ActionDelta({ statKey, delta }: { statKey: keyof GameStats; delta: number }) {
    const info = STAT_LABELS[statKey];

    return (
        <span className={delta >= 0 ? styles.effectPositive : styles.effectNegative}>
            {info.emoji} {info.label} {delta >= 0 ? "+" : ""}
            {delta}
        </span>
    );
}

function getActionCategory(action: GameAction): ActionCategory {
    if (action.id === "cancel_indictment") return "final";
    if (action.id === "do_nothing") return "restraint";
    if (["frame_media", "play_recording", "press_conference"].includes(action.id)) return "media";
    if (["launch_investigation", "adopt_report", "draft_special_counsel", "pass_special_counsel"].includes(action.id)) {
        return "institution";
    }
    if (["summon_witnesses", "mass_indictments", "appoint_counsel", "transfer_cases", "seize_prosecution"].includes(action.id)) {
        return "judicial";
    }
    return "support";
}

function getActionRisk(action: GameAction) {
    if (action.id === "cancel_indictment") return ACTION_RISK_META[ACTION_RISK_META.length - 1];

    const destabilizationScore = getActionEffects(action).reduce((score, [statKey, delta]) => {
        if (delta >= 0) return score;
        if (["lawRule", "separation", "judicialIndep", "publicTrust"].includes(statKey)) return score + Math.abs(delta);
        return score;
    }, 0);

    return ACTION_RISK_META.find((item) => destabilizationScore <= item.max) ?? ACTION_RISK_META[0];
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
    const [turnCinematic, setTurnCinematic] = useState<{ actionId: string; month: number } | null>(null);
    const completedStages = new Set(milestones);

    const handleAction = (action: GameAction) => {
        if (action.id === "cancel_indictment") {
            setOverlay({ type: "cancel_confirm", step: 1 });
            return;
        }

        setTurnCinematic({ actionId: action.id, month: month + 1 });
        window.setTimeout(() => setTurnCinematic(null), 1250);
        onAction(action);
        if (action.id !== "do_nothing") {
            setOverlay({ type: "education", actionId: action.id });
        }
    };

    const confirmCancelAction = () => {
        const action = actions.find((a) => a.id === "cancel_indictment");
        if (action) {
            setOverlay(null);
            setTurnCinematic({ actionId: action.id, month: month + 1 });
            window.setTimeout(() => setTurnCinematic(null), 1250);
            onAction(action);
            setOverlay({ type: "education", actionId: action.id });
        }
    };

    const currentStageIndex = MILESTONE_STAGES.findIndex((stage) => !completedStages.has(stage.id));
    const isLawRuleAlarm = stats.lawRule <= 30 && !trialsCancelled;
    const recentActionPreview = recentActions.slice(-3);
    const activeOverlay = useMemo(() => {
        if (overlay) return overlay;
        if (currentEvent) return { type: "event", event: currentEvent } as const;
        return null;
    }, [currentEvent, overlay]);
    const latestActionId = recentActions[recentActions.length - 1] ?? null;
    const latestAction = latestActionId ? GAME_ACTIONS.find((action) => action.id === latestActionId) ?? null : null;

    return (
        <div className={`${styles.gameContainer} ${isLawRuleAlarm ? styles["gameContainer--alarm"] : ""}`}>
            {turnCinematic && latestAction && (
                <div className={styles.turnCinematic} aria-hidden="true">
                    <div className={styles.turnCinematicCard}>
                        <div className={styles.turnCinematicLabel}>TURN ADVANCE</div>
                        <div className={styles.turnCinematicAction}>
                            <span>{latestAction.emoji}</span>
                            <span>{latestAction.name}</span>
                        </div>
                        <div className={styles.turnCinematicMonth}>{turnCinematic.month}개월 차 돌입</div>
                    </div>
                </div>
            )}
            <div className={styles.gameLayout}>
                <section className={styles.hud}>
                    <div className={styles.hudLeft}>
                        <span className={styles.hudMonth}>임기</span>
                        <span className={styles.hudMonthValue}>{month}개월 / 60</span>
                    </div>
                    <div className={styles.hudCenter}>
                        <span className={styles.hudCharacter}>{characterEmoji}</span>
                        <span className={styles.hudCharName}>{characterName}</span>
                    </div>
                    <div className={styles.hudRight}>
                        <span className={styles.hudLevel}>Lv.{characterLevel}</span>
                        <span className={styles.hudProgress}>공소취소 {stats.cancelProgress}%</span>
                        {hasSavedGame && <span className={styles.hudSave}>자동 저장됨</span>}
                    </div>
                </section>

                <section className={styles.stagePanel} aria-label="진행 단계">
                    <div className={styles.stageHeader}>
                        <div className={styles.stageTitle}>해금 단계</div>
                        <div className={styles.stageMeta}>
                            {Math.max(currentStageIndex, 0)}/{MILESTONE_STAGES.length} 완료
                        </div>
                    </div>
                    <div className={styles.stageRail}>
                        {MILESTONE_STAGES.map((stage, index) => {
                            const done = completedStages.has(stage.id);
                            const active = !done && index === currentStageIndex;

                            return (
                                <div
                                    key={stage.id}
                                    className={`${styles.stageNode} ${done ? styles["stageNode--done"] : ""} ${active ? styles["stageNode--active"] : ""}`}
                                >
                                    <span className={styles.stageEmoji}>{stage.emoji}</span>
                                    <span className={styles.stageLabel}>{stage.label}</span>
                                </div>
                            );
                        })}
                    </div>
                </section>

                {recentActionPreview.length > 0 && (
                    <section className={styles.comboPanel} aria-label="최근 행동 흐름">
                        <div className={styles.comboTitle}>최근 행동 흐름</div>
                        <div className={styles.comboTrack}>
                            {recentActionPreview.map((actionId, index) => {
                                const action = actions.find((item) => item.id === actionId);

                                return (
                                    <div key={`${actionId}-${index}`} className={styles.comboChip}>
                                        <span>{action?.emoji ?? "•"}</span>
                                        <span>{action?.name ?? actionId}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </section>
                )}

                {eventForecast.length > 0 && (
                    <section className={styles.riskPanel} aria-label="위험 예고">
                        <div className={styles.riskTitle}>위험 예고</div>
                        <div className={styles.riskList}>
                            {eventForecast.map((forecast) => (
                                <div key={forecast.eventId} className={styles.riskItem}>
                                    <span>{forecast.title}</span>
                                    <span className={styles.riskWeight}>
                                        {Math.round(forecast.weight * 100)}%
                                    </span>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                <section className={styles.statsPanel} aria-label="게임 수치">
                    {(Object.entries(STAT_LABELS) as [keyof GameStats, (typeof STAT_LABELS)[keyof GameStats]][]).map(
                        ([key, info]) => (
                            <div key={key} className={styles.statItem}>
                                <span className={styles.statLabel}>
                                    {info.emoji} {info.label}
                                </span>
                                <div className={styles.statBarOuter} aria-hidden="true">
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
                        <span className={styles.trialsTitle}>📂 기밀 사건 파일 (Trial Dossier)</span>
                        <span className={styles.trialsHint}>👆 탭하여 상세 열람</span>
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

                {newsHistory.length > 0 && (
                    <section className={styles.newsTicker} aria-live="polite">
                        <div className={styles.newsTickerBar}>
                            <div className={styles.newsLabel}>🔴 BREAKING</div>
                            <div className={styles.newsMarquee}>
                                <div className={styles.newsMarqueeTrack}>
                                    <span className={styles.newsMarqueeItem}>{newsHistory[0]}</span>
                                    <span className={styles.newsMarqueeDivider}>•</span>
                                    <span className={styles.newsMarqueeItem}>{newsHistory[0]}</span>
                                    <span className={styles.newsMarqueeDivider}>•</span>
                                    <span className={styles.newsMarqueeItem}>{newsHistory[0]}</span>
                                </div>
                            </div>
                        </div>
                        {newsHistory.length > 1 && (
                            <div className={styles.newsHistory}>
                                {newsHistory.slice(1).map((headline, index) => (
                                    <div key={`${headline}-${index}`} className={styles.newsHistoryItem}>
                                        <span className={styles.newsHistoryIndex}>{String(index + 1).padStart(2, "0")}</span>
                                        <span>{headline}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>
                )}

                <section className={styles.storeCtaSection} aria-label="운영자 실사용 아이템">
                    <StoreCta variant="inGame" />
                </section>

                <section className={styles.actionsSection}>
                    <div className={styles.actionsTitle}>🎯 이번 달 행동을 선택하세요</div>
                    <div className={styles.actionsHint}>카드를 눌러 진행합니다. 선행 조건이 없는 행동부터 여세요.</div>
                    <div className={styles.actionsGrid}>
                        {actions.map((action) => {
                            const locked = isActionLocked(action);
                            const done = isActionDone(action);
                            const isFinalAction = action.id === "cancel_indictment" && !locked;
                            const category = ACTION_CATEGORY_META[getActionCategory(action)];
                            const risk = getActionRisk(action);
                            const stage = MILESTONE_STAGES[Math.max(action.phase - 1, 0)];

                            return (
                                <button
                                    key={action.id}
                                    type="button"
                                    className={`${styles.actionCard} ${locked ? styles["actionCard--locked"] : ""} ${isFinalAction ? styles["actionCard--final"] : ""} ${styles[risk.cardClassName]} ${latestActionId === action.id ? styles["actionCard--recent"] : ""}`}
                                    onClick={() => handleAction(action)}
                                    disabled={locked}
                                    aria-disabled={locked}
                                >
                                    <div className={styles.actionHeader}>
                                        <span className={styles.actionEmoji}>{action.emoji}</span>
                                        {done && <span className={styles.actionDone}>완료</span>}
                                    </div>
                                    <div className={styles.actionMeta}>
                                        <span className={`${styles.actionBadge} ${styles[category.className]}`}>{category.label}</span>
                                        <span className={`${styles.actionBadge} ${styles[risk.className]}`}>{risk.label}</span>
                                        <span className={`${styles.actionBadge} ${styles["actionBadge--phase"]}`}>
                                            {stage?.emoji ?? "📍"} PHASE {action.phase}
                                        </span>
                                    </div>
                                    <div className={styles.actionName}>{action.name}</div>
                                    <div className={styles.actionDesc}>{action.description}</div>
                                    <div className={styles.actionEffects}>
                                        {getActionEffects(action)
                                            .slice(0, 4)
                                            .map(([statKey, delta]) => (
                                                <ActionDelta key={`${action.id}-${statKey}`} statKey={statKey} delta={delta} />
                                            ))}
                                    </div>
                                    {locked && <div className={styles.actionLocked}>🔒 선행 조건 미충족</div>}
                                </button>
                            );
                        })}
                    </div>
                </section>
            </div>

            <GameOverlay
                actions={actions}
                overlay={activeOverlay}
                onClose={() => {
                    if (overlay) {
                        setOverlay(null);
                        return;
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
