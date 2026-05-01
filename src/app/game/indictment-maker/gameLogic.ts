import {
    CHARACTER_LEVELS,
    GAME_ACTIONS,
    GAME_ENDINGS,
    type GameAction,
    type GameEnding,
    type GameStats,
    type RandomEvent,
} from "./gameData";

export const INITIAL_STATS: GameStats = {
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

export const SAVE_KEY = "indictment-maker-save-v2";
export const CANCEL_ANIMATION_MS = 3200;

export type GamePhase = "title" | "playing" | "cancel_animation" | "ending";

export const STAT_LABELS: Record<keyof GameStats, { label: string; emoji: string }> = {
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

export const MILESTONE_STAGES = [
    { id: "frame_established", label: "프레임", emoji: "📺" },
    { id: "investigation_launched", label: "국정조사", emoji: "🏛️" },
    { id: "report_adopted", label: "보고서", emoji: "📑" },
    { id: "bill_passed", label: "특검법", emoji: "🗳️" },
    { id: "counsel_appointed", label: "특검임명", emoji: "👤" },
    { id: "prosecution_seized", label: "공소장악", emoji: "🔑" },
    { id: "indictment_cancelled", label: "공소취소", emoji: "🔴" },
] as const;

const GOOD_STATS: (keyof GameStats)[] = ["lawRule", "separation", "judicialIndep", "publicTrust"];

export interface GameSnapshot {
    phase: GamePhase;
    stats: GameStats;
    month: number;
    milestones: string[];
    newsHistory: string[];
    currentEvent: RandomEvent | null;
    endingId: GameEnding["id"] | null;
    trialsCancelled: boolean;
}

export interface StoredGameState {
    version: 2;
    snapshot: GameSnapshot;
}

export function createInitialSnapshot(): GameSnapshot {
    return {
        phase: "title",
        stats: INITIAL_STATS,
        month: 1,
        milestones: [],
        newsHistory: [],
        currentEvent: null,
        endingId: null,
        trialsCancelled: false,
    };
}

export function clamp(value: number, min = 0, max = 100) {
    return Math.max(min, Math.min(max, value));
}

export function applyEffects(stats: GameStats, effects: Partial<GameStats>): GameStats {
    const next = { ...stats };

    for (const [key, delta] of Object.entries(effects)) {
        const statKey = key as keyof GameStats;
        next[statKey] = clamp(next[statKey] + (delta ?? 0));
    }

    return next;
}

export function getCharacterLevel(progress: number) {
    let current = CHARACTER_LEVELS[0];

    for (const level of CHARACTER_LEVELS) {
        if (progress >= level.requiredProgress) current = level;
    }

    return current;
}

export function getStatTone(key: keyof GameStats, value: number) {
    if (GOOD_STATS.includes(key)) {
        if (value >= 60) return "good";
        if (value >= 30) return "warning";
        return "danger";
    }

    if (value >= 70) return "danger";
    if (value >= 40) return "warning";
    return "neutral";
}

export function getMilestoneSet(milestones: string[]) {
    return new Set(milestones);
}

export function checkImmediateEnding(stats: GameStats, month: number) {
    if (month > 60) {
        return GAME_ENDINGS.find((ending) => ending.id === "term_ended") ?? null;
    }

    if (stats.lawRule <= 15 && stats.separation <= 20 && stats.cancelProgress < 100) {
        return GAME_ENDINGS.find((ending) => ending.id === "constitutional_block") ?? null;
    }

    return null;
}

export function resolveFinalEnding(stats: GameStats, milestones: string[]) {
    const milestoneSet = getMilestoneSet(milestones);

    return (
        GAME_ENDINGS
            .filter((ending) => ending.condition(stats, milestoneSet))
            .sort((a, b) => b.priority - a.priority)[0] ??
        GAME_ENDINGS.find((ending) => ending.id === "shield_success") ??
        null
    );
}

export function getEndingById(endingId: GameEnding["id"] | null) {
    if (!endingId) return null;
    return GAME_ENDINGS.find((ending) => ending.id === endingId) ?? null;
}

export function getAvailableActions(cancelProgress: number) {
    const level = getCharacterLevel(cancelProgress);
    return GAME_ACTIONS.filter((action) => action.phase <= level.level + 1);
}

export function isActionLocked(action: GameAction, milestones: string[]) {
    if (!action.requires) return false;
    const milestoneSet = getMilestoneSet(milestones);
    return action.requires.some((requirement) => !milestoneSet.has(requirement));
}

export function isActionDone(action: GameAction, milestones: string[]) {
    if (!action.unlocksMilestone) return false;
    return milestones.includes(action.unlocksMilestone);
}

export function getActionEffects(action: GameAction) {
    return Object.entries(action.effects) as [keyof GameStats, number][];
}
