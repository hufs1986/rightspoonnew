// ===== 역전재판 스타일 대사 시퀀스 데이터 =====

export type CharacterId = "prosecutor" | "politician" | "judge" | "citizen" | "narrator";
export type Expression = "normal" | "angry" | "shocked" | "confident" | "sad";
export type Background = "courtroom" | "parliament" | "protest" | "dark";
export type ScreenEffect = "shake" | "flash" | "slam" | "none";

export interface DialogueLine {
    character: CharacterId;
    expression?: Expression;
    text: string;
    effect?: ScreenEffect;
    background?: Background;
}

export interface DialogueSequence {
    background: Background;
    lines: DialogueLine[];
}

export const CHARACTER_META: Record<CharacterId, { name: string; image: string; position: "left" | "right" | "center" }> = {
    prosecutor: { name: "검사", image: "/game/prosecutor.png", position: "left" },
    politician: { name: "정치인", image: "/game/politician.png", position: "right" },
    judge: { name: "재판장", image: "/game/judge.png", position: "center" },
    citizen: { name: "시민", image: "/game/citizen.png", position: "left" },
    narrator: { name: "", image: "", position: "center" },
};

export const BG_IMAGES: Record<Background, string> = {
    courtroom: "/game/bg-courtroom.png",
    parliament: "/game/bg-parliament.png",
    protest: "/game/bg-protest.png",
    dark: "",
};

// 행동별 대사 시퀀스
export const ACTION_DIALOGUES: Record<string, DialogueSequence> = {
    frame_media_1: {
        background: "parliament",
        lines: [
            { character: "politician", expression: "confident", text: "이 기소는 정치적 조작이다! 국민 여러분, 눈을 떠야 합니다!" },
            { character: "prosecutor", expression: "angry", text: "증거를 법정에서 다투지 않고 여론전으로 가겠다는 건가!", effect: "shake" },
            { character: "citizen", expression: "normal", text: "나도 억울하게 기소된 적 있는데... 나는 법정에서 싸워야 했잖아요." },
            { character: "narrator", text: "📺 '정치검찰 조작기소' 프레임이 대중에게 확산되기 시작했다." },
        ],
    },
    frame_media_2: {
        background: "parliament",
        lines: [
            { character: "politician", expression: "angry", text: "특검을 거부하는 자가 범인이다! 진실을 은폐하려는 검찰을 규탄한다!" },
            { character: "prosecutor", expression: "angry", text: "법과 절차에 따른 정당한 수사마저 음모론으로 매도하고 있습니다!" },
            { character: "citizen", expression: "normal", text: "맨날 음모론이래... 진짜 잘못한 거 없는 거 맞아요?" },
            { character: "narrator", text: "📺 기소의 본질은 흐려지고, 여론전만이 남았다." },
        ],
    },
    rally_supporters_1: {
        background: "protest",
        lines: [
            { character: "politician", expression: "confident", text: "부당한 기소에 맞서 함께 싸워주십시오!" },
            { character: "citizen", expression: "angry", text: "수만 명이 '무죄'를 외치면 판사가 부담을 안 느낄까요? 이게 공정한 재판인가요?" },
            { character: "narrator", text: "✊ 지지자 수만 명이 결집했지만, 사법부에 대한 압박이 거세지고 있다." },
        ],
    },
    rally_supporters_2: {
        background: "protest",
        lines: [
            { character: "politician", expression: "confident", text: "우리가 촛불을 들어야 민주주의가 지켜집니다! 광장으로 모이십시오!" },
            { character: "citizen", expression: "sad", text: "재판받기 싫어서 사람들 동원하는 거 너무 속 보이는 거 아니에요?" },
            { character: "narrator", text: "✊ 장외 집회가 계속되며 정치적 양극화가 극에 달하고 있다." },
        ],
    },
    discredit_prosecutors_1: {
        background: "courtroom",
        lines: [
            { character: "politician", expression: "confident", text: "이 검사의 과거를 보십시오! 이런 자가 수사한 결과를 어떻게 믿습니까!" },
            { character: "prosecutor", expression: "shocked", text: "검사 개인의 하자로 사건 전체의 증거를 부정하는 것은 논리적 비약입니다!" },
            { character: "citizen", text: "검사가 나빴으면 다른 검사가 수사하면 되잖아요. 왜 재판을 없애려 하죠?" },
        ],
    },
    discredit_prosecutors_2: {
        background: "courtroom",
        lines: [
            { character: "politician", expression: "confident", text: "검찰청에서 연어회와 소주 파티를 열어 증인을 회유했다는 제보가 있습니다!" },
            { character: "prosecutor", expression: "angry", text: "명백한 가짜뉴스입니다! 출입 기록과 영수증까지 모두 공개하지 않았습니까!", effect: "shake" },
            { character: "citizen", expression: "normal", text: "글쎄요... 검찰청에서 파티를 한다는 게 상식적으로 말이 되나요?" },
        ],
    },
    launch_investigation_1: {
        background: "parliament",
        lines: [
            { character: "narrator", text: "🏛️ 국회 국조특위가 출범한다. 42일간의 집중 조사가 시작된다.", effect: "slam" },
            { character: "politician", expression: "confident", text: "조작기소의 진상을 반드시 밝혀내겠습니다!" },
            { character: "prosecutor", expression: "angry", text: "법원에 계류 중인 형사사건을 국회가 조사한다고? 이건 사법권 침해다!", effect: "shake" },
            { character: "judge", expression: "normal", text: "헌법 제61조가 국정조사권을 보장하지만... 사법부 독립이 위협받고 있습니다." },
        ],
    },
    launch_investigation_2: {
        background: "parliament",
        lines: [
            { character: "politician", expression: "confident", text: "국민의 알 권리를 위해 검찰의 무소불위 권력을 철저히 조사해야 합니다!" },
            { character: "prosecutor", expression: "shocked", text: "재판 중인 사건을 국회에서 조사하는 것은 명백한 헌법 위반입니다!" },
            { character: "judge", expression: "sad", text: "이대로라면 사법부의 고유 권한이 심각하게 침해받게 됩니다." },
        ],
    },
    summon_witnesses_1: {
        background: "parliament",
        lines: [
            { character: "narrator", text: "📜 검사, 수사관, 참고인 등 219명에게 소환장이 발부된다.", effect: "slam" },
            { character: "prosecutor", expression: "shocked", text: "219명?! 수사에 참여한 거의 모든 인원을 소환하겠다는 건가!", effect: "shake" },
            { character: "citizen", text: "앞으로 검사들이 힘 있는 사람을 수사하면 국회에 끌려가는 거예요?" },
        ],
    },
    summon_witnesses_2: {
        background: "parliament",
        lines: [
            { character: "narrator", text: "📜 주말과 밤낮을 가리지 않는 증인 소환 통보가 이어진다." },
            { character: "prosecutor", expression: "angry", text: "이건 조사가 아니라 망신 주기와 수사 방해를 위한 괴롭힘입니다!" },
            { character: "citizen", expression: "sad", text: "수사관들 일도 못하게 국회로 부르면 진짜 범죄자들은 누가 잡아요?" },
        ],
    },
    play_recording_1: {
        background: "parliament",
        lines: [
            { character: "politician", expression: "confident", text: "이 녹취록을 들어보십시오! '자백이 필요하다'... 검사의 육성입니다!", effect: "slam" },
            { character: "prosecutor", expression: "angry", text: "수사 과정의 하자와 범죄 혐의의 실체는 별개의 문제입니다!" },
            { character: "citizen", text: "검사가 잘못했으면 검사를 처벌하면 되죠. 왜 피고인의 재판까지 없애버리나요?" },
        ],
    },
    play_recording_2: {
        background: "parliament",
        lines: [
            { character: "politician", expression: "angry", text: "충격적인 녹음 파일입니다! 검찰이 허위 진술을 강요한 스모킹 건입니다!" },
            { character: "prosecutor", expression: "shocked", text: "전체 맥락을 자르고 교묘하게 짜깁기한 악의적 편집본입니다!" },
            { character: "citizen", expression: "sad", text: "아니, 앞뒤 내용 다 자르고 저렇게 틀면 나라도 범죄자 되겠다..." },
        ],
    },
    adopt_report_1: {
        background: "parliament",
        lines: [
            { character: "narrator", text: "📑 여당이 단독으로 '조작기소 확인' 결과보고서를 채택한다.", effect: "slam" },
            { character: "prosecutor", expression: "angry", text: "야당 의견이 전혀 반영되지 않은 보고서! 이건 정파적 결론을 위한 도구다!" },
            { character: "citizen", expression: "angry", text: "국회의원 절반이 반대하는 보고서로 재판을 없앤다고요? 그게 민주주의예요?" },
        ],
    },
    adopt_report_2: {
        background: "parliament",
        lines: [
            { character: "narrator", text: "📑 수적 우위를 앞세워 기소 취소를 권고하는 보고서가 통과된다.", effect: "slam" },
            { character: "prosecutor", expression: "sad", text: "다수결로 진실을 덮을 수는 없습니다. 역사가 평가할 것입니다." },
            { character: "citizen", expression: "normal", text: "자기들끼리 북치고 장구치고... 이럴 거면 재판이 왜 필요해요?" },
        ],
    },
    mass_indictments_1: {
        background: "parliament",
        lines: [
            { character: "narrator", text: "⚡ 국회가 청문회 증인 31명을 위증, 불출석 등 혐의로 일괄 고발한다.", effect: "shake" },
            { character: "prosecutor", expression: "shocked", text: "증인을 고발한다고?! 진실을 말한 대가가 형사 처벌이란 말인가!", effect: "shake" },
            { character: "citizen", expression: "sad", text: "증인이 사실대로 말했는데 고발당한다면... 다음에 누가 진실을 말하겠어요?" },
        ],
    },
    mass_indictments_2: {
        background: "parliament",
        lines: [
            { character: "politician", expression: "angry", text: "국회를 기만하고 위증한 자들은 법의 엄중한 심판을 받아야 합니다!" },
            { character: "prosecutor", expression: "angry", text: "자신들이 원하는 대답을 안 했다고 고발하는 건 명백한 권력 남용입니다!" },
            { character: "citizen", expression: "sad", text: "이제 국회에 불려가면 무조건 그쪽 입맛에 맞게 대답해야겠네..." },
        ],
    },
    draft_special_counsel_1: {
        background: "parliament",
        lines: [
            { character: "narrator", text: "📝 350명 규모의 '슈퍼 특검법'이 국회에 전격 발의된다.", effect: "slam" },
            { character: "citizen", expression: "angry", text: "350명짜리 특검이 수사를 하는 게 아니라 재판을 없애러 가는 거잖아요?" },
            { character: "prosecutor", expression: "angry", text: "특검은 새로 수사하기 위한 제도다! 공소취소 권한을 부여하다니!" },
        ],
    },
    draft_special_counsel_2: {
        background: "parliament",
        lines: [
            { character: "politician", expression: "confident", text: "이 특검법만이 무너진 사법 정의를 바로 세울 유일한 길입니다." },
            { character: "judge", expression: "sad", text: "사법부의 심판을 받기도 전에 입법부가 재판을 무효화하려 합니다." },
            { character: "citizen", expression: "normal", text: "결국 자기 재판 없애려고 법을 새로 만드는 거잖아요?" },
        ],
    },
    pass_special_counsel_1: {
        background: "parliament",
        lines: [
            { character: "narrator", text: "🗳️ 특검법이 본회의에서 여당 단독으로 강행 처리된다.", effect: "slam" },
            { character: "judge", expression: "normal", text: "공소가 취소되면 법원은 유무죄를 판단할 기회를 완전히 잃게 됩니다..." },
            { character: "citizen", text: "재판을 해서 무죄가 나오면 그게 진짜 무죄 아닌가요? 왜 재판 자체를 안 하려 하죠?" },
        ],
    },
    pass_special_counsel_2: {
        background: "parliament",
        lines: [
            { character: "narrator", text: "🗳️ 무제한 토론마저 강제 종료되며 법안이 통과되었다.", effect: "slam" },
            { character: "politician", expression: "confident", text: "국민의 명령입니다! 특검법 통과는 거스를 수 없는 대세입니다!" },
            { character: "citizen", expression: "shocked", text: "다수당이면 헌법도 마음대로 고치고 재판도 없앨 수 있는 거였어?" },
        ],
    },
    appoint_counsel_1: {
        background: "courtroom",
        lines: [
            { character: "narrator", text: "👤 여당 추천 후보가 대통령에 의해 특별검사로 임명된다.", effect: "slam" },
            { character: "prosecutor", expression: "angry", text: "피고인이 자기 사건 검사를 고르는 나라가 어디 있습니까!", effect: "shake" },
            { character: "judge", expression: "normal", text: "이것은 명백한 이해충돌입니다. 민주주의 역사에 유례가 없습니다." },
        ],
    },
    appoint_counsel_2: {
        background: "courtroom",
        lines: [
            { character: "narrator", text: "👤 철저히 당의 입맛에 맞는 인물이 특별검사로 내정되었다.", effect: "slam" },
            { character: "prosecutor", expression: "shocked", text: "이것은 특검이 아니라, 피고인의 개인 변호사를 임명한 것과 다름없습니다!" },
            { character: "citizen", expression: "angry", text: "자기 편을 심판으로 세우고 경기하겠다니, 너무 뻔뻔한 거 아니에요?" },
        ],
    },
    transfer_cases_1: {
        background: "courtroom",
        lines: [
            { character: "narrator", text: "📦 법원 계류 중인 5개 재판 기록 일체가 특검에 넘겨진다.", effect: "shake" },
            { character: "judge", expression: "angry", text: "사법부의 관할에서 사건을 물리적으로 빼앗는 행위... 이건 전례가 없다!", effect: "shake" },
            { character: "citizen", expression: "sad", text: "법원에서 재판하던 걸 갑자기 옮긴다고요? 피해자들은 어디서 정의를 찾아요?" },
        ],
    },
    transfer_cases_2: {
        background: "courtroom",
        lines: [
            { character: "narrator", text: "📦 트럭 수십 대 분량의 재판 기록이 법원을 떠나 특검 사무실로 이관된다.", effect: "shake" },
            { character: "judge", expression: "sad", text: "법원의 손에서 사건이 강탈당했습니다... 오늘 법치주의는 죽었습니다." },
            { character: "citizen", expression: "shocked", text: "재판받던 사람이 서류를 뺏어가는 거랑 뭐가 달라요?" },
        ],
    },
    seize_prosecution_1: {
        background: "courtroom",
        lines: [
            { character: "narrator", text: "🔑 특검이 기존 검찰의 공소유지 권한을 강제로 인수한다.", effect: "slam" },
            { character: "prosecutor", expression: "shocked", text: "내가 유죄를 주장하던 사건을... 다른 검사가 와서 '없던 일'로 하겠다고?!", effect: "shake" },
            { character: "citizen", text: "검사가 '유죄입니다' 하던 걸 다른 검사가 '없던 일로 합시다' 하면... 판사는 뭘 하는 거예요?" },
        ],
    },
    seize_prosecution_2: {
        background: "courtroom",
        lines: [
            { character: "narrator", text: "🔑 그동안 수사했던 검사들은 모두 사건에서 배제되었다.", effect: "slam" },
            { character: "prosecutor", expression: "sad", text: "피땀 흘려 찾아낸 증거들이 모두 휴지조각이 되게 생겼습니다..." },
            { character: "citizen", expression: "angry", text: "그렇게 당당하면 그냥 재판을 끝까지 받지, 왜 남의 권한을 뺏어요?" },
        ],
    },
    cancel_indictment: {
        background: "courtroom",
        lines: [
            { character: "narrator", text: "🔴 특검이 '조작기소로 판명'을 이유로 공소를 취소한다.", effect: "flash" },
            { character: "narrator", text: "개발비리 4,895억 배임... 대북송금 800만 달러... 성남FC 133억 뇌물...", effect: "shake" },
            { character: "narrator", text: "법원은 이 사건들에 대해 유죄도, 무죄도 선고하지 못합니다." },
            { character: "judge", expression: "sad", text: "진실은... 영원히 미궁 속에 갇히게 되었습니다.", effect: "shake" },
            { character: "citizen", expression: "angry", text: "무죄면 무죄 판결을 받으면 되잖아요! 왜 재판 자체를 없애나요! 그건 무죄가 아닙니다. 그건 도망입니다!", effect: "shake" },
        ],
    },
    do_nothing_1: {
        background: "dark",
        lines: [
            { character: "narrator", text: "🏢 이번 달은 사법 이슈에 개입하지 않고 국정에 집중했다." },
            { character: "citizen", expression: "normal", text: "정치인이 재판에 개입하지 않고 일을 하다니... 원래 이게 정상 아닌가요?" },
        ],
    },
    do_nothing_2: {
        background: "dark",
        lines: [
            { character: "narrator", text: "🏢 조용한 한 달이 지나갔다. 법원은 정상적으로 재판을 진행했다." },
            { character: "judge", expression: "normal", text: "외부의 압력이 없으니 법과 원칙에 따라 충실히 심리할 수 있군." },
        ],
    },
    press_conference_1: {
        background: "parliament",
        lines: [
            { character: "politician", expression: "confident", text: "나는 정치검찰의 피해자입니다! 국민 여러분, 진실을 봐주십시오!" },
            { character: "citizen", text: "대통령이 직접 '내 재판은 조작'이라고 하면, 판사가 자유롭게 판결할 수 있을까요?" },
        ],
    },
    press_conference_2: {
        background: "parliament",
        lines: [
            { character: "politician", expression: "angry", text: "이 모든 것은 야당 탄압을 위한 검찰의 치밀한 공작입니다!" },
            { character: "citizen", expression: "normal", text: "또 남 탓이야... 매번 패턴이 똑같아서 이젠 감흥도 없네." },
        ],
    },
};

// 랜덤 이벤트별 대사
export const EVENT_DIALOGUES: Record<string, DialogueSequence> = {
    constitutional_court_warning: {
        background: "courtroom",
        lines: [
            { character: "judge", expression: "angry", text: "헌법기관은 입법부의 사법 개입에 대해 심각한 우려를 표명합니다!", effect: "slam" },
            { character: "narrator", text: "⚖️ 헌재의 이례적 공식 성명이 발표되었다." },
        ],
    },
    international_criticism: {
        background: "dark",
        lines: [
            { character: "narrator", text: "🌍 주요 서방국가들이 공동 성명을 발표한다.", effect: "slam" },
            { character: "narrator", text: "\"한국의 사법 독립성 훼손에 대해 심각한 우려를 표명합니다.\"" },
        ],
    },
    public_protest: {
        background: "protest",
        lines: [
            { character: "citizen", expression: "angry", text: "왜 한 사람만 예외인가! 법 앞에 평등하라!", effect: "shake" },
            { character: "narrator", text: "🕯️ 국회 앞에 5만 명의 시민이 촛불을 들고 모였다." },
        ],
    },
    judge_resignation: {
        background: "courtroom",
        lines: [
            { character: "judge", expression: "angry", text: "우리는 사법부의 독립을 끝까지 수호할 것입니다!", effect: "slam" },
            { character: "narrator", text: "⚖️ 현직 판사 200명이 '사법독립 사수' 긴급 성명을 발표했다." },
        ],
    },
    economy_crisis: {
        background: "dark",
        lines: [
            { character: "narrator", text: "📉 사법 혼란으로 외국인 투자자가 이탈하고, 환율이 급등하고 있다.", effect: "shake" },
            { character: "citizen", expression: "sad", text: "원·달러 환율 1500원 돌파... 우리 경제는 어디로 가는 건가요?" },
        ],
    },
    supporter_fatigue: {
        background: "protest",
        lines: [
            { character: "citizen", expression: "angry", text: "사법 이슈만 하지 말고 민생을 챙겨라! 우리 삶은 누가 돌봐요?" },
            { character: "narrator", text: "지지층 내부에서도 피로감과 불만이 확산되고 있다." },
        ],
    },
    bar_association_statement: {
        background: "courtroom",
        lines: [
            { character: "prosecutor", expression: "confident", text: "변호사 단체 회원 수만 명이 한 목소리로 말합니다. 공소취소는 법치주의 자살 행위입니다.", effect: "slam" },
            { character: "citizen", text: "변호사들까지 나서서 반대하는 건... 이건 정말 정상이 아닌 거 맞죠?" },
        ],
    },
    professor_petition: {
        background: "courtroom",
        lines: [
            { character: "narrator", text: "📚 전국 법학 교수 수백 명이 헌법기관에 청원서를 제출했다.", effect: "slam" },
            { character: "citizen", text: "법을 가르치는 사람들이 '이것은 법치의 죽음'이라고 하는데... 우리는 뭘 해야 할까요?" },
        ],
    },
    media_split: {
        background: "dark",
        lines: [
            { character: "narrator", text: "📺 같은 사건이 두 개의 완전히 다른 뉴스가 되어 나가고 있다.", effect: "shake" },
            { character: "citizen", expression: "sad", text: "A채널은 '정치 조작', B채널은 '사법 농단'... 나는 뭘 믿어야 하는 거죠?" },
            { character: "narrator", text: "대한민국이 두 개의 현실로 갈라지고 있다." },
        ],
    },
    business_warning: {
        background: "dark",
        lines: [
            { character: "narrator", text: "📊 주요 경제단체가 긴급 기자회견을 열었다.", effect: "slam" },
            { character: "citizen", text: "외국 기업들이 한국 투자를 보류하기 시작했대요. 우리 일자리는 어떻게 되는 거예요?" },
        ],
    },
    viral_meme: {
        background: "dark",
        lines: [
            { character: "narrator", text: "📱 '재판 삭제 버튼' 밈이 SNS에서 폭발적으로 퍼지고 있다." },
            { character: "citizen", expression: "normal", text: "외국 사람들이 한국을 보면서 웃고 있어요. '재판을 삭제할 수 있는 나라'라고..." },
            { character: "narrator", text: "풍자가 현실을 앞지르는 순간이 왔다." },
        ],
    },
    whistleblower: {
        background: "courtroom",
        lines: [
            { character: "narrator", text: "💣 특검팀 전 수사관이 폭로 기자회견을 열었다.", effect: "flash" },
            { character: "prosecutor", expression: "shocked", text: "처음부터 공소취소가 목적이었다고?! 수사는 연극이었단 말인가!", effect: "shake" },
            { character: "citizen", expression: "angry", text: "특검이 수사가 아니라 대본대로 움직인 거라면... 우리는 속은 거잖아요!" },
        ],
    },
    victim_testimony: {
        background: "courtroom",
        lines: [
            { character: "citizen", expression: "sad", text: "4,895억... 그건 우리 세금이에요. 진실을 밝힐 기회마저 빼앗기는 건가요?", effect: "shake" },
            { character: "narrator", text: "😢 개발비리·성남FC 피해자들이 국회 앞에서 눈물의 기자회견을 열었다." },
            { character: "citizen", expression: "angry", text: "무죄면 재판해서 무죄 받으세요! 재판을 없애는 건 무죄가 아닙니다!" },
        ],
    },
    prosecution_morale: {
        background: "courtroom",
        lines: [
            { character: "prosecutor", expression: "sad", text: "권력자를 수사하면 국회에 끌려가고, 고발당하고, 경력이 끝납니다... 이래서 누가 수사를 하겠습니까.", effect: "shake" },
            { character: "narrator", text: "검사 30명이 집단으로 사표를 제출했다. 법 집행의 의지가 꺾이고 있다." },
        ],
    },
    ruling_party_revolt: {
        background: "parliament",
        lines: [
            { character: "narrator", text: "🗳️ 여당 소장파 의원 3명이 표결에서 이탈했다!", effect: "slam" },
            { character: "politician", expression: "shocked", text: "내부에서 반란이?! 당론을 어기다니!", effect: "shake" },
            { character: "citizen", expression: "normal", text: "양심에 따라 반대한 의원이 있다니... 아직 희망이 있는 건가요?" },
        ],
    },
    youth_movement: {
        background: "protest",
        lines: [
            { character: "citizen", expression: "angry", text: "우리가 배운 헌법은 이게 아닙니다! 법치주의를 지켜라!", effect: "shake" },
            { character: "narrator", text: "🎓 전국 120개 대학 학생회가 공동 성명을 발표하고 캠퍼스 서명운동을 시작했다." },
        ],
    },
    // 연쇄 이벤트
    chain_echo_chamber: {
        background: "dark",
        lines: [
            { character: "narrator", text: "🧩 언론 프레임과 지지층 결집이 맞물렸다." },
            { character: "citizen", text: "지지 기반은 단단해졌지만... 중도층은 '현실 검증이 사라졌다'며 돌아서고 있다." },
        ],
    },
    chain_witness_chill: {
        background: "courtroom",
        lines: [
            { character: "narrator", text: "🧩 대규모 고발 이후 증언 환경이 얼어붙었다.", effect: "shake" },
            { character: "citizen", expression: "sad", text: "핵심 참고인들이 줄줄이 침묵하기 시작했어요... '다음은 나일 수 있다'는 공포가 퍼지고 있습니다." },
        ],
    },
    chain_legislative_fatigue: {
        background: "parliament",
        lines: [
            { character: "narrator", text: "🧩 강행 처리의 속도가 올랐지만, 여당 내부에서도 균열이 보인다." },
            { character: "politician", expression: "normal", text: "'민생보다 방탄'이라는 불만이... 우리 내부에서도 새어나오기 시작했다." },
        ],
    },
    chain_conflict_backlash: {
        background: "courtroom",
        lines: [
            { character: "narrator", text: "🧩 이해충돌 비판이 국내외 법조계에서 증폭되고 있다.", effect: "shake" },
            { character: "prosecutor", expression: "angry", text: "피고인이 자기 사건 심판자를 고른 셈입니다. 이건 전 세계 어디서도 없는 일이다!" },
        ],
    },
    chain_late_normalization: {
        background: "dark",
        lines: [
            { character: "narrator", text: "🧩 정면 충돌을 멈추자 일부 여론이 숨을 돌렸다." },
            { character: "citizen", expression: "normal", text: "처음부터 이랬어야죠... 다만 이미 손상된 신뢰를 회복하기엔 늦었을 수도 있어요." },
        ],
    },
};
