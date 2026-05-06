// ===== 프롤로그 시나리오 — 게임 시작 전 30초 몰입 =====

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
            text: "대장동 4,895억 배임... 대북송금 800만 달러... 성남FC 133억 뇌물...",
            background: "courtroom",
        },
        {
            character: "judge",
            expression: "normal",
            text: "피고인, 법정에서 유무죄를 다투시겠습니까?",
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
            text: "당신은 이제 이 정치인의 편에서 플레이합니다.",
            background: "dark",
        },
        {
            character: "narrator",
            text: "60개월. 그 안에 모든 재판을 소멸시키세요.",
            effect: "flash",
        },
        {
            character: "narrator",
            text: "...그리고 그 대가를 목격하세요.",
        },
    ],
};
