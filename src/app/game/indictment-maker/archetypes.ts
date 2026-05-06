export interface Archetype {
    id: string;
    name: string;
    emoji: string;
    description: string;
    color: string;
}

export const ARCHETYPES: Record<string, Archetype> = {
    investigator: {
        id: "investigator",
        name: "팩트폭행 수사관",
        emoji: "🕵️",
        description: "논리와 증거로 승부하는 당신! 감정보다는 명확한 사실 관계로 상대의 허점을 찌르는 데 탁월합니다.",
        color: "#4a90e2",
    },
    activist: {
        id: "activist",
        name: "아스팔트 행동대장",
        emoji: "✊",
        description: "행동이 곧 정의! 머뭇거리지 않고 거리로 나가 직접 목소리를 내며 여론을 주도하는 불도저입니다.",
        color: "#e24a4a",
    },
    scholar: {
        id: "scholar",
        name: "엄근진 지식인",
        emoji: "📚",
        description: "펜은 칼보다 강하다! 법리와 논평을 통해 여론의 기반을 다지고 명분을 만들어내는 전략가입니다.",
        color: "#4ae290",
    },
    guardian: {
        id: "guardian",
        name: "법치주의 수호자",
        emoji: "⚖️",
        description: "시스템 안에서 정당하게 싸운다! 헌법과 국제 여론을 무기로 거대한 권력에 맞서는 원칙주의자입니다.",
        color: "#e2b84a",
    },
    slacker: {
        id: "slacker",
        name: "관망하는 침대축구러",
        emoji: "🛌",
        description: "위기 앞에서도 흔들림 없는(?) 멘탈. 적극적인 행동보다는 상황을 관망하며 에너지만 비축하는 타입입니다.",
        color: "#a0a0a0",
    },
    balanced: {
        id: "balanced",
        name: "올라운더 시민",
        emoji: "🌟",
        description: "상황에 맞춰 다양한 전략을 구사하는 팔방미인! 치우침 없이 유연하게 위기를 헤쳐나갑니다.",
        color: "#9d4ae2",
    }
};

export function calculateArchetype(frequencies: Record<string, number>): Archetype {
    const totalActions = Object.values(frequencies).reduce((a, b) => a + b, 0);
    if (totalActions === 0) return ARCHETYPES.balanced;

    const actionRates = {
        investigator: (frequencies["investigative_report"] || 0) + (frequencies["corruption_expose"] || 0),
        activist: (frequencies["citizen_petition"] || 0) + (frequencies["protest_rally"] || 0),
        scholar: (frequencies["legal_scholars"] || 0) + (frequencies["education_campaign"] || 0),
        guardian: (frequencies["constitutional_appeal"] || 0) + (frequencies["international_solidarity"] || 0),
        slacker: frequencies["rest"] || 0,
    };

    // 가장 많이 한 행동 유형 찾기
    let maxType = "balanced";
    let maxVal = 0;

    for (const [key, val] of Object.entries(actionRates)) {
        if (val > maxVal) {
            maxVal = val;
            maxType = key;
        }
    }

    // 만약 한 가지 행동이 압도적이지 않고 여러 개가 비슷하다면 balanced (최대값이 전체의 30% 이하인 경우, 단 휴식은 예외)
    if (maxType !== "slacker" && maxVal / totalActions < 0.3 && totalActions > 5) {
        return ARCHETYPES.balanced;
    }

    return ARCHETYPES[maxType] || ARCHETYPES.balanced;
}
