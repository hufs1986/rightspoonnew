"use client";

import { useState, useEffect } from "react";

export default function InstallPrompt() {
    const [isInstallable, setIsInstallable] = useState(false);
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
    const [isDismissed, setIsDismissed] = useState(false);

    useEffect(() => {
        // 클라이언트에서 한 번 해제(닫기)한 적 있는지 확인
        if (typeof window !== "undefined") {
            const dismissed = localStorage.getItem("pwa-install-dismissed");
            if (dismissed === "true") {
                setIsDismissed(true);
            }
            if ('serviceWorker' in navigator) {
                navigator.serviceWorker.register('/sw.js')
                    .then(() => console.log('Service Worker Registered'))
                    .catch(err => console.error('Service Worker Failed', err));
            }
        }

        const handleBeforeInstallPrompt = (e: any) => {
            // 기본 설치 프롬프트 무시
            e.preventDefault();
            // 이벤트 저장
            setDeferredPrompt(e);
            // 설치 가능 상태로 변경
            setIsInstallable(true);
        };

        window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

        // 앱이 성공적으로 설치되었을 때
        window.addEventListener("appinstalled", () => {
            console.log("PWA 설치 완료");
            setIsInstallable(false);
            setDeferredPrompt(null);
        });

        return () => {
            window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
        };
    }, []);

    const handleInstallClick = async () => {
        if (!deferredPrompt) return;

        // 설치 프롬프트 표시
        deferredPrompt.prompt();

        // 사용자 응답 기다림
        const { outcome } = await deferredPrompt.userChoice;
        console.log(`사용자 설치 응답: ${outcome}`);

        // 프롬프트는 한 번만 사용할 수 있으므로 null 처리
        setDeferredPrompt(null);
        setIsInstallable(false);
    };

    const handleDismiss = () => {
        setIsDismissed(true);
        localStorage.setItem("pwa-install-dismissed", "true");
    };

    if (!isInstallable || isDismissed) return null;

    return (
        <div style={{
            position: "fixed",
            bottom: "20px",
            left: "50%",
            transform: "translateX(-50%)",
            width: "90%",
            maxWidth: "400px",
            backgroundColor: "white",
            boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.3)",
            borderRadius: "12px",
            padding: "16px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            zIndex: 9999,
            border: "1px solid var(--color-border)"
        }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <img src="/logo-v2.png" alt="logo" style={{ width: 40, height: 40, borderRadius: 8 }} />
                <div style={{ display: "flex", flexDirection: "column" }}>
                    <span style={{ fontWeight: "bold", fontSize: "14px", color: "var(--color-text-primary)" }}>오른스푼 앱 설치하기</span>
                    <span style={{ fontSize: "12px", color: "var(--color-text-secondary)" }}>바탕화면에 추가하여 더 빠르게 접속하세요!</span>
                </div>
            </div>
            <div style={{ display: "flex", gap: "8px" }}>
                <button
                    onClick={handleInstallClick}
                    style={{
                        padding: "6px 12px",
                        background: "var(--color-accent)",
                        color: "white",
                        border: "none",
                        borderRadius: "6px",
                        fontSize: "13px",
                        fontWeight: "bold",
                        cursor: "pointer"
                    }}
                >
                    설치
                </button>
                <button
                    onClick={handleDismiss}
                    style={{
                        background: "transparent",
                        border: "none",
                        color: "var(--color-text-muted)",
                        fontSize: "20px",
                        cursor: "pointer",
                        padding: "4px"
                    }}
                    aria-label="닫기"
                >
                    ×
                </button>
            </div>
        </div>
    );
}
