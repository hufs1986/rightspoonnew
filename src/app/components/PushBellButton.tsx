"use client";

import { useState, useEffect } from "react";

/**
 * 헤더용 🔔 벨 아이콘 버튼.
 * 아직 푸시 구독을 안 한 유저에게만 표시됨.
 * 클릭하면 알림 권한을 요청하고 구독 처리.
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

export default function PushBellButton() {
    const [show, setShow] = useState(false);
    const [pulse, setPulse] = useState(false);

    useEffect(() => {
        if (typeof window === "undefined") return;
        if (!("Notification" in window) || !("serviceWorker" in navigator)) return;

        const subscribed = localStorage.getItem("push-subscribed") === "true";
        const denied = Notification.permission === "denied";

        if (!subscribed && !denied) {
            setShow(true);
            // 3초 후 한번 반짝 애니메이션
            setTimeout(() => setPulse(true), 3000);
            setTimeout(() => setPulse(false), 4500);
        }
    }, []);

    async function handleClick() {
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
                    setShow(false);
                    // 알림 구독 완료 피드백
                    alert("🔔 알림 구독 완료! 새 글이 올라오면 바로 알려드립니다.");
                }
            }
        } catch (err) {
            console.error("Push subscribe error:", err);
        }
    }

    if (!show) return null;

    return (
        <button
            onClick={handleClick}
            aria-label="알림 구독"
            title="새 글 알림 받기"
            style={{
                background: "none",
                border: "none",
                fontSize: "18px",
                cursor: "pointer",
                padding: "6px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                position: "relative",
                animation: pulse ? "bellShake 0.6s ease" : "none",
            }}
        >
            🔔
            {/* 미구독 표시 빨간 점 */}
            <span
                style={{
                    position: "absolute",
                    top: "4px",
                    right: "4px",
                    width: "8px",
                    height: "8px",
                    borderRadius: "50%",
                    background: "#d32f2f",
                    border: "1.5px solid var(--color-bg, #0d1117)",
                }}
            />
            <style>{`
                @keyframes bellShake {
                    0%, 100% { transform: rotate(0); }
                    20% { transform: rotate(15deg); }
                    40% { transform: rotate(-15deg); }
                    60% { transform: rotate(8deg); }
                    80% { transform: rotate(-8deg); }
                }
            `}</style>
        </button>
    );
}
