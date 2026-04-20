"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import styles from "./LikeButton.module.css";

interface LikeButtonProps {
    articleId: string;
    initialLikes: number;
}

export default function LikeButton({ articleId, initialLikes }: LikeButtonProps) {
    const [likes, setLikes] = useState(initialLikes);
    const [isLiked, setIsLiked] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);

    useEffect(() => {
        // 클라이언트 렌더링 이후에 localStorage에서 기존 좋아요 상태 확인
        const likedCookie = localStorage.getItem(`liked_${articleId}`);
        if (likedCookie) {
            setIsLiked(true);
        }
    }, [articleId]);

    const handleLike = async () => {
        if (isLiked) return; // 이미 좋아요를 눌렀으면 무시

        // 즉각적인 UI 피드백 (Optimistic Update)
        setIsLiked(true);
        setLikes(prev => prev + 1);
        setIsAnimating(true);
        localStorage.setItem(`liked_${articleId}`, "true");

        setTimeout(() => setIsAnimating(false), 800); // 하트 애니메이션 지속 시간

        // 백엔드 업데이트
        try {
            const supabase = createClient();
            const { error } = await supabase.rpc("increment_like_count", { article_id: articleId });
            if (error) {
                console.error("Failed to increment like count:", error);
                // 실전에서는 여기서 롤백 로직을 추가할 수 있습니다.
            }
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <button
            className={`${styles.likeButton} ${isLiked ? styles.liked : ""}`}
            onClick={handleLike}
            disabled={isLiked}
            aria-label="좋아요"
        >
            <span className={`${styles.icon} ${isAnimating ? styles.pop : ""}`}>
                {isLiked ? "❤️" : "🤍"}
            </span>
            <span className={styles.count}>{likes.toLocaleString()}</span>
        </button>
    );
}
