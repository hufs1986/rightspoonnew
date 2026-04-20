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
        let timer: NodeJS.Timeout;
        const checkKakao = () => {
            if (window.Kakao) {
                try {
                    if (!window.Kakao.isInitialized()) {
                        window.Kakao.init("3c3a1cf249d8957ccd1841d3865a1a31");
                    }
                    setKakaoReady(true);
                } catch (e) {
                    console.error("Kakao init error:", e);
                }
            } else {
                timer = setTimeout(checkKakao, 500);
            }
        };
        checkKakao();

        return () => clearTimeout(timer);
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
        if (!window.Kakao) {
            alert("카카오 SDK가 로드되지 않았습니다. 광고 차단기 등을 확인해주세요.");
            return;
        }
        if (!window.Kakao.isInitialized()) {
            try {
                window.Kakao.init("52979deca9d16fe9c0eb91b5e21a5b24");
            } catch (e) {
                alert(`초기화 실패 (도메인 미동록 가능성): ${e}`);
                return;
            }
        }
        if (!window.Kakao.Share) {
            alert("카카오 공유 기능(Share)을 찾을 수 없습니다.");
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
