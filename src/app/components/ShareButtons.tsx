"use client";

import { useState } from "react";
import styles from "./ShareButtons.module.css";

interface ShareButtonsProps {
    title: string;
}

export default function ShareButtons({ title }: ShareButtonsProps) {
    const [copied, setCopied] = useState(false);

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
        alert("카카오톡 연동은 현재 준비 중입니다. 우측의 X나 링크 복사 버튼을 이용해주세요.");
    };

    return (
        <div className={styles.shareWrap}>
            <span className={styles.shareLabel}>공유하기</span>
            <button onClick={handleKakaoShare} className={styles.shareBtn} aria-label="카카오톡 공유" title="카카오톡 공유 (준비중)">
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
