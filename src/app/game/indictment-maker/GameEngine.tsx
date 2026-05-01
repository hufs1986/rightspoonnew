"use client";

import CancelAnimation from "./CancelAnimation";
import EndingScreen from "./EndingScreen";
import GameScreen from "./GameScreen";
import TitleScreen from "./TitleScreen";
import { useIndictmentGame } from "./useIndictmentGame";

export default function GameEngine() {
    const {
        actions,
        characterLevel,
        continueSavedGame,
        endingData,
        hasSavedGame,
        isHydrated,
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
                await navigator.share({
                    title: "공소취소 메이커",
                    text,
                    url: window.location.href,
                });
                return;
            }

            await navigator.clipboard.writeText(`${text}\n${window.location.href}`);
            window.alert("결과가 복사되었습니다!");
        } catch {
            // no-op
        }
    };

    if (state.phase === "title") {
        return (
            <TitleScreen
                hasSavedGame={hasSavedGame}
                isHydrated={isHydrated}
                onClearSave={clearSave}
                onContinue={continueSavedGame}
                onNewGame={startNewGame}
            />
        );
    }

    if (state.phase === "cancel_animation") {
        return <CancelAnimation />;
    }

    if (state.phase === "ending" && endingData) {
        return <EndingScreen endingData={endingData} onRestart={restart} onShare={handleShare} stats={state.stats} />;
    }

    return (
        <GameScreen
            actions={actions}
            characterEmoji={characterLevel.emoji}
            characterLevel={characterLevel.level}
            characterName={characterLevel.name}
            currentEvent={state.currentEvent}
            month={state.month}
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
