// ===== 피해 결과 데이터 — 매 행동 후 즉각적 감정 피드백 =====

export interface ImpactMessage {
    emoji: string;
    text: string;
}

// 각 액션별 피해 결과 메시지 (랜덤으로 1개 표시)
export const ACTION_IMPACTS: Record<string, ImpactMessage[]> = {
    frame_media: [
        { emoji: "📰", text: "여론조사에서 '검찰을 믿지 않는다'는 응답이 3%p 올랐습니다." },
        { emoji: "🤷", text: "시민 14만 명이 '재판 결과와 상관없이 무죄'라고 답했습니다." },
        { emoji: "📺", text: "검찰의 공식 해명이 SNS에서 '조작'이라는 댓글에 묻혔습니다." },
    ],
    rally_supporters: [
        { emoji: "⚖️", text: "담당 재판부 판사에게 항의 전화가 하루 200통 걸려왔습니다." },
        { emoji: "😰", text: "재판부가 '외부 압력에 의한 공정성 훼손 우려'를 공식 표명했습니다." },
        { emoji: "📢", text: "법원 앞에서 '무죄 석방' 구호가 매일 울려 퍼지고 있습니다." },
    ],
    discredit_prosecutors: [
        { emoji: "😔", text: "수사를 담당한 검사 3명이 '신변 위협'을 호소했습니다." },
        { emoji: "🔇", text: "다음 사건 배정을 거부하는 검사가 늘고 있습니다." },
        { emoji: "💔", text: "검찰 내부 사기가 역대 최저치를 기록했습니다." },
    ],
    launch_investigation: [
        { emoji: "🏛️", text: "국회가 법원의 재판 기능을 사실상 정지시켰습니다." },
        { emoji: "😡", text: "야당 의원들이 '삼권분립 파괴'라며 의사당 앞에서 농성 중입니다." },
        { emoji: "📋", text: "법원 관계자: '국정조사와 재판이 동시에 진행되면 증인들이 혼란에 빠집니다.'" },
    ],
    summon_witnesses: [
        { emoji: "😰", text: "소환된 수사관 중 47명이 '향후 권력 수사를 포기하겠다'고 답했습니다." },
        { emoji: "🤐", text: "핵심 참고인 5명이 갑자기 '기억나지 않는다'로 진술을 번복했습니다." },
        { emoji: "😢", text: "한 수사관의 가족: '아빠가 국회에 끌려가고 나서 밤마다 우세요.'" },
    ],
    play_recording: [
        { emoji: "✂️", text: "녹취록의 앞뒤 맥락이 잘린 채 SNS에서 100만 회 공유되었습니다." },
        { emoji: "🎭", text: "피고인의 혐의 내용은 잊혀지고, 검사의 녹취만 기억에 남았습니다." },
        { emoji: "📉", text: "검찰의 수사 결과에 대한 국민 신뢰도가 12%p 하락했습니다." },
    ],
    adopt_report: [
        { emoji: "🚫", text: "야당 의견이 한 줄도 반영되지 않은 보고서가 '사실'이 되었습니다." },
        { emoji: "📑", text: "국회의 반쪽 결론이 특검법의 '법적 근거'로 사용됩니다." },
        { emoji: "⚠️", text: "법학 교수 300명: '국정조사가 사법 판단을 대체하는 전례가 만들어졌습니다.'" },
    ],
    mass_indictments: [
        { emoji: "🔇", text: "다음 청문회에서 증인 출석률이 60%에서 15%로 급락했습니다." },
        { emoji: "😨", text: "수사 협조자 12명이 '보복이 두렵다'며 진술을 철회했습니다." },
        { emoji: "⚖️", text: "한 판사: '증인이 겁에 질려 진실을 말하지 않으면, 재판은 의미를 잃습니다.'" },
    ],
    draft_special_counsel: [
        { emoji: "📝", text: "역사상 처음으로, 재판을 없애기 위한 법이 만들어지고 있습니다." },
        { emoji: "🌍", text: "외신 헤드라인: 'South Korea creates law to erase president's trials'" },
        { emoji: "👨‍⚖️", text: "헌법학자: '이 법은 사법부의 존재 이유를 부정합니다.'" },
    ],
    pass_special_counsel: [
        { emoji: "🗳️", text: "국회 의석 과반으로, 재판 삭제가 합법이 되었습니다." },
        { emoji: "😱", text: "시민: '다수당이면 재판도 없앨 수 있는 나라가 된 건가요?'" },
        { emoji: "🏛️", text: "삼권분립의 핵심 원칙에 균열이 생겼습니다." },
    ],
    appoint_counsel: [
        { emoji: "🤝", text: "피고인 측이 추천한 사람이 피고인의 재판을 담당합니다." },
        { emoji: "🌏", text: "국제법률가협회: '이것은 이해충돌의 교과서적 사례입니다.'" },
        { emoji: "⚖️", text: "수사의 독립성이 구조적으로 사라졌습니다." },
    ],
    transfer_cases: [
        { emoji: "📦", text: "법원에서 트럭 수십 대 분량의 재판 기록이 사라졌습니다." },
        { emoji: "😢", text: "피해자 가족: '우리의 증거가 어디로 가는 거예요?'" },
        { emoji: "👨‍⚖️", text: "담당 판사: '제 손에서 사건이 강탈당했습니다.'" },
    ],
    seize_prosecution: [
        { emoji: "🔑", text: "유죄를 주장하던 검사가 해임되고, 무혐의를 주장할 검사가 왔습니다." },
        { emoji: "😤", text: "원래 수사팀: '피땀 흘려 찾은 증거가 휴지조각이 됩니다.'" },
        { emoji: "⚖️", text: "법원은 이제 '유죄'를 주장하는 사람 없이 재판을 열어야 합니다." },
    ],
    cancel_indictment: [
        { emoji: "💀", text: "4,895억 원 배임의 진실은 영원히 법정에서 확인되지 못합니다." },
        { emoji: "😭", text: "800만 달러 대북송금의 진실은 영원히 미궁 속에 갇힙니다." },
        { emoji: "🚫", text: "유죄도 무죄도 아닙니다. 재판이 사라진 것입니다." },
    ],
    do_nothing: [
        { emoji: "✅", text: "법원이 외부 압력 없이 정상적으로 재판을 진행했습니다." },
        { emoji: "🏢", text: "국정에 집중하자 민생 관련 법안 3건이 통과되었습니다." },
    ],
    press_conference: [
        { emoji: "🎤", text: "대통령의 '조작' 발언 이후 재판부에 대한 압박이 가중되었습니다." },
        { emoji: "📊", text: "담화 직후 '재판 불신' 여론이 8%p 상승했습니다." },
    ],
};

// 피해 카운터 — 누적 수치
export interface ImpactCounters {
    intimidatedProsecutors: number;  // 위축된 검사
    silencedWitnesses: number;       // 침묵한 증인
    unverifiedAmount: number;        // 영구 미확인 금액 (억 원)
    abandonedVictims: number;        // 진실을 포기한 피해자
}

export const INITIAL_IMPACT_COUNTERS: ImpactCounters = {
    intimidatedProsecutors: 0,
    silencedWitnesses: 0,
    unverifiedAmount: 0,
    abandonedVictims: 0,
};

// 각 행동이 피해 카운터에 미치는 영향
export const ACTION_COUNTER_EFFECTS: Record<string, Partial<ImpactCounters>> = {
    frame_media: { intimidatedProsecutors: 2 },
    rally_supporters: { intimidatedProsecutors: 1, silencedWitnesses: 1 },
    discredit_prosecutors: { intimidatedProsecutors: 5, silencedWitnesses: 2 },
    launch_investigation: { intimidatedProsecutors: 3, silencedWitnesses: 3 },
    summon_witnesses: { intimidatedProsecutors: 8, silencedWitnesses: 5 },
    play_recording: { silencedWitnesses: 3 },
    adopt_report: { silencedWitnesses: 4, abandonedVictims: 2 },
    mass_indictments: { intimidatedProsecutors: 6, silencedWitnesses: 8, abandonedVictims: 3 },
    draft_special_counsel: { intimidatedProsecutors: 4, abandonedVictims: 2, unverifiedAmount: 500 },
    pass_special_counsel: { intimidatedProsecutors: 5, abandonedVictims: 3, unverifiedAmount: 1000 },
    appoint_counsel: { intimidatedProsecutors: 7, silencedWitnesses: 4, unverifiedAmount: 800 },
    transfer_cases: { silencedWitnesses: 6, abandonedVictims: 5, unverifiedAmount: 1200 },
    seize_prosecution: { intimidatedProsecutors: 10, silencedWitnesses: 8, unverifiedAmount: 1500 },
    cancel_indictment: { intimidatedProsecutors: 15, silencedWitnesses: 12, abandonedVictims: 12, unverifiedAmount: 5728 },
    do_nothing: {},
    press_conference: { intimidatedProsecutors: 1 },
};

export function getRandomImpact(actionId: string): ImpactMessage | null {
    const messages = ACTION_IMPACTS[actionId];
    if (!messages || messages.length === 0) return null;
    return messages[Math.floor(Math.random() * messages.length)];
}

export function applyCounterEffects(
    counters: ImpactCounters,
    actionId: string,
): ImpactCounters {
    const effects = ACTION_COUNTER_EFFECTS[actionId];
    if (!effects) return counters;
    return {
        intimidatedProsecutors: counters.intimidatedProsecutors + (effects.intimidatedProsecutors ?? 0),
        silencedWitnesses: counters.silencedWitnesses + (effects.silencedWitnesses ?? 0),
        unverifiedAmount: counters.unverifiedAmount + (effects.unverifiedAmount ?? 0),
        abandonedVictims: counters.abandonedVictims + (effects.abandonedVictims ?? 0),
    };
}
