import { TRIALS } from "./gameData";
import styles from "./game.module.css";

export default function CancelAnimation() {
    return (
        <div className={styles.gameContainer}>
            <div className={styles.cancelOverlay}>
                <div className={styles.cancelSequence}>
                    <div className={styles.cancelSequenceHeader}>사건 파일 삭제 중...</div>
                    <div className={styles.cancelDossierGrid}>
                        {TRIALS.map((trial, index) => (
                            <div
                                key={trial.id}
                                className={styles.cancelDossier}
                                style={{ animationDelay: `${index * 0.32}s` }}
                            >
                                <span className={styles.cancelDossierBadge}>TOP SECRET</span>
                                <div className={styles.cancelDossierTitle}>
                                    {trial.emoji} {trial.name}
                                </div>
                                <div className={styles.cancelDossierCourt}>{trial.court}</div>
                                <div
                                    className={styles.cancelDossierVoid}
                                    style={{ animationDelay: `${0.22 + index * 0.32}s` }}
                                >
                                    VOID
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className={styles.cancelVerdict}>
                    <div className={styles.cancelText}>재판이 종료되었습니다.</div>
                    <div className={styles.cancelSubText}>
                        유무죄 판단 없음.
                        <br />
                        증거조사 없음.
                        <br />
                        판결 없음.
                        <br />
                        <br />
                        공소가 사라졌습니다.
                    </div>
                </div>
            </div>
        </div>
    );
}
