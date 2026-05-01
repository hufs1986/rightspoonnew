"use client";

import { useState, useEffect } from "react";

/**
 * 기사 하단에 표시되는 비침습적 푸시 구독 바.
 * 글을 끝까지 읽은 유저 = 관심이 높은 유저 → 구독 전환율 높음.
 */

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!;

function urlBase64ToUint8Array(base64String: string) {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}

export default function ArticlePushBar() {
    const [show, setShow] = useState(false);
    const [done, setDone] = useState(false);

    useEffect(() => {
        if (typeof window === "undefined") return;
        if (!("Notification" in window) || !("serviceWorker" in navigator)) return;
        if (localStorage.getItem("push-subscribed") === "true") return;
        if (Notification.permission === "denied") return;
        if (Notification.permission === "granted") return;

        setShow(true);
    }, []);

    async function handleSubscribe() {
        try {
            const permission = await Notification.requestPermission();
            if (permission === "granted") {
                const registration = await navigator.serviceWorker.ready;
                const subscription = await registration.pushManager.subscribe({
                    userVisibleOnly: true,
                    applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
                });
                const res = await fetch("/api/push/subscribe", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(subscription.toJSON()),
                });
                if (res.ok) {
                    localStorage.setItem("push-subscribed", "true");
                    setDone(true);
                    setTimeout(() => setShow(false), 2000);
                }
            }
        } catch (err) {
            console.error("Article push bar subscribe error:", err);
        }
    }

    if (!show) return null;

    return (
        <div
            style={{
                margin: "32px 0",
                padding: "20px 24px",
                background: "linear-gradient(135deg, rgba(211,47,47,0.06) 0%, rgba(211,47,47,0.02) 100%)",
                border: "1px solid rgba(211,47,47,0.15)",
                borderRadius: "16px",
                display: "flex",
                alignItems: "center",
                gap: "16px",
                flexWrap: "wrap",
            }}
        >
            <div style={{ flex: 1, minWidth: "200px" }}>
                <div
                    style={{
                        fontSize: "15px",
                        fontWeight: 700,
                        color: "var(--color-text-primary)",
                        marginBottom: "4px",
                    }}
                >
                    {done ? "✅ 구독 완료!" : "🔔 이런 글, 놓치고 싶지 않다면?"}
                </div>
                <div
                    style={{
                        fontSize: "13px",
                        color: "var(--color-text-muted)",
                        lineHeight: 1.5,
                    }}
                >
                    {done
                        ? "새 칼럼이 올라오면 바로 알려드릴게요."
                        : "새 칼럼 · 웹툰 알림을 받아보세요. 광고 없이, 언제든 해제 가능."}
                </div>
            </div>

            {!done && (
                <button
                    onClick={handleSubscribe}
                    style={{
                        padding: "10px 20px",
                        background: "linear-gradient(135deg, #d32f2f 0%, #b71c1c 100%)",
                        color: "#fff",
                        border: "none",
                        borderRadius: "10px",
                        fontSize: "14px",
                        fontWeight: 700,
                        cursor: "pointer",
                        boxShadow: "0 2px 10px rgba(211,47,47,0.3)",
                        whiteSpace: "nowrap",
                    }}
                >
                    알림 받기
                </button>
            )}
        </div>
    );
}
