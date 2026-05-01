import styles from "./game.module.css";

interface TitleScreenProps {
    hasSavedGame: boolean;
    isHydrated: boolean;
    onClearSave: () => void;
    onContinue: () => void;
    onNewGame: () => void;
}

export default function TitleScreen({
    hasSavedGame,
    isHydrated,
    onClearSave,
    onContinue,
    onNewGame,
}: TitleScreenProps) {
    return (
        <div className={styles.gameContainer}>
            <div className={styles.titleScreen}>
                <div className={styles.titleLogo}>📜</div>
                <h1 className={styles.titleName}>공소취소 메이커</h1>
                <p className={styles.titleSub}>&quot;재판은 멈추고, 권력은 자란다&quot;</p>

                <div className={styles.titleActions}>
                    <button className={styles.startBtn} onClick={onNewGame}>
                        ▶ 새 게임
                    </button>
                    {isHydrated && hasSavedGame && (
                        <>
                            <button className={styles.secondaryBtn} onClick={onContinue}>
                                ↺ 이어하기
                            </button>
                            <button className={styles.ghostBtn} onClick={onClearSave}>
                                저장 삭제
                            </button>
                        </>
                    )}
                </div>

                <div className={styles.titleInfo}>
                    <span>모바일 최적화</span>
                    <span>자동 저장</span>
                    <span>멀티 엔딩</span>
                </div>

                {isHydrated && hasSavedGame && <div className={styles.saveBanner}>이전 플레이가 저장되어 있습니다.</div>}

                <div className={styles.titleCredits}>정치 풍자 육성 시뮬레이션 · 오른스푼 제작</div>
            </div>
        </div>
    );
}
