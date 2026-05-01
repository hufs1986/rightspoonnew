"use client";

import { useEffect, useMemo, useReducer, useRef, useState } from "react";
import { type GameAction } from "./gameData";
import { gameReducer, getEventForecast, rollRandomEvent } from "./gameReducer";
import {
    CANCEL_ANIMATION_MS,
    createInitialSnapshot,
    createInitialPlayStats,
    ENDING_COLLECTION_KEY,
    getAvailableActions,
    getCharacterLevel,
    getEndingById,
    isActionDone,
    isActionLocked,
    LEGACY_SAVE_KEY,
    MAX_SAVE_SLOTS,
    PLAY_STATS_KEY,
    SAVE_SLOTS_KEY,
    type EndingCollection,
    type PlayStats,
    type SaveSlotRecord,
    type StoredGameState,
    type StoredSaveSlots,
} from "./gameLogic";

function isStoredGameState(value: unknown): value is StoredGameState {
    if (!value || typeof value !== "object") return false;

    const candidate = value as Partial<StoredGameState>;
    if (candidate.version !== 2 || !candidate.snapshot) return false;

    return typeof candidate.snapshot.month === "number" && Array.isArray(candidate.snapshot.newsHistory);
}

function isStoredSaveSlots(value: unknown): value is StoredSaveSlots {
    if (!value || typeof value !== "object") return false;

    const candidate = value as Partial<StoredSaveSlots>;
    return candidate.version === 3 && typeof candidate.activeSlotId === "number" && Array.isArray(candidate.slots);
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
        typeof candidate.totalActions === "number" &&
        typeof candidate.completedRuns === "number" &&
        typeof candidate.actionCounts === "object"
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

export function useIndictmentGame() {
    const [state, dispatch] = useReducer(gameReducer, undefined, createInitialSnapshot);
    const [isHydrated, setIsHydrated] = useState(false);
    const [activeSlotId, setActiveSlotId] = useState(1);
    const [saveSlots, setSaveSlots] = useState<SaveSlotRecord[]>([]);
    const [discoveredEndingIds, setDiscoveredEndingIds] = useState<string[]>([]);
    const [playStats, setPlayStats] = useState<PlayStats>(createInitialPlayStats);
    const cancelTimerRef = useRef<number | null>(null);
    const countedEndingRef = useRef<string | null>(null);

    useEffect(() => {
        if (typeof window === "undefined") return;

        try {
            const slotsRaw = window.localStorage.getItem(SAVE_SLOTS_KEY);
            if (slotsRaw) {
                const parsedSlots = JSON.parse(slotsRaw) as unknown;
                if (isStoredSaveSlots(parsedSlots)) {
                    setSaveSlots(parsedSlots.slots);
                    setActiveSlotId(parsedSlots.activeSlotId);
                }
            } else {
                const legacyRaw = window.localStorage.getItem(LEGACY_SAVE_KEY);
                if (legacyRaw) {
                    const parsedLegacy = JSON.parse(legacyRaw) as unknown;
                    if (isStoredGameState(parsedLegacy)) {
                        const migratedSlots: SaveSlotRecord[] = [
                            {
                                slotId: 1,
                                snapshot: parsedLegacy.snapshot,
                                updatedAt: new Date().toISOString(),
                            },
                        ];

                        const migratedPayload: StoredSaveSlots = {
                            version: 3,
                            activeSlotId: 1,
                            slots: migratedSlots,
                        };

                        window.localStorage.setItem(SAVE_SLOTS_KEY, JSON.stringify(migratedPayload));
                        window.localStorage.removeItem(LEGACY_SAVE_KEY);
                        setSaveSlots(migratedSlots);
                        setActiveSlotId(1);
                    }
                }
            }

            const collectionRaw = window.localStorage.getItem(ENDING_COLLECTION_KEY);
            if (collectionRaw) {
                const parsedCollection = JSON.parse(collectionRaw) as unknown;
                if (isEndingCollection(parsedCollection)) {
                    setDiscoveredEndingIds(parsedCollection.endingIds);
                }
            }

            const statsRaw = window.localStorage.getItem(PLAY_STATS_KEY);
            if (statsRaw) {
                const parsedStats = JSON.parse(statsRaw) as unknown;
                if (isPlayStats(parsedStats)) {
                    setPlayStats(parsedStats);
                }
            }
        } catch {
            window.localStorage.removeItem(SAVE_SLOTS_KEY);
            window.localStorage.removeItem(LEGACY_SAVE_KEY);
        } finally {
            setIsHydrated(true);
        }
    }, []);

    useEffect(() => {
        if (!isHydrated || typeof window === "undefined") return;

        const shouldPersist = state.phase !== "title" || state.month > 1 || state.newsHistory.length > 0;
        let nextSlots = saveSlots;

        if (shouldPersist) {
            const existingRecord = saveSlots.find((slot) => slot.slotId === activeSlotId);
            const nextRecord: SaveSlotRecord = {
                slotId: activeSlotId,
                snapshot: state,
                updatedAt: new Date().toISOString(),
            };

            nextSlots = [
                ...saveSlots.filter((slot) => slot.slotId !== activeSlotId),
                nextRecord,
            ].sort((a, b) => a.slotId - b.slotId);

            const payload: StoredSaveSlots = {
                version: 3,
                activeSlotId,
                slots: nextSlots,
            };

            window.localStorage.setItem(SAVE_SLOTS_KEY, JSON.stringify(payload));
            if (!existingRecord || existingRecord.snapshot !== state) {
                setSaveSlots(nextSlots);
            }
            return;
        }

        if (saveSlots.length > 0) {
            const payload: StoredSaveSlots = {
                version: 3,
                activeSlotId,
                slots: saveSlots,
            };
            window.localStorage.setItem(SAVE_SLOTS_KEY, JSON.stringify(payload));
        }
    }, [activeSlotId, isHydrated, saveSlots, state]);

    useEffect(() => {
        if (!isHydrated || typeof window === "undefined" || !state.endingId) return;
        if (discoveredEndingIds.includes(state.endingId)) return;

        const nextEndingIds = [...discoveredEndingIds, state.endingId];
        const payload: EndingCollection = {
            version: 1,
            endingIds: nextEndingIds,
        };

        window.localStorage.setItem(ENDING_COLLECTION_KEY, JSON.stringify(payload));
        setDiscoveredEndingIds(nextEndingIds);
    }, [discoveredEndingIds, isHydrated, state.endingId]);

    useEffect(() => {
        if (!isHydrated || !state.endingId) return;
        if (countedEndingRef.current === state.endingId) return;

        countedEndingRef.current = state.endingId;

        setPlayStats((current) => {
            return {
                ...current,
                completedRuns: current.completedRuns + 1,
                latestEndingId: state.endingId,
                latestPlayedAt: new Date().toISOString(),
            };
        });
    }, [isHydrated, state.endingId]);

    useEffect(() => {
        if (!isHydrated || typeof window === "undefined") return;
        window.localStorage.setItem(PLAY_STATS_KEY, JSON.stringify(playStats));
    }, [isHydrated, playStats]);

    useEffect(() => {
        if (state.phase !== "cancel_animation") return;

        cancelTimerRef.current = window.setTimeout(() => {
            dispatch({ type: "finish_cancel_animation" });
        }, CANCEL_ANIMATION_MS);

        return () => {
            if (cancelTimerRef.current !== null) {
                window.clearTimeout(cancelTimerRef.current);
            }
        };
    }, [state.phase]);

    useEffect(() => {
        if (state.phase !== "playing" || state.currentEvent) return;

        const randomEvent = rollRandomEvent(state.month, state.stats, state.recentActions);
        if (randomEvent) {
            dispatch({ type: "open_event", event: randomEvent });
        }
    }, [state.currentEvent, state.month, state.phase, state.recentActions, state.stats]);

    const actions = useMemo(
        () =>
            getAvailableActions(state.stats.cancelProgress).filter((action) => {
                if (isActionDone(action, state.milestones)) {
                    return ["do_nothing", "press_conference", "rally_supporters", "discredit_prosecutors"].includes(
                        action.id,
                    );
                }

                return true;
            }),
        [state.milestones, state.stats.cancelProgress],
    );

    const characterLevel = getCharacterLevel(state.stats.cancelProgress);
    const endingData = getEndingById(state.endingId);
    const eventForecast = getEventForecast(state.month, state.stats, state.recentActions);
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
    const activeSlotRecord = saveSlots.find((slot) => slot.slotId === activeSlotId) ?? null;
    const saveSlotSummaries: SaveSlotSummary[] = Array.from({ length: MAX_SAVE_SLOTS }, (_, index) => {
        const slotId = index + 1;
        const record = saveSlots.find((slot) => slot.slotId === slotId);

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
            const nextSlots = saveSlots.filter((slot) => slot.slotId !== activeSlotId);
            const payload: StoredSaveSlots = {
                version: 3,
                activeSlotId,
                slots: nextSlots,
            };

            window.localStorage.setItem(SAVE_SLOTS_KEY, JSON.stringify(payload));
        }
        setSaveSlots((current) => current.filter((slot) => slot.slotId !== activeSlotId));
    };

    return {
        activeSlotId,
        actions,
        characterLevel,
        discoveredEndingIds,
        endingData,
        eventForecast,
        hasSavedGame: Boolean(activeSlotRecord),
        isHydrated,
        playStatsDetails,
        playStatsSummary,
        saveSlotSummaries,
        state,
        selectSlot: (slotId: number) => setActiveSlotId(slotId),
        continueSavedGame: () => {
            if (!activeSlotRecord) return;
            dispatch({ type: "continue_game", snapshot: activeSlotRecord.snapshot });
        },
        dismissEvent: () => dispatch({ type: "dismiss_event" }),
        executeAction: (action: GameAction) => {
            if (state.phase !== "playing") return;
            if (isActionLocked(action, state.milestones)) return;
            setPlayStats((current) => ({
                ...current,
                totalActions: current.totalActions + 1,
                actionCounts: {
                    ...current.actionCounts,
                    [action.id]: (current.actionCounts[action.id] ?? 0) + 1,
                },
                latestPlayedAt: new Date().toISOString(),
            }));
            dispatch({ type: "execute_action", action });
        },
        getShareText: () => {
            if (endingData) {
                return `🎮 공소취소 메이커\n엔딩: ${endingData.title}\n${endingData.name}\n\n법치주의: ${state.stats.lawRule}\n공소취소: ${state.stats.cancelProgress}\n\n#공소취소메이커 #오른스푼`;
            }

            return "🎮 공소취소 메이커를 플레이해보세요! #공소취소메이커 #오른스푼";
        },
        clearSave,
        isActionDone: (action: GameAction) => isActionDone(action, state.milestones),
        isActionLocked: (action: GameAction) => isActionLocked(action, state.milestones),
        restart: () => {
            countedEndingRef.current = null;
            clearSave();
            dispatch({ type: "restart" });
        },
        startNewGame: () => {
            countedEndingRef.current = null;
            setPlayStats((current) => ({
                ...current,
                totalSessions: current.totalSessions + 1,
                latestPlayedAt: new Date().toISOString(),
            }));
            dispatch({ type: "start_new_game" });
        },
    };
}
