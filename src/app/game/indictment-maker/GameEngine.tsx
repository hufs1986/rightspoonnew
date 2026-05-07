"use client";

import { useCallback, useEffect, useState } from "react";

import DialogueSystem from "./DialogueSystem";
import EndingScreen from "./EndingScreen";
import GameScreen from "./GameScreen";
import TitleScreen from "./TitleScreen";
import { PROLOGUE_SEQUENCE } from "./PrologueSequence";
import { ACTION_DIALOGUES } from "./dialogueData";
import { trackGameEvent } from "./tracking";
import { useIndictmentGame } from "./useIndictmentGame";
import { createClient } from "@/utils/supabase/client";
import { selectPoliticalAttack, checkRandomEvent } from "./gameLogic";
import type { DefenseAction, PoliticalAttack, RandomEvent } from "./gameData";

type TurnPhase = "show_dialogue" | "show_attack" | "pick_defense" | "apply_defense" | "idle";

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
        applyAttack,
        executeDefense,
        getShareText,
        restart,
        clearSave,
        startNewGame,
    } = useIndictmentGame();

    const [showPrologue, setShowPrologue] = useState(false);
    const [completionCount, setCompletionCount] = useState<number | null>(null);

    // Turn phase management
    const [turnPhase, setTurnPhase] = useState<TurnPhase>("idle");
    const [pendingAttack, setPendingAttack] = useState<PoliticalAttack | null>(null);
    const [pendingEvent, setPendingEvent] = useState<RandomEvent | null>(null);
    const [usedEvents] = useState(() => new Set<string>());

    // Auto-trigger attack at game start and after each defense
    useEffect(() => {
        if (state.phase === "playing" && turnPhase === "idle") {
            const attack = selectPoliticalAttack(state.month);
            setPendingAttack(attack);

            if (attack) {
                if (attack.id === "atk_generic") {
                    applyAttack(attack); // 백그라운드 데미지 적용
                    setTurnPhase("pick_defense"); // UI 팝업 생략하고 바로 방어 페이즈로
                } else if (attack.dialogueKey && ACTION_DIALOGUES[attack.dialogueKey]) {
                    setTurnPhase("show_dialogue");
                } else {
                    setTurnPhase("show_attack");
                }
            } else {
                setTurnPhase("pick_defense");
            }

            // Check random event
            const event = checkRandomEvent(state.month, usedEvents);
            if (event) {
                usedEvents.add(event.id);
                setPendingEvent(event);
            }
        }
    }, [state.phase, turnPhase, state.month, usedEvents, applyAttack]);

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
        const fetchCount = async () => {
            try {
                const supabase = createClient();
                const { data } = await supabase.rpc("get_game_completion_count");
                if (typeof data === "number") setCompletionCount(data);
            } catch { /* ignore */ }
        };
        fetchCount();
    }, [state.phase]);

    const handleNewGame = () => {
        setTurnPhase("idle");
        setPendingAttack(null);
        setPendingEvent(null);
        setShowPrologue(true);
    };

    const handlePrologueComplete = () => {
        setShowPrologue(false);
        startNewGame();
    };

    const handleDialogueComplete = useCallback(() => {
        setTurnPhase("show_attack");
    }, []);

    // Player dismissed the attack overlay → move to defense pick phase
    const handleDismissAttack = useCallback(() => {
        // Apply the attack to game state
        if (pendingAttack) {
            applyAttack(pendingAttack);
        }
        // Apply random event if any
        if (pendingEvent) {
            // Event will be shown via GameScreen's event modal
        }
        setTurnPhase("pick_defense");
    }, [pendingAttack, pendingEvent, applyAttack]);

    // Player chose a defense action
    const handleDefense = useCallback((action: DefenseAction) => {
        executeDefense(action);
        setPendingAttack(null);
        setPendingEvent(null);
        
        // 방어 효과(스탯 변화, 화면 플래시)를 플레이어가 확인할 수 있도록 지연 시간을 둡니다.
        setTurnPhase("apply_defense");
        setTimeout(() => {
            setTurnPhase("idle");
        }, 1500);
    }, [executeDefense]);

    const handleShareGame = async () => {
        const text = "⚖️ 정치 권력이 재판을 회피하려 한다. 막을 수 있을까?\n\n30개월 동안 끝까지 재판에 세워 처벌받게 하세요!\n거의 아무도 못 깹니다. 🔥\n\n🎮 [공소취소 방어전] 도전해보세요 👇";
        try {
            if (navigator.share) {
                await navigator.share({ title: "공소취소 방어전", text, url: `${window.location.origin}${window.location.pathname}` });
                return;
            }
            await navigator.clipboard.writeText(`${text}\n${window.location.origin}${window.location.pathname}`);
            window.alert("게임 링크가 복사되었습니다!");
        } catch { /* no-op */ }
    };

    const handleRestart = useCallback(() => {
        setTurnPhase("idle");
        setPendingAttack(null);
        setPendingEvent(null);
        restart();
    }, [restart]);

    if (showPrologue) {
        return (
            <div style={{ minHeight: "100vh", background: "#090b14" }}>
                <DialogueSystem sequence={PROLOGUE_SEQUENCE} onComplete={handlePrologueComplete} />
            </div>
        );
    }

    if (turnPhase === "show_dialogue" && pendingAttack && pendingAttack.dialogueKey) {
        const sequence = ACTION_DIALOGUES[pendingAttack.dialogueKey];
        if (sequence) {
            return (
                <div style={{ minHeight: "100vh", background: "#090b14" }}>
                    <DialogueSystem sequence={sequence} onComplete={handleDialogueComplete} />
                </div>
            );
        }
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
                onContinue={() => { setTurnPhase("idle"); continueSavedGame(); }}
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
                onRestart={handleRestart}
                onShare={handleShare}
                stats={state.stats}
                month={state.month}
                leaderboard={leaderboard}
                onSubmitScore={submitScore}
                actionFrequencies={state.actionFrequencies}
            />
        );
    }

    return (
        <GameScreen
            defenseActions={defenseActions}
            currentEvent={pendingEvent}
            pendingAttack={pendingAttack}
            turnPhase={turnPhase}
            month={state.month}
            recentDefenses={state.recentDefenses}
            newsHistory={state.newsHistory}
            onDefend={handleDefense}
            onDismissAttack={handleDismissAttack}
            onDismissEvent={dismissEvent}
            stats={state.stats}
            exhaustedTurns={state.exhaustedTurns}
            currentHand={state.currentHand}
        />
    );
}
