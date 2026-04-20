"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";

export default function DailyQuote() {
    const [quote, setQuote] = useState<string | null>(null);

    useEffect(() => {
        const fetchQuote = async () => {
            const supabase = createClient();
            const { data, error } = await supabase
                .from("daily_quotes")
                .select("quote_text")
                .eq("active", true)
                .order("created_at", { ascending: false })
                .limit(1)
                .single();

            if (!error && data) {
                setQuote(data.quote_text);
            }
        };

        fetchQuote();
    }, []);

    if (!quote) return null;

    return (
        <div style={{
            margin: "0 auto",
            maxWidth: "1100px",
            padding: "0 20px",
            marginBottom: "16px",
            marginTop: "8px" // 긴급배너와 약간의 간격 확보
        }}>
            <div style={{
                background: "linear-gradient(135deg, #11141d 0%, #171b26 100%)",
                border: "1px solid rgba(211,47,47,0.3)",
                borderRadius: "16px",
                padding: "20px 24px",
                display: "flex",
                alignItems: "center",
                gap: "16px",
                position: "relative",
                overflow: "hidden",
                boxShadow: "0 6px 20px rgba(0,0,0,0.5), inset 0 2px 0 rgba(255,255,255,0.05)"
            }}>
                {/* 좌측 레드 포인트 라인 */}
                <div style={{
                    position: "absolute",
                    left: 0,
                    top: 0,
                    bottom: 0,
                    width: "4px",
                    background: "var(--color-primary)"
                }} />

                {/* 인용구 아이콘 */}
                <div style={{
                    background: "rgba(211,47,47,0.1)",
                    color: "var(--color-primary)",
                    borderRadius: "50%",
                    width: "42px",
                    height: "42px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "20px",
                    flexShrink: 0,
                    fontWeight: "bold"
                }}>
                    ❝
                </div>

                {/* 한 줄 텍스트 */}
                <div style={{ flex: 1 }}>
                    <div style={{ fontSize: "13px", color: "var(--color-primary)", fontWeight: "700", marginBottom: "4px", letterSpacing: "1px" }}>
                        TODAY&apos;S HOOK
                    </div>
                    <div style={{ fontSize: "16px", fontWeight: "600", color: "#f0f6fc", lineHeight: 1.4 }}>
                        {quote}
                    </div>
                </div>
            </div>
        </div>
    );
}
