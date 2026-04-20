"use client";

import { useEffect } from "react";
import { createClient } from "@/utils/supabase/client";

interface ViewCounterProps {
    articleId: string;
}

export default function ViewCounter({ articleId }: ViewCounterProps) {
    useEffect(() => {
        const incrementView = async () => {
            const supabase = createClient();
            await supabase.rpc("increment_view_count", { article_id: articleId });
        };
        incrementView();
    }, [articleId]);

    return null; // 화면에 표시할 내용 없음 (서버에 조회수만 올림)
}
