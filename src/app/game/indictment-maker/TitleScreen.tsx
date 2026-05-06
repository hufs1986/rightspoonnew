import { useState } from "react";
import { GAME_ACTIONS, GAME_ENDINGS } from "./gameData";
import ModalShell from "./ModalShell";
import StoreCta from "./StoreCta";
import type { PlayStatsDetails, PlayStatsSummary, SaveSlotSummary } from "./useIndictmentGame";
import styles from "./game.module.css";

interface TitleScreenProps {
    activeSlotId: number;
    completionCount?: number | null;
    discoveredEndingIds: string[];
    hasSavedGame: boolean;
    isHydrated: boolean;
    onClearSave: () => void;
    onContinue: () => void;
    onNewGame: () => void;
    onSelectSlot: (slotId: number) => void;
    playStatsDetails: PlayStatsDetails;
    playStatsSummary: PlayStatsSummary;
    saveSlotSummaries: SaveSlotSummary[];
    onShareGame: () => void;
}

export default function TitleScreen({
    activeSlotId,
    completionCount,
    discoveredEndingIds,
    hasSavedGame,
    isHydrated,
    onClearSave,
    onContinue,
    onNewGame,
    onSelectSlot,
    playStatsDetails,
    playStatsSummary,
    saveSlotSummaries,
    onShareGame,
}: TitleScreenProps) {
    const [showInfo, setShowInfo] = useState(false);
    const [showStats, setShowStats] = useState(false);
    const [showMore, setShowMore] = useState(false);

    const isFirstVisit = playStatsSummary.totalSessions === 0;

    const mostUsedAction = playStatsSummary.mostUsedActionId
        ? GAME_ACTIONS.find((action) => action.id === playStatsSummary.mostUsedActionId) ?? null
        : null;
    const latestEnding = playStatsSummary.latestEndingId
        ? GAME_ENDINGS.find((ending) => ending.id === playStatsSummary.latestEndingId) ?? null
        : null;

    // ===== 첫 방문자: 시네마틱 타이틀 =====
    if (isFirstVisit && isHydrated) {
        return (
            <div className={styles.gameContainer}>
                <div className={styles.titleScreen}>
                    {/* 시네마틱 배경 */}
                    <div className={styles.titleCinematicBg} />

                    <div className={styles.titleLogo}>⚖️</div>
                    <h1 className={styles.titleName}>공소취소 메이커</h1>
                    <p className={styles.titleTagline}>
                        5건의 형사재판. 60개월의 시간.<br />
                        <strong>당신이 지우세요.</strong>
                    </p>

                    {completionCount != null && completionCount > 0 && (
                        <div className={styles.completionBanner}>
                            🏆 지금까지 <strong>{completionCount.toLocaleString()}</strong>명이 공소취소를 목격했습니다
                        </div>
                    )}

                    <button className={styles.startBtn} onClick={onNewGame} style={{ marginTop: "8px", fontSize: "1.1rem" }}>
                        ▶ 시작하기
                    </button>

                    <p className={styles.titleDisclaimer}>
                        이 게임은 법치주의의 가치를 체험하기 위해 만들어졌습니다.
                    </p>

                    <div className={styles.titleExtraActions} style={{ display: 'flex', gap: '8px', marginTop: '4px', width: '100%' }}>
                        <button className={styles.ghostBtn} onClick={() => setShowInfo(true)} style={{ flex: 1, padding: '12px 8px', fontSize: '0.85rem' }}>
                            📖 게임 안내
                        </button>
                        <button className={styles.secondaryBtn} onClick={onShareGame} style={{ flex: 1, padding: '12px 8px', fontSize: '0.85rem' }}>
                            📤 게임 공유하기
                        </button>
                    </div>

                    <div className={styles.titleCredits}>정치 풍자 육성 시뮬레이션 · 오른스푼 × 드럼통119 제작</div>

                    <div className={styles.socialLinks}>
                        <a href="https://www.youtube.com/@drumtong119" target="_blank" rel="noopener noreferrer" className={styles.socialLink}>
                            ▶ 드럼통119 유튜브
                        </a>
                        <a href="https://www.instagram.com/drumtong119" target="_blank" rel="noopener noreferrer" className={styles.socialLink}>
                            📸 드럼통119 인스타그램
                        </a>
                    </div>
                </div>

                {showInfo && (
                    <ModalShell
                        className={`${styles.eduModal} ${styles.infoModal}`}
                        labelledBy="title-info-modal"
                        onClose={() => setShowInfo(false)}
                    >
                            <div className={styles.eventEmoji}>📜</div>
                            <h3 className={styles.eventTitle} id="title-info-modal">게임 안내 및 제작 목적</h3>

                            <div className={styles.eduSection}>
                                <div className={styles.eduSectionTitle}>🎯 제작 목적</div>
                                <p className={styles.eduText}>
                                    이 게임은 현직 정치인의 여러 형사 재판들이 정치적 외압이나 특검법 등을 통해 강제로 취소(소멸)될 경우, 대한민국의 법치주의와 삼권분립 체계에 어떤 파국이 도래할 수 있는지를 시뮬레이션하기 위해 제작되었습니다.<br/><br/>
                                    권력으로 재판을 없애는 행위가 단순한 &apos;방어&apos;가 아니라 헌정사에 대한 심각한 도전임을 체험하게 하는 것이 본 게임의 목적입니다.
                                </p>
                            </div>

                            <div className={styles.eduSection}>
                                <div className={styles.eduSectionTitle}>🎮 게임 방법</div>
                                <ul className={styles.infoList}>
                                    <li><strong>목표:</strong> 60개월(5년)의 임기 동안 여러 정치적 행동을 통해 &apos;공소취소완성도&apos;를 100%로 만들고, 최종적으로 <strong>&apos;공소취소 버튼&apos;</strong>을 누르는 것입니다.</li>
                                    <li><strong>수치 관리:</strong> 각 행동은 공소취소완성도를 높이지만, 동시에 법치주의, 삼권분립, 국민신뢰 수치를 깎아먹습니다.</li>
                                    <li><strong>엔딩 조건:</strong> 어떤 행동을 주로 했느냐, 최종 법치주의 수치가 얼마냐에 따라 <strong>5가지의 멀티 엔딩</strong>(방탄 성공, 여론 폭발, 헌재 제동, 법치 붕괴, 임기 종료)으로 분기합니다.</li>
                                    <li><strong>학습 요소:</strong> 행동을 완료할 때마다 실제 헌법에 기반한 법률 해설과 시민들의 반응이 등장합니다.</li>
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

    // ===== 재방문자: 풀 UI =====
    return (
        <div className={styles.gameContainer}>
            <div className={styles.titleScreen}>
                <div className={styles.titleLogo}>📜</div>
                <h1 className={styles.titleName}>공소취소 메이커</h1>
                <p className={styles.titleSub}>&quot;재판은 멈추고, 권력은 자란다&quot;</p>

                {completionCount != null && completionCount > 0 && (
                    <div className={styles.completionBanner}>
                        🏆 지금까지 <strong>{completionCount.toLocaleString()}</strong>명이 공소취소를 목격했습니다
                    </div>
                )}

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

                <StoreCta variant="title" />

                <div className={styles.titleInfo}>
                    <span>모바일 최적화</span>
                    <span>자동 저장</span>
                    <span>멀티 엔딩</span>
                </div>

                {/* 슬롯/컬렉션/통계 — 접기 가능 */}
                <button
                    className={styles.secondaryBtn}
                    onClick={() => setShowMore(!showMore)}
                    style={{ padding: "10px 16px", fontSize: "0.85rem", minWidth: "auto" }}
                >
                    {showMore ? "△ 접기" : "▽ 슬롯 · 컬렉션 · 통계"}
                </button>

                {showMore && (
                    <>
                        <div className={styles.slotSection}>
                            <div className={styles.slotHeader}>
                                <div className={styles.slotTitle}>저장 슬롯</div>
                                <div className={styles.slotMeta}>선택 중: {activeSlotId}번</div>
                            </div>
                            <div className={styles.slotGrid}>
                                {saveSlotSummaries.map((slot) => (
                                    <button
                                        key={slot.slotId}
                                        type="button"
                                        className={`${styles.slotCard} ${slot.slotId === activeSlotId ? styles["slotCard--active"] : ""}`}
                                        onClick={() => onSelectSlot(slot.slotId)}
                                    >
                                        <div className={styles.slotCardTop}>
                                            <span className={styles.slotCardLabel}>SLOT {slot.slotId}</span>
                                            <span className={styles.slotCardStatus}>{slot.hasSave ? "저장됨" : "비어 있음"}</span>
                                        </div>
                                        <div className={styles.slotCardBody}>
                                            {slot.hasSave ? (
                                                <>
                                                    <div>{slot.month}개월 차</div>
                                                    <div>공소취소 {slot.progress}%</div>
                                                </>
                                            ) : (
                                                <div>새 게임 시작 가능</div>
                                            )}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className={styles.collectionPanel}>
                            <div className={styles.collectionHeader}>
                                <div className={styles.collectionTitle}>엔딩 컬렉션</div>
                                <div className={styles.collectionMeta}>
                                    {discoveredEndingIds.length}/{GAME_ENDINGS.length} 해금
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

                        <div className={styles.profilePanel}>
                            <div className={styles.profileHeader}>
                                <div className={styles.profileTitle}>플레이 기록</div>
                                <button className={styles.profileOpenBtn} onClick={() => setShowStats(true)}>
                                    상세 보기
                                </button>
                            </div>
                            <div className={styles.profileGrid}>
                                <div className={styles.profileCard}>
                                    <span className={styles.profileLabel}>총 플레이</span>
                                    <strong className={styles.profileValue}>{playStatsSummary.totalSessions}</strong>
                                </div>
                                <div className={styles.profileCard}>
                                    <span className={styles.profileLabel}>총 행동 수</span>
                                    <strong className={styles.profileValue}>{playStatsSummary.totalActions}</strong>
                                </div>
                                <div className={styles.profileCard}>
                                    <span className={styles.profileLabel}>완주 횟수</span>
                                    <strong className={styles.profileValue}>{playStatsSummary.completedRuns}</strong>
                                </div>
                                <div className={styles.profileCard}>
                                    <span className={styles.profileLabel}>최다 사용 행동</span>
                                    <strong className={styles.profileValueSmall}>
                                        {mostUsedAction ? `${mostUsedAction.emoji} ${mostUsedAction.name}` : "기록 없음"}
                                    </strong>
                                </div>
                                <div className={styles.profileCard}>
                                    <span className={styles.profileLabel}>최근 엔딩</span>
                                    <strong className={styles.profileValueSmall}>
                                        {latestEnding ? `${latestEnding.emoji} ${latestEnding.name}` : "아직 없음"}
                                    </strong>
                                </div>
                            </div>
                        </div>
                    </>
                )}

                <div className={styles.titleExtraActions} style={{ display: 'flex', gap: '8px', marginTop: '12px', width: '100%' }}>
                    <button className={styles.ghostBtn} onClick={() => setShowInfo(true)} style={{ flex: 1, padding: '12px 8px', fontSize: '0.85rem' }}>
                        📖 안내 및 목적
                    </button>
                    <button className={styles.secondaryBtn} onClick={onShareGame} style={{ flex: 1, padding: '12px 8px', fontSize: '0.85rem' }}>
                        📤 게임 공유하기
                    </button>
                </div>

                {isHydrated && hasSavedGame && <div className={styles.saveBanner}>이전 플레이가 저장되어 있습니다.</div>}

                <div className={styles.titleCredits}>정치 풍자 육성 시뮬레이션 · 오른스푼 × 드럼통119 제작</div>

                <div className={styles.socialLinks}>
                    <a href="https://www.youtube.com/@drumtong119" target="_blank" rel="noopener noreferrer" className={styles.socialLink}>
                        ▶ 드럼통119 유튜브
                    </a>
                    <a href="https://www.instagram.com/drumtong119" target="_blank" rel="noopener noreferrer" className={styles.socialLink}>
                        📸 드럼통119 인스타그램
                    </a>
                </div>
            </div>

            {showInfo && (
                <ModalShell
                    className={`${styles.eduModal} ${styles.infoModal}`}
                    labelledBy="title-info-modal"
                    onClose={() => setShowInfo(false)}
                >
                        <div className={styles.eventEmoji}>📜</div>
                        <h3 className={styles.eventTitle} id="title-info-modal">게임 안내 및 제작 목적</h3>

                        <div className={styles.eduSection}>
                            <div className={styles.eduSectionTitle}>🎯 제작 목적</div>
                            <p className={styles.eduText}>
                                이 게임은 현직 정치인의 여러 형사 재판들이 정치적 외압이나 특검법 등을 통해 강제로 취소(소멸)될 경우, 대한민국의 법치주의와 삼권분립 체계에 어떤 파국이 도래할 수 있는지를 시뮬레이션하기 위해 제작되었습니다.<br/><br/>
                                권력으로 재판을 없애는 행위가 단순한 &apos;방어&apos;가 아니라 헌정사에 대한 심각한 도전임을 체험하게 하는 것이 본 게임의 목적입니다.
                            </p>
                        </div>

                        <div className={styles.eduSection}>
                            <div className={styles.eduSectionTitle}>🎮 게임 방법</div>
                            <ul className={styles.infoList}>
                                <li><strong>목표:</strong> 60개월(5년)의 임기 동안 여러 정치적 행동을 통해 &apos;공소취소완성도&apos;를 100%로 만들고, 최종적으로 <strong>&apos;공소취소 버튼&apos;</strong>을 누르는 것입니다.</li>
                                <li><strong>수치 관리:</strong> 각 행동은 공소취소완성도를 높이지만, 동시에 법치주의, 삼권분립, 국민신뢰 수치를 깎아먹습니다.</li>
                                <li><strong>엔딩 조건:</strong> 어떤 행동을 주로 했느냐, 최종 법치주의 수치가 얼마냐에 따라 <strong>5가지의 멀티 엔딩</strong>(방탄 성공, 여론 폭발, 헌재 제동, 법치 붕괴, 임기 종료)으로 분기합니다.</li>
                                <li><strong>학습 요소:</strong> 행동을 완료할 때마다 실제 헌법에 기반한 법률 해설과 시민들의 반응이 등장합니다.</li>
                            </ul>
                        </div>

                        <button className={styles.eventBtn} onClick={() => setShowInfo(false)}>
                            확인
                        </button>
                </ModalShell>
            )}

            {showStats && (
                <ModalShell
                    className={`${styles.eduModal} ${styles.statsModal}`}
                    labelledBy="title-stats-modal"
                    onClose={() => setShowStats(false)}
                >
                    <div className={styles.eventEmoji}>📊</div>
                    <h3 className={styles.eventTitle} id="title-stats-modal">플레이 통계 상세</h3>

                    <div className={styles.eduSection}>
                        <div className={styles.eduSectionTitle}>요약</div>
                        <div className={styles.statsSummaryGrid}>
                            <div className={styles.statsSummaryCard}>
                                <span className={styles.profileLabel}>총 플레이</span>
                                <strong className={styles.profileValue}>{playStatsSummary.totalSessions}</strong>
                            </div>
                            <div className={styles.statsSummaryCard}>
                                <span className={styles.profileLabel}>완주율</span>
                                <strong className={styles.profileValue}>{Math.round(playStatsDetails.completionRate * 100)}%</strong>
                            </div>
                            <div className={styles.statsSummaryCard}>
                                <span className={styles.profileLabel}>해금 엔딩</span>
                                <strong className={styles.profileValue}>{discoveredEndingIds.length}</strong>
                            </div>
                        </div>
                    </div>

                    <div className={styles.eduSection}>
                        <div className={styles.eduSectionTitle}>행동 사용 랭킹</div>
                        <div className={styles.statsRanking}>
                            {playStatsDetails.actionRanking.length > 0 ? (
                                playStatsDetails.actionRanking.map((entry, index) => {
                                    const action = GAME_ACTIONS.find((item) => item.id === entry.actionId);
                                    return (
                                        <div key={entry.actionId} className={styles.statsRankingItem}>
                                            <span className={styles.statsRankingIndex}>{String(index + 1).padStart(2, "0")}</span>
                                            <span className={styles.statsRankingName}>
                                                {action ? `${action.emoji} ${action.name}` : entry.actionId}
                                            </span>
                                            <span className={styles.statsRankingCount}>{entry.count}회</span>
                                        </div>
                                    );
                                })
                            ) : (
                                <div className={styles.statsEmpty}>아직 기록이 없습니다.</div>
                            )}
                        </div>
                    </div>

                    <button className={styles.eventBtn} onClick={() => setShowStats(false)}>
                        닫기
                    </button>
                </ModalShell>
            )}
        </div>
    );
}
