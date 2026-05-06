"use client";

import { useCallback, useEffect, useState } from "react";

import DialogueSystem from "./DialogueSystem";
import EndingScreen from "./EndingScreen";
import GameScreen from "./GameScreen";
import TitleScreen from "./TitleScreen";
import { PROLOGUE_SEQUENCE } from "./PrologueSequence";
import { trackGameEvent } from "./tracking";
import { useIndictmentGame } from "./useIndictmentGame";
import { createClient } from "@/utils/supabase/client";
import type { DefenseAction } from "./gameData";

export default function GameEngine() {
    const {
        activeSlotId,
        defenseActions,
        continueSavedGame,
        discoveredEndingIds,
        endingData,
        hasSavedGame,
        isHydrated,
        leaderboard,
        playStatsDetails,
        playStatsSummary,
        saveSlotSummaries,
        selectSlot,
        state,
        submitScore,
        dismissEvent,
        executeTurn,
        getShareText,
        restart,
        clearSave,
        startNewGame,
    } = useIndictmentGame();

    const [showPrologue, setShowPrologue] = useState(false);
    const [completionCount, setCompletionCount] = useState<number | null>(null);

    const handleShare = async () => {
        const text = getShareText();
        try {
            if (navigator.share) {
                trackGameEvent("indictment_share_result", { method: "native_share" });
                await navigator.share({ title: "공소취소 방어전", text, url: window.location.href });
                return;
            }
            trackGameEvent("indictment_share_result", { method: "clipboard" });
            await navigator.clipboard.writeText(`${text}\n${window.location.href}`);
            window.alert("결과가 복사되었습니다!");
        } catch { /* no-op */ }
    };

    // Completion count
    useEffect(() => {
        if (state.phase !== "ending" && state.phase !== "title") return;
        const fetch = async () => {
            try {
                const supabase = createClient();
                const { data } = await supabase.rpc("get_game_completion_count");
                if (typeof data === "number") setCompletionCount(data);
            } catch { /* ignore */ }
        };
        fetch();
    }, [state.phase]);

    const handleNewGame = () => {
        const isFirstPlay = playStatsSummary.totalSessions === 0;
        if (isFirstPlay) {
            setShowPrologue(true);
        } else {
            startNewGame();
        }
    };

    const handlePrologueComplete = () => {
        setShowPrologue(false);
        startNewGame();
    };

    const handleDefense = useCallback((action: DefenseAction) => {
        executeTurn(action);
    }, [executeTurn]);

    const handleShareGame = async () => {
        const text = "⚖️ 정치 권력이 재판을 없애려 한다. 막을 수 있을까?\n\n30개월 안에 공소취소를 저지하세요!\n거의 아무도 못 깹니다. 🔥\n\n🎮 [공소취소 방어전] 도전해보세요 👇";
        try {
            if (navigator.share) {
                await navigator.share({ title: "공소취소 방어전", text, url: `${window.location.origin}${window.location.pathname}` });
                return;
            }
            await navigator.clipboard.writeText(`${text}\n${window.location.origin}${window.location.pathname}`);
            window.alert("게임 링크가 복사되었습니다!");
        } catch { /* no-op */ }
    };

    if (showPrologue) {
        return (
            <div style={{ minHeight: "100vh", background: "#090b14" }}>
                <DialogueSystem sequence={PROLOGUE_SEQUENCE} onComplete={handlePrologueComplete} />
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
                playStatsSummary={playStatsSummary}
                onClearSave={clearSave}
                onContinue={continueSavedGame}
                onNewGame={handleNewGame}
                onSelectSlot={selectSlot}
                saveSlotSummaries={saveSlotSummaries}
                onShareGame={handleShareGame}
                completionCount={completionCount}
                leaderboard={leaderboard}
            />
        );
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
                month={state.month}
                leaderboard={leaderboard}
                onSubmitScore={submitScore}
            />
        );
    }

    return (
        <GameScreen
            defenseActions={defenseActions}
            currentEvent={state.currentEvent}
            currentAttack={state.currentAttack}
            month={state.month}
            recentDefenses={state.recentDefenses}
            newsHistory={state.newsHistory}
            onDefend={handleDefense}
            onDismissEvent={dismissEvent}
            stats={state.stats}
            exhaustedTurns={state.exhaustedTurns}
        />
    );
}
