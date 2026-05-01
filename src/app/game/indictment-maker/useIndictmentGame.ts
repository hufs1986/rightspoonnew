"use client";

import { useEffect, useMemo, useReducer, useRef, useState } from "react";
import {
    GAME_ENDINGS,
    RANDOM_EVENTS,
    type GameAction,
    type RandomEvent,
} from "./gameData";
import {
    applyEffects,
    CANCEL_ANIMATION_MS,
    checkImmediateEnding,
    createInitialSnapshot,
    getAvailableActions,
    getCharacterLevel,
    getEndingById,
    isActionDone,
    isActionLocked,
    resolveFinalEnding,
    SAVE_KEY,
    type GameSnapshot,
    type StoredGameState,
} from "./gameLogic";

type GameState = GameSnapshot;

type GameActionState =
    | { type: "start_new_game" }
    | { type: "continue_game"; snapshot: GameSnapshot }
    | { type: "restart" }
    | { type: "execute_action"; action: GameAction }
    | { type: "open_event"; event: RandomEvent }
    | { type: "dismiss_event" }
    | { type: "finish_cancel_animation" };

function pushNews(newsHistory: string[], headline: string) {
    return [headline, ...newsHistory].slice(0, 10);
}

function addMilestone(milestones: string[], milestone?: string) {
    if (!milestone || milestones.includes(milestone)) return milestones;
    return [...milestones, milestone];
}

function rollRandomEvent(currentMonth: number) {
    const eligibleEvents = RANDOM_EVENTS.filter(
        (event) => currentMonth >= event.minMonth && Math.random() < event.probability,
    );

    if (eligibleEvents.length === 0) return null;
    return eligibleEvents[Math.floor(Math.random() * eligibleEvents.length)];
}

function reducer(state: GameState, actionState: GameActionState): GameState {
    switch (actionState.type) {
        case "start_new_game":
            return {
                ...createInitialSnapshot(),
                phase: "playing",
            };

        case "continue_game":
            return {
                ...actionState.snapshot,
                phase: actionState.snapshot.phase === "title" ? "playing" : actionState.snapshot.phase,
            };

        case "restart":
            return createInitialSnapshot();

        case "execute_action": {
            const nextStats = applyEffects(state.stats, actionState.action.effects);
            const nextMilestones = addMilestone(state.milestones, actionState.action.unlocksMilestone);
            const nextMonth = state.month + 1;
            const nextNews = pushNews(state.newsHistory, actionState.action.newsHeadline);

            if (actionState.action.id === "cancel_indictment") {
                return {
                    ...state,
                    phase: "cancel_animation",
                    stats: nextStats,
                    month: nextMonth,
                    milestones: nextMilestones,
                    newsHistory: nextNews,
                    trialsCancelled: true,
                    currentEvent: null,
                };
            }

            const nextEnding = checkImmediateEnding(nextStats, nextMonth);

            return {
                ...state,
                phase: nextEnding ? "ending" : "playing",
                stats: nextStats,
                month: nextMonth,
                milestones: nextMilestones,
                newsHistory: nextNews,
                currentEvent: null,
                endingId: nextEnding?.id ?? state.endingId,
            };
        }

        case "open_event":
            return {
                ...state,
                currentEvent: actionState.event,
            };

        case "dismiss_event": {
            if (!state.currentEvent) return state;

            const nextStats = applyEffects(state.stats, state.currentEvent.effects);
            const nextNews = pushNews(state.newsHistory, state.currentEvent.newsHeadline);
            const nextEnding = checkImmediateEnding(nextStats, state.month);

            return {
                ...state,
                phase: nextEnding ? "ending" : state.phase,
                stats: nextStats,
                newsHistory: nextNews,
                currentEvent: null,
                endingId: nextEnding?.id ?? state.endingId,
            };
        }

        case "finish_cancel_animation": {
            const finalEnding = resolveFinalEnding(state.stats, state.milestones);

            return {
                ...state,
                phase: "ending",
                endingId: finalEnding?.id ?? GAME_ENDINGS[0].id,
            };
        }

        default:
            return state;
    }
}

function isStoredGameState(value: unknown): value is StoredGameState {
    if (!value || typeof value !== "object") return false;

    const candidate = value as Partial<StoredGameState>;
    if (candidate.version !== 2 || !candidate.snapshot) return false;

    return typeof candidate.snapshot.month === "number" && Array.isArray(candidate.snapshot.newsHistory);
}

export function useIndictmentGame() {
    const [state, dispatch] = useReducer(reducer, undefined, createInitialSnapshot);
    const [isHydrated, setIsHydrated] = useState(false);
    const [hasSavedGame, setHasSavedGame] = useState(false);
    const [savedSnapshot, setSavedSnapshot] = useState<GameSnapshot | null>(null);
    const cancelTimerRef = useRef<number | null>(null);

    useEffect(() => {
        if (typeof window === "undefined") return;

        const raw = window.localStorage.getItem(SAVE_KEY);
        if (!raw) {
            setIsHydrated(true);
            return;
        }

        try {
            const parsed = JSON.parse(raw) as unknown;
            if (isStoredGameState(parsed)) {
                setHasSavedGame(parsed.snapshot.phase !== "title" || parsed.snapshot.month > 1);
                setSavedSnapshot(parsed.snapshot);
            }
        } catch {
            window.localStorage.removeItem(SAVE_KEY);
        } finally {
            setIsHydrated(true);
        }
    }, []);

    useEffect(() => {
        if (!isHydrated || typeof window === "undefined") return;

        const storedState: StoredGameState = {
            version: 2,
            snapshot: state,
        };

        const shouldPersist = state.phase !== "title" || state.month > 1 || state.newsHistory.length > 0;

        if (!shouldPersist) {
            if (!hasSavedGame) {
                window.localStorage.removeItem(SAVE_KEY);
                setSavedSnapshot(null);
            }
            return;
        }

        window.localStorage.setItem(SAVE_KEY, JSON.stringify(storedState));
        setHasSavedGame(true);
        setSavedSnapshot(state);
    }, [hasSavedGame, isHydrated, state]);

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

        const randomEvent = rollRandomEvent(state.month);
        if (randomEvent) {
            dispatch({ type: "open_event", event: randomEvent });
        }
    }, [state.phase, state.month, state.currentEvent]);

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
    const clearSave = () => {
        if (typeof window !== "undefined") {
            window.localStorage.removeItem(SAVE_KEY);
        }
        setHasSavedGame(false);
        setSavedSnapshot(null);
    };

    return {
        actions,
        characterLevel,
        endingData,
        hasSavedGame,
        isHydrated,
        state,
        continueSavedGame: () => {
            if (!savedSnapshot) return;
            dispatch({ type: "continue_game", snapshot: savedSnapshot });
        },
        dismissEvent: () => dispatch({ type: "dismiss_event" }),
        executeAction: (action: GameAction) => {
            if (state.phase !== "playing") return;
            if (isActionLocked(action, state.milestones)) return;
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
            clearSave();
            dispatch({ type: "restart" });
        },
        startNewGame: () => dispatch({ type: "start_new_game" }),
    };
}
