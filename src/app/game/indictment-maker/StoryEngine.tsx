"use client";

import { useState, useEffect } from "react";
import { STORY_DATA, type StoryNodeId, type StoryChoice } from "./storyData";
import DialogueSystem from "./DialogueSystem";
import styles from "./game.module.css";
import { createClient } from "@/utils/supabase/client";

export default function StoryEngine() {
    const [phase, setPhase] = useState<"title" | "playing" | "ending">("title");
    const [currentNodeId, setCurrentNodeId] = useState<StoryNodeId>("prologue");
    const [stats, setStats] = useState({ integrity: 50, opinion: 50 });
    const [endingId, setEndingId] = useState<string | null>(null);

    // 통계 데이터 상태
    const [endingStats, setEndingStats] = useState<Record<string, number>>({});
    const [totalPlays, setTotalPlays] = useState<number>(0);

    // 타이틀 화면에서 통계 불러오기
    useEffect(() => {
        if (phase === "title") {
            const fetchStats = async () => {
                const supabase = createClient();
                const { data } = await supabase.from("ending_stats").select("*");
                if (data) {
                    const statsMap: Record<string, number> = {};
                    let total = 0;
                    data.forEach(row => {
                        statsMap[row.id] = row.count;
                        total += row.count;
                    });
                    setEndingStats(statsMap);
                    setTotalPlays(total);
                }
            };
            fetchStats();
        }
    }, [phase]);

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

        if (choice.nextNodeId === "check_ending") {
            if (stats.opinion < 20) {
                setCurrentNodeId("ending_b"); 
            } else if (stats.integrity >= 70 && stats.opinion >= 40) {
                setCurrentNodeId("ending_d"); 
            } else {
                setCurrentNodeId("ending_c"); 
            }
        } else {
            setCurrentNodeId(choice.nextNodeId);
        }
    };

    const handleNextNode = (nextNodeId: string) => {
        setCurrentNodeId(nextNodeId);
    };

    const handleEnding = async (id: string) => {
        setEndingId(id);
        setPhase("ending");
        
        // Supabase에 엔딩 카운트 증가
        const mapping: Record<string, string> = {
            "ending_a": "bad_conceal",
            "ending_b": "bad_subordinate",
            "ending_c": "normal_scars",
            "ending_d": "true_justice"
        };
        const mappedId = mapping[id] || id;
        
        try {
            const supabase = createClient();
            await supabase.rpc('increment_ending_count', { ending_id_param: mappedId });
        } catch (e) {
            console.error("Failed to increment stats", e);
        }
    };

    if (phase === "title") {
        return (
            <div style={{ position: "fixed", inset: 0, height: "100dvh", zIndex: 100, background: "#090b14", color: "#fff", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                <h1 style={{ fontSize: "clamp(1.5rem, 5vw, 2.5rem)", color: "#ff3333", marginBottom: "1rem", textAlign: "center", wordBreak: "keep-all" }}>공소취소 방어전:<br/>진실의 법정</h1>
                <p style={{ marginBottom: "2rem", color: "#aaa" }}>법치주의를 수호할 것인가, 타협할 것인가.</p>
                <button 
                    onClick={handleStart}
                    style={{ padding: "16px 32px", fontSize: "1.2rem", background: "#d32f2f", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", marginBottom: "2rem" }}
                >
                    새 게임 시작
                </button>

                {/* 통계 화면 */}
                <div style={{ background: "rgba(255,255,255,0.05)", padding: "16px", borderRadius: "12px", width: "min(90%, 400px)", fontSize: "0.9rem" }}>
                    <div style={{ textAlign: "center", marginBottom: "12px", color: "#ccc", fontWeight: "bold" }}>
                        현재까지 누적 플레이: {totalPlays.toLocaleString()}회
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: "8px", color: "#999" }}>
                        <div>배드엔딩 (진실의 은폐):</div>
                        <div style={{ color: "#ff5555" }}>{endingStats["bad_conceal"] || 0}명</div>
                        
                        <div>배드엔딩 (사법부의 예속):</div>
                        <div style={{ color: "#ff5555" }}>{endingStats["bad_subordinate"] || 0}명</div>
                        
                        <div>노멀엔딩 (상처뿐인 원칙):</div>
                        <div style={{ color: "#aaaaaa" }}>{endingStats["normal_scars"] || 0}명</div>
                        
                        <div>트루엔딩 (법치주의의 증명):</div>
                        <div style={{ color: "#ffd700", fontWeight: "bold" }}>{endingStats["true_justice"] || 0}명</div>
                    </div>
                </div>

                {/* 공유 버튼 */}
                <button
                    onClick={async () => {
                        const shareData = {
                            title: '공소취소 방어전: 진실의 법정',
                            text: '당신의 선택이 법치주의의 운명을 결정합니다. 트루엔딩에 도전해보세요!',
                            url: window.location.href
                        };
                        if (navigator.share) {
                            try { await navigator.share(shareData); } catch (e) { /* 취소 */ }
                        } else {
                            await navigator.clipboard.writeText(window.location.href);
                            alert('링크가 복사되었습니다!');
                        }
                    }}
                    style={{ marginTop: "16px", padding: "14px 28px", fontSize: "1rem", background: "#fee500", color: "#000", fontWeight: "bold", border: "none", borderRadius: "12px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}
                >
                    💬 친구에게 공유하기
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

        const mapping: Record<string, string> = {
            "ending_a": "bad_conceal",
            "ending_b": "bad_subordinate",
            "ending_c": "normal_scars",
            "ending_d": "true_justice"
        };
        const mappedId = endingId ? mapping[endingId] : null;

        const meta = mappedId && ENDING_META[mappedId] ? ENDING_META[mappedId] : { title: "종료", color: "#fff", bg: "#000" };

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
                <h1 style={{ fontSize: "clamp(1.5rem, 5vw, 2.5rem)", color: meta.color, marginBottom: "2rem", textShadow: mappedId === "true_justice" ? "0 0 20px rgba(255, 215, 0, 0.5)" : "none", wordBreak: "keep-all" }}>{meta.title}</h1>
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
