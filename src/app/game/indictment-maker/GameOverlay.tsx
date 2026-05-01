import { ACTION_EDUCATION, TRIAL_DETAILS } from "./educationData";
import { TRIALS, type GameAction, type GameStats, type RandomEvent } from "./gameData";
import { STAT_LABELS } from "./gameLogic";
import ModalShell from "./ModalShell";
import styles from "./game.module.css";

type OverlayState =
    | { type: "event"; event: RandomEvent }
    | { type: "education"; actionId: string }
    | { type: "trial"; trialId: number }
    | { type: "cancel_confirm"; step: number };

interface GameOverlayProps {
    actions: GameAction[];
    overlay: OverlayState | null;
    onClose: () => void;
    onConfirmCancel: () => void;
    onNextCancelStep: () => void;
    trialsCancelled: boolean;
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

export default function GameOverlay({
    actions,
    overlay,
    onClose,
    onConfirmCancel,
    onNextCancelStep,
    trialsCancelled,
}: GameOverlayProps) {
    if (!overlay) return null;

    if (overlay.type === "event") {
        const isChainEvent = overlay.event.id.startsWith("chain_");

        return (
            <ModalShell className={styles.eventModal} labelledBy="game-event-title" onClose={onClose}>
                <div className={styles.eventEmoji}>{isChainEvent ? "🧩" : "⚡"}</div>
                <div className={styles.eventKind}>{isChainEvent ? "연쇄 이벤트" : "랜덤 이벤트"}</div>
                <h3 className={styles.eventTitle} id="game-event-title">
                    {overlay.event.title}
                </h3>
                <p className={styles.eventDesc}>{overlay.event.description}</p>
                <div className={styles.eventEffects}>
                    {(Object.entries(overlay.event.effects) as [keyof GameStats, number][]).map(([key, value]) => (
                        <div key={key}>
                            <ActionDelta statKey={key} delta={value} />
                        </div>
                    ))}
                </div>
                <button className={styles.eventBtn} onClick={onClose}>
                    확인
                </button>
            </ModalShell>
        );
    }

    if (overlay.type === "education" && ACTION_EDUCATION[overlay.actionId]) {
        const content = ACTION_EDUCATION[overlay.actionId];

        return (
            <ModalShell
                className={`${styles.eduModal} ${styles.breakingNewsModal}`}
                labelledBy="education-title"
                onClose={onClose}
            >
                <div className={styles.breakingNewsHeader}>🚨 긴급 속보 / 사법부 팩트체크</div>
                <h3 className={styles.srOnly} id="education-title">
                    행동 교육 해설
                </h3>
                <div className={styles.eduSection}>
                    <div className={styles.eduSectionTitle}>⚖️ 법률 해설</div>
                    <p className={styles.eduText}>{content.legalComment}</p>
                </div>
                <div className={styles.eduSection}>
                    <div className={styles.eduSectionTitle}>🗣️ 시민의 목소리</div>
                    <p className={styles.eduCitizen}>{content.citizenVoice}</p>
                </div>
                {content.historicalNote && (
                    <div className={styles.eduSection}>
                        <div className={styles.eduSectionTitle}>🌍 역사적 비교</div>
                        <p className={styles.eduHistory}>{content.historicalNote}</p>
                    </div>
                )}
                <button className={styles.eventBtn} onClick={onClose}>
                    이해했습니다
                </button>
            </ModalShell>
        );
    }

    if (overlay.type === "trial" && TRIAL_DETAILS[overlay.trialId]) {
        const trial = TRIALS.find((item) => item.id === overlay.trialId);
        const detail = TRIAL_DETAILS[overlay.trialId];

        return (
            <ModalShell
                className={`${styles.eduModal} ${styles.dossierModal}`}
                labelledBy="dossier-title"
                onClose={onClose}
            >
                {trialsCancelled && <div className={styles.dossierVoidStamp}>VOID / 취소됨</div>}
                <div className={styles.dossierTop}>
                    <div className={styles.dossierId}>CASE NO. {overlay.trialId}</div>
                    <div className={styles.dossierEmoji}>{trial?.emoji}</div>
                </div>
                <h3 className={styles.dossierHeader} id="dossier-title">
                    {detail.summary}
                </h3>

                <div className={styles.dossierGrid}>
                    <div className={styles.dossierField}>
                        <div className={styles.dossierLabel}>기소일자</div>
                        <div className={styles.dossierValue}>{detail.indictmentDate}</div>
                    </div>
                    <div className={styles.dossierField}>
                        <div className={styles.dossierLabel}>적용 법조</div>
                        <div className={styles.dossierValue}>{detail.penalCode}</div>
                    </div>
                    <div className={styles.dossierField}>
                        <div className={styles.dossierLabel}>예상 형량</div>
                        <div className={styles.dossierValue}>{detail.expectedSentence}</div>
                    </div>
                </div>

                <div className={styles.dossierSection}>
                    <div className={styles.dossierLabel}>📋 혐의 요지</div>
                    <p className={styles.dossierText}>{detail.stakes}</p>
                </div>
                <div className={styles.dossierSection}>
                    <div className={styles.dossierLabel}>🔍 핵심 증거</div>
                    <p className={styles.dossierText}>{detail.evidence}</p>
                </div>
                {trialsCancelled && (
                    <div className={styles.eduSection}>
                        <div className={styles.eduSectionTitle} style={{ color: "#ff0000" }}>
                            ❌ 공소취소됨
                        </div>
                        <p className={styles.eduCitizen}>
                            이 재판의 모든 증거와 혐의는 법원의 판단 없이 영구히 봉인되었습니다.
                        </p>
                    </div>
                )}
                <button className={styles.eventBtn} onClick={onClose}>
                    파일 덮기
                </button>
            </ModalShell>
        );
    }

    if (overlay.type === "cancel_confirm") {
        const cancelAction = actions.find((action) => action.id === "cancel_indictment");
        if (!cancelAction) return null;

        return (
            <ModalShell
                className={`${styles.eventModal} ${styles.criticalConfirmModal}`}
                closeOnBackdrop={false}
                labelledBy="cancel-confirm-title"
                onClose={onClose}
            >
                <div className={styles.eventEmoji}>⚠️</div>
                <h3 className={styles.eventTitle} id="cancel-confirm-title">
                    최종 승인 절차
                </h3>

                {overlay.step >= 1 && (
                    <p className={styles.criticalWarningText}>정말로 공소를 취소하시겠습니까?</p>
                )}
                {overlay.step >= 2 && (
                    <p className={styles.criticalWarningText}>
                        이 버튼을 누르면 대장동 4,895억 배임과 대북송금 800만 달러의 실체적 진실은 영원히 법정에서
                        가려지지 못합니다. 그래도 진행하시겠습니까?
                    </p>
                )}
                {overlay.step >= 3 && (
                    <p className={styles.criticalWarningText} style={{ color: "#ff4444", fontWeight: 900 }}>
                        이 결정은 대한민국 헌정사상 유례없는 사법권 침해로 기록될 것입니다. 역사의 심판을 감당하시겠습니까?
                    </p>
                )}

                <div className={styles.criticalConfirmActions}>
                    <button className={styles.ghostBtn} onClick={onClose}>
                        취소
                    </button>
                    <button
                        className={styles.startBtn}
                        onClick={() => {
                            if (overlay.step < 3) {
                                onNextCancelStep();
                                return;
                            }

                            onConfirmCancel();
                        }}
                    >
                        {overlay.step === 1
                            ? "네, 취소합니다"
                            : overlay.step === 2
                              ? "진행합니다"
                              : "역사의 심판을 받겠습니다"}
                    </button>
                </div>
            </ModalShell>
        );
    }

    return null;
}
