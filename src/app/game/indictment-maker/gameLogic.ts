import {
    DEFENSE_ACTIONS,
    GAME_ENDINGS,
    INITIAL_STATS,
    MAX_MONTHS,
    POLITICAL_ATTACKS,
    RANDOM_EVENTS,
    type DefenseAction,
    type GameEnding,
    type GameStats,
    type PoliticalAttack,
    type RandomEvent,
} from "./gameData";

export const SAVE_SLOTS_KEY = "indictment-defense-save-v1";
export const ENDING_COLLECTION_KEY = "indictment-defense-endings-v1";
export const PLAY_STATS_KEY = "indictment-defense-stats-v1";
export const MAX_SAVE_SLOTS = 3;

export type GamePhase = "title" | "playing" | "ending";

export const STAT_LABELS: Record<keyof GameStats, { label: string; emoji: string }> = {
    cancelProgress: { label: "사법 붕괴 임계점", emoji: "🔴" },
    awareness: { label: "여론 지형", emoji: "👁️" },
    democracy: { label: "법치주의 지수", emoji: "🏛️" },
};

export const ENERGY_RESTORE_AMOUNT = 30;

export interface GameSnapshot {
    phase: GamePhase;
    stats: GameStats;
    month: number;
    recentDefenses: string[];
    newsHistory: string[];
    currentEvent: RandomEvent | null;
    currentAttack: PoliticalAttack | null;
    endingId: GameEnding["id"] | null;
    cooldowns: Record<string, number>;   // actionId -> turns left
    currentHand: string[];               // actionIds currently available to pick
    actionFrequencies: Record<string, number>; // actionId -> count
}

export interface StoredSaveSlots {
    version: 5;
    activeSlotId: number;
    slots: SaveSlotRecord[];
}

export interface SaveSlotRecord {
    slotId: number;
    snapshot: GameSnapshot;
    updatedAt: string;
}

export interface EndingCollection {
    version: 1;
    endingIds: GameEnding["id"][];
}

export interface PlayStats {
    version: 1;
    totalSessions: number;
    totalActions: number;
    completedRuns: number;
    actionCounts: Record<string, number>;
    latestEndingId: GameEnding["id"] | null;
    latestPlayedAt: string | null;
}

export function createInitialPlayStats(): PlayStats {
    return {
        version: 1,
        totalSessions: 0,
        totalActions: 0,
        completedRuns: 0,
        actionCounts: {},
        latestEndingId: null,
        latestPlayedAt: null,
    };
}

export function createInitialSnapshot(): GameSnapshot {
    return {
        phase: "title",
        stats: { ...INITIAL_STATS },
        month: 1,
        recentDefenses: [],
        newsHistory: [],
        currentEvent: null,
        currentAttack: null,
        endingId: null,
        cooldowns: {},
        currentHand: drawHand({}),
        actionFrequencies: {},
    };
}

export function clamp(value: number, min = 0, max = 100) {
    return Math.max(min, Math.min(max, value));
}

// ===== 정치 머신 공격 선택 =====
export function selectPoliticalAttack(month: number): PoliticalAttack {
            const TIMELINE: Record<number, string> = {
        1: "atk_frame_media",
        2: "atk_falsify",
        3: "atk_press_conf",
        4: "atk_petitions",
        5: "atk_rally",
        6: "atk_investigation",
        7: "atk_discredit",
        8: "atk_summon",
        9: "atk_recording",
        10: "atk_leak",
        11: "atk_boycott",
        12: "atk_report",
        13: "atk_threat",
        14: "atk_budget",
        15: "atk_draft_bill",
        16: "atk_fasttrack",
        17: "atk_filibuster",
        18: "atk_pass_bill",
        19: "atk_veto_reject",
        20: "atk_appoint",
        21: "atk_office",
        22: "atk_seize",
        23: "atk_media_play",
        24: "atk_suspend",
        25: "atk_transfer",
        26: "atk_reassign",
        27: "atk_cancel",
        28: "atk_final_hearing",
        29: "atk_court_pressure",
        30: "atk_d_day",
    };

    const targetId = TIMELINE[month];
    if (targetId) {
        const found = POLITICAL_ATTACKS.find((a) => a.id === targetId);
        if (found) return found;
    }

    // Default to generic attack for months without a major event
    return POLITICAL_ATTACKS.find((a) => a.id === "atk_generic") || POLITICAL_ATTACKS[0];
}

// ===== 공격 적용 (난이도: 매우 높음) =====
export function applyPoliticalAttack(
    stats: GameStats,
    attack: PoliticalAttack,
    month: number,
): GameStats {
    // 난이도 스케일링: 후반부 갈수록 공격 배율 증가
    const monthScale = 1 + (month / MAX_MONTHS) * 0.6; // 1.0 → 1.6

    // awareness가 높으면 공격 약간 약화 (최대 30% 감소)
    const awarenessReduction = Math.min(0.3, stats.awareness / 300);
    const effectiveScale = monthScale * (1 - awarenessReduction);

    const cancelIncrease = Math.ceil(attack.cancelIncrease * effectiveScale);
    const demoDamage = Math.ceil(attack.democracyDamage * effectiveScale);

    return {
        cancelProgress: clamp(stats.cancelProgress + cancelIncrease),
        awareness: clamp(stats.awareness + attack.awarenessEffect),
        democracy: clamp(stats.democracy - demoDamage),
    };
}

export function applyDefenseAction(
    stats: GameStats,
    action: DefenseAction,
): GameStats {
    return {
        cancelProgress: clamp(stats.cancelProgress + action.cancelReduction),
        awareness: clamp(stats.awareness + action.awarenessGain),
        democracy: clamp(stats.democracy + action.democracyGain),
    };
}

export function canUseAction(
    action: DefenseAction,
    cooldowns: Record<string, number>,
): boolean {
    if (cooldowns[action.id] && cooldowns[action.id] > 0) return false;
    return true;
}

// ===== 쿨다운 업데이트 =====
export function tickCooldowns(cooldowns: Record<string, number>): Record<string, number> {
    const next: Record<string, number> = {};
    for (const [key, val] of Object.entries(cooldowns)) {
        if (val > 1) next[key] = val - 1;
    }
    return next;
}

export function setCooldown(
    cooldowns: Record<string, number>,
    action: DefenseAction,
): Record<string, number> {
    if (!action.cooldown) return cooldowns;
    return { ...cooldowns, [action.id]: action.cooldown };
}

// ===== 카드 드로우 (덱빌딩) =====
export function drawHand(cooldowns: Record<string, number>): string[] {
    const available = DEFENSE_ACTIONS
        .filter((a) => !(cooldowns[a.id] > 0))
        .map((a) => a.id);
    
    // 랜덤하게 4장 섞기
    const shuffled = [...available].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 4);
}

// ===== 랜덤 이벤트 체크 =====
export function checkRandomEvent(month: number, usedEvents: Set<string>): RandomEvent | null {
    const candidates = RANDOM_EVENTS.filter(
        (ev) => month >= ev.minMonth && !usedEvents.has(ev.id),
    );

    for (const event of candidates) {
        if (Math.random() < event.probability) return event;
    }

    return null;
}

export function applyRandomEvent(stats: GameStats, event: RandomEvent): GameStats {
    return {
        cancelProgress: clamp(stats.cancelProgress + event.cancelEffect),
        awareness: clamp(stats.awareness + event.awarenessEffect),
        democracy: clamp(stats.democracy + event.democracyEffect),
    };
}

// ===== 엔딩 체크 =====
export function checkEnding(
    stats: GameStats,
    month: number,
): GameEnding | null {
    // 패배 1: 공소취소 100% (사법 붕괴)
    if (stats.cancelProgress >= 100) {
        return GAME_ENDINGS.find((e) => e.id === "cancel_success") ?? null;
    }

    // 패배 2: 법치주의 0% (법치주의 붕괴 / 광장 정치)
    if (stats.democracy <= 0) {
        return GAME_ENDINGS.find((e) => e.id === "democracy_collapse") ?? null;
    }

    // 승리 조건: 30턴 생존
    if (month > MAX_MONTHS) {
        // 국민 각성 (awareness >= 80)
        if (stats.awareness >= 80) {
            return GAME_ENDINGS.find((e) => e.id === "awakening") ?? null;
        }
        // 완벽한 수호 (democracy >= 60)
        if (stats.democracy >= 60) {
            return GAME_ENDINGS.find((e) => e.id === "perfect_defense") ?? null;
        }
        // 간신히 생존
        return GAME_ENDINGS.find((e) => e.id === "narrow_survival") ?? null;
    }

    return null;
}

export function getEndingById(endingId: GameEnding["id"] | null) {
    if (!endingId) return null;
    return GAME_ENDINGS.find((ending) => ending.id === endingId) ?? null;
}

export function getStatTone(key: keyof GameStats, value: number): string {
    if (key === "cancelProgress") {
        if (value >= 70) return "danger";
        if (value >= 40) return "warning";
        return "good";
    }
    // awareness, democracy — higher is better
    if (value >= 60) return "good";
    if (value >= 30) return "warning";
    return "danger";
}
