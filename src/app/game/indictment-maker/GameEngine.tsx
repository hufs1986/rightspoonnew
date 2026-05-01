"use client";

import CancelAnimation from "./CancelAnimation";
import EndingScreen from "./EndingScreen";
import GameScreen from "./GameScreen";
import TitleScreen from "./TitleScreen";
import { trackGameEvent } from "./tracking";
import { useIndictmentGame } from "./useIndictmentGame";

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

    const handleShareGame = async () => {
        const text = "권력으로 재판을 덮으면 어떻게 될까?\n정치 풍자 육성 시뮬레이션 [공소취소 메이커]\n직접 체험해보세요!";
        
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
