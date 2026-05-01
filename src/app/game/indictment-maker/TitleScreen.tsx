import { useState } from "react";
import { GAME_ENDINGS } from "./gameData";
import ModalShell from "./ModalShell";
import type { SaveSlotSummary } from "./useIndictmentGame";
import styles from "./game.module.css";

interface TitleScreenProps {
    activeSlotId: number;
    discoveredEndingIds: string[];
    hasSavedGame: boolean;
    isHydrated: boolean;
    onClearSave: () => void;
    onContinue: () => void;
    onNewGame: () => void;
    onSelectSlot: (slotId: number) => void;
    saveSlotSummaries: SaveSlotSummary[];
}

export default function TitleScreen({
    activeSlotId,
    discoveredEndingIds,
    hasSavedGame,
    isHydrated,
    onClearSave,
    onContinue,
    onNewGame,
    onSelectSlot,
    saveSlotSummaries,
}: TitleScreenProps) {
    const [showInfo, setShowInfo] = useState(false);

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

                <button className={styles.ghostBtn} onClick={() => setShowInfo(true)} style={{ marginTop: '8px' }}>
                    📖 게임 안내 및 제작 목적
                </button>

                {isHydrated && hasSavedGame && <div className={styles.saveBanner}>이전 플레이가 저장되어 있습니다.</div>}

                <div className={styles.titleCredits}>정치 풍자 육성 시뮬레이션 · 오른스푼 제작</div>

                <a 
                    href="https://influencers.coupang.com/s/drumtong119" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className={styles.sponsorBannerTitle}
                >
                    <div className={styles.sponsorIcon}>💖</div>
                    <div className={styles.sponsorText}>
                        <span>클릭 한 번으로 콘텐츠 제작을 응원해주세요 (쿠팡 방문)</span>
                    </div>
                </a>
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
                                <li><strong>학습 요소:</strong> 행동을 완료할 때마다 실제 헌법에 기반한 법률 해설과 시민들의 반응이 등장합니다. 또한, 화면 중앙의 사건 파일(Dossier) 탭을 눌러 각 재판의 실제 혐의와 증거를 확인할 수 있습니다.</li>
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
