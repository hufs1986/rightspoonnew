"use client";

declare global {
    interface Window {
        gtag?: (
            command: "event",
            eventName: string,
            params?: Record<string, string | number>,
        ) => void;
    }
}

export function trackGameEvent(eventName: string, params: Record<string, string | number>) {
    if (typeof window === "undefined" || typeof window.gtag !== "function") return;
    window.gtag("event", eventName, params);
}
