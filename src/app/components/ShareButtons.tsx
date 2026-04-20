"use client";

import { useState, useEffect } from "react";
import styles from "./ShareButtons.module.css";

interface ShareButtonsProps {
    title: string;
    description?: string;
    thumbnailUrl?: string;
}

declare global {
    interface Window {
        Kakao?: any;
    }
}

export default function ShareButtons({ title, description, thumbnailUrl }: ShareButtonsProps) {
    const [copied, setCopied] = useState(false);
    const [kakaoReady, setKakaoReady] = useState(false);

    useEffect(() => {
        // 카카오 SDK 로드
        if (window.Kakao?.isInitialized?.()) {
            setKakaoReady(true);
            return;
        }

        const script = document.createElement("script");
        script.src = "https://t1.kakaocdn.net/kakao_js_sdk/2.7.4/kakao.min.js";
        script.integrity = "sha384-DKYJZ8NLiK8MN4/C5P2dtSmLQ4KwPaoqAfyA/DfmEc1VDxu4yyC7wy6K1Ber32n";
        script.crossOrigin = "anonymous";
        script.async = true;
        script.onload = () => {
            if (window.Kakao && !window.Kakao.isInitialized()) {
                window.Kakao.init("52979deca9d16fe9c0eb91b5e21a5b24");
            }
            setKakaoReady(true);
        };
        document.head.appendChild(script);
    }, []);

    const handleCopy = () => {
        if (!window) return;
        navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        alert("기사 링크가 복사되었습니다!");
        setTimeout(() => setCopied(false), 2000);
    };

    const handleXShare = () => {
        if (!window) return;
        const text = encodeURIComponent(`[오른스푼] ${title}`);
        const url = encodeURIComponent(window.location.href);
        window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, "_blank");
    };

    const handleKakaoShare = () => {
        if (!window.Kakao?.Share) {
            // SDK 로드 실패 시 폴백: 카카오톡 URL 스킴
            const url = encodeURIComponent(window.location.href);
            const text = encodeURIComponent(`[오른스푼] ${title}`);
            window.open(`https://story.kakao.com/share?url=${url}&text=${text}`, "_blank");
            return;
        }

        window.Kakao.Share.sendDefault({
            objectType: "feed",
            content: {
                title: title,
                description: description || "오른스푼 — 대한민국 오른 시각의 뉴스와 칼럼",
                imageUrl: thumbnailUrl || "https://www.rightspoon.co.kr/logo-v2.png",
                link: {
                    mobileWebUrl: window.location.href,
                    webUrl: window.location.href,
                },
            },
            buttons: [
                {
                    title: "기사 읽기",
                    link: {
                        mobileWebUrl: window.location.href,
                        webUrl: window.location.href,
                    },
                },
            ],
        });
    };

    return (
        <div className={styles.shareWrap}>
            <span className={styles.shareLabel}>공유하기</span>
            <button
                onClick={handleKakaoShare}
                className={styles.shareBtn}
                aria-label="카카오톡 공유"
                title="카카오톡으로 공유"
                style={{
                    background: kakaoReady ? "#FEE500" : undefined,
                    color: kakaoReady ? "#191919" : undefined,
                }}
            >
                💬
            </button>
            <button onClick={handleXShare} className={styles.shareBtn} aria-label="X 공유" title="X (트위터)에 공유">
                𝕏
            </button>
            <button onClick={handleCopy} className={styles.shareBtn} aria-label="링크 복사" title="링크 복사">
                {copied ? "✅" : "🔗"}
            </button>
        </div>
    );
}
