import { useState } from "react";
import { GAME_ENDINGS, MAX_MONTHS, type GameEnding, type GameStats } from "./gameData";
import type { LeaderboardEntry } from "./useIndictmentGame";
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
}: EndingScreenProps) {
    const [nickname, setNickname] = useState("");
    const [submitted, setSubmitted] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const survived = Math.min(month - 1, MAX_MONTHS);

    const handleSubmit = async () => {
        if (!nickname.trim() || submitted) return;
        setSubmitting(true);
        await onSubmitScore(nickname.trim());
        setSubmitted(true);
        setSubmitting(false);
    };

    const bgGradient = endingData.isVictory
        ? "linear-gradient(180deg, rgba(20,60,40,0.98), rgba(10,15,30,0.98))"
        : "linear-gradient(180deg, rgba(60,20,20,0.98), rgba(15,10,20,0.98))";

    return (
        <div className={styles.gameContainer}>
            <div className={styles.endingScreen} style={{ background: bgGradient }}>
                <div className={styles.vnEndingEmoji}>{endingData.emoji}</div>

                <div className={styles.vnEndingBadge}>
                    {endingData.isVictory ? "🏆 승리!" : "💀 패배..."}
                </div>

                <h2 className={styles.vnEndingTitle}>{endingData.title}</h2>

                <p className={styles.vnEndingDesc}>{endingData.description}</p>

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
                    <button className={styles.secondaryBtn} onClick={onShare}>
                        📤 결과 공유
                    </button>
                </div>
            </div>
        </div>
    );
}
