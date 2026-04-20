"use client";

import { useState, useEffect } from "react";

export default function InstallBanner() {
    const [show, setShow] = useState(false);
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

    useEffect(() => {
        if (typeof window === "undefined") return;

        // PWA 스탠드얼론 모드면 숨기기
        const isStandalone =
            window.matchMedia("(display-mode: standalone)").matches ||
            (window.navigator as any).standalone === true;
        if (isStandalone) return;

        // v2 마이그레이션
        if (!localStorage.getItem("pwa-v2-migrated")) {
            localStorage.removeItem("pwa-installed");
            localStorage.removeItem("pwa-install-never");
            localStorage.removeItem("pwa-install-dismissed-at");
            localStorage.removeItem("push-dismissed");
            localStorage.setItem("pwa-v2-migrated", "true");
        }

        // 이미 설치 완료 시
        if (localStorage.getItem("pwa-installed") === "true") return;

        // 배너를 닫은 적이 있으면 (7일 쿨다운)
        const closedAt = localStorage.getItem("install-banner-closed");
        if (closedAt) {
            const daysSince = (Date.now() - parseInt(closedAt)) / (1000 * 60 * 60 * 24);
            if (daysSince < 7) return;
        }

        // 서비스 워커 등록
        if ("serviceWorker" in navigator) {
            navigator.serviceWorker
                .register("/sw.js")
                .then(() => console.log("SW Registered"))
                .catch((err) => console.error("SW Failed", err));
        }

        // 설치 가능 시 프롬프트 저장
        const handler = (e: any) => {
            e.preventDefault();
            setDeferredPrompt(e);
        };
        window.addEventListener("beforeinstallprompt", handler);

        window.addEventListener("appinstalled", () => {
            localStorage.setItem("pwa-installed", "true");
            setShow(false);
        });

        // 무조건 배너 표시 (3초 후 부드럽게)
        const timer = setTimeout(() => setShow(true), 3000);
        return () => {
            clearTimeout(timer);
            window.removeEventListener("beforeinstallprompt", handler);
        };
    }, []);

    const handleInstall = async () => {
        if (deferredPrompt) {
            deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;
            if (outcome === "accepted") {
                localStorage.setItem("pwa-installed", "true");
                setShow(false);
            }
            setDeferredPrompt(null);
        } else {
            alert(
                "📱 앱 설치 가이드\n\n" +
                "[아이폰 / 사파리]\n하단 가운데 공유(⤴) → '홈 화면에 추가'\n\n" +
                "[안드로이드 / 크롬]\n우측 상단 메뉴(⋮) → '홈 화면에 추가' 또는 '앱 설치'\n\n" +
                "[삼성 인터넷]\n우측 하단 메뉴(≡) → '현재 페이지 추가' → '홈 화면'\n\n" +
                "※ 네이버·카카오 앱 내에서는 '다른 브라우저로 열기' 후 진행"
            );
        }
    };

    const handleClose = () => {
        setShow(false);
        localStorage.setItem("install-banner-closed", Date.now().toString());
    };

    if (!show) return null;

    return (
        <div
            style={{
                width: "100%",
                background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)",
                borderBottom: "2px solid #d32f2f",
                padding: "12px 16px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "12px",
                animation: "bannerSlideDown 0.4s ease-out",
                flexWrap: "wrap",
            }}
        >
            <span style={{ fontSize: "14px", color: "rgba(255,255,255,0.9)", fontWeight: 500 }}>
                📲 오른스푼을 홈 화면에 추가하세요!
            </span>
            <button
                onClick={handleInstall}
                style={{
                    padding: "8px 20px",
                    background: "linear-gradient(135deg, #d32f2f 0%, #b71c1c 100%)",
                    color: "white",
                    border: "none",
                    borderRadius: "20px",
                    fontSize: "13px",
                    fontWeight: "bold",
                    cursor: "pointer",
                    boxShadow: "0 2px 8px rgba(211,47,47,0.4)",
                    whiteSpace: "nowrap",
                }}
            >
                설치하기
            </button>
            <button
                onClick={handleClose}
                style={{
                    background: "transparent",
                    border: "none",
                    color: "rgba(255,255,255,0.4)",
                    fontSize: "18px",
                    cursor: "pointer",
                    padding: "0 4px",
                    lineHeight: 1,
                }}
                aria-label="닫기"
            >
                ✕
            </button>
            <style>{`
                @keyframes bannerSlideDown {
                    0% { opacity: 0; transform: translateY(-100%); }
                    100% { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
}
