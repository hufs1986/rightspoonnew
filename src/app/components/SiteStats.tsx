"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";

export default function SiteStats() {
    const [visitorCount, setVisitorCount] = useState<number | null>(null);
    const [downloadCount, setDownloadCount] = useState<number | null>(null);

    useEffect(() => {
        const supabase = createClient();

        const loadAndTrack = async () => {
            // 세션당 1번만 방문자 수 증가
            if (!sessionStorage.getItem("visitor-counted")) {
                await supabase.rpc("increment_visitor_count");
                sessionStorage.setItem("visitor-counted", "true");
            }

            // 현재 통계 조회
            const { data } = await supabase
                .from("site_stats")
                .select("visitor_count, download_count")
                .eq("id", 1)
                .single();

            if (data) {
                setVisitorCount(data.visitor_count);
                setDownloadCount(data.download_count);
            }
        };

        loadAndTrack();
    }, []);

    if (visitorCount === null) return null;

    return (
        <div
            style={{
                display: "flex",
                justifyContent: "center",
                gap: "24px",
                padding: "16px 0 8px",
                flexWrap: "wrap",
            }}
        >
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    background: "rgba(255,255,255,0.04)",
                    padding: "8px 16px",
                    borderRadius: "20px",
                    border: "1px solid rgba(255,255,255,0.08)",
                }}
            >
                <span style={{ fontSize: "16px" }}>👥</span>
                <span
                    style={{
                        fontSize: "12px",
                        color: "var(--color-text-muted)",
                        fontWeight: 500,
                    }}
                >
                    전체 방문
                </span>
                <span
                    style={{
                        fontSize: "14px",
                        color: "var(--color-text-primary)",
                        fontWeight: 700,
                        fontFamily: "var(--font-display)",
                    }}
                >
                    {visitorCount.toLocaleString()}명
                </span>
            </div>
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    background: "rgba(255,255,255,0.04)",
                    padding: "8px 16px",
                    borderRadius: "20px",
                    border: "1px solid rgba(255,255,255,0.08)",
                }}
            >
                <span style={{ fontSize: "16px" }}>📲</span>
                <span
                    style={{
                        fontSize: "12px",
                        color: "var(--color-text-muted)",
                        fontWeight: 500,
                    }}
                >
                    앱 설치
                </span>
                <span
                    style={{
                        fontSize: "14px",
                        color: "var(--color-text-primary)",
                        fontWeight: 700,
                        fontFamily: "var(--font-display)",
                    }}
                >
                    {downloadCount?.toLocaleString() ?? 0}회
                </span>
            </div>
        </div>
    );
}
