"use client";

import { useState } from "react";
import { STORY_DATA, type StoryNodeId, type StoryChoice } from "./storyData";
import DialogueSystem from "./DialogueSystem";
import styles from "./game.module.css";

export default function StoryEngine() {
    const [phase, setPhase] = useState<"title" | "playing" | "ending">("title");
    const [currentNodeId, setCurrentNodeId] = useState<StoryNodeId>("prologue");
    const [stats, setStats] = useState({ integrity: 50, opinion: 50 });
    const [endingId, setEndingId] = useState<string | null>(null);

    const handleStart = () => {
        setPhase("playing");
        setCurrentNodeId("prologue");
        setStats({ integrity: 50, opinion: 50 });
    };

    const handleChoiceMade = (choice: StoryChoice) => {
        if (choice.effect) {
            setStats(prev => ({
                integrity: Math.min(100, Math.max(0, prev.integrity + (choice.effect?.integrity || 0))),
                opinion: Math.min(100, Math.max(0, prev.opinion + (choice.effect?.opinion || 0)))
            }));
        }

        // Handle dynamic check_ending node redirect
        if (choice.nextNodeId === "check_ending") {
            // Decide ending based on stats
            if (stats.opinion < 20) {
                setCurrentNodeId("ending_b"); // Riot
            } else if (stats.integrity >= 70 && stats.opinion >= 40) {
                setCurrentNodeId("ending_d"); // True ending
            } else {
                setCurrentNodeId("ending_c"); // Normal ending
            }
        } else {
            setCurrentNodeId(choice.nextNodeId);
        }
    };

    const handleNextNode = (nextNodeId: string) => {
        setCurrentNodeId(nextNodeId);
    };

    const handleEnding = (id: string) => {
        setEndingId(id);
        setPhase("ending");
    };

    if (phase === "title") {
        // Render a basic title screen or reuse the existing one
        return (
            <div style={{ position: "fixed", inset: 0, height: "100dvh", zIndex: 100, background: "#090b14", color: "#fff", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                <h1 style={{ fontSize: "2.5rem", color: "#ff3333", marginBottom: "1rem" }}>공소취소 방어전: 진실의 법정</h1>
                <p style={{ marginBottom: "2rem", color: "#aaa" }}>법치주의를 수호할 것인가, 타협할 것인가.</p>
                <button 
                    onClick={handleStart}
                    style={{ padding: "16px 32px", fontSize: "1.2rem", background: "#d32f2f", color: "white", border: "none", borderRadius: "8px", cursor: "pointer" }}
                >
                    새 게임 시작
                </button>
            </div>
        );
    }

    if (phase === "ending") {
        return (
            <div style={{ position: "fixed", inset: 0, height: "100dvh", zIndex: 100, background: "#000", color: "#fff", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "20px", textAlign: "center" }}>
                <h1 style={{ fontSize: "3rem", color: "#ff3333", marginBottom: "2rem" }}>THE END</h1>
                <p style={{ fontSize: "1.2rem", color: "#ddd", marginBottom: "2rem" }}>
                    엔딩 코드: {endingId}
                </p>
                <p style={{ fontSize: "1rem", color: "#aaa", marginBottom: "3rem" }}>
                    최종 법치주의: {stats.integrity} / 최종 여론: {stats.opinion}
                </p>
                <button 
                    onClick={() => setPhase("title")}
                    style={{ padding: "12px 24px", fontSize: "1rem", background: "#333", color: "white", border: "1px solid #555", borderRadius: "8px", cursor: "pointer" }}
                >
                    타이틀로 돌아가기
                </button>
            </div>
        );
    }

    const currentNode = STORY_DATA[currentNodeId];

    if (!currentNode) {
        return <div style={{ color: "white", padding: "20px" }}>Error: Node not found ({currentNodeId})</div>;
    }

    // Filter choices based on required stats
    const nodeToRender = { ...currentNode };
    if (nodeToRender.choices) {
        nodeToRender.choices = nodeToRender.choices.filter(choice => {
            if (choice.requiredIntegrity && stats.integrity < choice.requiredIntegrity) return false;
            return true;
        });
    }

    return (
        <div style={{ position: "relative", height: "100dvh", background: "#090b14" }}>
            <DialogueSystem 
                node={nodeToRender} 
                onChoiceMade={handleChoiceMade} 
                onNextNode={handleNextNode}
                onEnding={handleEnding}
            />
        </div>
    );
}
