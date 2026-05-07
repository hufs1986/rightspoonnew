// ===== 공소취소 방어전 — 게임 데이터 =====
// 콘셉트: 정치 머신이 매 턴 공소취소를 밀어붙이고, 시민이 방어한다.

export interface GameStats {
    cancelProgress: number;   // 공소취소 진행률 (0-100) — 100이면 패배
    energy: number;           // 시민 에너지 (0-100)
    awareness: number;        // 국민 인식 (0-100) — 높으면 정치 공격 약화
    democracy: number;        // 민주주의 건강도 (0-100) — 엔딩 분기
}

export const INITIAL_STATS: GameStats = {
    cancelProgress: 0,
    energy: 80,
    awareness: 30,
    democracy: 70,
};

export const MAX_MONTHS = 30;

// ===== 정치 머신 공격 (매 턴 자동) =====
export interface PoliticalAttack {
    id: string;
    name: string;
    emoji: string;
    description: string;
    newsHeadline: string;
    cancelIncrease: number;
    democracyDamage: number;
    awarenessEffect: number;
    minMonth: number;
    maxMonth: number;
    dialogueKey?: string;
    emotionalText: string;      // 감정을 자극하는 짧은 문장
    victimVoice?: string;       // 피해자 관점의 독백
}

export const POLITICAL_ATTACKS: PoliticalAttack[] = [
    // Phase 1: 프레임 구축 (1~5)
    {
        id: "atk_frame_media",
        name: "\"조작기소\" 프레임 유포",
        emoji: "📺",
        description: "여당이 \"검찰의 정치적 조작기소\"라는 프레임을 대중에게 확산시킨다",
        newsHeadline: "여당 \"검찰 기소는 정치적 조작\" 대대적 캠페인 돌입",
        cancelIncrease: 2,
        democracyDamage: 2,
        awarenessEffect: -3,
        minMonth: 1,
        maxMonth: 5,
        dialogueKey: "frame_media_1",
        emotionalText: "진실을 가리는 가장 효과적인 방법은, 진실을 '조작'이라고 부르는 것이다.",
        victimVoice: "저는 피해자예요. 근데 TV에서는 제 사건이 '조작'이래요. 저의 고통은 조작인가요?",
    },
    {
        id: "atk_rally",
        name: "지지자 대규모 결집",
        emoji: "✊",
        description: "수만 명의 지지자들이 \"부당한 기소 규탄\" 집회에 모였다",
        newsHeadline: "여당 지지자 수만 명, \"조작기소 규탄\" 대규모 집회",
        cancelIncrease: 2,
        democracyDamage: 3,
        awarenessEffect: -2,
        minMonth: 1,
        maxMonth: 8,
        dialogueKey: "rally_supporters_1",
        emotionalText: "법원 앞에 모인 수만 명. 그들이 원하는 건 '정의'가 아니라 '면죄부'다.",
        victimVoice: "재판부 판사님 집 앞까지 시위가 왔대요. 판사님이 공정한 판결을 내릴 수 있을까요?",
    },
    {
        id: "atk_discredit",
        name: "검사 신뢰도 공격",
        emoji: "🔨",
        description: "기소를 담당한 검사들의 과거를 캐서 신뢰를 무너뜨린다",
        newsHeadline: "검사 과거 비위 의혹 폭로... 수사 공정성 논란",
        cancelIncrease: 2,
        democracyDamage: 4,
        awarenessEffect: -4,
        minMonth: 2,
        maxMonth: 10,
        dialogueKey: "discredit_prosecutors_1",
        emotionalText: "메신저를 죽이면 메시지도 죽는다. 검사를 무너뜨리면 기소도 무너진다.",
        victimVoice: "수사해준 검사님이 신상 털리고 협박받고 있대요. 다음에 누가 수사하겠어요?",
    },
    {
        id: "atk_press_conf",
        name: "대통령 대국민 담화",
        emoji: "🎤",
        description: "\"나는 정치검찰의 피해자\"라는 대국민 호소문을 발표한다",
        newsHeadline: "대통령 \"나는 정치검찰의 피해자\" 대국민 담화 발표",
        cancelIncrease: 2,
        democracyDamage: 2,
        awarenessEffect: -5,
        minMonth: 1,
        maxMonth: 30,
        dialogueKey: "press_conference_1",
        emotionalText: "4,895억 원의 피해자가 있는데, 가해 혐의자가 '나는 피해자'라고 말한다.",
        victimVoice: "대통령이 피해자라면... 4,895억을 잃은 저는 뭔가요?",
    },

    // Phase 2: 국정조사 (6~15)
    {
        id: "atk_investigation",
        name: "국정조사 강행 개회",
        emoji: "🏛️",
        description: "국회에서 \"조작기소 의혹 진상규명 국정조사\"를 정식 개회한다",
        newsHeadline: "국회 국조특위 출범 — 42일간 집중 조사 돌입",
        cancelIncrease: 4,
        democracyDamage: 5,
        awarenessEffect: -3,
        minMonth: 6,
        maxMonth: 15,
        dialogueKey: "launch_investigation_1",
        emotionalText: "국회가 법원의 일을 빼앗았다. 재판 대신 정치쇼가 시작됐다.",
        victimVoice: "법원에서 진실이 밝혀지길 기다렸는데... 이제 국회에서 정치인들이 판단한대요.",
    },
    {
        id: "atk_summon",
        name: "증인 219명 소환",
        emoji: "📜",
        description: "검사, 수사관, 참고인 등 219명에게 대규모 소환장을 발부한다",
        newsHeadline: "국조특위, 219명 증인·36명 참고인 일괄 소환",
        cancelIncrease: 3,
        democracyDamage: 6,
        awarenessEffect: -2,
        minMonth: 8,
        maxMonth: 15,
        dialogueKey: "summon_witnesses_1",
        emotionalText: "219명. 진실을 밝히려 했던 모든 사람이 심판대에 올랐다.",
        victimVoice: "수사관 아내: '남편이 국회에 불려가고 나서 밤마다 울어요. 정의를 위해 일했을 뿐인데.'",
    },
    {
        id: "atk_recording",
        name: "통화녹취록 공개",
        emoji: "🎙️",
        description: "검사-변호인 간 실제 통화 녹음을 국회에서 재생한다",
        newsHeadline: "\"자백이 필요하다\" 검사 육성 녹취 국회서 폭탄 공개",
        cancelIncrease: 5,
        democracyDamage: 5,
        awarenessEffect: -6,
        minMonth: 9,
        maxMonth: 18,
        dialogueKey: "play_recording_1",
        emotionalText: "맥락을 잘라낸 30초 녹취가, 2년간의 수사를 삼켰다.",
        victimVoice: "그 녹취의 전체 맥락을 아무도 안 틀어줘요. 30초만 돌려요. 그게 공정한가요?",
    },
    {
        id: "atk_report",
        name: "조사결과보고서 채택",
        emoji: "📑",
        description: "여당 단독으로 \"조작기소 확인\" 결과보고서를 채택한다",
        newsHeadline: "국조특위, 여당 단독 \"조작기소 확인\" 보고서 채택",
        cancelIncrease: 4,
        democracyDamage: 7,
        awarenessEffect: -4,
        minMonth: 10,
        maxMonth: 18,
        dialogueKey: "adopt_report_1",
        emotionalText: "야당 의견 0줄. 반쪽짜리 보고서가 '진실'이 되었다.",
        victimVoice: "국회가 결론을 내렸대요. 법원도 아닌 국회가. 제 사건의 진실을 정치인이 결정한 거예요.",
    },

    // Phase 3: 특검법 (16~25)
    {
        id: "atk_draft_bill",
        name: "특검법 전격 발의",
        emoji: "📝",
        description: "\"조작기소 진상규명 특별검사법\"을 국회에 전격 발의한다",
        newsHeadline: "여당, 350명 규모 '슈퍼 특검법' 국회 전격 발의",
        cancelIncrease: 6,
        democracyDamage: 8,
        awarenessEffect: -3,
        minMonth: 16,
        maxMonth: 22,
        dialogueKey: "draft_special_counsel_1",
        emotionalText: "역사상 처음이다. 재판을 없애기 위한 법이 만들어지고 있다.",
        victimVoice: "재판을 없애는 법이라니... 그럼 저의 피해는 법적으로 존재하지 않게 되는 건가요?",
    },
    {
        id: "atk_pass_bill",
        name: "특검법 강행 통과",
        emoji: "🗳️",
        description: "본회의에서 특검법을 여당 단독으로 강행 처리한다",
        newsHeadline: "특검법 본회의 강행 통과 — 야당 퇴장 속 단독 처리",
        cancelIncrease: 7,
        democracyDamage: 10,
        awarenessEffect: -4,
        minMonth: 18,
        maxMonth: 25,
        dialogueKey: "pass_special_counsel_1",
        emotionalText: "다수당이면 재판도 없앨 수 있는 나라. 이것이 민주주의인가?",
        victimVoice: "국회 표결 영상을 봤어요. 웃으면서 통과시키더라고요. 제 인생이 걸린 재판인데.",
    },
    {
        id: "atk_appoint",
        name: "여당 추천 특검 임명",
        emoji: "👤",
        description: "여당 추천 후보를 대통령이 특별검사로 임명한다",
        newsHeadline: "대통령, 여당 추천 특검 후보 전격 임명",
        cancelIncrease: 6,
        democracyDamage: 9,
        awarenessEffect: -5,
        minMonth: 20,
        maxMonth: 27,
        dialogueKey: "appoint_counsel_1",
        emotionalText: "피고인이 추천한 검사가, 피고인의 재판을 맡는다.",
        victimVoice: "재판하는 사람을 피의자가 골랐어요. 이게 말이 되나요? 어느 나라 이야기예요?",
    },
    {
        id: "atk_seize",
        name: "공소유지권 장악",
        emoji: "🔑",
        description: "특검이 기존 검찰의 공소유지 권한을 강제로 넘겨받는다",
        newsHeadline: "특검, 대통령 관련 사건 공소유지권 전면 인수",
        cancelIncrease: 7,
        democracyDamage: 10,
        awarenessEffect: -4,
        minMonth: 22,
        maxMonth: 28,
        dialogueKey: "seize_prosecution_1",
        emotionalText: "'유죄입니다'라고 말하던 검사를 쫓아내고, '무혐의입니다'라고 말할 검사가 왔다.",
        victimVoice: "원래 검사님이 해임됐대요. 2년간 제 사건을 맡아준 분인데... 이제 누가 제 편이죠?",
    },

    // Phase 4: 최종 공격 (26~30)
    {
        id: "atk_transfer",
        name: "재판기록 강제 이첩",
        emoji: "📦",
        description: "법원 계류 중인 5개 재판 기록 일체를 특검에 넘긴다",
        newsHeadline: "특검, 대통령 관련 5개 재판 기록 일괄 이첩 요구",
        cancelIncrease: 8,
        democracyDamage: 8,
        awarenessEffect: -3,
        minMonth: 26,
        maxMonth: 30,
        dialogueKey: "transfer_cases_1",
        emotionalText: "법원에서 트럭 수십 대 분량의 재판 기록이 사라졌다.",
        victimVoice: "판사님이 '제 손에서 사건이 강탈당했다'고 하셨대요. 판사도 막을 수 없는 거예요?",
    },
    {
        id: "atk_cancel",
        name: "⚠️ 공소취소 최종 시도",
        emoji: "🔴",
        description: "특검이 \"조작기소로 판명\"을 이유로 공소를 취소하려 한다",
        newsHeadline: "특검, 대통령 관련 전 사건 공소취소 절차 돌입!",
        cancelIncrease: 10,
        democracyDamage: 12,
        awarenessEffect: -5,
        minMonth: 27,
        maxMonth: 30,
        dialogueKey: "cancel_indictment",
        emotionalText: "지금 이 순간, 5개 재판의 진실이 영원히 사라지려 하고 있다.",
        victimVoice: "4,895억 원... 800만 달러... 133억 원... 이 모든 진실이 사라진다고요? 제발... 제발 재판만은 남겨주세요.",
    },
    {
        id: "atk_generic",
        name: "정치 공세 지속",
        emoji: "⚔️",
        description: "여당의 일상적인 정치 공세와 여론전이 계속되고 있습니다",
        newsHeadline: "",
        cancelIncrease: 3,
        democracyDamage: 2,
        awarenessEffect: -1,
        minMonth: 1,
        maxMonth: 30,
        dialogueKey: "generic_attack",
        emotionalText: "조용한 날이 없다. 거짓 프레임은 매일같이 뉴스를 채운다.",
        victimVoice: "매일 뉴스를 보기가 무서워요. 언제 끝날까요?",
    }
];

// ===== 방어 행동 =====
export interface DefenseAction {
    id: string;
    name: string;
    emoji: string;
    description: string;
    energyCost: number;        // 에너지 소모
    cancelReduction: number;   // 공소취소 감소량
    awarenessGain: number;     // 국민인식 증가
    democracyGain: number;     // 민주주의 회복
    newsHeadline: string;
    cooldown?: number;         // 쿨다운 (턴)
}

export const DEFENSE_ACTIONS: DefenseAction[] = [
    {
        id: "investigative_report",
        name: "범죄 증거 추가 폭로",
        emoji: "📰",
        description: "탐사 기자에게 내부 자료를 제공하여 진실을 파헤친다",
        energyCost: 15,
        cancelReduction: 6,
        awarenessGain: 6,
        democracyGain: 1,
        newsHeadline: "탐사보도 \"특검법의 숨겨진 조항, 공소취소 장치였다\"",
    },
    {
        id: "citizen_petition",
        name: "신속 재판 촉구 시민 청원",
        emoji: "📢",
        description: "100만 시민 청원을 국회에 제출하여 압박한다",
        energyCost: 20,
        cancelReduction: 7,
        awarenessGain: 4,
        democracyGain: 2,
        newsHeadline: "\"법 앞에 평등하라\" 100만 시민 청원 국회 도달",
    },
    {
        id: "protest_rally",
        name: "사법 정의 실현 대규모 시위",
        emoji: "✊",
        description: "국회 앞에서 법치주의 수호 시위에 참여한다",
        energyCost: 25,
        cancelReduction: 10,
        awarenessGain: 5,
        democracyGain: 3,
        newsHeadline: "\"재판을 지켜라\" 국회 앞 시위 10만 명 운집",
    },
    {
        id: "constitutional_appeal",
        name: "방탄 특검법 위헌 소송",
        emoji: "⚖️",
        description: "헌법기관에 특검법 위헌 심판을 청구한다",
        energyCost: 30,
        cancelReduction: 13,
        awarenessGain: 3,
        democracyGain: 5,
        newsHeadline: "시민단체, 특검법 핵심 조항 위헌 심판 청구",
        cooldown: 3,
    },
    {
        id: "education_campaign",
        name: "재판 지연 실태 고발",
        emoji: "📚",
        description: "공소취소가 왜 위험한지 시민들에게 알린다",
        energyCost: 10,
        cancelReduction: 4,
        awarenessGain: 10,
        democracyGain: 2,
        newsHeadline: "\"공소취소의 진짜 의미\" 시민 교육 캠페인 전국 확산",
    },
    {
        id: "corruption_expose",
        name: "측근 비리 추가 고발",
        emoji: "🔍",
        description: "정치인의 추가 비위를 발굴하여 공소취소 명분을 약화시킨다",
        energyCost: 20,
        cancelReduction: 10,
        awarenessGain: 4,
        democracyGain: 1,
        newsHeadline: "새 비위 폭로 \"특검이 이것도 없앨 건가\" 여론 들끓어",
        cooldown: 2,
    },
    {
        id: "international_solidarity",
        name: "사법 방해 국제 사회 고발",
        emoji: "🌍",
        description: "해외 법조계와 인권단체에 한국 사법위기를 알린다",
        energyCost: 15,
        cancelReduction: 6,
        awarenessGain: 5,
        democracyGain: 4,
        newsHeadline: "국제법률가협회 \"한국 사법독립 훼손\" 긴급 성명",
        cooldown: 3,
    },
    {
        id: "legal_scholars",
        name: "법조계 엄벌 촉구 성명",
        emoji: "👨‍⚖️",
        description: "전국 법학 교수 수백 명의 공동 성명을 이끌어낸다",
        energyCost: 10,
        cancelReduction: 5,
        awarenessGain: 7,
        democracyGain: 3,
        newsHeadline: "법학 교수 300명 \"공소취소는 법치의 죽음\" 긴급 성명",
        cooldown: 4,
    },
    {
        id: "rest",
        name: "여론 결집",
        emoji: "😤",
        description: "대대적인 심판 촉구를 위해 여론의 에너지를 대폭 회복한다.",
        energyCost: 0,  // actually restores energy
        cancelReduction: 0,
        awarenessGain: 0,
        democracyGain: 0,
        newsHeadline: "",
    },
];

// ===== 엔딩 =====
export interface GameEnding {
    id: string;
    name: string;
    title: string;
    description: string;
    emoji: string;
    isVictory: boolean;
}

export const GAME_ENDINGS: GameEnding[] = [
    {
        id: "perfect_defense",
        name: "완벽한 수호",
        title: "\"시민이 법치주의를 지켰다\"",
        description: "당신의 끊임없는 저항 덕분에\n공소취소는 좌절되었습니다.\n\n재판은 계속됩니다.\n진실은 법정에서 밝혀질 것입니다.\n\n대한민국의 법치주의는 당신 같은 시민이 지킵니다.",
        emoji: "🏆",
        isVictory: true,
    },
    {
        id: "narrow_survival",
        name: "간신히 생존",
        title: "\"재판은 남았지만, 상처가 깊다\"",
        description: "30개월을 버텼습니다.\n재판은 살아남았지만...\n\n민주주의는 깊은 상처를 입었습니다.\n국민은 지쳤고, 법원은 위축되었습니다.\n\n그래도... 재판은 남았습니다.",
        emoji: "⚖️",
        isVictory: true,
    },
    {
        id: "cancel_success",
        name: "공소취소 성공",
        title: "\"재판이 사라졌습니다\"",
        description: "4,895억 원 개발비리의 진실은\n영원히 법정에서 확인되지 못합니다.\n\n800만 달러 대북송금의 진실은\n영원히 미궁 속에 갇힙니다.\n\n유죄도 무죄도 아닙니다.\n그냥... 재판이 없어진 것입니다.\n\n다음 권력도 배웠습니다.\n\"재판은 지울 수 있다.\"",
        emoji: "💀",
        isVictory: false,
    },
    {
        id: "exhausted",
        name: "시민 소진",
        title: "\"지쳐서 포기했습니다\"",
        description: "에너지가 바닥났습니다.\n더 이상 싸울 힘이 없습니다.\n\n정치 머신은 지치지 않습니다.\n하지만 시민은 지칩니다.\n\n그렇게 재판은 조용히 사라졌습니다.",
        emoji: "😞",
        isVictory: false,
    },
    {
        id: "awakening",
        name: "국민 각성",
        title: "\"깨어난 국민은 막을 수 없다\"",
        description: "당신의 교육과 연대 덕분에\n국민 인식이 임계점을 넘었습니다.\n\n이제 어떤 정치인도\n공소취소를 입에 올릴 수 없습니다.\n\n법치주의는 시민의 각성 위에 서 있습니다.",
        emoji: "🌅",
        isVictory: true,
    },
];

// ===== 재판 목록 (표시용) =====
export const TRIALS = [
    { id: 1, name: "공직선거법 위반", court: "서울고법 파기환송심", emoji: "🗳️" },
    { id: 2, name: "위증교사", court: "서울고법 항소심", emoji: "🤥" },
    { id: 3, name: "개발비리·성남FC 뇌물", court: "서울중앙지법 1심", emoji: "🏗️" },
    { id: 4, name: "쌍방울 대북송금", court: "수원지법 1심", emoji: "💸" },
    { id: 5, name: "법인카드 유용", court: "수원지법 1심", emoji: "💳" },
];

// ===== 랜덤 이벤트 =====
export interface RandomEvent {
    id: string;
    title: string;
    description: string;
    newsHeadline: string;
    cancelEffect: number;
    energyEffect: number;
    awarenessEffect: number;
    democracyEffect: number;
    minMonth: number;
    probability: number;
    isPositive: boolean;
}

export const RANDOM_EVENTS: RandomEvent[] = [
    {
        id: "whistleblower",
        title: "내부 고발자 등장!",
        description: "특검팀 내부에서 \"처음부터 공소취소가 목적이었다\"는 폭로가 나왔다",
        newsHeadline: "특검팀 前 수사관 \"공소취소 시나리오, 임명 전부터 짜여 있었다\" 폭로",
        cancelEffect: -8,
        energyEffect: 10,
        awarenessEffect: 10,
        democracyEffect: 3,
        minMonth: 10,
        probability: 0.12,
        isPositive: true,
    },
    {
        id: "victim_testimony",
        title: "피해자 눈물의 기자회견",
        description: "개발비리·성남FC 관련 피해자들이 \"우리의 정의는 어디로 갔나\" 호소했다",
        newsHeadline: "피해자 연대 \"4,895억 배임 진실, 영원히 묻히게 생겼다\" 눈물 호소",
        cancelEffect: -5,
        energyEffect: 15,
        awarenessEffect: 8,
        democracyEffect: 2,
        minMonth: 5,
        probability: 0.15,
        isPositive: true,
    },
    {
        id: "youth_movement",
        title: "대학생 연합 행동!",
        description: "전국 120개 대학 학생회가 \"법치주의를 지켜라\" 공동 선언에 나섰다",
        newsHeadline: "전국 120개 대학 \"우리가 배운 헌법은 이게 아니다\" 공동 선언",
        cancelEffect: -3,
        energyEffect: 20,
        awarenessEffect: 6,
        democracyEffect: 4,
        minMonth: 6,
        probability: 0.13,
        isPositive: true,
    },
    {
        id: "media_split",
        title: "언론 양극화 심화",
        description: "보수·진보 언론이 극단적으로 갈라져 진실이 묻히고 있다",
        newsHeadline: "\"조작기소\" vs \"사법농단\"... 같은 사건, 두 개의 대한민국",
        cancelEffect: 5,
        energyEffect: -10,
        awarenessEffect: -8,
        democracyEffect: -3,
        minMonth: 3,
        probability: 0.15,
        isPositive: false,
    },
    {
        id: "supporter_intimidation",
        title: "지지자들의 위협",
        description: "온라인에서 법치주의 수호 활동가들에 대한 신상 공개와 위협이 확산되고 있다",
        newsHeadline: "\"법치 수호\" 활동가들 신상 유출... 협박 메시지 수백 건",
        cancelEffect: 3,
        energyEffect: -20,
        awarenessEffect: -3,
        democracyEffect: -5,
        minMonth: 8,
        probability: 0.12,
        isPositive: false,
    },
    {
        id: "economy_crisis",
        title: "경제 위기 가중",
        description: "사법 혼란으로 외국인 투자 이탈, 국민들의 관심이 민생으로 분산된다",
        newsHeadline: "원·달러 환율 1500원 돌파, 법치 이슈 관심도 급락",
        cancelEffect: 4,
        energyEffect: -15,
        awarenessEffect: -10,
        democracyEffect: -2,
        minMonth: 12,
        probability: 0.1,
        isPositive: false,
    },
    {
        id: "ruling_party_revolt",
        title: "여당 내 이탈자!",
        description: "여당 소장파 의원 3명이 양심에 따라 반대표를 던졌다",
        newsHeadline: "여당 소장파 3인 \"양심에 따라 반대\" 깜짝 이탈표",
        cancelEffect: -6,
        energyEffect: 10,
        awarenessEffect: 5,
        democracyEffect: 5,
        minMonth: 15,
        probability: 0.09,
        isPositive: true,
    },
];
