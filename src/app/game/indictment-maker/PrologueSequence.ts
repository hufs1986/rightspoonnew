import type { DialogueSequence } from "./dialogueData";

export const PROLOGUE_SEQUENCE: DialogueSequence = {
    background: "dark",
    lines: [
        {
            character: "narrator",
            text: "대한민국, 20XX년.",
        },
        {
            character: "narrator",
            text: "한 정치인에게 5건의 형사재판이 진행 중이다.",
            effect: "slam",
        },
        {
            character: "narrator",
            text: "개발비리 4,895억 배임... 대북송금 800만 달러... 성남FC 133억 뇌물...",
            background: "courtroom",
        },
        {
            character: "politician",
            expression: "confident",
            text: "재판을요? ...아뇨. 재판을 없애겠습니다.",
            effect: "shake",
            background: "parliament",
        },
        {
            character: "narrator",
            text: "국정조사, 특검법, 공소유지권 장악...\n30개월 안에 모든 재판을 소멸시키려 합니다.",
        },
        {
            character: "narrator",
            text: "당신은 이것을 막아야 하는 시민입니다.",
            effect: "flash",
            background: "dark",
        },
        {
            character: "narrator",
            text: "에너지는 한정되어 있고,\n정치 머신은 멈추지 않습니다.",
        },
        {
            character: "narrator",
            text: "30개월. 재판을 지켜내세요.\n...거의 아무도 못 합니다.",
            effect: "slam",
        },
    ],
};
