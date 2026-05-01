import {
    CHAINED_EVENTS,
    GAME_ENDINGS,
    RANDOM_EVENTS,
    type ChainedEvent,
    type GameAction,
    type GameStats,
    type RandomEvent,
} from "./gameData";
import {
    applyEffects,
    checkImmediateEnding,
    createInitialSnapshot,
    resolveFinalEnding,
    type GameSnapshot,
} from "./gameLogic";

export type GameState = GameSnapshot;

export type GameReducerAction =
    | { type: "start_new_game" }
    | { type: "continue_game"; snapshot: GameSnapshot }
    | { type: "restart" }
    | { type: "execute_action"; action: GameAction }
    | { type: "open_event"; event: RandomEvent }
    | { type: "dismiss_event" }
    | { type: "finish_cancel_animation" };

export interface EventForecast {
    eventId: string;
    title: string;
    weight: number;
}

function pushNews(newsHistory: string[], headline: string) {
    return [headline, ...newsHistory].slice(0, 10);
}

function addMilestone(milestones: string[], milestone?: string) {
    if (!milestone || milestones.includes(milestone)) return milestones;
    return [...milestones, milestone];
}

function pushRecentAction(recentActions: string[], actionId: string) {
    return [...recentActions, actionId].slice(-6);
}

function selectChainedEvent(
    action: GameAction,
    nextStats: GameState["stats"],
    nextMilestones: string[],
    nextRecentActions: string[],
): ChainedEvent | null {
    const milestoneSet = new Set(nextMilestones);
    const hasSeen = (id: string) => milestoneSet.has(`chain:${id}`);

    if (
        action.id === "rally_supporters" &&
        nextRecentActions.includes("frame_media") &&
        !hasSeen("chain_echo_chamber")
    ) {
        return CHAINED_EVENTS.find((event) => event.id === "chain_echo_chamber") ?? null;
    }

    if (
        action.id === "mass_indictments" &&
        nextRecentActions.includes("summon_witnesses") &&
        !hasSeen("chain_witness_chill")
    ) {
        return CHAINED_EVENTS.find((event) => event.id === "chain_witness_chill") ?? null;
    }

    if (
        action.id === "pass_special_counsel" &&
        nextStats.legislativeRush >= 35 &&
        !hasSeen("chain_legislative_fatigue")
    ) {
        return CHAINED_EVENTS.find((event) => event.id === "chain_legislative_fatigue") ?? null;
    }

    if (
        action.id === "appoint_counsel" &&
        nextStats.publicTrust <= 45 &&
        !hasSeen("chain_conflict_backlash")
    ) {
        return CHAINED_EVENTS.find((event) => event.id === "chain_conflict_backlash") ?? null;
    }

    if (
        action.id === "do_nothing" &&
        (nextStats.lawRule <= 40 || nextStats.publicTrust <= 40) &&
        !hasSeen("chain_late_normalization")
    ) {
        return CHAINED_EVENTS.find((event) => event.id === "chain_late_normalization") ?? null;
    }

    return null;
}

function getEventWeight(event: RandomEvent, stats: GameStats, recentActions: string[]) {
    let weight = event.probability;

    switch (event.id) {
        case "constitutional_court_warning":
            if (stats.separation <= 45 || stats.lawRule <= 45) weight += 0.12;
            if (recentActions.includes("pass_special_counsel")) weight += 0.06;
            break;
        case "international_criticism":
            if (stats.judicialIndep <= 50) weight += 0.1;
            if (recentActions.includes("appoint_counsel")) weight += 0.08;
            break;
        case "public_protest":
            if (stats.publicTrust <= 50) weight += 0.12;
            if (stats.mediaControversy >= 45) weight += 0.05;
            break;
        case "judge_resignation":
            if (stats.judicialIndep <= 40 || stats.lawRule <= 40) weight += 0.1;
            if (recentActions.includes("seize_prosecution")) weight += 0.08;
            break;
        case "economy_crisis":
            if (stats.publicTrust <= 35) weight += 0.08;
            if (stats.mediaControversy >= 50) weight += 0.05;
            break;
        case "supporter_fatigue":
            if (stats.regimeShield >= 55 && stats.publicTrust <= 55) weight += 0.1;
            if (recentActions.includes("rally_supporters")) weight += 0.05;
            break;
        default:
            break;
    }

    return Math.max(0, weight);
}

function getWeightedEligibleEvents(currentMonth: number, stats: GameStats, recentActions: string[]) {
    return RANDOM_EVENTS
        .filter((event) => currentMonth >= event.minMonth)
        .map((event) => ({
            event,
            weight: getEventWeight(event, stats, recentActions),
        }))
        .filter(({ weight }) => weight > 0);
}

export function getEventForecast(currentMonth: number, stats: GameStats, recentActions: string[]): EventForecast[] {
    return getWeightedEligibleEvents(currentMonth, stats, recentActions)
        .sort((a, b) => b.weight - a.weight)
        .slice(0, 3)
        .map(({ event, weight }) => ({
            eventId: event.id,
            title: event.title,
            weight,
        }));
}

export function rollRandomEvent(currentMonth: number, stats: GameStats, recentActions: string[]) {
    const weightedEvents = getWeightedEligibleEvents(currentMonth, stats, recentActions).filter(
        ({ weight }) => Math.random() < weight,
    );

    if (weightedEvents.length === 0) return null;

    const totalWeight = weightedEvents.reduce((sum, item) => sum + item.weight, 0);
    let roll = Math.random() * totalWeight;

    for (const { event, weight } of weightedEvents) {
        roll -= weight;
        if (roll <= 0) return event;
    }

    return weightedEvents[weightedEvents.length - 1]?.event ?? null;
}

export function gameReducer(state: GameState, actionState: GameReducerAction): GameState {
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
            const nextRecentActions = pushRecentAction(state.recentActions, actionState.action.id);

            if (actionState.action.id === "cancel_indictment") {
                return {
                    ...state,
                    phase: "cancel_animation",
                    stats: nextStats,
                    month: nextMonth,
                    milestones: nextMilestones,
                    recentActions: nextRecentActions,
                    newsHistory: nextNews,
                    trialsCancelled: true,
                    currentEvent: null,
                };
            }

            const chainedEvent = selectChainedEvent(
                actionState.action,
                nextStats,
                nextMilestones,
                nextRecentActions,
            );

            const chainedStats = chainedEvent ? applyEffects(nextStats, chainedEvent.effects) : nextStats;
            const chainedMilestones = chainedEvent
                ? addMilestone(nextMilestones, `chain:${chainedEvent.id}`)
                : nextMilestones;
            const finalNews = chainedEvent ? pushNews(nextNews, chainedEvent.newsHeadline) : nextNews;

            const nextEnding = checkImmediateEnding(chainedStats, nextMonth);

            return {
                ...state,
                phase: nextEnding ? "ending" : "playing",
                stats: chainedStats,
                month: nextMonth,
                milestones: chainedMilestones,
                recentActions: nextRecentActions,
                newsHistory: finalNews,
                currentEvent: chainedEvent
                    ? {
                          id: chainedEvent.id,
                          title: chainedEvent.title,
                          description: chainedEvent.description,
                          effects: chainedEvent.effects,
                          newsHeadline: chainedEvent.newsHeadline,
                          minMonth: nextMonth,
                          probability: 1,
                      }
                    : null,
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
