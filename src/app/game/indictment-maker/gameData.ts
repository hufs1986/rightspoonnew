// ===== 공소취소 메이커 — 게임 데이터 =====

export interface GameStats {
    lawRule: number;           // 법치주의 (0-100)
    separation: number;        // 삼권분립 (0-100)
    judicialIndep: number;     // 사법독립 (0-100)
    publicTrust: number;       // 국민신뢰 (0-100)
    regimeShield: number;      // 정권방탄도 (0-100)
    legislativeRush: number;   // 입법폭주도 (0-100)
    cancelProgress: number;    // 공소취소완성도 (0-100)
    mediaControversy: number;  // 언론논란 (0-100)
    oppositionAnger: number;   // 야당분노 (0-100)
}

export interface GameAction {
    id: string;
    name: string;
    emoji: string;
    description: string;
    effects: Partial<GameStats>;
    requires?: string[];       // 선행 조건 (completedMilestones)
    unlocksMilestone?: string;
    newsHeadline: string;
    phase: number;            // 어느 단계부터 가능한지 (1~7)
}

export interface CharacterLevel {
    level: number;
    name: string;
    emoji: string;
    description: string;
    requiredProgress: number;
}

export interface GameEnding {
    id: string;
    name: string;
    title: string;
    description: string;
    emoji: string;
    condition: (stats: GameStats, milestones: Set<string>) => boolean;
    priority: number;
}

// ===== 캐릭터 성장 단계 =====
export const CHARACTER_LEVELS: CharacterLevel[] = [
    { level: 1, name: "의혹의 씨앗", emoji: "🌱", description: "아직은 조용한 서류 뭉치...", requiredProgress: 0 },
    { level: 2, name: "조작기소 프레임", emoji: "📋", description: "프레임이 만들어지기 시작했다", requiredProgress: 15 },
    { level: 3, name: "국정조사 병아리", emoji: "🐣", description: "국회에서 날개를 펴기 시작", requiredProgress: 30 },
    { level: 4, name: "특검법 소녀", emoji: "⚖️", description: "법안의 형태를 갖추기 시작", requiredProgress: 50 },
    { level: 5, name: "공소취소 공주", emoji: "👸", description: "공소를 삭제할 힘이 자라고 있다", requiredProgress: 70 },
    { level: 6, name: "사법삭제 여왕", emoji: "👑", description: "재판이 두려워하기 시작했다", requiredProgress: 85 },
    { level: 7, name: "법치붕괴 마왕", emoji: "😈", description: "아무도 막을 수 없다", requiredProgress: 95 },
];

// ===== 게임 행동 목록 =====
export const GAME_ACTIONS: GameAction[] = [
    // Phase 1: 프레임 구축
    {
        id: "frame_media",
        name: "언론 프레임 구축",
        emoji: "📺",
        description: "\"정치검찰 조작기소\"라는 프레임을 대중에게 확산시킨다",
        effects: { cancelProgress: 5, regimeShield: 6, publicTrust: -3, mediaControversy: 8 },
        newsHeadline: "여당 \"검찰 기소는 정치적 조작\" 대대적 캠페인 돌입",
        phase: 1,
        unlocksMilestone: "frame_established"
    },
    {
        id: "rally_supporters",
        name: "지지자 결집",
        emoji: "✊",
        description: "지지층에게 \"부당한 기소\"를 호소하며 결집을 촉구한다",
        effects: { regimeShield: 8, publicTrust: -5, oppositionAnger: 6, mediaControversy: 4 },
        newsHeadline: "여당 지지자 수만 명, \"조작기소 규탄\" 대규모 집회",
        phase: 1,
    },
    {
        id: "discredit_prosecutors",
        name: "검사 신뢰도 공격",
        emoji: "🔨",
        description: "기소를 담당한 검사들의 과거 행적을 캐서 신뢰도를 떨어뜨린다",
        effects: { cancelProgress: 4, judicialIndep: -6, mediaControversy: 10, regimeShield: 5 },
        newsHeadline: "검사 과거 비위 의혹 폭로... 수사 공정성 논란",
        phase: 1,
    },

    // Phase 2: 국정조사
    {
        id: "launch_investigation",
        name: "국정조사 개회",
        emoji: "🏛️",
        description: "국회에서 \"조작기소 의혹 진상규명 국정조사\"를 정식 개회한다",
        effects: { cancelProgress: 10, legislativeRush: 12, lawRule: -8, separation: -6, oppositionAnger: 12 },
        requires: ["frame_established"],
        unlocksMilestone: "investigation_launched",
        newsHeadline: "국회 국조특위 출범 — 42일간 집중 조사 돌입",
        phase: 2,
    },
    {
        id: "summon_witnesses",
        name: "증인 219명 소환",
        emoji: "📜",
        description: "검사, 수사관, 참고인 등 대규모 증인 소환장을 발부한다",
        effects: { cancelProgress: 8, judicialIndep: -10, legislativeRush: 8, oppositionAnger: 10, mediaControversy: 12 },
        requires: ["investigation_launched"],
        unlocksMilestone: "witnesses_summoned",
        newsHeadline: "국조특위, 219명 증인·36명 참고인 일괄 소환",
        phase: 2,
    },
    {
        id: "play_recording",
        name: "통화녹취록 공개",
        emoji: "🎙️",
        description: "검사-변호인 간 실제 통화 녹음을 국회에서 재생한다",
        effects: { cancelProgress: 12, regimeShield: 10, lawRule: -6, judicialIndep: -8, mediaControversy: 15 },
        requires: ["witnesses_summoned"],
        unlocksMilestone: "recording_played",
        newsHeadline: "\"자백이 필요하다\" 검사 육성 녹취 국회서 폭탄 공개",
        phase: 2,
    },

    // Phase 3: 국정조사 마무리 + 고발
    {
        id: "adopt_report",
        name: "조사결과보고서 채택",
        emoji: "📑",
        description: "여당 단독으로 \"조작기소 확인\" 결과보고서를 채택한다",
        effects: { cancelProgress: 10, legislativeRush: 15, lawRule: -10, separation: -8, publicTrust: -8, oppositionAnger: 15 },
        requires: ["recording_played"],
        unlocksMilestone: "report_adopted",
        newsHeadline: "국조특위, 여당 단독 \"조작기소 확인\" 보고서 채택",
        phase: 3,
    },
    {
        id: "mass_indictments",
        name: "증인 31명 무더기 고발",
        emoji: "⚡",
        description: "청문회 증인 31명을 위증, 불출석 등 혐의로 일괄 고발한다",
        effects: { cancelProgress: 6, regimeShield: 8, lawRule: -12, judicialIndep: -10, oppositionAnger: 18, publicTrust: -6 },
        requires: ["report_adopted"],
        unlocksMilestone: "witnesses_indicted",
        newsHeadline: "국회, 검사·참고인 31명 무더기 형사 고발 의결",
        phase: 3,
    },

    // Phase 4: 특검법
    {
        id: "draft_special_counsel",
        name: "특검법 발의",
        emoji: "📝",
        description: "\"조작기소 진상규명 특별검사법\"을 국회에 전격 발의한다",
        effects: { cancelProgress: 12, legislativeRush: 15, lawRule: -15, separation: -12, judicialIndep: -10, oppositionAnger: 20, mediaControversy: 15 },
        requires: ["report_adopted"],
        unlocksMilestone: "bill_submitted",
        newsHeadline: "여당, 350명 규모 '슈퍼 특검법' 국회 전격 발의",
        phase: 4,
    },
    {
        id: "pass_special_counsel",
        name: "특검법 강행 통과",
        emoji: "🗳️",
        description: "본회의에서 특검법을 여당 단독으로 강행 처리한다",
        effects: { cancelProgress: 15, legislativeRush: 20, lawRule: -18, separation: -15, judicialIndep: -12, publicTrust: -10, oppositionAnger: 25 },
        requires: ["bill_submitted"],
        unlocksMilestone: "bill_passed",
        newsHeadline: "특검법 본회의 강행 통과 — 야당 퇴장 속 단독 처리",
        phase: 4,
    },

    // Phase 5: 특검 임명 + 권한 확보
    {
        id: "appoint_counsel",
        name: "특검 임명",
        emoji: "👤",
        description: "여당 추천 후보를 대통령이 특별검사로 임명한다",
        effects: { cancelProgress: 10, regimeShield: 15, lawRule: -10, separation: -15, judicialIndep: -12, publicTrust: -8 },
        requires: ["bill_passed"],
        unlocksMilestone: "counsel_appointed",
        newsHeadline: "대통령, 여당 추천 특검 후보 전격 임명",
        phase: 5,
    },
    {
        id: "transfer_cases",
        name: "재판기록 강제 이첩",
        emoji: "📦",
        description: "법원 계류 중인 5개 재판 기록 일체를 특검에 넘긴다",
        effects: { cancelProgress: 10, legislativeRush: 10, lawRule: -12, separation: -10, judicialIndep: -15 },
        requires: ["counsel_appointed"],
        unlocksMilestone: "cases_transferred",
        newsHeadline: "특검, 대통령 관련 5개 재판 기록 일괄 이첩 요구",
        phase: 5,
    },
    {
        id: "seize_prosecution",
        name: "공소유지권 장악",
        emoji: "🔑",
        description: "특검이 기존 검찰의 공소유지 권한을 강제로 넘겨받는다",
        effects: { cancelProgress: 12, regimeShield: 12, lawRule: -15, separation: -12, judicialIndep: -18, publicTrust: -10 },
        requires: ["cases_transferred"],
        unlocksMilestone: "prosecution_seized",
        newsHeadline: "특검, 대통령 관련 사건 공소유지권 전면 인수",
        phase: 5,
    },

    // Phase 6: 최종 — 공소취소
    {
        id: "cancel_indictment",
        name: "⚠️ 공소취소 버튼",
        emoji: "🔴",
        description: "특검이 \"조작기소로 판명\"을 이유로 공소를 취소한다. 재판이 사라진다.",
        effects: { cancelProgress: 100, regimeShield: 30, lawRule: -50, separation: -40, judicialIndep: -50, publicTrust: -30, oppositionAnger: 40 },
        requires: ["prosecution_seized"],
        unlocksMilestone: "indictment_cancelled",
        newsHeadline: "특검, 대통령 관련 전 사건 공소취소 — 재판 전면 소멸",
        phase: 6,
    },

    // 언제든 사용 가능한 보조 행동들
    {
        id: "do_nothing",
        name: "국정에 집중",
        emoji: "🏢",
        description: "이번 달은 사법 이슈에 개입하지 않고 국정에 집중한다",
        effects: { publicTrust: 5, lawRule: 2, oppositionAnger: -3, mediaControversy: -5, regimeShield: -2 },
        newsHeadline: "대통령, 경제·민생 현안에 전념... 조용한 한 달",
        phase: 1,
    },
    {
        id: "press_conference",
        name: "대국민 담화",
        emoji: "🎤",
        description: "\"부당한 정치 기소의 피해자\"라는 내용의 대국민 호소문을 발표한다",
        effects: { cancelProgress: 3, regimeShield: 5, publicTrust: -4, mediaControversy: 8, oppositionAnger: 5 },
        newsHeadline: "대통령 \"나는 정치검찰의 피해자\" 대국민 담화 발표",
        phase: 1,
    },
];

// ===== 랜덤 이벤트 =====
export interface RandomEvent {
    id: string;
    title: string;
    description: string;
    effects: Partial<GameStats>;
    newsHeadline: string;
    minMonth: number;
    probability: number; // 0~1
}

export interface ChainedEvent {
    id: string;
    title: string;
    description: string;
    effects: Partial<GameStats>;
    newsHeadline: string;
    triggerActionId: string;
}

export const RANDOM_EVENTS: RandomEvent[] = [
    {
        id: "constitutional_court_warning",
        title: "헌재 경고",
        description: "헌법재판소가 \"입법부의 사법 개입에 대해 심각한 우려\"를 표명했다",
        effects: { legislativeRush: -5, lawRule: 5, oppositionAnger: -3 },
        newsHeadline: "헌재 \"삼권분립 훼손 우려\" 이례적 공식 성명",
        minMonth: 6,
        probability: 0.15,
    },
    {
        id: "international_criticism",
        title: "국제 사회 비판",
        description: "미국 국무부와 EU가 \"사법 독립성 훼손 우려\"를 공식 표명했다",
        effects: { publicTrust: -8, judicialIndep: 3, mediaControversy: 10 },
        newsHeadline: "미·EU \"한국 사법독립 훼손 심각\" 공동 성명",
        minMonth: 12,
        probability: 0.12,
    },
    {
        id: "public_protest",
        title: "시민 항의 집회",
        description: "\"왜 한 사람만 예외인가\" 플래카드를 든 시민들이 국회 앞에 모였다",
        effects: { publicTrust: -10, oppositionAnger: 8, mediaControversy: 12 },
        newsHeadline: "\"법 앞에 평등하라\" 국회 앞 촛불 집회 5만 명 운집",
        minMonth: 8,
        probability: 0.18,
    },
    {
        id: "judge_resignation",
        title: "판사 집단 성명",
        description: "현직 판사 200명이 \"사법부 독립 수호\" 성명을 발표했다",
        effects: { judicialIndep: 8, lawRule: 5, legislativeRush: -3, oppositionAnger: 5 },
        newsHeadline: "현직 판사 200명 \"사법독립 사수\" 긴급 성명",
        minMonth: 10,
        probability: 0.1,
    },
    {
        id: "economy_crisis",
        title: "경제 위기 심화",
        description: "사법 혼란으로 외국인 투자자 이탈, 환율 급등",
        effects: { publicTrust: -12, regimeShield: -5, mediaControversy: 8 },
        newsHeadline: "원·달러 환율 1500원 돌파, 외국인 투자 이탈 가속",
        minMonth: 15,
        probability: 0.1,
    },
    {
        id: "supporter_fatigue",
        title: "지지층 피로감",
        description: "\"사법 이슈만 하지 말고 민생을 챙겨라\" 지지층 내부 불만 확산",
        effects: { regimeShield: -8, publicTrust: -5, mediaControversy: 5 },
        newsHeadline: "여당 지지층 \"민생이 먼저\" 내부 불만 표출",
        minMonth: 18,
        probability: 0.15,
    },
    {
        id: "bar_association_statement",
        title: "변호사회 긴급 성명",
        description: "대한변호사협회가 \"공소취소는 법치주의 자살 행위\"라며 긴급 성명을 발표했다",
        effects: { lawRule: 6, judicialIndep: 4, mediaControversy: 8, oppositionAnger: 4 },
        newsHeadline: "변협 \"공소취소는 헌정사상 유례 없는 사법 파괴\" 긴급 성명",
        minMonth: 8,
        probability: 0.12,
    },
    {
        id: "professor_petition",
        title: "법학 교수 청원",
        description: "전국 법학 교수 500명이 \"법치주의 수호\" 청원서를 헌법재판소에 제출했다",
        effects: { lawRule: 4, publicTrust: -3, judicialIndep: 5 },
        newsHeadline: "법학 교수 500명 \"이것은 법치의 죽음\" 헌재 청원",
        minMonth: 10,
        probability: 0.1,
    },
    {
        id: "media_split",
        title: "언론 양극화 심화",
        description: "보수·진보 언론이 극단적으로 갈라져 같은 사건을 전혀 다른 뉴스로 보도하고 있다",
        effects: { mediaControversy: 15, publicTrust: -7, separation: -4 },
        newsHeadline: "\"조작기소\" vs \"사법농단\"... 같은 사건, 두 개의 대한민국",
        minMonth: 5,
        probability: 0.14,
    },
    {
        id: "business_warning",
        title: "재계 투자 경고",
        description: "한국경영자총협회가 \"사법 불확실성으로 인한 투자 위축\"을 경고했다",
        effects: { publicTrust: -6, regimeShield: -3, mediaControversy: 5 },
        newsHeadline: "경총 \"사법 혼란으로 외국 기업 한국 투자 보류 속출\"",
        minMonth: 12,
        probability: 0.1,
    },
    {
        id: "viral_meme",
        title: "SNS 밈 폭발",
        description: "공소취소 과정을 풍자하는 밈이 SNS에서 폭발적으로 확산되고 있다",
        effects: { mediaControversy: 10, publicTrust: -4, regimeShield: -3 },
        newsHeadline: "\"재판 삭제 버튼\" 밈 트위터 실검 1위... 해외까지 확산",
        minMonth: 3,
        probability: 0.16,
    },
    {
        id: "whistleblower",
        title: "내부 고발자 등장",
        description: "특검팀 내부에서 \"처음부터 공소취소가 목적이었다\"는 폭로가 나왔다",
        effects: { regimeShield: -10, publicTrust: -8, lawRule: 3, mediaControversy: 12 },
        newsHeadline: "특검팀 前 수사관 \"공소취소 시나리오, 임명 전부터 짜여 있었다\" 폭로",
        minMonth: 20,
        probability: 0.08,
    },
    {
        id: "victim_testimony",
        title: "피해자 기자회견",
        description: "대장동·성남FC 관련 피해자들이 \"우리의 정의는 어디로 갔나\" 기자회견을 열었다",
        effects: { publicTrust: -10, oppositionAnger: 8, mediaControversy: 6 },
        newsHeadline: "피해자 연대 \"4,895억 배임 진실, 영원히 묻히게 생겼다\" 눈물 호소",
        minMonth: 15,
        probability: 0.12,
    },
    {
        id: "prosecution_morale",
        title: "검찰 사기 저하",
        description: "검사 30명이 \"권력자 수사는 보복만 돌아온다\"며 사표를 제출했다",
        effects: { judicialIndep: -8, lawRule: -5, regimeShield: 4 },
        newsHeadline: "현직 검사 30명 집단 사표 \"권력 수사하면 경력 끝\" 한탄",
        minMonth: 14,
        probability: 0.1,
    },
    {
        id: "ruling_party_revolt",
        title: "여당 내 이탈자",
        description: "여당 소장파 의원 3명이 특검법 표결에서 이탈하여 반대표를 던졌다",
        effects: { regimeShield: -6, legislativeRush: -8, separation: 5, publicTrust: 3 },
        newsHeadline: "여당 소장파 3인 \"양심에 따라 반대\" 깜짝 이탈표",
        minMonth: 16,
        probability: 0.09,
    },
    {
        id: "youth_movement",
        title: "대학생 연합 행동",
        description: "전국 대학 학생회가 \"법치주의를 지켜라\" 공동 성명과 함께 캠퍼스 서명운동을 시작했다",
        effects: { publicTrust: -5, oppositionAnger: 6, mediaControversy: 8, regimeShield: -3 },
        newsHeadline: "전국 120개 대학 학생회 \"우리가 배운 헌법은 이게 아니다\" 공동 선언",
        minMonth: 7,
        probability: 0.13,
    },
];

export const CHAINED_EVENTS: ChainedEvent[] = [
    {
        id: "chain_echo_chamber",
        triggerActionId: "rally_supporters",
        title: "확증편향 생태계 강화",
        description: "언론 프레임과 지지층 결집이 맞물리며 지지 기반은 단단해졌지만, 중도층 이탈이 빨라졌다.",
        effects: { regimeShield: 6, publicTrust: -7, mediaControversy: 6 },
        newsHeadline: "지지층 결집 성공... 그러나 중도층 '현실 검증은 사라졌다' 반발",
    },
    {
        id: "chain_witness_chill",
        triggerActionId: "mass_indictments",
        title: "증인 위축 효과",
        description: "대규모 고발 이후 수사 협조자와 참고인들이 발언을 꺼리기 시작했다. 진술 환경 전체가 얼어붙었다.",
        effects: { judicialIndep: -7, oppositionAnger: 7, publicTrust: -5 },
        newsHeadline: "핵심 참고인들 줄줄이 침묵... '다음은 나일 수 있다' 위축 확산",
    },
    {
        id: "chain_legislative_fatigue",
        triggerActionId: "pass_special_counsel",
        title: "입법 피로 누적",
        description: "강행 처리의 속도가 오르자 여당 내부에서도 '민생보다 방탄'이라는 불만이 새어나오기 시작했다.",
        effects: { regimeShield: -4, publicTrust: -6, mediaControversy: 7 },
        newsHeadline: "여당 내부서도 '입법 폭주 피로감'... 정권 핵심 의제 흔들림",
    },
    {
        id: "chain_conflict_backlash",
        triggerActionId: "appoint_counsel",
        title: "이해충돌 역풍",
        description: "정권이 추천한 특검이 정권 핵심 사건을 넘겨받는 구조에 대해 국내외 법조계 비판이 증폭됐다.",
        effects: { publicTrust: -8, separation: -6, mediaControversy: 10 },
        newsHeadline: "법조계 '피고인이 자기 사건 심판자를 고른 셈' 이해충돌 비판 확산",
    },
    {
        id: "chain_late_normalization",
        triggerActionId: "do_nothing",
        title: "늦은 정상화 시도",
        description: "정면 충돌을 멈추고 국정에 집중하자 일부 여론이 숨을 돌렸다. 다만 이미 손상된 신뢰를 회복하기엔 늦었다.",
        effects: { lawRule: 4, publicTrust: 4, mediaControversy: -5, regimeShield: -3 },
        newsHeadline: "정치 개입 멈추자 시장과 여론 일시 안정... '처음부터 이랬어야' 지적도",
    },
];

// ===== 엔딩 =====
export const GAME_ENDINGS: GameEnding[] = [
    {
        id: "shield_success",
        name: "방탄 성공",
        title: "\"무죄가 아니라, 재판이 사라졌다\"",
        description: "모든 재판이 사라졌습니다.\n대통령은 웃었습니다.\n법원은 판단하지 못했습니다.\n국민은 아무것도 확인하지 못했습니다.\n\n유죄도 아니고, 무죄도 아닙니다.\n그냥... 재판이 없어진 것입니다.",
        emoji: "👑",
        condition: (stats, milestones) => milestones.has("indictment_cancelled") && stats.lawRule > 0,
        priority: 10,
    },
    {
        id: "constitutional_block",
        name: "헌재 제동",
        title: "\"버튼은 있었지만, 헌법이 막았다\"",
        description: "헌법재판소가 특검법 핵심 조항에 대해\n위헌 결정을 내렸습니다.\n\n공소취소 메이커는 실패했습니다.\n재판은 다시 열립니다.\n\n법치주의는 간신히 숨을 쉬었습니다.",
        emoji: "⚖️",
        condition: (stats) => stats.lawRule <= 15 && stats.separation <= 20 && stats.cancelProgress < 100,
        priority: 8,
    },
    {
        id: "public_rage",
        name: "여론 폭발",
        title: "\"법은 이겼지만, 나라는 졌다\"",
        description: "공소취소는 성공했지만,\n국민 신뢰가 바닥을 쳤습니다.\n\n거리에는\n'왜 한 사람만 예외인가'\n라는 문구가 걸렸습니다.\n\n권력은 이겼지만,\n나라는 깊은 상처를 입었습니다.",
        emoji: "🔥",
        condition: (stats, milestones) => milestones.has("indictment_cancelled") && stats.publicTrust <= 10,
        priority: 9,
    },
    {
        id: "law_collapse",
        name: "법치주의 붕괴",
        title: "\"다음 권력도 배웠다\"",
        description: "이제 누구도 재판을 믿지 않습니다.\n\n정권이 바뀔 때마다 재판은 지워지고,\n특검은 방탄 도구가 되었습니다.\n\n오늘의 칼은,\n내일 자신에게 돌아올 것입니다.",
        emoji: "💀",
        condition: (stats, milestones) => milestones.has("indictment_cancelled") && stats.lawRule <= 0,
        priority: 11,
    },
    {
        id: "term_ended",
        name: "임기 종료",
        title: "\"5년이 지났다. 재판은 아직 거기 있다\"",
        description: "60개월의 임기가 끝났습니다.\n\n공소취소에 실패했지만,\n재판은 5년간 멈춰 있었습니다.\n\n퇴임과 함께 법정의 시계가\n다시 째깍거리기 시작합니다.",
        emoji: "⏰",
        condition: () => true, // fallback
        priority: 1,
    },
];

// ===== 재판 목록 (HUD 표시용) =====
export const TRIALS = [
    { id: 1, name: "공직선거법 위반", court: "서울고법 파기환송심", emoji: "🗳️" },
    { id: 2, name: "위증교사", court: "서울고법 항소심", emoji: "🤥" },
    { id: 3, name: "대장동·성남FC 뇌물", court: "서울중앙지법 1심", emoji: "🏗️" },
    { id: 4, name: "쌍방울 대북송금", court: "수원지법 1심", emoji: "💸" },
    { id: 5, name: "법인카드 유용", court: "수원지법 1심", emoji: "💳" },
];
