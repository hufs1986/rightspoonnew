"use client";

import { useEffect } from "react";

interface AdSlotProps {
    slot?: string;
    format?: "auto" | "fluid" | "rectangle";
    responsive?: "true" | "false";
    className?: string;
    style?: React.CSSProperties;
}

export default function AdSlot({
    slot = "",
    format = "auto",
    responsive = "true",
    className = "",
    style = { display: "block", minHeight: "0px", margin: "0" }
}: AdSlotProps) {
    useEffect(() => {
        try {
            // @ts-ignore
            if (window) (window.adsbygoogle = window.adsbygoogle || []).push({});
        } catch (e) {
            console.error("AdSense Error: ", e);
        }
    }, []);

    // For local development, display a placeholder to help with layout tuning
    if (process.env.NODE_ENV === "development") {
        return (
            <div className={className} style={{ ...style, display: "flex", alignItems: "center", justifyContent: "center", background: "#f1f3f5", border: "1px dashed #ced4da", padding: "20px", color: "#868e96", borderRadius: "8px" }}>
                <span>📢 [구글 애드센스 광고 영역] - 개발 모드에서는 광고가 표시되지 않습니다.</span>
            </div>
        )
    }

    return (
        <ins
            className={`adsbygoogle ${className}`}
            style={style}
            data-ad-client="ca-pub-3058080931936742"
            data-ad-slot={slot}
            data-ad-format={format}
            data-full-width-responsive={responsive}
        />
    );
}
