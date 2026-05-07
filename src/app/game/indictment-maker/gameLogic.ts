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
    cancelProgress: { label: "공소취소 진행률", emoji: "🔴" },
    energy: { label: "시민 에너지", emoji: "⚡" },
    awareness: { label: "국민 인식", emoji: "👁️" },
    democracy: { label: "민주주의", emoji: "🏛️" },
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
    exhaustedTurns: number;              // consecutive turns with 0 energy
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
        exhaustedTurns: 0,
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
        3: "atk_press_conf",
        5: "atk_rally",
        7: "atk_discredit",
        10: "atk_investigation",
        12: "atk_summon",
        15: "atk_recording",
        17: "atk_report",
        20: "atk_draft_bill",
        22: "atk_pass_bill",
        24: "atk_appoint",
        26: "atk_seize",
        28: "atk_transfer",
        30: "atk_cancel",
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
        energy: clamp(stats.energy - 2), // 에너지도 매 턴 자연감소
        awareness: clamp(stats.awareness + attack.awarenessEffect),
        democracy: clamp(stats.democracy - demoDamage),
    };
}

// ===== 방어 행동 적용 =====
export function applyDefenseAction(
    stats: GameStats,
    action: DefenseAction,
): GameStats {
    if (action.id === "rest") {
        return {
            ...stats,
            energy: clamp(stats.energy + ENERGY_RESTORE_AMOUNT),
        };
    }

    return {
        cancelProgress: clamp(stats.cancelProgress - action.cancelReduction),
        energy: clamp(stats.energy - action.energyCost),
        awareness: clamp(stats.awareness + action.awarenessGain),
        democracy: clamp(stats.democracy + action.democracyGain),
    };
}

// ===== 에너지로 사용 가능한지 체크 =====
export function canUseAction(
    action: DefenseAction,
    energy: number,
    cooldowns: Record<string, number>,
): boolean {
    if (action.id === "rest") return true;
    if (energy < action.energyCost) return false;
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
        .filter((a) => a.id !== "rest" && !(cooldowns[a.id] > 0))
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
        energy: clamp(stats.energy + event.energyEffect),
        awareness: clamp(stats.awareness + event.awarenessEffect),
        democracy: clamp(stats.democracy + event.democracyEffect),
    };
}

// ===== 엔딩 체크 =====
export function checkEnding(
    stats: GameStats,
    month: number,
    exhaustedTurns: number,
): GameEnding | null {
    // 패배: 공소취소 100%
    if (stats.cancelProgress >= 100) {
        return GAME_ENDINGS.find((e) => e.id === "cancel_success") ?? null;
    }

    // 패배: 시민 소진 (에너지 0으로 5턴 연속)
    if (exhaustedTurns >= 5) {
        return GAME_ENDINGS.find((e) => e.id === "exhausted") ?? null;
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
    if (key === "energy") {
        if (value >= 40) return "good";
        if (value >= 20) return "warning";
        return "danger";
    }
    // awareness, democracy — higher is better
    if (value >= 60) return "good";
    if (value >= 30) return "warning";
    return "danger";
}
