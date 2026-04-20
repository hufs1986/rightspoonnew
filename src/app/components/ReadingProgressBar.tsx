"use client";

import { useEffect, useState } from "react";

export default function ReadingProgressBar() {
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        const handleScroll = () => {
            const scrollTop = window.scrollY;
            const docHeight = document.documentElement.scrollHeight - window.innerHeight;
            if (docHeight <= 0) return;
            const scrolled = Math.min((scrollTop / docHeight) * 100, 100);
            setProgress(scrolled);
        };

        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    if (progress <= 0) return null;

    return (
        <div
            style={{
                position: "fixed",
                top: 0,
                left: 0,
                width: `${progress}%`,
                height: "3px",
                background: "linear-gradient(90deg, #d32f2f 0%, #ff6659 100%)",
                zIndex: 9999,
                transition: "width 50ms linear",
                boxShadow: "0 0 8px rgba(211,47,47,0.5)",
            }}
        />
    );
}
