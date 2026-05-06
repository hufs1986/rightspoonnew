import { useState } from "react";
import { GAME_ENDINGS } from "./gameData";
import ModalShell from "./ModalShell";
import type { LeaderboardEntry, PlayStatsSummary, SaveSlotSummary } from "./useIndictmentGame";
import styles from "./game.module.css";

interface TitleScreenProps {
    activeSlotId: number;
    completionCount?: number | null;
    discoveredEndingIds: string[];
    hasSavedGame: boolean;
    isHydrated: boolean;
    leaderboard: LeaderboardEntry[];
    onClearSave: () => void;
    onContinue: () => void;
    onNewGame: () => void;
    onSelectSlot: (slotId: number) => void;
    onShareGame: () => void;
    playStatsSummary: PlayStatsSummary;
    saveSlotSummaries: SaveSlotSummary[];
}

export default function TitleScreen({
    completionCount,
    discoveredEndingIds,
    hasSavedGame,
    isHydrated,
    leaderboard,
    onClearSave,
    onContinue,
    onNewGame,
    onShareGame,
    playStatsSummary,
}: TitleScreenProps) {
    const [showInfo, setShowInfo] = useState(false);

    const isFirstVisit = playStatsSummary.totalSessions === 0;
    const victoryCount = leaderboard.filter((e) => e.is_victory).length;
    const totalCount = leaderboard.length;
    const winRate = totalCount > 0 ? Math.round((victoryCount / totalCount) * 100) : 0;

    return (
        <div className={styles.gameContainer}>
            <div className={styles.titleScreen}>
                <div className={styles.titleCinematicBg} />

                <div className={styles.titleLogo}>⚖️</div>
                <h1 className={styles.titleName}>공소취소 방어전</h1>
                <p className={styles.titleTagline}>
                    정치 권력이 재판을 없애려 한다.<br />
                    <strong>30개월. 막을 수 있겠는가?</strong>
                </p>

                {/* 난이도 강조 */}
                {totalCount > 0 && (
                    <div className={styles.difficultyBanner}>
                        🔥 현재 승률 <strong>{winRate}%</strong>
                        <span style={{ opacity: 0.6 }}> ({victoryCount}/{totalCount}명 성공)</span>
                    </div>
                )}

                {completionCount != null && completionCount > 0 && (
                    <div className={styles.completionBanner}>
                        🏆 <strong>{completionCount.toLocaleString()}</strong>명이 법치주의를 지켜냈습니다
                    </div>
                )}

                <div className={styles.titleActions}>
                    <button className={styles.startBtn} onClick={onNewGame}>
                        {isFirstVisit ? "▶ 도전 시작" : "▶ 새 게임"}
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

                {/* 미니 리더보드 */}
                {leaderboard.length > 0 && (
                    <div className={styles.leaderboardPanel} style={{ marginTop: "12px" }}>
                        <div className={styles.leaderboardTitle}>🏆 리더보드</div>
                        <div className={styles.leaderboardList}>
                            {leaderboard.slice(0, 5).map((entry, idx) => (
                                <div
                                    key={entry.id}
                                    className={`${styles.leaderboardItem} ${entry.is_victory ? styles["leaderboardItem--victory"] : ""}`}
                                >
                                    <span className={styles.leaderboardRank}>
                                        {idx === 0 ? "🥇" : idx === 1 ? "🥈" : idx === 2 ? "🥉" : `${idx + 1}`}
                                    </span>
                                    <span className={styles.leaderboardName}>{entry.nickname}</span>
                                    <span className={styles.leaderboardScore}>
                                        {entry.survived_months}개월
                                        {entry.is_victory && " ✅"}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* 엔딩 컬렉션 (재방문자만) */}
                {!isFirstVisit && discoveredEndingIds.length > 0 && (
                    <div className={styles.collectionPanel}>
                        <div className={styles.collectionHeader}>
                            <div className={styles.collectionTitle}>엔딩 컬렉션</div>
                            <div className={styles.collectionMeta}>
                                {discoveredEndingIds.length}/{GAME_ENDINGS.length}
                            </div>
                        </div>
                        <div className={styles.collectionGrid}>
                            {GAME_ENDINGS.map((ending) => {
                                const unlocked = discoveredEndingIds.includes(ending.id);
                                return (
                                    <div
                                        key={ending.id}
                                        className={`${styles.collectionBadge} ${unlocked ? styles["collectionBadge--unlocked"] : ""}`}
                                    >
                                        <span className={styles.collectionEmoji}>{unlocked ? ending.emoji : "❔"}</span>
                                        <span className={styles.collectionName}>{unlocked ? ending.name : "잠김"}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                <div className={styles.titleExtraActions} style={{ display: "flex", gap: "8px", marginTop: "12px", width: "100%" }}>
                    <button className={styles.ghostBtn} onClick={() => setShowInfo(true)} style={{ flex: 1, padding: "12px 8px", fontSize: "0.85rem" }}>
                        📖 게임 안내
                    </button>
                    <button className={styles.secondaryBtn} onClick={onShareGame} style={{ flex: 1, padding: "12px 8px", fontSize: "0.85rem" }}>
                        📤 공유하기
                    </button>
                </div>

                <div className={styles.titleCredits}>정치 풍자 방어 시뮬레이션 · 오른스푼 × 드럼통119 제작</div>

                <div className={styles.socialLinks}>
                    <a href="https://www.youtube.com/@drumtong119" target="_blank" rel="noopener noreferrer" className={styles.socialLink}>
                        ▶ 드럼통119 유튜브
                    </a>
                    <a href="https://www.instagram.com/drumtong119" target="_blank" rel="noopener noreferrer" className={styles.socialLink}>
                        📸 드럼통119 인스타
                    </a>
                </div>
            </div>

            {showInfo && (
                <ModalShell
                    className={`${styles.eduModal} ${styles.infoModal}`}
                    labelledBy="title-info-modal"
                    onClose={() => setShowInfo(false)}
                >
                    <div className={styles.eventEmoji}>⚖️</div>
                    <h3 className={styles.eventTitle} id="title-info-modal">게임 안내</h3>

                    <div className={styles.eduSection}>
                        <div className={styles.eduSectionTitle}>🎯 목표</div>
                        <p className={styles.eduText}>
                            정치 권력이 5건의 형사재판을 없애려 합니다.<br /><br />
                            당신은 시민으로서 <strong>30개월</strong> 동안 이를 막아야 합니다.<br />
                            공소취소 진행률이 100%에 도달하면 <strong>패배</strong>합니다.
                        </p>
                    </div>

                    <div className={styles.eduSection}>
                        <div className={styles.eduSectionTitle}>🎮 게임 방법</div>
                        <ul className={styles.infoList}>
                            <li>매 턴 <strong>정치 머신</strong>이 자동으로 공소취소를 밀어붙입니다</li>
                            <li>당신은 <strong>에너지를 소모</strong>하여 방어 행동을 선택합니다</li>
                            <li>에너지가 0이면 &apos;힘 모으기&apos;로 회복해야 합니다</li>
                            <li>에너지 0 상태가 5턴 연속이면 <strong>시민 소진 패배</strong></li>
                            <li>난이도가 매우 높습니다. 전략적으로 플레이하세요!</li>
                        </ul>
                    </div>

                    <button className={styles.eventBtn} onClick={() => setShowInfo(false)}>
                        확인
                    </button>
                </ModalShell>
            )}
        </div>
    );
}
