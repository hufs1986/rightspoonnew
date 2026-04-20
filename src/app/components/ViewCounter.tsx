"use client";

import { useEffect } from "react";
import { createClient } from "@/utils/supabase/client";

interface ViewCounterProps {
    articleId: string;
}

export default function ViewCounter({ articleId }: ViewCounterProps) {
    useEffect(() => {
        const key = `viewed_${articleId}`;
        if (sessionStorage.getItem(key)) return; // 같은 세션 내 중복 방지

        const incrementView = async () => {
            const supabase = createClient();
            await supabase.rpc("increment_view_count", { article_id: articleId });
            sessionStorage.setItem(key, "true");
        };
        incrementView();
    }, [articleId]);

    return null; // 화면에 표시할 내용 없음 (서버에 조회수만 올림)
}
