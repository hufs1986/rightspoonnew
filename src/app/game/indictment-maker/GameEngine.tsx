"use client";

import { useCallback, useEffect, useState } from "react";

import CancelAnimation from "./CancelAnimation";
import DialogueSystem from "./DialogueSystem";
import EndingScreen from "./EndingScreen";
import GameScreen from "./GameScreen";
import ImpactCard from "./ImpactCard";
import TitleScreen from "./TitleScreen";
import { PROLOGUE_SEQUENCE } from "./PrologueSequence";
import { applyCounterEffects, getRandomImpact, INITIAL_IMPACT_COUNTERS, type ImpactCounters, type ImpactMessage } from "./impactData";
import { trackGameEvent } from "./tracking";
import { useIndictmentGame } from "./useIndictmentGame";
import { createClient } from "@/utils/supabase/client";
import type { GameAction } from "./gameData";
import { ACTION_EDUCATION } from "./educationData";

export default function GameEngine() {
    const {
        activeSlotId,
        actions,
        characterLevel,
        continueSavedGame,
        discoveredEndingIds,
        endingData,
        eventForecast,
        hasSavedGame,
        isHydrated,
        playStatsDetails,
        playStatsSummary,
        saveSlotSummaries,
        selectSlot,
        state,
        dismissEvent,
        executeAction,
        getShareText,
        isActionDone,
        isActionLocked,
        restart,
        clearSave,
        startNewGame,
    } = useIndictmentGame();

    // 프롤로그 상태
    const [showPrologue, setShowPrologue] = useState(false);

    // 피해 카운터 & 카드
    const [impactCounters, setImpactCounters] = useState<ImpactCounters>(INITIAL_IMPACT_COUNTERS);
    const [currentImpact, setCurrentImpact] = useState<ImpactMessage | null>(null);

    // 시민 코멘트
    const [citizenComment, setCitizenComment] = useState<string | null>(null);

    const handleShare = async () => {
        const text = getShareText();

        try {
            if (navigator.share) {
                trackGameEvent("indictment_share_result", { method: "native_share" });
                await navigator.share({
                    title: "공소취소 메이커",
                    text,
                    url: window.location.href,
                });
                return;
            }

            trackGameEvent("indictment_share_result", { method: "clipboard" });
            await navigator.clipboard.writeText(`${text}\n${window.location.href}`);
            window.alert("결과가 복사되었습니다!");
        } catch {
            // no-op
        }
    };

    // 완주자 수 로딩 — 타이틀 + 엔딩 모두에서 로딩
    const [completionCount, setCompletionCount] = useState<number | null>(null);

    useEffect(() => {
        if (state.phase !== "ending" && state.phase !== "title") return;
        const fetchCount = async () => {
            try {
                const supabase = createClient();
                const { data } = await supabase.rpc("get_game_completion_count");
                if (typeof data === "number") setCompletionCount(data);
            } catch (err) {
                // Ignore error
            }
        };
        fetchCount();
    }, [state.phase]);

    // 새 게임 시작 핸들러 — 첫 플레이면 프롤로그 표시
    const handleNewGame = () => {
        const isFirstPlay = playStatsSummary.totalSessions === 0;
        if (isFirstPlay) {
            setShowPrologue(true);
        } else {
            startNewGame();
        }
        // 카운터 리셋
        setImpactCounters(INITIAL_IMPACT_COUNTERS);
        setCitizenComment(null);
        setCurrentImpact(null);
    };

    const handlePrologueComplete = () => {
        setShowPrologue(false);
        startNewGame();
    };

    // 액션 실행 래퍼 — 피해 카드 + 시민 코멘트 생성
    const handleAction = useCallback((action: GameAction) => {
        executeAction(action);

        // 피해 카운터 업데이트
        setImpactCounters((prev) => applyCounterEffects(prev, action.id));

        // 피해 카드 표시
        const impact = getRandomImpact(action.id);
        if (impact) {
            setCurrentImpact(impact);
        }

        // 시민 코멘트 설정 (educationData에서 가져오기)
        const edu = ACTION_EDUCATION[action.id];
        if (edu?.citizenVoice) {
            // 따옴표 제거하고 첫 문장만
            const voice = edu.citizenVoice.replace(/^"|"$/g, "").split("\\n")[0];
            setCitizenComment(voice);
        }
    }, [executeAction]);

    const handleDismissImpact = () => {
        setCurrentImpact(null);
    };

    // 중간 공유 핸들러
    const handleMidGameShare = async () => {
        const { month, stats } = state;
        const text = `⚖️ 나의 공소취소 메이커 현황\n📅 ${month}개월차 | 🔴 공소취소 ${stats.cancelProgress}% | ⚖️ 법치주의 ${stats.lawRule}%\n😰 위축된 검사 ${impactCounters.intimidatedProsecutors}명 | 💰 미확인 금액 ${impactCounters.unverifiedAmount.toLocaleString()}억\n\n과연 나의 결말은? 👇`;
        try {
            if (navigator.share) {
                trackGameEvent("indictment_share_midgame", { method: "native_share", month });
                await navigator.share({
                    title: "공소취소 메이커",
                    text,
                    url: window.location.origin + window.location.pathname,
                });
                return;
            }

            trackGameEvent("indictment_share_midgame", { method: "clipboard", month });
            await navigator.clipboard.writeText(`${text}\n${window.location.origin}${window.location.pathname}`);
            window.alert("현재 상태가 복사되었습니다!");
        } catch {
            // no-op
        }
    };

    const handleShareGame = async () => {
        const text = "⚖️ 재판은 멈추고, 권력은 자란다.\n국회에서 특검법을 통과시키고, 지지자를 결집해 재판을 덮어버리세요!\n\n\"연어회 소주파티 가짜뉴스 유포부터, 350명 슈퍼특검법 발의까지...\"\n현실 정치를 100% 고증한 블랙코미디 시뮬레이션\n🎮 [공소취소 메이커] 당신의 선택은?👇";
        try {
            if (navigator.share) {
                trackGameEvent("indictment_share_game", { method: "native_share" });
                await navigator.share({
                    title: "공소취소 메이커",
                    text,
                    url: window.location.origin + window.location.pathname,
                });
                return;
            }

            trackGameEvent("indictment_share_game", { method: "clipboard" });
            await navigator.clipboard.writeText(`${text}\n${window.location.origin}${window.location.pathname}`);
            window.alert("게임 링크가 복사되었습니다!");
        } catch {
            // no-op
        }
    };

    // 프롤로그 표시
    if (showPrologue) {
        return (
            <div style={{ minHeight: "100vh", background: "#090b14" }}>
                <DialogueSystem
                    sequence={PROLOGUE_SEQUENCE}
                    onComplete={handlePrologueComplete}
                />
            </div>
        );
    }

    if (state.phase === "title") {
        return (
            <TitleScreen
                hasSavedGame={hasSavedGame}
                isHydrated={isHydrated}
                activeSlotId={activeSlotId}
                discoveredEndingIds={discoveredEndingIds}
                playStatsDetails={playStatsDetails}
                playStatsSummary={playStatsSummary}
                onClearSave={clearSave}
                onContinue={continueSavedGame}
                onNewGame={handleNewGame}
                onSelectSlot={selectSlot}
                saveSlotSummaries={saveSlotSummaries}
                onShareGame={handleShareGame}
                completionCount={completionCount}
            />
        );
    }

    if (state.phase === "cancel_animation") {
        return <CancelAnimation />;
    }

    if (state.phase === "ending" && endingData) {
        return (
            <EndingScreen
                completionCount={completionCount}
                discoveredEndingIds={discoveredEndingIds}
                endingData={endingData}
                onRestart={restart}
                onShare={handleShare}
                stats={state.stats}
                impactCounters={impactCounters}
            />
        );
    }

    return (
        <>
            <GameScreen
                actions={actions}
                characterEmoji={characterLevel.emoji}
                characterLevel={characterLevel.level}
                characterName={characterLevel.name}
                currentEvent={state.currentEvent}
                eventForecast={eventForecast}
                month={state.month}
                recentActions={state.recentActions}
                newsHistory={state.newsHistory}
                onAction={handleAction}
                onDismissEvent={dismissEvent}
                stats={state.stats}
                trialsCancelled={state.trialsCancelled}
                hasSavedGame={hasSavedGame}
                milestones={state.milestones}
                isActionDone={isActionDone}
                isActionLocked={isActionLocked}
                citizenComment={citizenComment}
                impactCounters={impactCounters}
                onMidGameShare={handleMidGameShare}
            />
            {currentImpact && (
                <ImpactCard
                    impact={currentImpact}
                    counters={impactCounters}
                    onDismiss={handleDismissImpact}
                />
            )}
        </>
    );
}
