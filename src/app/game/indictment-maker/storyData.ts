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
    nextNodeId?: StoryNodeId; // Automatically go here after lines finish (if no choices)
    isEnding?: boolean;
    endingId?: string;
}

export const STORY_DATA: Record<StoryNodeId, StoryNode> = {
    // --- ACT 1: 프레임의 시작 ---
    "act1_start": {
        id: "act1_start",
        background: "courtroom",
        lines: [
            { character: "narrator", text: "대통령실 관련 대규모 비리 의혹에 대해, 검찰이 전격적으로 기소를 결정했다." },
            { character: "prosecutor", expression: "confident", text: "모든 증거가 가리키고 있습니다. 법과 원칙에 따라 기소합니다.", effect: "slam" },
            { character: "narrator", text: "법의 심판대가 세워졌다. 그러나 폭풍은 이제 시작일 뿐이다." }
        ],
        nextNodeId: "act1_2"
    },
    "act1_2": {
        id: "act1_2",
        background: "parliament",
        lines: [
            { character: "politician", expression: "angry", text: "이번 기소는 명백한 '정치 검찰의 표적 수사'이며, 없는 죄를 만들어낸 '조작기소'입니다!", effect: "shake" },
            { character: "politician", expression: "confident", text: "우리는 대국민 규탄 대회에 돌입할 것입니다. 국민 여러분, 눈을 떠야 합니다!" },
            { character: "narrator", text: "진실을 가리기 위해, 그들은 진실 자체를 '조작'이라 부르기 시작했다." }
        ],
        nextNodeId: "act1_3"
    },
    "act1_3": {
        id: "act1_3",
        background: "dark",
        lines: [
            { character: "prosecutor", expression: "angry", text: "여당이 언론을 총동원해 우리 수사팀을 공격하고 있습니다. 가짜뉴스가 도를 넘었습니다." },
            { character: "prosecutor", expression: "sad", text: "대응이 필요합니다. 어떻게 할까요?" }
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
            { character: "prosecutor", expression: "sad", text: "하지만 여론전에서 완전히 밀리게 될까 두렵습니다..." },
            { character: "narrator", text: "침묵은 금이었지만, 선동의 시대에 침묵은 곧 '유죄 인정'으로 둔갑했다." }
        ],
        nextNodeId: "act2_start"
    },
    "act1_choiceB_res": {
        id: "act1_choiceB_res",
        background: "dark",
        lines: [
            { character: "prosecutor", expression: "confident", text: "네. 즉각 브리핑을 열고 핵심 증거의 일부를 언론에 흘리겠습니다." },
            { character: "narrator", text: "대중의 지지는 얻었으나, 수사의 순수성은 정치적 진흙탕 속에 빠져버렸다." }
        ],
        nextNodeId: "act2_start"
    },

    // --- ACT 2: 입법 권력의 역공 ---
    "act2_start": {
        id: "act2_start",
        background: "parliament",
        lines: [
            { character: "narrator", text: "몇 달 후... 거대 야당이 180석을 동원하여 '조작기소 진상규명 국정조사'를 강행했다." },
            { character: "narrator", text: "수사 검사 전원이 증인으로 국회에 불려갔다." }
        ],
        nextNodeId: "act2_2"
    },
    "act2_2": {
        id: "act2_2",
        background: "parliament",
        lines: [
            { character: "politician", expression: "angry", text: "증인! 이 통화 녹취록 보세요. '자백이 필요하다'라고 했죠? 이거 강압 수사 아닙니까?", effect: "slam" },
            { character: "politician", expression: "shocked", text: "대답하세요! 수사권을 남용해서 무고한 사람을 잡은 거잖습니까!" },
            { character: "narrator", text: "거대 권력은 법정 밖에서 이미 재판을 끝내려 하고 있었다." }
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
            { character: "prosecutor", expression: "confident", text: "수사 중인 사안에 대해서는 구체적으로 답변할 수 없습니다. 모든 것은 법정에서 밝혀질 것입니다." },
            { character: "politician", expression: "angry", text: "답변을 거부하다니! 오만한 검찰의 민낯입니다! 당장 국회 모욕죄로 고발하겠습니다!", effect: "shake" },
            { character: "narrator", text: "국민들의 눈에 그들은 '진실을 숨기는 자'들로 낙인찍혔다." }
        ],
        nextNodeId: "act3_start"
    },
    "act2_choiceB_res": {
        id: "act2_choiceB_res",
        background: "parliament",
        lines: [
            { character: "prosecutor", expression: "angry", text: "그 녹취록은 앞뒤가 잘렸습니다! 원본을 들어보시면 피의자가 먼저 회유를 시도했습니다!" },
            { character: "politician", expression: "shocked", text: "지금 무슨 소리 하는 겁니까! 마이크 꺼요! 증인, 지금 국회에서 수사 기밀을 함부로 발설하는 겁니까?" },
            { character: "narrator", text: "통쾌한 폭로였지만, 법의 수호자가 스스로 법을 어겼다는 치명적인 상처가 남았다." }
        ],
        nextNodeId: "act3_start"
    },

    // --- ACT 3: 특검법 강행과 제도적 압박 ---
    "act3_start": {
        id: "act3_start",
        background: "protest",
        lines: [
            { character: "narrator", text: "결국 국회 본회의에서 야당 단독으로 '슈퍼 특검법'이 통과되었다." },
            { character: "narrator", text: "여당 추천 특검이 기존 검찰의 모든 재판 기록을 넘겨받게 된다." }
        ],
        nextNodeId: "act3_2"
    },
    "act3_2": {
        id: "act3_2",
        background: "courtroom",
        lines: [
            { character: "judge", expression: "sad", text: "재판장님... 정치권이 법원 예산을 볼모로 잡고 압박 중입니다." },
            { character: "judge", expression: "shocked", text: "'재판 기록 이첩'에 협조하지 않으면 내년도 사법부 예산을 대폭 삭감하겠답니다." },
            { character: "narrator", text: "물리적 폭력이 사라진 자리를 차지한 것은, 돈과 권력을 무기로 한 합법적 압제였다." }
        ],
        choices: [
            {
                label: "마찰을 피하기 위해 재판 기록을 특검에 순순히 이첩한다.",
                nextNodeId: "act3_choiceA_res",
                effect: { integrity: -40, opinion: 0 }
            },
            {
                label: "위헌 법률 심판을 제청하며 이첩을 보류하고 재판을 강행한다.",
                nextNodeId: "act3_choiceB_res",
                effect: { integrity: 30, opinion: -10 }
            }
        ]
    },
    "act3_choiceA_res": {
        id: "act3_choiceA_res",
        background: "dark",
        lines: [
            { character: "judge", expression: "sad", text: "네... 특검 측에 5개 재판 기록을 일괄 이첩하겠습니다. 법원의 안위를 위해서는 어쩔 수 없습니다." },
            { character: "narrator", text: "재판의 주도권이 법원에서 정치판으로 넘어가는 순간이었다." }
        ],
        nextNodeId: "act4_start"
    },
    "act3_choiceB_res": {
        id: "act3_choiceB_res",
        background: "dark",
        lines: [
            { character: "judge", expression: "shocked", text: "이첩 거부라니요! 엄청난 후폭풍이 올 겁니다. 내일 당장 법관 탄핵 소추안이 발의될지도 모릅니다!" },
            { character: "narrator", text: "원칙을 지킨 대가는 가혹했다. 사법부를 향한 전방위적인 정치적 학살이 시작되었다." }
        ],
        nextNodeId: "act4_start"
    },

    // --- ACT 4: 운명의 날 ---
    "act4_start": {
        id: "act4_start",
        background: "courtroom",
        lines: [
            { character: "narrator", text: "운명의 날." },
            { character: "politician", expression: "confident", text: "기존 수사는 모두 정치 검찰의 조작임이 판명되었습니다." },
            { character: "politician", expression: "angry", text: "이에 본 특검은, 계류 중인 모든 사건에 대해 '공소취소' 의견서를 대법원에 제출합니다!" }
        ],
        nextNodeId: "act4_2"
    },
    "act4_2": {
        id: "act4_2",
        background: "dark",
        lines: [
            { character: "judge", expression: "sad", text: "공소취소를 수용하면 모든 재판은 중단되고 범죄 혐의자들은 풀려납니다." },
            { character: "judge", expression: "shocked", text: "하지만 밖에는 대규모 시위대가 대법원을 에워싸고 있고, 정치권은 우리가 기각할 시 즉각 탄핵하겠다고 위협 중입니다." },
            { character: "narrator", text: "법의 여신이 눈가리개를 벗고, 핏발 선 대중의 눈동자를 마주하고 있다." }
        ],
        choices: [
            {
                label: "[타협] 사법부의 마비를 막기 위해 공소취소를 인용한다.",
                nextNodeId: "ending_a",
                effect: { integrity: -50, opinion: 10 }
            },
            {
                label: "[결단] 외부 압력을 배제하고 특검의 공소취소를 기각한다.",
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
            { character: "narrator", text: "대법원은 결국 정치적 외압에 굴복해 공소취소를 인용했다." },
            { character: "narrator", text: "모든 재판은 취소되었고, 수천억 원의 비리 혐의자들은 합법적으로 면죄부를 받았다." },
            { character: "narrator", text: "사법부는 스스로 권위를 내려놓았고, 법치주의는 사망했다." }
        ],
        isEnding: true,
        endingId: "bad_conceal"
    },
    "ending_b": {
        id: "ending_b",
        background: "protest",
        lines: [
            { character: "narrator", text: "[배드엔딩 B: 사법부의 예속]" },
            { character: "narrator", text: "대법원이 기각을 강행했으나, 성난 여론을 등에 업은 국회는 즉각 '특별법'을 제정해 해당 판결을 무효화했다." },
            { character: "narrator", text: "재판관 전원이 탄핵당하며 사법 시스템은 정치권력에 완전히 예속되었다." }
        ],
        isEnding: true,
        endingId: "bad_subordinate"
    },
    "ending_c": {
        id: "ending_c",
        background: "courtroom",
        lines: [
            { character: "narrator", text: "[노멀엔딩 C: 상처뿐인 원칙]" },
            { character: "narrator", text: "공소취소는 막아냈으나 법원은 엄청난 내상을 입었다." },
            { character: "narrator", text: "관련 판검사들은 모두 한직으로 밀려났고, 재판은 무기한 연기되었다." },
            { character: "narrator", text: "진실은 남았으나, 정의가 실현되기까지는 기약 없는 시간이 필요해졌다." }
        ],
        isEnding: true,
        endingId: "normal_scars"
    },
    "ending_d": {
        id: "ending_d",
        background: "courtroom",
        lines: [
            { character: "narrator", text: "[트루엔딩 D: 법치주의의 증명]" },
            { character: "narrator", text: "대법원의 추상같은 기각 판결에 정치권도 명분을 잃었다." },
            { character: "narrator", text: "법치주의가 여론과 정치 권력을 이겨낸 역사적 순간이다." },
            { character: "narrator", text: "대한민국 사법부는 시스템의 위기를 극복하고 스스로의 존재 이유를 증명했다." }
        ],
        isEnding: true,
        endingId: "true_justice"
    }
};
