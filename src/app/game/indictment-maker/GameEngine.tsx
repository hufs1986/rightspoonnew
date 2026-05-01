"use client";

import { useState, useCallback, useEffect } from "react";
import styles from "./game.module.css";
import {
    GameStats, GameAction, RandomEvent,
    GAME_ACTIONS, CHARACTER_LEVELS, RANDOM_EVENTS,
    GAME_ENDINGS, TRIALS,
} from "./gameData";

const INITIAL_STATS: GameStats = {
    lawRule: 100,
    separation: 100,
    judicialIndep: 100,
    publicTrust: 80,
    regimeShield: 10,
    legislativeRush: 5,
    cancelProgress: 0,
    mediaControversy: 10,
    oppositionAnger: 15,
};

function clamp(val: number, min = 0, max = 100) {
    return Math.max(min, Math.min(max, val));
}

function applyEffects(stats: GameStats, effects: Partial<GameStats>): GameStats {
    const next = { ...stats };
    for (const [key, delta] of Object.entries(effects)) {
        const k = key as keyof GameStats;
        next[k] = clamp((next[k] || 0) + (delta || 0));
    }
    return next;
}

function getCharacterLevel(progress: number) {
    let current = CHARACTER_LEVELS[0];
    for (const lvl of CHARACTER_LEVELS) {
        if (progress >= lvl.requiredProgress) current = lvl;
    }
    return current;
}

function getStatColor(key: string, value: number): string {
    // 법치주의/삼권분립/사법독립/국민신뢰는 높을수록 좋음
    const goodStats = ["lawRule", "separation", "judicialIndep", "publicTrust"];
    if (goodStats.includes(key)) {
        if (value >= 60) return styles.statGood;
        if (value >= 30) return styles.statWarning;
        return styles.statDanger;
    }
    // 나머지는 높을수록 위험
    if (value >= 70) return styles.statDanger;
    if (value >= 40) return styles.statWarning;
    return styles.statNeutral;
}

const STAT_LABELS: Record<string, { label: string; emoji: string }> = {
    lawRule: { label: "법치주의", emoji: "⚖️" },
    separation: { label: "삼권분립", emoji: "🏛️" },
    judicialIndep: { label: "사법독립", emoji: "👨‍⚖️" },
    publicTrust: { label: "국민신뢰", emoji: "👥" },
    regimeShield: { label: "정권방탄", emoji: "🛡️" },
    legislativeRush: { label: "입법폭주", emoji: "🚂" },
    cancelProgress: { label: "공소취소", emoji: "🔴" },
    mediaControversy: { label: "언론논란", emoji: "📺" },
    oppositionAnger: { label: "야당분노", emoji: "😡" },
};

export default function GameEngine() {
    const [phase, setPhase] = useState<"title" | "playing" | "cancel_animation" | "ending">("title");
    const [stats, setStats] = useState<GameStats>(INITIAL_STATS);
    const [month, setMonth] = useState(1);
    const [milestones, setMilestones] = useState<Set<string>>(new Set());
    const [newsHistory, setNewsHistory] = useState<string[]>([]);
    const [currentEvent, setCurrentEvent] = useState<{ title: string; description: string; effects: Partial<GameStats>; newsHeadline: string } | null>(null);
    const [endingData, setEndingData] = useState<typeof GAME_ENDINGS[0] | null>(null);
    const [trialsCancelled, setTrialsCancelled] = useState(false);

    const charLevel = getCharacterLevel(stats.cancelProgress);

    // 엔딩 체크
    const checkEnding = useCallback((newStats: GameStats, newMilestones: Set<string>, newMonth: number) => {
        if (newMonth > 60) {
            // 임기 종료 엔딩
            const ending = GAME_ENDINGS.find(e => e.id === "term_ended")!;
            setEndingData(ending);
            setPhase("ending");
            return true;
        }

        // 헌재 제동 엔딩: 법치주의와 삼권분립이 너무 낮고 공소취소 미완성
        if (newStats.lawRule <= 15 && newStats.separation <= 20 && newStats.cancelProgress < 100) {
            const ending = GAME_ENDINGS.find(e => e.id === "constitutional_block")!;
            setEndingData(ending);
            setPhase("ending");
            return true;
        }

        return false;
    }, []);

    // 공소취소 후 엔딩 판정
    useEffect(() => {
        if (phase === "playing" && milestones.has("indictment_cancelled")) {
            // 공소취소 애니메이션 후 엔딩으로
            const timer = setTimeout(() => {
                let ending = GAME_ENDINGS
                    .filter(e => e.condition(stats, milestones))
                    .sort((a, b) => b.priority - a.priority)[0];
                if (!ending) ending = GAME_ENDINGS.find(e => e.id === "shield_success")!;
                setEndingData(ending);
                setPhase("ending");
            }, 100);
            return () => clearTimeout(timer);
        }
    }, [phase, milestones, stats]);

    // 랜덤 이벤트
    const rollRandomEvent = useCallback((currentMonth: number): RandomEvent | null => {
        const eligible = RANDOM_EVENTS.filter(e => currentMonth >= e.minMonth && Math.random() < e.probability);
        if (eligible.length === 0) return null;
        return eligible[Math.floor(Math.random() * eligible.length)];
    }, []);

    // 행동 실행
    const executeAction = useCallback((action: GameAction) => {
        const newStats = applyEffects(stats, action.effects);
        const newMilestones = new Set(milestones);
        if (action.unlocksMilestone) newMilestones.add(action.unlocksMilestone);

        const newMonth = month + 1;
        const newNews = [action.newsHeadline, ...newsHistory].slice(0, 10);

        // 공소취소 특별 처리
        if (action.id === "cancel_indictment") {
            setStats(newStats);
            setMilestones(newMilestones);
            setMonth(newMonth);
            setNewsHistory(newNews);
            setTrialsCancelled(true);
            setPhase("cancel_animation");
            setTimeout(() => setPhase("playing"), 4000);
            return;
        }

        setStats(newStats);
        setMilestones(newMilestones);
        setMonth(newMonth);
        setNewsHistory(newNews);

        // 엔딩 체크
        if (checkEnding(newStats, newMilestones, newMonth)) return;

        // 랜덤 이벤트
        const randomEvent = rollRandomEvent(newMonth);
        if (randomEvent) {
            setCurrentEvent(randomEvent);
        }
    }, [stats, milestones, month, newsHistory, checkEnding, rollRandomEvent]);

    // 이벤트 닫기
    const dismissEvent = useCallback(() => {
        if (!currentEvent) return;
        const newStats = applyEffects(stats, currentEvent.effects);
        const newNews = [currentEvent.newsHeadline, ...newsHistory].slice(0, 10);
        setStats(newStats);
        setNewsHistory(newNews);
        setCurrentEvent(null);
        checkEnding(newStats, milestones, month);
    }, [currentEvent, stats, newsHistory, milestones, month, checkEnding]);

    // 리스타트
    const restart = () => {
        setPhase("title");
        setStats(INITIAL_STATS);
        setMonth(1);
        setMilestones(new Set());
        setNewsHistory([]);
        setEndingData(null);
        setTrialsCancelled(false);
        setCurrentEvent(null);
    };

    // 공유
    const handleShare = async () => {
        const text = endingData
            ? `🎮 공소취소 메이커\n엔딩: ${endingData.title}\n${endingData.name}\n\n 법치주의: ${stats.lawRule}\n 공소취소: ${stats.cancelProgress}\n\n#공소취소메이커 #오른스푼`
            : "🎮 공소취소 메이커를 플레이해보세요! #공소취소메이커 #오른스푼";
        try {
            if (navigator.share) {
                await navigator.share({ title: "공소취소 메이커", text, url: window.location.href });
            } else {
                await navigator.clipboard.writeText(text + "\n" + window.location.href);
                alert("결과가 복사되었습니다!");
            }
        } catch { /* ignore */ }
    };

    // 사용 가능한 행동 필터
    const availableActions = GAME_ACTIONS.filter(a => {
        if (a.phase > charLevel.level + 1) return false;
        return true;
    });

    const isActionLocked = (action: GameAction): boolean => {
        if (!action.requires) return false;
        return action.requires.some(req => !milestones.has(req));
    };

    const isActionDone = (action: GameAction): boolean => {
        return action.unlocksMilestone ? milestones.has(action.unlocksMilestone) : false;
    };

    // ============ TITLE SCREEN ============
    if (phase === "title") {
        return (
            <div className={styles.gameContainer}>
                <div className={styles.titleScreen}>
                    <div className={styles.titleLogo}>📜</div>
                    <h1 className={styles.titleName}>공소취소 메이커</h1>
                    <p className={styles.titleSub}>&quot;재판은 멈추고, 권력은 자란다&quot;</p>
                    <button className={styles.startBtn} onClick={() => setPhase("playing")}>
                        ▶ 게임 시작
                    </button>
                    <div className={styles.titleCredits}>
                        정치 풍자 육성 시뮬레이션 · 오른스푼 제작
                    </div>
                </div>
            </div>
        );
    }

    // ============ CANCEL ANIMATION ============
    if (phase === "cancel_animation") {
        return (
            <div className={styles.gameContainer}>
                <div className={styles.cancelOverlay}>
                    <div className={styles.cancelText}>
                        재판이 종료되었습니다.
                    </div>
                    <div className={styles.cancelSubText}>
                        유무죄 판단 없음.<br />
                        증거조사 없음.<br />
                        판결 없음.<br /><br />
                        공소가 사라졌습니다.
                    </div>
                </div>
            </div>
        );
    }

    // ============ ENDING SCREEN ============
    if (phase === "ending" && endingData) {
        return (
            <div className={styles.gameContainer}>
                <div className={styles.endingScreen}>
                    <div className={styles.endingEmoji}>{endingData.emoji}</div>
                    <div className={styles.endingLabel}>— ENDING —</div>
                    <h2 className={styles.endingTitle}>{endingData.title}</h2>
                    <p className={styles.endingDesc}>{endingData.description}</p>

                    <div className={styles.endingStats}>
                        {[
                            { label: "법치주의", value: stats.lawRule },
                            { label: "삼권분립", value: stats.separation },
                            { label: "사법독립", value: stats.judicialIndep },
                            { label: "국민신뢰", value: stats.publicTrust },
                            { label: "정권방탄", value: stats.regimeShield },
                            { label: "공소취소", value: stats.cancelProgress },
                        ].map(s => (
                            <div key={s.label} className={styles.endingStat}>
                                <div className={styles.endingStatLabel}>{s.label}</div>
                                <div className={`${styles.endingStatValue} ${s.value >= 50 ? styles["endingStatValue--good"] : styles["endingStatValue--bad"]}`}>
                                    {s.value}
                                </div>
                            </div>
                        ))}
                    </div>

                    <button className={styles.restartBtn} onClick={restart}>
                        ↻ 다시 시작
                    </button>
                    <button className={styles.shareBtn} onClick={handleShare}>
                        📤 결과 공유하기
                    </button>
                </div>
            </div>
        );
    }

    // ============ PLAYING ============
    return (
        <div className={styles.gameContainer}>
            <div className={styles.gameLayout}>
                {/* HUD */}
                <div className={styles.hud}>
                    <div className={styles.hudLeft}>
                        <span className={styles.hudMonth}>임기</span>
                        <span className={styles.hudMonthValue}>{month}개월 / 60</span>
                    </div>
                    <div className={styles.hudCenter}>
                        <span className={styles.hudCharacter}>{charLevel.emoji}</span>
                        <span className={styles.hudCharName}>{charLevel.name}</span>
                    </div>
                    <div className={styles.hudRight}>
                        <span className={styles.hudLevel}>Lv.{charLevel.level}</span>
                        <span className={styles.hudProgress}>공소취소 {stats.cancelProgress}%</span>
                    </div>
                </div>

                {/* Stats */}
                <div className={styles.statsPanel}>
                    {(Object.entries(STAT_LABELS) as [string, { label: string; emoji: string }][]).map(([key, info]) => {
                        const value = stats[key as keyof GameStats];
                        return (
                            <div key={key} className={styles.statItem}>
                                <span className={styles.statLabel}>
                                    {info.emoji} {info.label}
                                </span>
                                <div className={styles.statBarOuter}>
                                    <div
                                        className={`${styles.statBarInner} ${getStatColor(key, value)}`}
                                        style={{ width: `${value}%` }}
                                    />
                                </div>
                                <span className={styles.statValue}>{value}</span>
                            </div>
                        );
                    })}
                </div>

                {/* Trials */}
                <div className={styles.trialsPanel}>
                    {TRIALS.map(trial => (
                        <div
                            key={trial.id}
                            className={`${styles.trialChip} ${trialsCancelled ? styles["trialChip--cancelled"] : ""}`}
                        >
                            {trial.emoji} {trial.name}
                        </div>
                    ))}
                </div>

                {/* News */}
                {newsHistory.length > 0 && (
                    <div className={styles.newsTicker}>
                        <div className={styles.newsLabel}>🔴 속보</div>
                        <div className={styles.newsText}>{newsHistory[0]}</div>
                        {newsHistory.length > 1 && (
                            <div className={styles.newsHistory}>
                                {newsHistory.slice(1).map((n, i) => (
                                    <div key={i} className={styles.newsHistoryItem}>{n}</div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Actions */}
                <div className={styles.actionsTitle}>🎯 이번 달 행동을 선택하세요</div>
                <div className={styles.actionsGrid}>
                    {availableActions.map(action => {
                        const locked = isActionLocked(action);
                        const done = isActionDone(action);
                        const isFinal = action.id === "cancel_indictment" && !locked;

                        if (done && action.id !== "do_nothing" && action.id !== "press_conference" && action.id !== "rally_supporters" && action.id !== "discredit_prosecutors") {
                            return null;
                        }

                        return (
                            <div
                                key={action.id}
                                className={`${styles.actionCard} ${locked ? styles["actionCard--locked"] : ""} ${isFinal ? styles["actionCard--final"] : ""}`}
                                onClick={() => !locked && executeAction(action)}
                            >
                                <div className={styles.actionEmoji}>{action.emoji}</div>
                                <div className={styles.actionName}>{action.name}</div>
                                <div className={styles.actionDesc}>{action.description}</div>
                                {locked && (
                                    <div className={styles.actionLocked}>🔒 선행 조건 미충족</div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Event Modal */}
            {currentEvent && (
                <div className={styles.eventOverlay} onClick={dismissEvent}>
                    <div className={styles.eventModal} onClick={e => e.stopPropagation()}>
                        <div className={styles.eventEmoji}>⚡</div>
                        <h3 className={styles.eventTitle}>{currentEvent.title}</h3>
                        <p className={styles.eventDesc}>{currentEvent.description}</p>
                        <div className={styles.eventEffects}>
                            {Object.entries(currentEvent.effects).map(([key, val]) => (
                                <div key={key}>
                                    <span className={val! > 0 ? styles.effectPositive : styles.effectNegative}>
                                        {STAT_LABELS[key]?.emoji} {STAT_LABELS[key]?.label}: {val! > 0 ? "+" : ""}{val}
                                    </span>
                                </div>
                            ))}
                        </div>
                        <button className={styles.eventBtn} onClick={dismissEvent}>
                            확인
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
