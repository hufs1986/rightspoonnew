import { useState, useRef, useEffect } from "react";
import { toPng } from "html-to-image";
import { GAME_ENDINGS, MAX_MONTHS, TRIALS, type GameEnding, type GameStats } from "./gameData";
import type { LeaderboardEntry } from "./useIndictmentGame";
import { calculateArchetype } from "./archetypes";
import { initAudio, playSfx } from "./audioUtils";
import styles from "./game.module.css";

interface EndingScreenProps {
    completionCount?: number | null;
    discoveredEndingIds: string[];
    endingData: GameEnding;
    onRestart: () => void;
    onShare: () => void;
    stats: GameStats;
    month: number;
    leaderboard: LeaderboardEntry[];
    onSubmitScore: (nickname: string) => Promise<void>;
    actionFrequencies: Record<string, number>;
}

export default function EndingScreen({
    completionCount,
    discoveredEndingIds,
    endingData,
    onRestart,
    onShare,
    stats,
    month,
    leaderboard,
    onSubmitScore,
    actionFrequencies,
}: EndingScreenProps) {
    const [nickname, setNickname] = useState("");
    const [submitted, setSubmitted] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const cardRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        initAudio();
        if (endingData.isVictory) {
            playSfx("win");
        } else {
            playSfx("lose");
        }
    }, [endingData.isVictory]);

    const survived = Math.min(month - 1, MAX_MONTHS);
    const archetype = calculateArchetype(actionFrequencies);

    const handleSubmit = async () => {
        if (!nickname.trim() || submitted) return;
        setSubmitting(true);
        await onSubmitScore(nickname.trim());
        setSubmitted(true);
        setSubmitting(false);
    };

    const handleDownloadCard = async () => {
        if (!cardRef.current) return;
        try {
            const dataUrl = await toPng(cardRef.current, { cacheBust: true, pixelRatio: 2, style: { background: "#090b14" } });
            const link = document.createElement("a");
            link.download = "indictment-archetype.png";
            link.href = dataUrl;
            link.click();
        } catch (err) {
            console.error(err);
            alert("이미지 저장에 실패했습니다.");
        }
    };

    const bgGradient = endingData.isVictory
        ? "linear-gradient(180deg, rgba(20,60,40,0.98), rgba(10,15,30,0.98))"
        : "linear-gradient(180deg, rgba(60,20,20,0.98), rgba(15,10,20,0.98))";

    return (
        <div className={styles.gameContainer} style={{ overflowY: 'auto', WebkitOverflowScrolling: 'touch', minHeight: '100dvh', paddingBottom: '40px' }}>
            <div className={styles.endingScreen} style={{ background: bgGradient, minHeight: '100%' }}>
                <div className={styles.vnEndingEmoji}>{endingData.emoji}</div>

                <div className={styles.vnEndingBadge}>
                    {endingData.isVictory ? "🏆 승리!" : "💀 패배..."}
                </div>

                <h2 className={styles.vnEndingTitle}>{endingData.title}</h2>

                <p className={styles.vnEndingDesc}>{endingData.description}</p>

                {/* 패배 엔딩: 사라지는 재판 목록 */}
                {!endingData.isVictory && endingData.id === "cancel_success" && (
                    <div style={{
                        margin: '16px auto',
                        padding: '16px',
                        background: 'rgba(255, 50, 50, 0.06)',
                        border: '1px solid rgba(255, 50, 50, 0.2)',
                        borderRadius: '12px',
                        maxWidth: '400px',
                    }}>
                        <div style={{ fontSize: '0.8rem', color: '#ff6b6b', marginBottom: '12px', fontWeight: 700 }}>
                            ❌ 영원히 사라진 재판들
                        </div>
                        {TRIALS.map((trial) => (
                            <div key={trial.id} style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                padding: '6px 0',
                                borderBottom: '1px solid rgba(255,255,255,0.05)',
                                textDecoration: 'line-through',
                                color: 'rgba(255, 100, 100, 0.6)',
                                fontSize: '0.82rem',
                            }}>
                                <span>{trial.emoji}</span>
                                <span>{trial.name}</span>
                                <span style={{ marginLeft: 'auto', fontSize: '0.7rem', color: '#555' }}>{trial.court}</span>
                            </div>
                        ))}
                        <div style={{
                            marginTop: '12px',
                            fontSize: '0.78rem',
                            color: '#ff9999',
                            textAlign: 'center',
                            fontStyle: 'italic',
                            lineHeight: '1.6',
                        }}>
                            유죄도 무죄도 아닙니다.<br />
                            재판이 사라진 것입니다.<br />
                            <strong style={{ color: '#ff6b6b' }}>다음 권력도 배웠습니다. &ldquo;재판은 지울 수 있다.&rdquo;</strong>
                        </div>
                    </div>
                )}

                {/* 승리 엔딩: 지켜낸 재판 목록 */}
                {endingData.isVictory && (
                    <div style={{
                        margin: '16px auto',
                        padding: '16px',
                        background: 'rgba(94, 226, 141, 0.06)',
                        border: '1px solid rgba(94, 226, 141, 0.2)',
                        borderRadius: '12px',
                        maxWidth: '400px',
                    }}>
                        <div style={{ fontSize: '0.8rem', color: '#5ee28d', marginBottom: '12px', fontWeight: 700 }}>
                            ✅ 당신이 지켜낸 재판들
                        </div>
                        {TRIALS.map((trial) => (
                            <div key={trial.id} style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                padding: '6px 0',
                                borderBottom: '1px solid rgba(255,255,255,0.05)',
                                color: '#c8d8e8',
                                fontSize: '0.82rem',
                            }}>
                                <span>{trial.emoji}</span>
                                <span>{trial.name}</span>
                                <span style={{ marginLeft: 'auto', fontSize: '0.7rem', color: '#5ee28d' }}>진행 중 ✅</span>
                            </div>
                        ))}
                        <div style={{
                            marginTop: '12px',
                            fontSize: '0.78rem',
                            color: '#a3d4b0',
                            textAlign: 'center',
                            fontStyle: 'italic',
                            lineHeight: '1.6',
                        }}>
                            진실은 법정에서 밝혀질 것입니다.<br />
                            <strong style={{ color: '#5ee28d' }}>시민이 법치주의를 지켰습니다.</strong>
                        </div>
                    </div>
                )}

                {/* 플레이어 성향(Archetype) 결과 카드 (캡처 영역) */}
                <div 
                    ref={cardRef}
                    className={styles.archetypeCard}
                    style={{ borderColor: archetype.color }}
                >
                    <div className={styles.archetypeHeader}>당신의 플레이 성향은?</div>
                    <div className={styles.archetypeEmoji}>{archetype.emoji}</div>
                    <div className={styles.archetypeName} style={{ color: archetype.color }}>
                        {archetype.name}
                    </div>
                    <div className={styles.archetypeDesc}>{archetype.description}</div>
                </div>

                {/* 결과 수치 */}
                <div className={styles.vnEndingStatsGrid}>
                    <div className={styles.vnEndingStatCard}>
                        <div className={styles.vnEndingStatLabel}>📅 생존 기간</div>
                        <div className={`${styles.vnEndingStatValue} ${survived >= MAX_MONTHS ? styles["vnEndingStatValue--good"] : styles["vnEndingStatValue--bad"]}`}>
                            {survived}/{MAX_MONTHS}개월
                        </div>
                    </div>
                    <div className={styles.vnEndingStatCard}>
                        <div className={styles.vnEndingStatLabel}>🔴 공소취소 진행률</div>
                        <div className={`${styles.vnEndingStatValue} ${stats.cancelProgress < 100 ? styles["vnEndingStatValue--good"] : styles["vnEndingStatValue--bad"]}`}>
                            {stats.cancelProgress}%
                        </div>
                    </div>
                    <div className={styles.vnEndingStatCard}>
                        <div className={styles.vnEndingStatLabel}>🏛️ 민주주의</div>
                        <div className={`${styles.vnEndingStatValue} ${stats.democracy >= 50 ? styles["vnEndingStatValue--good"] : styles["vnEndingStatValue--bad"]}`}>
                            {stats.democracy}%
                        </div>
                    </div>
                    <div className={styles.vnEndingStatCard}>
                        <div className={styles.vnEndingStatLabel}>👁️ 국민 인식</div>
                        <div className={`${styles.vnEndingStatValue} ${stats.awareness >= 50 ? styles["vnEndingStatValue--good"] : styles["vnEndingStatValue--bad"]}`}>
                            {stats.awareness}%
                        </div>
                    </div>
                </div>

                {/* 랭킹 등록 */}
                {!submitted ? (
                    <div className={styles.rankSubmitBox}>
                        <div className={styles.rankSubmitTitle}>🏅 랭킹에 등록하세요</div>
                        <div className={styles.rankSubmitRow}>
                            <input
                                type="text"
                                value={nickname}
                                onChange={(e) => setNickname(e.target.value)}
                                placeholder="닉네임 입력"
                                maxLength={12}
                                className={styles.rankInput}
                            />
                            <button
                                className={styles.startBtn}
                                onClick={handleSubmit}
                                disabled={!nickname.trim() || submitting}
                                style={{ padding: "12px 20px", fontSize: "0.9rem" }}
                            >
                                {submitting ? "등록 중..." : "등록"}
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className={styles.rankSubmitBox} style={{ borderColor: "rgba(94,226,141,0.3)", background: "rgba(94,226,141,0.08)" }}>
                        <div className={styles.rankSubmitTitle}>✅ 랭킹에 등록되었습니다!</div>
                    </div>
                )}

                {/* 리더보드 */}
                {leaderboard.length > 0 && (
                    <div className={styles.leaderboardPanel}>
                        <div className={styles.leaderboardTitle}>🏆 리더보드 TOP {leaderboard.length}</div>
                        <div className={styles.leaderboardList}>
                            {leaderboard.map((entry, idx) => (
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
                                    <span className={styles.leaderboardDemocracy}>
                                        🏛️{entry.democracy_score}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* 완주자 수 */}
                {completionCount != null && (
                    <div className={styles.completionBanner}>
                        🏆 지금까지 <strong>{completionCount.toLocaleString()}</strong>명이 법치주의를 지켜냈습니다
                    </div>
                )}

                {/* 엔딩 컬렉션 */}
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

                {/* Action Buttons */}
                <div className={styles.endingActions}>
                    <button className={styles.startBtn} onClick={onRestart}>
                        🔄 다시 도전
                    </button>
                    <button className={styles.secondaryBtn} onClick={handleDownloadCard} style={{ flex: 1 }}>
                        📸 내 성향 이미지 저장
                    </button>
                    <button className={styles.ghostBtn} onClick={onShare}>
                        📤 이 게임 공유하기 — &ldquo;당신도 법치주의를 지켜보세요&rdquo;
                    </button>
                </div>
            </div>
        </div>
    );
}
