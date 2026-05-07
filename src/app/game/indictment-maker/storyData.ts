import { CharacterId, Expression, Background, ScreenEffect, DialogueLine } from "./dialogueData";

export type StoryNodeId = string;

export interface StoryChoice {
    label: string;
    nextNodeId: StoryNodeId;
    effect?: {
        integrity?: number;
        opinion?: number;
    };
    requiredIntegrity?: number;
}

export interface StoryNode {
    id: StoryNodeId;
    background: Background;
    lines: DialogueLine[];
    choices?: StoryChoice[];
    nextNodeId?: StoryNodeId;
    isEnding?: boolean;
    endingId?: string;
}

export const STORY_DATA: Record<StoryNodeId, StoryNode> = {
    // --- PROLOGUE: 크리에이터 소개 및 경고문 ---
    "prologue": {
        id: "prologue",
        background: "dark",
        lines: [
            { character: "narrator", text: "※ 본 게임은 가상의 픽션이며, 현실에서 '진짜' 일어날 법한 일들을 바탕으로 제작되었습니다." },
            { character: "creator" as any, text: "안녕하세요! 오른스푼 크리에이터 @drumtong119 입니다." },
            { character: "creator" as any, text: "최근 대한민국 사법 시스템이 직면한 전례 없는 정치적 외압과 딜레마를 시뮬레이션하기 위해 기획했습니다." },
            { character: "creator" as any, text: "당신의 선택 하나하나가 법치주의의 운명을 결정합니다. 부디, 진실을 지켜내 주십시오." }
        ],
        nextNodeId: "act1_start"
    },

    // --- ACT 1: 프레임의 시작 (발단) ---
    "act1_start": {
        id: "act1_start",
        background: "courtroom",
        lines: [
            { character: "narrator", text: "1년 전, 대규모 횡령 및 배임 비리 의혹에 대한 강도 높은 수사가 시작되었다." },
            { character: "prosecutor", expression: "normal", text: "수만 페이지의 계좌 추적 내역, 그리고 핵심 관계자들의 일관된 진술 확보했습니다." },
            { character: "prosecutor", expression: "confident", text: "모든 증거가 단 한 사람, '그분'을 가리키고 있습니다. 법과 원칙에 따라 기소하겠습니다.", effect: "slam" },
            { character: "narrator", text: "법의 심판대가 세워졌다. 그러나 폭풍은 이제 시작일 뿐이다." }
        ],
        nextNodeId: "act1_2"
    },
    "act1_2": {
        id: "act1_2",
        background: "parliament",
        lines: [
            { character: "politician", expression: "angry", text: "이번 기소는 명백한 야당 탄압이자, '정치 검찰의 표적 수사'입니다!", effect: "shake" },
            { character: "politician", expression: "confident", text: "없는 죄를 만들어낸 '조작기소'에 맞서, 우리는 대국민 규탄 대회에 돌입할 것입니다!" },
            { character: "citizen", expression: "normal", text: "그래! 이건 명백한 조작이다! 특검을 도입하라!" },
            { character: "narrator", text: "거대 정당과 강성 지지층이 움직이기 시작했다." },
            { character: "narrator", text: "진실을 가리기 위해, 그들은 진실 자체를 '조작'이라 부르기 시작했다." }
        ],
        nextNodeId: "act1_3"
    },
    "act1_3": {
        id: "act1_3",
        background: "dark",
        lines: [
            { character: "prosecutor", expression: "angry", text: "여당이 유튜브와 언론을 총동원해 우리 수사팀의 신상을 털고 공격하고 있습니다." },
            { character: "prosecutor", expression: "sad", text: "심지어 수사관들의 가족까지 괴롭힘을 당하고 있습니다. 대응이 필요합니다." }
        ],
        choices: [
            {
                label: "침묵하며 법정에서 증거로만 말한다.",
                nextNodeId: "act1_choiceA_res",
                effect: { integrity: 20, opinion: -20 }
            },
            {
                label: "여론에 맞서 수사 기밀의 일부를 언론에 흘린다.",
                nextNodeId: "act1_choiceB_res",
                effect: { integrity: -20, opinion: 20 }
            }
        ]
    },
    "act1_choiceA_res": {
        id: "act1_choiceA_res",
        background: "dark",
        lines: [
            { character: "prosecutor", expression: "normal", text: "알겠습니다. 원칙대로 무대응 원칙을 고수하겠습니다." },
            { character: "prosecutor", expression: "sad", text: "하지만 저들의 스피커가 너무 큽니다. 여론전에서 완전히 밀리게 될까 두렵습니다..." },
            { character: "narrator", text: "침묵은 금이었지만, 선동의 시대에 침묵은 곧 '유죄 인정'으로 둔갑했다." }
        ],
        nextNodeId: "act2_start"
    },
    "act1_choiceB_res": {
        id: "act1_choiceB_res",
        background: "dark",
        lines: [
            { character: "prosecutor", expression: "confident", text: "네. 즉각 익명 브리핑을 열고 핵심 증거의 일부를 언론에 흘리겠습니다." },
            { character: "narrator", text: "검찰 발 단독 기사가 쏟아지며 대중의 지지는 일부 회복했다." },
            { character: "narrator", text: "그러나 수사의 순수성은 정치적 진흙탕 속에 빠져버렸다." }
        ],
        nextNodeId: "act2_start"
    },

    // --- ACT 2: 입법 권력의 역공 (전개) ---
    "act2_start": {
        id: "act2_start",
        background: "protest",
        lines: [
            { character: "narrator", text: "몇 달 후... 사태는 더욱 걷잡을 수 없이 커졌다." },
            { character: "citizen", expression: "angry", text: "조작 검사 물러가라! 국회는 국정조사를 실시하라!", effect: "shake" },
            { character: "narrator", text: "거대 야당은 180석을 동원하여 '조작기소 진상규명 국정조사'를 강행했다." },
            { character: "narrator", text: "수사 검사 전원이 피의자 신분이나 다름없이 국회 증인석에 불려갔다." }
        ],
        nextNodeId: "act2_2"
    },
    "act2_2": {
        id: "act2_2",
        background: "parliament",
        lines: [
            { character: "politician", expression: "angry", text: "증인! 이 통화 녹취록 보세요. '자백이 필요하다'라고 윽박질렀죠? 이거 강압 수사 아닙니까?", effect: "slam" },
            { character: "politician", expression: "shocked", text: "당장 대답하세요! 없는 죄를 만들기 위해 무고한 사람을 협박한 거잖습니까!" },
            { character: "narrator", text: "의원들은 앞뒤가 잘린 녹취록을 생중계 카메라 앞에서 흔들어댔다." },
            { character: "narrator", text: "거대 권력은 법정 밖에서 이미 여론 재판을 끝내려 하고 있었다." }
        ],
        choices: [
            {
                label: "답변을 거부하고 수사의 정당성만 원론적으로 주장한다.",
                nextNodeId: "act2_choiceA_res",
                effect: { integrity: 15, opinion: -25 }
            },
            {
                label: "비밀 유지 의무를 깨고 녹취록의 전후 맥락을 모두 폭로한다.",
                nextNodeId: "act2_choiceB_res",
                effect: { integrity: -25, opinion: 15 }
            }
        ]
    },
    "act2_choiceA_res": {
        id: "act2_choiceA_res",
        background: "parliament",
        lines: [
            { character: "prosecutor", expression: "confident", text: "진행 중인 재판 사안에 대해서는 구체적으로 답변할 수 없습니다. 모든 것은 법정에서 밝혀질 것입니다." },
            { character: "politician", expression: "angry", text: "답변을 거부하다니! 진실이 두려운 겁니까? 당장 국회 모욕죄로 고발하겠습니다!", effect: "shake" },
            { character: "narrator", text: "생중계를 보던 국민들의 눈에 그들은 '진실을 숨기는 악당'으로 낙인찍혔다." }
        ],
        nextNodeId: "act3_start"
    },
    "act2_choiceB_res": {
        id: "act2_choiceB_res",
        background: "parliament",
        lines: [
            { character: "prosecutor", expression: "angry", text: "그 녹취록은 악의적으로 편집되었습니다! 원본을 들어보시면 피의자가 먼저 회유를 시도했습니다!" },
            { character: "politician", expression: "shocked", text: "지금 무슨 소리 하는 겁니까! 마이크 끄세요! 증인, 지금 국회에서 수사 기밀을 함부로 발설하는 겁니까?" },
            { character: "narrator", text: "생중계에서의 통쾌한 폭로로 여론은 반전되었다." },
            { character: "narrator", text: "하지만 법의 수호자가 스스로 법을 어겼다는 치명적인 상처가 남았다." }
        ],
        nextNodeId: "act3_start"
    },

    // --- ACT 3: 특검법 강행과 제도적 압박 (위기) ---
    "act3_start": {
        id: "act3_start",
        background: "protest",
        lines: [
            { character: "narrator", text: "국정조사 이후, 야당은 더 노골적인 수를 던졌다." },
            { character: "politician", expression: "confident", text: "검찰은 이미 신뢰를 잃었습니다. 이제 특검만이 답입니다!" },
            { character: "narrator", text: "국회 본회의에서 야당 단독으로 무소불위의 권한을 가진 '슈퍼 특검법'이 통과되었다." },
            { character: "narrator", text: "이 특검의 목적은 단 하나, 기존 재판 기록을 모두 빼앗아 재판을 중단시키는 것이었다." }
        ],
        nextNodeId: "act3_2"
    },
    "act3_2": {
        id: "act3_2",
        background: "courtroom",
        lines: [
            { character: "judge", expression: "sad", text: "재판장님... 상황이 심상치 않습니다. 정치권이 법원 예산을 볼모로 잡았습니다." },
            { character: "judge", expression: "shocked", text: "'재판 기록 이첩'에 협조하지 않으면 내년도 사법부 예산을 50% 이상 삭감하겠답니다." },
            { character: "narrator", text: "사법부의 목줄을 쥐고 흔드는 끔찍한 협박." },
            { character: "narrator", text: "물리적 폭력이 사라진 자리를 차지한 것은, 돈과 권력을 무기로 한 합법적 형태의 압제였다." }
        ],
        choices: [
            {
                label: "사법부의 마비를 피하기 위해 기록을 특검에 순순히 넘긴다.",
                nextNodeId: "act3_choiceA_res",
                effect: { integrity: -40, opinion: 0 }
            },
            {
                label: "특검법의 위헌 소지를 지적하며 이첩을 거부하고 버틴다.",
                nextNodeId: "act3_choiceB_res",
                effect: { integrity: 30, opinion: -10 }
            }
        ]
    },
    "act3_choiceA_res": {
        id: "act3_choiceA_res",
        background: "dark",
        lines: [
            { character: "judge", expression: "sad", text: "네... 특검 측에 수만 장의 재판 기록을 일괄 이첩하겠습니다." },
            { character: "narrator", text: "재판의 주도권이 법원에서 완전히 정치판으로 넘어가는 순간이었다." },
            { character: "narrator", text: "가까스로 버텨오던 사법부의 둑이 무너지기 시작했다." }
        ],
        nextNodeId: "act4_start"
    },
    "act3_choiceB_res": {
        id: "act3_choiceB_res",
        background: "dark",
        lines: [
            { character: "judge", expression: "shocked", text: "이첩 거부라니요! 엄청난 후폭풍이 올 겁니다." },
            { character: "judge", expression: "sad", text: "당장 내일 야당 주도로 담당 법관들에 대한 탄핵 소추안이 발의될 겁니다!" },
            { character: "narrator", text: "원칙을 지킨 대가는 가혹했다. 사법부를 향한 전방위적인 '정치적 학살'이 시작되었다." }
        ],
        nextNodeId: "act4_start"
    },

    // --- ACT 4: 운명의 날 (절정) ---
    "act4_start": {
        id: "act4_start",
        background: "protest",
        lines: [
            { character: "narrator", text: "그리고 1년 뒤, 대법원 선고일. 운명의 날이 밝았다." },
            { character: "politician", expression: "confident", text: "기존 수사는 모두 정치 검찰의 조작임이 특검 조사를 통해 명백히 판명되었습니다!" },
            { character: "politician", expression: "angry", text: "이에 본 특검은, 대법원에 계류 중인 해당 사건에 대해 '공소취소' 의견서를 최종 제출합니다!" },
            { character: "narrator", text: "특검이 스스로 범죄자들의 죄를 덮어주기 위해 공소취소를 요청한 초유의 사태." }
        ],
        nextNodeId: "act4_2"
    },
    "act4_2": {
        id: "act4_2",
        background: "courtroom",
        lines: [
            { character: "judge", expression: "sad", text: "재판장님. 공소취소를 수용하면 모든 재판은 중단되고, 그들은 영원히 면죄부를 받게 됩니다." },
            { character: "judge", expression: "shocked", text: "하지만 창밖을 보십시오. 대법원 주변을 포위한 수십만 명의 시위대가 우리의 결정을 지켜보고 있습니다." },
            { character: "judge", expression: "angry", text: "만약 기각한다면, 국회는 즉각 특별법을 제정해 우리 대법관 전원을 탄핵하겠다고 통보해왔습니다." },
            { character: "narrator", text: "법의 여신이 낡은 안대를 벗고, 핏발 선 대중의 눈동자와 마주하고 있다." },
            { character: "narrator", text: "이제 마지막 판결봉을 두드릴 시간이다." }
        ],
        choices: [
            {
                label: "[타협] 사법부의 붕괴를 막기 위해 특검의 공소취소를 인용한다.",
                nextNodeId: "ending_a",
                effect: { integrity: -50, opinion: 10 }
            },
            {
                label: "[결단] 부당한 정치적 외압을 배제하고 공소취소를 기각한다.",
                nextNodeId: "check_ending",
                requiredIntegrity: 0 // Will check dynamically in engine
            }
        ]
    },

    // --- 멀티 엔딩 ---
    "ending_a": {
        id: "ending_a",
        background: "dark",
        lines: [
            { character: "narrator", text: "[배드엔딩 A: 진실의 은폐]" },
            { character: "narrator", text: "대법원은 결국 거대한 정치적 외압과 군중의 분노 앞에 굴복하여 공소취소를 인용했다." },
            { character: "narrator", text: "모든 재판은 취소되었고, 수천억 원의 비리 혐의자들은 합법적으로 면죄부를 받았다." },
            { character: "narrator", text: "승리에 도취된 군중의 환호 소리가 법원 문을 넘어 울려 퍼졌다." },
            { character: "narrator", text: "그날, 사법부는 스스로 권위를 내려놓았고 대한민국 법치주의는 사망했다." }
        ],
        isEnding: true,
        endingId: "bad_conceal"
    },
    "ending_b": {
        id: "ending_b",
        background: "protest",
        lines: [
            { character: "narrator", text: "[배드엔딩 B: 사법부의 예속]" },
            { character: "narrator", text: "대법원이 용기 있게 기각을 강행했으나, 이미 성난 여론을 등에 업은 국회를 막을 수는 없었다." },
            { character: "narrator", text: "국회는 다음 날 즉각 '특별법'을 제정해 대법원의 해당 판결을 무효화시켰다." },
            { character: "narrator", text: "명판결을 내린 재판관 전원이 헌정 사상 최초로 동시 탄핵당했다." },
            { character: "narrator", text: "사법 시스템은 정치권력의 완벽한 하수인으로 전락하고 말았다." }
        ],
        isEnding: true,
        endingId: "bad_subordinate"
    },
    "ending_c": {
        id: "ending_c",
        background: "courtroom",
        lines: [
            { character: "narrator", text: "[노멀엔딩 C: 상처뿐인 원칙]" },
            { character: "narrator", text: "대법원은 특검의 공소취소 요청을 간신히 막아냈다." },
            { character: "narrator", text: "하지만 법원은 엄청난 내상을 입었다. 보복성 인사 조치로 관련 판검사들은 모두 한직으로 밀려났다." },
            { character: "narrator", text: "사건의 핵심 재판은 무기한 연기되었고, 여론은 여전히 반으로 갈려 싸우고 있다." },
            { character: "narrator", text: "진실의 불씨는 남았으나, 정의가 완전히 실현되기까지는 기약 없는 인고의 시간이 필요해졌다." }
        ],
        isEnding: true,
        endingId: "normal_scars"
    },
    "ending_d": {
        id: "ending_d",
        background: "courtroom",
        lines: [
            { character: "narrator", text: "[트루엔딩 D: 법치주의의 증명]" },
            { character: "narrator", text: "대법원의 추상같은 기각 판결이 내려지자, 숨죽이던 침묵의 다수가 지지를 보내기 시작했다." },
            { character: "narrator", text: "특검의 위헌성이 만천하에 드러나며 맹렬했던 정치권의 폭주도 명분을 잃고 멈춰 섰다." },
            { character: "narrator", text: "법치주의가 여론의 쏠림과 거대 정치 권력을 이겨낸 역사적 순간." },
            { character: "narrator", text: "대한민국 사법부는 절체절명의 위기를 극복하고 스스로의 존재 이유를 완벽하게 증명했다." }
        ],
        isEnding: true,
        endingId: "true_justice"
    }
};
