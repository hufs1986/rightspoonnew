"use client";

import { useEffect, useState } from "react";

import CancelAnimation from "./CancelAnimation";
import EndingScreen from "./EndingScreen";
import GameScreen from "./GameScreen";
import TitleScreen from "./TitleScreen";
import { trackGameEvent } from "./tracking";
import { useIndictmentGame } from "./useIndictmentGame";
import { createClient } from "@/utils/supabase/client";

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

    // 완주자 수 로딩
    const [completionCount, setCompletionCount] = useState<number | null>(null);

    useEffect(() => {
        if (state.phase !== "ending") return;
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
                onNewGame={startNewGame}
                onSelectSlot={selectSlot}
                saveSlotSummaries={saveSlotSummaries}
                onShareGame={handleShareGame}
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
            />
        );
    }

    return (
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
            onAction={executeAction}
            onDismissEvent={dismissEvent}
            stats={state.stats}
            trialsCancelled={state.trialsCancelled}
            hasSavedGame={hasSavedGame}
            milestones={state.milestones}
            isActionDone={isActionDone}
            isActionLocked={isActionLocked}
        />
    );
}
