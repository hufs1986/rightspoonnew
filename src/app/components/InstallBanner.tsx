"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";

export default function InstallBanner() {
    const [show, setShow] = useState(false);
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
    const [isClosing, setIsClosing] = useState(false);

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

        // 배너를 닫은 적이 있으면 (3일 쿨다운으로 단축)
        const closedAt = localStorage.getItem("install-banner-closed");
        if (closedAt) {
            const daysSince = (Date.now() - parseInt(closedAt)) / (1000 * 60 * 60 * 24);
            if (daysSince < 3) return;
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
            const sb = createClient();
            sb.rpc("increment_download_count");
        });

        // 스크롤 후 또는 5초 후 표시 (더 자연스러운 타이밍)
        let triggered = false;
        const triggerShow = () => {
            if (triggered) return;
            triggered = true;
            setShow(true);
        };

        const scrollHandler = () => {
            if (window.scrollY > 300) {
                triggerShow();
                window.removeEventListener("scroll", scrollHandler);
            }
        };
        window.addEventListener("scroll", scrollHandler);
        const timer = setTimeout(triggerShow, 5000);

        return () => {
            clearTimeout(timer);
            window.removeEventListener("scroll", scrollHandler);
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
                const sb = createClient();
                sb.rpc("increment_download_count");
            }
            setDeferredPrompt(null);
        } else {
            // iOS / 삼성인터넷 등 beforeinstallprompt 미지원 브라우저
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
        setIsClosing(true);
        setTimeout(() => {
            setShow(false);
            setIsClosing(false);
            localStorage.setItem("install-banner-closed", Date.now().toString());
        }, 300);
    };

    if (!show) return null;

    return (
        <>
            {/* 백드롭 오버레이 */}
            <div
                onClick={handleClose}
                style={{
                    position: "fixed",
                    inset: 0,
                    background: "rgba(0,0,0,0.6)",
                    backdropFilter: "blur(4px)",
                    WebkitBackdropFilter: "blur(4px)",
                    zIndex: 9998,
                    animation: isClosing
                        ? "installFadeOut 0.3s ease forwards"
                        : "installFadeIn 0.3s ease forwards",
                }}
            />

            {/* 바텀 시트 모달 */}
            <div
                style={{
                    position: "fixed",
                    bottom: 0,
                    left: 0,
                    right: 0,
                    zIndex: 9999,
                    background: "linear-gradient(180deg, #1a1f36 0%, #0d1117 100%)",
                    borderTop: "2px solid #d32f2f",
                    borderRadius: "20px 20px 0 0",
                    padding: "28px 24px 36px",
                    boxShadow: "0 -8px 40px rgba(0,0,0,0.5), 0 0 30px rgba(211,47,47,0.15)",
                    animation: isClosing
                        ? "installSlideDown 0.3s ease forwards"
                        : "installSlideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards",
                    maxWidth: "500px",
                    margin: "0 auto",
                }}
            >
                {/* 드래그 핸들 */}
                <div style={{
                    width: "40px",
                    height: "4px",
                    background: "rgba(255,255,255,0.2)",
                    borderRadius: "2px",
                    margin: "0 auto 20px",
                }} />

                {/* 닫기 버튼 */}
                <button
                    onClick={handleClose}
                    style={{
                        position: "absolute",
                        top: "16px",
                        right: "16px",
                        background: "rgba(255,255,255,0.08)",
                        border: "none",
                        color: "rgba(255,255,255,0.5)",
                        fontSize: "16px",
                        cursor: "pointer",
                        width: "32px",
                        height: "32px",
                        borderRadius: "50%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                    }}
                    aria-label="닫기"
                >
                    ✕
                </button>

                {/* 앱 아이콘 + 타이틀 */}
                <div style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "14px",
                    marginBottom: "20px",
                }}>
                    <div style={{
                        width: "56px",
                        height: "56px",
                        borderRadius: "14px",
                        background: "linear-gradient(135deg, #d32f2f 0%, #b71c1c 100%)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "28px",
                        boxShadow: "0 4px 16px rgba(211,47,47,0.4)",
                        flexShrink: 0,
                    }}>
                        📰
                    </div>
                    <div>
                        <div style={{
                            fontSize: "18px",
                            fontWeight: 700,
                            color: "#f0f6fc",
                            lineHeight: 1.3,
                        }}>
                            오른스푼 앱 설치
                        </div>
                        <div style={{
                            fontSize: "13px",
                            color: "#8b949e",
                            marginTop: "2px",
                        }}>
                            무료 · 설치 3초 · 용량 0MB
                        </div>
                    </div>
                </div>

                {/* 혜택 목록 */}
                <div style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "10px",
                    marginBottom: "24px",
                    padding: "16px",
                    background: "rgba(255,255,255,0.03)",
                    borderRadius: "12px",
                    border: "1px solid rgba(255,255,255,0.06)",
                }}>
                    {[
                        { icon: "⚡", text: "새 기사 알림을 바로 받아보세요" },
                        { icon: "🚀", text: "홈 화면에서 한 번에 바로 접속" },
                        { icon: "📱", text: "앱처럼 깔끔한 전체화면 모드" },
                    ].map((item, i) => (
                        <div key={i} style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "10px",
                        }}>
                            <span style={{ fontSize: "16px", flexShrink: 0 }}>{item.icon}</span>
                            <span style={{
                                fontSize: "14px",
                                color: "#c9d1d9",
                                lineHeight: 1.4,
                            }}>{item.text}</span>
                        </div>
                    ))}
                </div>

                {/* CTA 버튼 */}
                <button
                    onClick={handleInstall}
                    style={{
                        width: "100%",
                        padding: "16px 0",
                        background: "linear-gradient(135deg, #d32f2f 0%, #c62828 50%, #b71c1c 100%)",
                        color: "white",
                        border: "none",
                        borderRadius: "14px",
                        fontSize: "16px",
                        fontWeight: 700,
                        cursor: "pointer",
                        boxShadow: "0 4px 20px rgba(211,47,47,0.5), inset 0 1px 1px rgba(255,255,255,0.15)",
                        letterSpacing: "0.5px",
                        animation: "installPulse 2s ease-in-out infinite",
                    }}
                >
                    📲 지금 설치하기
                </button>

                {/* 나중에 버튼 */}
                <button
                    onClick={handleClose}
                    style={{
                        width: "100%",
                        padding: "12px 0",
                        background: "transparent",
                        color: "#8b949e",
                        border: "none",
                        fontSize: "13px",
                        cursor: "pointer",
                        marginTop: "8px",
                    }}
                >
                    나중에 할게요
                </button>
            </div>

            <style>{`
                @keyframes installSlideUp {
                    0% { opacity: 0; transform: translateY(100%); }
                    100% { opacity: 1; transform: translateY(0); }
                }
                @keyframes installSlideDown {
                    0% { opacity: 1; transform: translateY(0); }
                    100% { opacity: 0; transform: translateY(100%); }
                }
                @keyframes installFadeIn {
                    0% { opacity: 0; }
                    100% { opacity: 1; }
                }
                @keyframes installFadeOut {
                    0% { opacity: 1; }
                    100% { opacity: 0; }
                }
                @keyframes installPulse {
                    0%, 100% { box-shadow: 0 4px 20px rgba(211,47,47,0.5), inset 0 1px 1px rgba(255,255,255,0.15); }
                    50% { box-shadow: 0 4px 30px rgba(211,47,47,0.7), 0 0 20px rgba(211,47,47,0.3), inset 0 1px 1px rgba(255,255,255,0.15); }
                }
            `}</style>
        </>
    );
}
