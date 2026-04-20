"use client";

import { useState, useEffect } from "react";

export default function InstallPrompt() {
    const [isInstallable, setIsInstallable] = useState(false);
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (typeof window === "undefined") return;

        // 1) 이미 PWA로 실행 중이면 절대 표시 안 함
        const isStandalone =
            window.matchMedia("(display-mode: standalone)").matches ||
            (window.navigator as any).standalone === true;
        if (isStandalone) return;

        // 2) 이미 설치 완료한 유저는 절대 표시 안 함
        if (localStorage.getItem("pwa-installed") === "true") return;

        // 3) "다시 보지 않기"를 선택한 유저
        if (localStorage.getItem("pwa-install-never") === "true") return;

        // 4) 닫기만 누른 경우: 7일 쿨다운
        const dismissedAt = localStorage.getItem("pwa-install-dismissed-at");
        if (dismissedAt) {
            const daysSince = (Date.now() - parseInt(dismissedAt)) / (1000 * 60 * 60 * 24);
            if (daysSince < 7) return;
        }

        // 서비스 워커 등록
        if ("serviceWorker" in navigator) {
            navigator.serviceWorker
                .register("/sw.js")
                .then(() => console.log("Service Worker Registered"))
                .catch((err) => console.error("Service Worker Failed", err));
        }

        const handleBeforeInstallPrompt = (e: any) => {
            e.preventDefault();
            setDeferredPrompt(e);
            setIsInstallable(true);
            // 약간의 딜레이 후 부드럽게 등장
            setTimeout(() => setIsVisible(true), 1500);
        };

        window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

        window.addEventListener("appinstalled", () => {
            console.log("PWA 설치 완료");
            localStorage.setItem("pwa-installed", "true");
            setIsInstallable(false);
            setIsVisible(false);
            setDeferredPrompt(null);
        });

        return () => {
            window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
        };
    }, []);

    const handleInstallClick = async () => {
        if (!deferredPrompt) return;
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === "accepted") {
            localStorage.setItem("pwa-installed", "true");
        }
        setDeferredPrompt(null);
        setIsInstallable(false);
        setIsVisible(false);
    };

    const handleDismiss = () => {
        setIsVisible(false);
        localStorage.setItem("pwa-install-dismissed-at", Date.now().toString());
    };

    const handleNeverShow = () => {
        setIsVisible(false);
        localStorage.setItem("pwa-install-never", "true");
    };

    if (!isInstallable || !isVisible) return null;

    return (
        <div
            style={{
                position: "fixed",
                bottom: 0,
                left: 0,
                right: 0,
                zIndex: 9999,
                animation: "slideUpFade 0.4s ease-out",
            }}
        >
            <div
                style={{
                    maxWidth: "440px",
                    margin: "0 auto 16px",
                    padding: "20px",
                    background: "linear-gradient(145deg, #161b22 0%, #1c2333 100%)",
                    borderRadius: "16px",
                    border: "1px solid rgba(255,255,255,0.1)",
                    boxShadow: "0 -4px 30px rgba(0,0,0,0.5), 0 0 60px rgba(211,47,47,0.1)",
                    backdropFilter: "blur(20px)",
                    marginLeft: "12px",
                    marginRight: "12px",
                }}
            >
                {/* 상단: 안전 인증 배지 */}
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        marginBottom: "14px",
                        padding: "6px 12px",
                        background: "rgba(46, 160, 67, 0.15)",
                        borderRadius: "20px",
                        width: "fit-content",
                        border: "1px solid rgba(46, 160, 67, 0.3)",
                    }}
                >
                    <span style={{ fontSize: "14px" }}>🔒</span>
                    <span
                        style={{
                            fontSize: "11px",
                            fontWeight: "bold",
                            color: "#3fb950",
                            letterSpacing: "0.03em",
                        }}
                    >
                        안전한 웹앱 · 개인정보 수집 없음
                    </span>
                </div>

                {/* 중앙: 아이콘 + 메시지 */}
                <div style={{ display: "flex", gap: "14px", alignItems: "flex-start", marginBottom: "16px" }}>
                    <img
                        src="/logo-character.jpg"
                        alt="오른스푼"
                        style={{
                            width: 52,
                            height: 52,
                            borderRadius: 12,
                            border: "2px solid rgba(211,47,47,0.4)",
                            flexShrink: 0,
                        }}
                    />
                    <div>
                        <div
                            style={{
                                fontWeight: "900",
                                fontSize: "16px",
                                color: "#fff",
                                marginBottom: "6px",
                                lineHeight: 1.3,
                            }}
                        >
                            📲 오른스푼을 홈 화면에 추가하세요!
                        </div>
                        <div
                            style={{
                                fontSize: "13px",
                                color: "rgba(255,255,255,0.7)",
                                lineHeight: 1.5,
                            }}
                        >
                            앱스토어 설치 없이 바로가기만 추가됩니다.
                            <br />
                            <strong style={{ color: "rgba(255,255,255,0.9)" }}>
                                새 영상 업로드 시 알림
                            </strong>
                            을 받아보실 수 있습니다.
                        </div>
                    </div>
                </div>

                {/* 혜택 리스트 */}
                <div
                    style={{
                        display: "flex",
                        gap: "8px",
                        marginBottom: "16px",
                        flexWrap: "wrap",
                    }}
                >
                    {["⚡ 즉시 접속", "🔔 새 글 알림", "📱 앱처럼 사용", "🚫 광고 없는 설치"].map(
                        (text) => (
                            <span
                                key={text}
                                style={{
                                    fontSize: "11px",
                                    padding: "4px 10px",
                                    background: "rgba(255,255,255,0.06)",
                                    borderRadius: "12px",
                                    color: "rgba(255,255,255,0.8)",
                                    border: "1px solid rgba(255,255,255,0.08)",
                                    whiteSpace: "nowrap",
                                }}
                            >
                                {text}
                            </span>
                        )
                    )}
                </div>

                {/* 버튼 영역 */}
                <div style={{ display: "flex", gap: "8px", marginBottom: "10px" }}>
                    <button
                        onClick={handleInstallClick}
                        style={{
                            flex: 1,
                            padding: "12px",
                            background: "linear-gradient(135deg, #d32f2f 0%, #b71c1c 100%)",
                            color: "white",
                            border: "none",
                            borderRadius: "10px",
                            fontSize: "15px",
                            fontWeight: "900",
                            cursor: "pointer",
                            boxShadow: "0 4px 15px rgba(211,47,47,0.4)",
                            transition: "transform 0.2s",
                        }}
                    >
                        홈 화면에 추가하기
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
                        나중에
                    </button>
                </div>

                {/* 다시 보지 않기 */}
                <button
                    onClick={handleNeverShow}
                    style={{
                        width: "100%",
                        background: "transparent",
                        border: "none",
                        fontSize: "11px",
                        color: "rgba(255,255,255,0.3)",
                        cursor: "pointer",
                        padding: "4px",
                        textAlign: "center",
                    }}
                >
                    다시 보지 않기
                </button>
            </div>

            <style>{`
                @keyframes slideUpFade {
                    0% { opacity: 0; transform: translateY(30px); }
                    100% { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
}
