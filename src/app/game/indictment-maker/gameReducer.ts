import {
    type DefenseAction,
    type PoliticalAttack,
    type RandomEvent,
} from "./gameData";
import {
    applyDefenseAction,
    applyPoliticalAttack,
    applyRandomEvent,
    checkEnding,
    createInitialSnapshot,
    drawHand,
    selectPoliticalAttack,
    setCooldown,
    tickCooldowns,
    type GameSnapshot,
} from "./gameLogic";

export type GameState = GameSnapshot;

export type GameReducerAction =
    | { type: "start_new_game" }
    | { type: "continue_game"; snapshot: GameSnapshot }
    | { type: "restart" }
    | { type: "execute_defense"; action: DefenseAction }
    | { type: "apply_attack"; attack: PoliticalAttack }
    | { type: "apply_event"; event: RandomEvent }
    | { type: "dismiss_event" };

function pushNews(newsHistory: string[], headline: string) {
    if (!headline) return newsHistory;
    return [headline, ...newsHistory].slice(0, 10);
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

        case "apply_attack": {
            const { attack } = actionState;
            const nextStats = applyPoliticalAttack(state.stats, attack, state.month);
            const nextNews = pushNews(state.newsHistory, attack.newsHeadline);
            const nextCooldowns = tickCooldowns(state.cooldowns);

            // Check ending after attack
            const ending = checkEnding(nextStats, state.month, state.exhaustedTurns);

            return {
                ...state,
                phase: ending ? "ending" : "playing",
                stats: nextStats,
                newsHistory: nextNews,
                currentAttack: attack,
                cooldowns: nextCooldowns,
                endingId: ending?.id ?? state.endingId,
            };
        }

        case "execute_defense": {
            const { action } = actionState;
            const nextStats = applyDefenseAction(state.stats, action);
            const nextMonth = state.month + 1;
            const nextNews = pushNews(state.newsHistory, action.newsHeadline);
            const nextRecentDefenses = [...state.recentDefenses, action.id].slice(-6);
            const nextCooldowns = setCooldown(state.cooldowns, action);
            const nextExhausted = nextStats.energy <= 0
                ? state.exhaustedTurns + 1
                : 0;

            const nextActionFrequencies = {
                ...state.actionFrequencies,
                [action.id]: (state.actionFrequencies[action.id] || 0) + 1,
            };
            const nextHand = drawHand(nextCooldowns);

            // Check ending after defense
            const ending = checkEnding(nextStats, nextMonth, nextExhausted);

            return {
                ...state,
                phase: ending ? "ending" : "playing",
                stats: nextStats,
                month: nextMonth,
                recentDefenses: nextRecentDefenses,
                newsHistory: nextNews,
                currentAttack: null,
                currentEvent: null,
                cooldowns: nextCooldowns,
                exhaustedTurns: nextExhausted,
                endingId: ending?.id ?? state.endingId,
                actionFrequencies: nextActionFrequencies,
                currentHand: nextHand,
            };
        }

        case "apply_event": {
            const nextStats = applyRandomEvent(state.stats, actionState.event);
            const nextNews = pushNews(state.newsHistory, actionState.event.newsHeadline);

            return {
                ...state,
                stats: nextStats,
                newsHistory: nextNews,
                currentEvent: actionState.event,
            };
        }

        case "dismiss_event":
            return {
                ...state,
                currentEvent: null,
            };

        default:
            return state;
    }
}
