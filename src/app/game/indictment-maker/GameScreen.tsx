import { memo, useState } from "react";
import { TRIALS, type GameAction, type GameStats, type RandomEvent } from "./gameData";
import { getActionEffects, getStatTone, MILESTONE_STAGES, STAT_LABELS } from "./gameLogic";
import { ACTION_EDUCATION, TRIAL_DETAILS } from "./educationData";
import styles from "./game.module.css";

interface GameScreenProps {
    actions: GameAction[];
    characterEmoji: string;
    characterLevel: number;
    characterName: string;
    currentEvent: RandomEvent | null;
    month: number;
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

function ActionDelta({ statKey, delta }: { statKey: keyof GameStats; delta: number }) {
    const info = STAT_LABELS[statKey];

    return (
        <span className={delta >= 0 ? styles.effectPositive : styles.effectNegative}>
            {info.emoji} {info.label} {delta >= 0 ? "+" : ""}
            {delta}
        </span>
    );
}

function GameScreenComponent({
    actions,
    characterEmoji,
    characterLevel,
    characterName,
    currentEvent,
    month,
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
    const [eduModal, setEduModal] = useState<{ actionId: string } | null>(null);
    const [trialDetail, setTrialDetail] = useState<number | null>(null);
    const completedStages = new Set(milestones);

    const handleAction = (action: GameAction) => {
        onAction(action);
        if (ACTION_EDUCATION[action.id] && action.id !== "do_nothing") {
            setEduModal({ actionId: action.id });
        }
    };
    const currentStageIndex = MILESTONE_STAGES.findIndex((stage) => !completedStages.has(stage.id));

    return (
        <div className={styles.gameContainer}>
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
                    {TRIALS.map((trial) => (
                        <button
                            type="button"
                            key={trial.id}
                            className={`${styles.trialChip} ${trialsCancelled ? styles["trialChip--cancelled"] : ""}`}
                            onClick={() => setTrialDetail(trial.id)}
                            title="클릭하면 상세 정보를 볼 수 있습니다"
                        >
                            {trial.emoji} {trial.name}
                        </button>
                    ))}
                    <div className={styles.trialHint}>👆 재판을 탭하면 실제 혐의를 확인할 수 있습니다</div>
                </section>

                {newsHistory.length > 0 && (
                    <section className={styles.newsTicker} aria-live="polite">
                        <div className={styles.newsLabel}>🔴 속보</div>
                        <div className={styles.newsText}>{newsHistory[0]}</div>
                        {newsHistory.length > 1 && (
                            <div className={styles.newsHistory}>
                                {newsHistory.slice(1).map((headline, index) => (
                                    <div key={`${headline}-${index}`} className={styles.newsHistoryItem}>
                                        {headline}
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>
                )}

                <section className={styles.actionsSection}>
                    <div className={styles.actionsTitle}>🎯 이번 달 행동을 선택하세요</div>
                    <div className={styles.actionsHint}>카드를 눌러 진행합니다. 선행 조건이 없는 행동부터 여세요.</div>
                    <div className={styles.actionsGrid}>
                        {actions.map((action) => {
                            const locked = isActionLocked(action);
                            const done = isActionDone(action);
                            const isFinalAction = action.id === "cancel_indictment" && !locked;

                            return (
                                <button
                                    key={action.id}
                                    type="button"
                                    className={`${styles.actionCard} ${locked ? styles["actionCard--locked"] : ""} ${isFinalAction ? styles["actionCard--final"] : ""}`}
                                    onClick={() => handleAction(action)}
                                    disabled={locked}
                                    aria-disabled={locked}
                                >
                                    <div className={styles.actionHeader}>
                                        <span className={styles.actionEmoji}>{action.emoji}</span>
                                        {done && <span className={styles.actionDone}>완료</span>}
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

            {currentEvent && (
                <div className={styles.eventOverlay} onClick={onDismissEvent}>
                    <div className={styles.eventModal} onClick={(event) => event.stopPropagation()}>
                        <div className={styles.eventEmoji}>⚡</div>
                        <h3 className={styles.eventTitle}>{currentEvent.title}</h3>
                        <p className={styles.eventDesc}>{currentEvent.description}</p>
                        <div className={styles.eventEffects}>
                            {(Object.entries(currentEvent.effects) as [keyof GameStats, number][]).map(([key, value]) => (
                                <div key={key}>
                                    <ActionDelta statKey={key} delta={value} />
                                </div>
                            ))}
                        </div>
                        <button className={styles.eventBtn} onClick={onDismissEvent}>
                            확인
                        </button>
                    </div>
                </div>
            )}

            {/* 교육 모달: 행동 실행 후 법적 해설 표시 */}
            {eduModal && ACTION_EDUCATION[eduModal.actionId] && (
                <div className={styles.eventOverlay} onClick={() => setEduModal(null)}>
                    <div className={styles.eduModal} onClick={(e) => e.stopPropagation()}>
                        <div className={styles.eduSection}>
                            <div className={styles.eduSectionTitle}>⚖️ 법률 해설</div>
                            <p className={styles.eduText}>{ACTION_EDUCATION[eduModal.actionId].legalComment}</p>
                        </div>
                        <div className={styles.eduSection}>
                            <div className={styles.eduSectionTitle}>🗣️ 시민의 목소리</div>
                            <p className={styles.eduCitizen}>{ACTION_EDUCATION[eduModal.actionId].citizenVoice}</p>
                        </div>
                        {ACTION_EDUCATION[eduModal.actionId].historicalNote && (
                            <div className={styles.eduSection}>
                                <div className={styles.eduSectionTitle}>🌍 역사적 비교</div>
                                <p className={styles.eduHistory}>{ACTION_EDUCATION[eduModal.actionId].historicalNote}</p>
                            </div>
                        )}
                        <button className={styles.eventBtn} onClick={() => setEduModal(null)}>이해했습니다</button>
                    </div>
                </div>
            )}

            {/* 재판 상세 모달 */}
            {trialDetail !== null && TRIAL_DETAILS[trialDetail] && (
                <div className={styles.eventOverlay} onClick={() => setTrialDetail(null)}>
                    <div className={styles.eduModal} onClick={(e) => e.stopPropagation()}>
                        <div className={styles.eventEmoji}>{TRIALS.find(t => t.id === trialDetail)?.emoji}</div>
                        <h3 className={styles.eventTitle}>{TRIAL_DETAILS[trialDetail].summary}</h3>
                        <div className={styles.eduSection}>
                            <div className={styles.eduSectionTitle}>📋 혐의 요지</div>
                            <p className={styles.eduText}>{TRIAL_DETAILS[trialDetail].stakes}</p>
                        </div>
                        <div className={styles.eduSection}>
                            <div className={styles.eduSectionTitle}>🔍 핵심 증거</div>
                            <p className={styles.eduText}>{TRIAL_DETAILS[trialDetail].evidence}</p>
                        </div>
                        {trialsCancelled && (
                            <div className={styles.eduSection}>
                                <div className={styles.eduSectionTitle} style={{color: '#ff0000'}}>❌ 공소취소됨</div>
                                <p className={styles.eduCitizen}>이 재판의 모든 증거와 혐의는 법원의 판단 없이 영구히 봉인되었습니다.</p>
                            </div>
                        )}
                        <button className={styles.eventBtn} onClick={() => setTrialDetail(null)}>닫기</button>
                    </div>
                </div>
            )}
        </div>
    );
}

const GameScreen = memo(GameScreenComponent);

export default GameScreen;
