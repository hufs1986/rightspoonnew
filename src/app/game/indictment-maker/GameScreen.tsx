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
    const [cancelConfirmStep, setCancelConfirmStep] = useState<number>(0);
    const completedStages = new Set(milestones);

    const handleAction = (action: GameAction) => {
        if (action.id === "cancel_indictment") {
            setCancelConfirmStep(1);
            return;
        }

        onAction(action);
        if (ACTION_EDUCATION[action.id] && action.id !== "do_nothing") {
            setEduModal({ actionId: action.id });
        }
    };

    const confirmCancelAction = () => {
        const action = actions.find((a) => a.id === "cancel_indictment");
        if (action) {
            setCancelConfirmStep(0);
            onAction(action);
            if (ACTION_EDUCATION[action.id]) {
                setEduModal({ actionId: action.id });
            }
        }
    };

    const currentStageIndex = MILESTONE_STAGES.findIndex((stage) => !completedStages.has(stage.id));
    const isLawRuleAlarm = stats.lawRule <= 30 && !trialsCancelled;

    return (
        <div className={`${styles.gameContainer} ${isLawRuleAlarm ? styles["gameContainer--alarm"] : ""}`}>
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
                                onClick={() => setTrialDetail(trial.id)}
                            >
                                <span className={styles.dossierBadge}>TOP SECRET</span>
                                <div className={styles.dossierTitle}>{trial.emoji} {trial.name}</div>
                            </button>
                        ))}
                    </div>
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

            {/* 교육 모달 / 긴급 속보 인터럽트 */}
            {eduModal && ACTION_EDUCATION[eduModal.actionId] && (
                <div className={styles.eventOverlay} onClick={() => setEduModal(null)}>
                    <div className={`${styles.eduModal} ${styles.breakingNewsModal}`} onClick={(e) => e.stopPropagation()}>
                        <div className={styles.breakingNewsHeader}>🚨 긴급 속보 / 사법부 팩트체크</div>
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

            {/* 기밀 사건 파일 (Trial Dossier) 상세 모달 */}
            {trialDetail !== null && TRIAL_DETAILS[trialDetail] && (
                <div className={styles.eventOverlay} onClick={() => setTrialDetail(null)}>
                    <div className={`${styles.eduModal} ${styles.dossierModal}`} onClick={(e) => e.stopPropagation()}>
                        {trialsCancelled && <div className={styles.dossierVoidStamp}>VOID / 취소됨</div>}
                        <div className={styles.dossierTop}>
                            <div className={styles.dossierId}>CASE NO. {trialDetail}</div>
                            <div className={styles.dossierEmoji}>{TRIALS.find(t => t.id === trialDetail)?.emoji}</div>
                        </div>
                        <h3 className={styles.dossierHeader}>{TRIAL_DETAILS[trialDetail].summary}</h3>
                        
                        <div className={styles.dossierGrid}>
                            <div className={styles.dossierField}>
                                <div className={styles.dossierLabel}>기소일자</div>
                                <div className={styles.dossierValue}>{TRIAL_DETAILS[trialDetail].indictmentDate}</div>
                            </div>
                            <div className={styles.dossierField}>
                                <div className={styles.dossierLabel}>적용 법조</div>
                                <div className={styles.dossierValue}>{TRIAL_DETAILS[trialDetail].penalCode}</div>
                            </div>
                            <div className={styles.dossierField}>
                                <div className={styles.dossierLabel}>예상 형량</div>
                                <div className={styles.dossierValue}>{TRIAL_DETAILS[trialDetail].expectedSentence}</div>
                            </div>
                        </div>

                        <div className={styles.dossierSection}>
                            <div className={styles.dossierLabel}>📋 혐의 요지</div>
                            <p className={styles.dossierText}>{TRIAL_DETAILS[trialDetail].stakes}</p>
                        </div>
                        <div className={styles.dossierSection}>
                            <div className={styles.dossierLabel}>🔍 핵심 증거</div>
                            <p className={styles.dossierText}>{TRIAL_DETAILS[trialDetail].evidence}</p>
                        </div>
                        {trialsCancelled && (
                            <div className={styles.eduSection}>
                                <div className={styles.eduSectionTitle} style={{color: '#ff0000'}}>❌ 공소취소됨</div>
                                <p className={styles.eduCitizen}>이 재판의 모든 증거와 혐의는 법원의 판단 없이 영구히 봉인되었습니다.</p>
                            </div>
                        )}
                        <button className={styles.eventBtn} onClick={() => setTrialDetail(null)}>파일 덮기</button>
                    </div>
                </div>
            )}

            {/* 공소취소 최종 승인 절차 (3단계) */}
            {cancelConfirmStep > 0 && (
                <div className={styles.eventOverlay} onClick={(e) => e.stopPropagation()}>
                    <div className={`${styles.eventModal} ${styles.criticalConfirmModal}`}>
                        <div className={styles.eventEmoji}>⚠️</div>
                        <h3 className={styles.eventTitle}>최종 승인 절차</h3>
                        
                        {cancelConfirmStep >= 1 && (
                            <p className={styles.criticalWarningText}>정말로 공소를 취소하시겠습니까?</p>
                        )}
                        {cancelConfirmStep >= 2 && (
                            <p className={styles.criticalWarningText}>이 버튼을 누르면 대장동 4,895억 배임과 대북송금 800만 달러의 실체적 진실은 영원히 법정에서 가려지지 못합니다. 그래도 진행하시겠습니까?</p>
                        )}
                        {cancelConfirmStep >= 3 && (
                            <p className={styles.criticalWarningText} style={{color: '#ff4444', fontWeight: 900}}>이 결정은 대한민국 헌정사상 유례없는 사법권 침해로 기록될 것입니다. 역사의 심판을 감당하시겠습니까?</p>
                        )}

                        <div className={styles.criticalConfirmActions}>
                            <button className={styles.ghostBtn} onClick={() => setCancelConfirmStep(0)}>
                                취소
                            </button>
                            <button 
                                className={styles.startBtn} 
                                onClick={() => {
                                    if (cancelConfirmStep < 3) {
                                        setCancelConfirmStep(s => s + 1);
                                    } else {
                                        confirmCancelAction();
                                    }
                                }}
                            >
                                {cancelConfirmStep === 1 ? "네, 취소합니다" : 
                                 cancelConfirmStep === 2 ? "진행합니다" : 
                                 "역사의 심판을 받겠습니다"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

const GameScreen = memo(GameScreenComponent);

export default GameScreen;
