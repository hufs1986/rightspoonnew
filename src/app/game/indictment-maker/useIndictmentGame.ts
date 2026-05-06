"use client";

import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from "react";
import { DEFENSE_ACTIONS, type DefenseAction } from "./gameData";
import { gameReducer } from "./gameReducer";
import { createClient } from "@/utils/supabase/client";
import {
    canUseAction,
    createInitialPlayStats,
    createInitialSnapshot,
    ENDING_COLLECTION_KEY,
    getEndingById,
    MAX_SAVE_SLOTS,
    PLAY_STATS_KEY,
    SAVE_SLOTS_KEY,
    type EndingCollection,
    type PlayStats,
    type SaveSlotRecord,
    type StoredSaveSlots,
} from "./gameLogic";

function isStoredSaveSlots(value: unknown): value is StoredSaveSlots {
    if (!value || typeof value !== "object") return false;
    const candidate = value as Partial<StoredSaveSlots>;
    return candidate.version === 5 && typeof candidate.activeSlotId === "number" && Array.isArray(candidate.slots);
}

function isEndingCollection(value: unknown): value is EndingCollection {
    if (!value || typeof value !== "object") return false;
    const candidate = value as Partial<EndingCollection>;
    return candidate.version === 1 && Array.isArray(candidate.endingIds);
}

function isPlayStats(value: unknown): value is PlayStats {
    if (!value || typeof value !== "object") return false;
    const candidate = value as Partial<PlayStats>;
    return (
        candidate.version === 1 &&
        typeof candidate.totalSessions === "number" &&
        typeof candidate.totalActions === "number"
    );
}

export interface SaveSlotSummary {
    slotId: number;
    hasSave: boolean;
    updatedAt: string | null;
    month: number | null;
    progress: number | null;
    endingId: string | null;
}

export interface PlayStatsSummary {
    totalSessions: number;
    totalActions: number;
    completedRuns: number;
    mostUsedActionId: string | null;
    latestEndingId: string | null;
}

export interface PlayStatsDetails {
    actionRanking: Array<{ actionId: string; count: number }>;
    completionRate: number;
}

export interface LeaderboardEntry {
    id: string;
    nickname: string;
    survived_months: number;
    democracy_score: number;
    awareness_score: number;
    cancel_progress: number;
    ending_id: string;
    is_victory: boolean;
    created_at: string;
}

export function useIndictmentGame() {
    const [state, dispatch] = useReducer(gameReducer, undefined, createInitialSnapshot);
    const [isHydrated, setIsHydrated] = useState(false);
    const [activeSlotId, setActiveSlotId] = useState(1);
    const [saveSlots, setSaveSlots] = useState<SaveSlotRecord[]>([]);
    const [discoveredEndingIds, setDiscoveredEndingIds] = useState<string[]>([]);
    const [playStats, setPlayStats] = useState<PlayStats>(createInitialPlayStats);
    const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
    const countedEndingRef = useRef<string | null>(null);
    const usedEventsRef = useRef<Set<string>>(new Set());

    // Hydrate from localStorage
    useEffect(() => {
        if (typeof window === "undefined") return;
        try {
            const slotsRaw = window.localStorage.getItem(SAVE_SLOTS_KEY);
            if (slotsRaw) {
                const parsed = JSON.parse(slotsRaw) as unknown;
                if (isStoredSaveSlots(parsed)) {
                    setSaveSlots(parsed.slots);
                    setActiveSlotId(parsed.activeSlotId);
                }
            }

            const collectionRaw = window.localStorage.getItem(ENDING_COLLECTION_KEY);
            if (collectionRaw) {
                const parsed = JSON.parse(collectionRaw) as unknown;
                if (isEndingCollection(parsed)) setDiscoveredEndingIds(parsed.endingIds);
            }

            const statsRaw = window.localStorage.getItem(PLAY_STATS_KEY);
            if (statsRaw) {
                const parsed = JSON.parse(statsRaw) as unknown;
                if (isPlayStats(parsed)) setPlayStats(parsed);
            }
        } catch {
            window.localStorage.removeItem(SAVE_SLOTS_KEY);
        } finally {
            setIsHydrated(true);
        }
    }, []);

    // Persist save state
    useEffect(() => {
        if (!isHydrated || typeof window === "undefined") return;

        const shouldPersist = state.phase !== "title" || state.month > 1;
        if (shouldPersist) {
            const nextRecord: SaveSlotRecord = {
                slotId: activeSlotId,
                snapshot: state,
                updatedAt: new Date().toISOString(),
            };
            const nextSlots = [
                ...saveSlots.filter((s) => s.slotId !== activeSlotId),
                nextRecord,
            ].sort((a, b) => a.slotId - b.slotId);

            const payload: StoredSaveSlots = { version: 5, activeSlotId, slots: nextSlots };
            window.localStorage.setItem(SAVE_SLOTS_KEY, JSON.stringify(payload));
            setSaveSlots(nextSlots);
        }
    }, [activeSlotId, isHydrated, state]);

    // Persist ending collection
    useEffect(() => {
        if (!isHydrated || typeof window === "undefined" || !state.endingId) return;
        if (discoveredEndingIds.includes(state.endingId)) return;

        const nextIds = [...discoveredEndingIds, state.endingId];
        window.localStorage.setItem(ENDING_COLLECTION_KEY, JSON.stringify({ version: 1, endingIds: nextIds }));
        setDiscoveredEndingIds(nextIds);
    }, [discoveredEndingIds, isHydrated, state.endingId]);

    // Record ending
    useEffect(() => {
        if (!isHydrated || !state.endingId) return;
        if (countedEndingRef.current === state.endingId) return;

        countedEndingRef.current = state.endingId;
        setPlayStats((c) => ({
            ...c,
            completedRuns: c.completedRuns + 1,
            latestEndingId: state.endingId,
            latestPlayedAt: new Date().toISOString(),
        }));
    }, [isHydrated, state.endingId]);

    // Persist stats
    useEffect(() => {
        if (!isHydrated || typeof window === "undefined") return;
        window.localStorage.setItem(PLAY_STATS_KEY, JSON.stringify(playStats));
    }, [isHydrated, playStats]);

    // Fetch leaderboard
    const fetchLeaderboard = useCallback(async () => {
        try {
            const supabase = createClient();
            const { data } = await supabase.rpc("get_game_leaderboard", { limit_count: 20 });
            if (Array.isArray(data)) setLeaderboard(data);
        } catch { /* ignore */ }
    }, []);

    useEffect(() => {
        if (state.phase === "title" || state.phase === "ending") {
            fetchLeaderboard();
        }
    }, [state.phase, fetchLeaderboard]);

    // Submit score to leaderboard
    const submitScore = useCallback(async (nickname: string) => {
        const ending = getEndingById(state.endingId);
        if (!ending) return;

        try {
            const supabase = createClient();
            await supabase.from("game_leaderboard").insert([{
                nickname,
                survived_months: Math.min(state.month - 1, 30),
                democracy_score: state.stats.democracy,
                awareness_score: state.stats.awareness,
                cancel_progress: state.stats.cancelProgress,
                ending_id: state.endingId,
                is_victory: ending.isVictory,
            }]);
            await fetchLeaderboard();
        } catch { /* ignore */ }
    }, [state, fetchLeaderboard]);

    // Available defense actions
    const defenseActions = useMemo(() => {
        return DEFENSE_ACTIONS.map((action) => ({
            ...action,
            available: canUseAction(action, state.stats.energy, state.cooldowns),
            cooldownLeft: state.cooldowns[action.id] ?? 0,
        }));
    }, [state.stats.energy, state.cooldowns]);

    const endingData = getEndingById(state.endingId);

    const mostUsedActionId =
        Object.entries(playStats.actionCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;
    const playStatsSummary: PlayStatsSummary = {
        totalSessions: playStats.totalSessions,
        totalActions: playStats.totalActions,
        completedRuns: playStats.completedRuns,
        mostUsedActionId,
        latestEndingId: playStats.latestEndingId,
    };
    const playStatsDetails: PlayStatsDetails = {
        actionRanking: Object.entries(playStats.actionCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 8)
            .map(([actionId, count]) => ({ actionId, count })),
        completionRate: playStats.totalSessions > 0 ? playStats.completedRuns / playStats.totalSessions : 0,
    };

    const activeSlotRecord = saveSlots.find((s) => s.slotId === activeSlotId) ?? null;
    const saveSlotSummaries: SaveSlotSummary[] = Array.from({ length: MAX_SAVE_SLOTS }, (_, i) => {
        const slotId = i + 1;
        const record = saveSlots.find((s) => s.slotId === slotId);
        return {
            slotId,
            hasSave: Boolean(record),
            updatedAt: record?.updatedAt ?? null,
            month: record?.snapshot.month ?? null,
            progress: record?.snapshot.stats.cancelProgress ?? null,
            endingId: record?.snapshot.endingId ?? null,
        };
    });

    const clearSave = () => {
        if (typeof window !== "undefined") {
            const nextSlots = saveSlots.filter((s) => s.slotId !== activeSlotId);
            const payload: StoredSaveSlots = { version: 5, activeSlotId, slots: nextSlots };
            window.localStorage.setItem(SAVE_SLOTS_KEY, JSON.stringify(payload));
        }
        setSaveSlots((c) => c.filter((s) => s.slotId !== activeSlotId));
    };

    // ===== SEPARATED TURN FLOW =====
    // Step 1: Apply attack (called when user dismisses attack overlay)
    const applyAttackAction = useCallback((attack: import("./gameData").PoliticalAttack) => {
        dispatch({ type: "apply_attack", attack });
    }, []);

    // Step 2: Apply defense (called when user picks a defense action)
    const executeDefenseAction = useCallback((action: DefenseAction) => {
        if (state.phase !== "playing") return;
        setPlayStats((c) => ({
            ...c,
            totalActions: c.totalActions + 1,
            actionCounts: {
                ...c.actionCounts,
                [action.id]: (c.actionCounts[action.id] ?? 0) + 1,
            },
            latestPlayedAt: new Date().toISOString(),
        }));
        dispatch({ type: "execute_defense", action });
    }, [state.phase]);

    return {
        activeSlotId,
        defenseActions,
        discoveredEndingIds,
        endingData,
        hasSavedGame: Boolean(activeSlotRecord),
        isHydrated,
        leaderboard,
        playStatsDetails,
        playStatsSummary,
        saveSlotSummaries,
        state,
        submitScore,
        selectSlot: (slotId: number) => setActiveSlotId(slotId),
        continueSavedGame: () => {
            if (!activeSlotRecord) return;
            dispatch({ type: "continue_game", snapshot: activeSlotRecord.snapshot });
        },
        dismissEvent: () => dispatch({ type: "dismiss_event" }),
        applyAttack: applyAttackAction,
        executeDefense: executeDefenseAction,
        getShareText: () => {
            if (endingData) {
                return `⚖️ [공소취소 방어전] 결과\n${endingData.isVictory ? "🏆 법치주의를 지켜냈다!" : "💀 공소취소를 막지 못했다..."}\n\n📅 ${Math.min(state.month - 1, 30)}개월 생존\n🏛️ 민주주의 ${state.stats.democracy}%\n🔴 공소취소 진행률 ${state.stats.cancelProgress}%\n\n엔딩: ${endingData.emoji} ${endingData.name}\n\n당신은 막을 수 있을까? 👇`;
            }
            return "⚖️ 재판을 지켜라! 정치 권력이 재판을 없애려 한다. 막을 수 있을까? [공소취소 방어전] 👇";
        },
        clearSave,
        restart: () => {
            countedEndingRef.current = null;
            clearSave();
            dispatch({ type: "restart" });
        },
        startNewGame: () => {
            countedEndingRef.current = null;
            setPlayStats((c) => ({
                ...c,
                totalSessions: c.totalSessions + 1,
                latestPlayedAt: new Date().toISOString(),
            }));
            dispatch({ type: "start_new_game" });
        },
    };
}
