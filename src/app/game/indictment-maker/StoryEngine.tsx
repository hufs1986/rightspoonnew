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
        const ENDING_META: Record<string, { title: string, color: string, bg: string }> = {
            "bad_conceal": { title: "배드엔딩: 진실의 은폐", color: "#ff3333", bg: "#0a0000" },
            "bad_subordinate": { title: "배드엔딩: 사법부의 예속", color: "#ff3333", bg: "#0a0000" },
            "normal_scars": { title: "노멀엔딩: 상처뿐인 원칙", color: "#aaaaaa", bg: "#111" },
            "true_justice": { title: "트루엔딩: 법치주의의 증명", color: "#ffd700", bg: "linear-gradient(135deg, #091e3a, #2f80ed, #2d9ee0)" },
        };

        const meta = endingId && ENDING_META[endingId] ? ENDING_META[endingId] : { title: "종료", color: "#fff", bg: "#000" };

        const handleShare = async () => {
            const shareData = {
                title: '공소취소 메이커',
                text: `나의 결과: [${meta.title}]\n법치주의: ${stats.integrity} / 여론: ${stats.opinion}\n대한민국 사법 시스템의 운명을 직접 결정해보세요!`,
                url: window.location.href
            };
            if (navigator.share) {
                try {
                    await navigator.share(shareData);
                } catch (e) {
                    console.log('공유 취소 또는 오류');
                }
            } else {
                alert('지원하지 않는 브라우저입니다. URL을 복사해주세요!');
            }
        };

        return (
            <div style={{ position: "fixed", inset: 0, height: "100dvh", zIndex: 100, background: meta.bg, color: "#fff", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "20px", textAlign: "center" }}>
                <h1 style={{ fontSize: "2.5rem", color: meta.color, marginBottom: "2rem", textShadow: endingId === "true_justice" ? "0 0 20px rgba(255, 215, 0, 0.5)" : "none" }}>{meta.title}</h1>
                <p style={{ fontSize: "1rem", color: "#ddd", marginBottom: "3rem" }}>
                    최종 사법 신뢰도: {stats.integrity} / 최종 대중 여론: {stats.opinion}
                </p>
                <div style={{ display: "flex", gap: "12px", flexDirection: "column", width: "min(100%, 300px)" }}>
                    <button 
                        onClick={handleShare}
                        style={{ padding: "16px 24px", fontSize: "1.1rem", background: "#fee500", color: "#000", fontWeight: "bold", border: "none", borderRadius: "12px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}
                    >
                        💬 결과 공유하기
                    </button>
                    <button 
                        onClick={() => setPhase("title")}
                        style={{ padding: "16px 24px", fontSize: "1rem", background: "rgba(255,255,255,0.1)", color: "white", border: "1px solid rgba(255,255,255,0.2)", borderRadius: "12px", cursor: "pointer" }}
                    >
                        다시 도전하기
                    </button>
                </div>
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
