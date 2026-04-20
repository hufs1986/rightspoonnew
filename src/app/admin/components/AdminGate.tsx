"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";

interface AdminGateProps {
    children: React.ReactNode;
}

export default function AdminGate({ children }: AdminGateProps) {
    const [isAuthed, setIsAuthed] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const checkAuth = async () => {
            const supabase = createClient();
            const { data: { session } } = await supabase.auth.getSession();

            if (session) {
                setIsAuthed(true);
            } else {
                // 로그인 안 되어 있으면 로그인 페이지로 이동
                window.location.href = "/admin-login";
            }
            setIsLoading(false);
        };

        checkAuth();
    }, []);

    if (isLoading) {
        return (
            <div style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                minHeight: "100vh",
                fontSize: "var(--text-lg)",
                color: "var(--color-text-muted)"
            }}>
                인증 확인 중...
            </div>
        );
    }

    if (!isAuthed) {
        return null; // 리다이렉트 중이므로 아무것도 렌더링하지 않음
    }

    return <>{children}</>;
}
