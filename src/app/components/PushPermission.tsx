"use client";

import { useState, useEffect } from "react";

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

export default function PushPermission() {
    const [showPrompt, setShowPrompt] = useState(false);
    const [isSubscribed, setIsSubscribed] = useState(false);

    useEffect(() => {
        if (typeof window === "undefined") return;

        // PWA가 아니면 표시하지 않음
        const isStandalone =
            window.matchMedia("(display-mode: standalone)").matches ||
            (window.navigator as any).standalone === true;

        // 이미 구독한 사용자
        if (localStorage.getItem("push-subscribed") === "true") {
            setIsSubscribed(true);
            return;
        }

        // 이미 거부한 사용자 - 1일 쿨다운 (영구 거부 방지)
        const dismissedAt = localStorage.getItem("push-dismissed-at");
        if (dismissedAt) {
            const hoursSince = (Date.now() - parseInt(dismissedAt)) / (1000 * 60 * 60);
            if (hoursSince < 24) return;
        }

        // 브라우저가 알림을 지원하지 않으면 표시하지 않음
        if (!("Notification" in window) || !("serviceWorker" in navigator)) return;

        // 이미 허용된 상태라면 자동으로 구독 처리
        if (Notification.permission === "granted") {
            autoSubscribe();
            return;
        }

        // 이미 거부된 상태라면 표시하지 않음
        if (Notification.permission === "denied") return;

        // 설치 배너가 보이는 동안은 표시하지 않음
        let installBannerVisible = false;
        const onInstallBanner = (e: Event) => {
            installBannerVisible = (e as CustomEvent).detail;
            if (installBannerVisible) {
                setShowPrompt(false);
            }
        };
        window.addEventListener("install-banner-visible", onInstallBanner);

        // PWA에서만 또는 일반 브라우저에서도 표시 (설치 배너 닫은 후 충분한 지연)
        const timer = setTimeout(() => {
            if (!installBannerVisible) {
                setShowPrompt(true);
            }
        }, isStandalone ? 2000 : 20000);

        return () => {
            clearTimeout(timer);
            window.removeEventListener("install-banner-visible", onInstallBanner);
        };
    }, []);

    async function autoSubscribe() {
        try {
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
                setIsSubscribed(true);
            }
        } catch (err) {
            console.error("Auto push subscribe failed:", err);
        }
    }

    async function handleAllow() {
        try {
            const permission = await Notification.requestPermission();
            if (permission === "granted") {
                await autoSubscribe();
            }
            setShowPrompt(false);
        } catch (err) {
            console.error("Push permission error:", err);
            setShowPrompt(false);
        }
    }

    function handleDismiss() {
        setShowPrompt(false);
        localStorage.setItem("push-dismissed-at", Date.now().toString());
    }

    if (!showPrompt || isSubscribed) return null;

    return (
        <div
            style={{
                position: "fixed",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                zIndex: 10000,
                animation: "fadeScaleIn 0.3s ease-out",
            }}
        >
            {/* 배경 오버레이 */}
            <div
                onClick={handleDismiss}
                style={{
                    position: "fixed",
                    inset: 0,
                    background: "rgba(0,0,0,0.6)",
                    backdropFilter: "blur(4px)",
                    zIndex: -1,
                }}
            />

            <div
                style={{
                    width: "min(360px, 90vw)",
                    background: "linear-gradient(145deg, #161b22 0%, #1c2333 100%)",
                    borderRadius: "20px",
                    padding: "28px 24px",
                    border: "1px solid rgba(255,255,255,0.1)",
                    boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
                    textAlign: "center",
                }}
            >
                {/* 아이콘 */}
                <div
                    style={{
                        width: "64px",
                        height: "64px",
                        borderRadius: "50%",
                        background: "linear-gradient(135deg, #d32f2f 0%, #ff6659 100%)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "32px",
                        margin: "0 auto 16px",
                        boxShadow: "0 4px 20px rgba(211,47,47,0.4)",
                    }}
                >
                    🔔
                </div>

                <h3
                    style={{
                        color: "#fff",
                        fontSize: "18px",
                        fontWeight: "900",
                        marginBottom: "8px",
                    }}
                >
                    새 영상 알림을 받아보시겠어요?
                </h3>

                <p
                    style={{
                        color: "rgba(255,255,255,0.6)",
                        fontSize: "13px",
                        lineHeight: 1.6,
                        marginBottom: "20px",
                    }}
                >
                    오른스푼에 새로운 콘텐츠가 올라오면
                    <br />
                    가장 먼저 알려드립니다.
                </p>

                <div style={{ display: "flex", gap: "10px" }}>
                    <button
                        onClick={handleAllow}
                        style={{
                            flex: 1,
                            padding: "12px",
                            background: "linear-gradient(135deg, #d32f2f 0%, #b71c1c 100%)",
                            color: "#fff",
                            border: "none",
                            borderRadius: "10px",
                            fontSize: "15px",
                            fontWeight: "900",
                            cursor: "pointer",
                            boxShadow: "0 4px 15px rgba(211,47,47,0.4)",
                        }}
                    >
                        🔔 알림 받기
                    </button>
                    <button
                        onClick={handleDismiss}
                        style={{
                            padding: "12px 16px",
                            background: "rgba(255,255,255,0.06)",
                            border: "1px solid rgba(255,255,255,0.1)",
                            borderRadius: "10px",
                            color: "rgba(255,255,255,0.5)",
                            fontSize: "14px",
                            cursor: "pointer",
                        }}
                    >
                        괜찮아요
                    </button>
                </div>
            </div>

            <style>{`
                @keyframes fadeScaleIn {
                    0% { opacity: 0; transform: translate(-50%, -50%) scale(0.9); }
                    100% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
                }
            `}</style>
        </div>
    );
}
