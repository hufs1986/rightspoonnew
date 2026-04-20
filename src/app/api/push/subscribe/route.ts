import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function POST(request: NextRequest) {
    try {
        // Content-Type 검증
        const contentType = request.headers.get("content-type");
        if (!contentType?.includes("application/json")) {
            return NextResponse.json(
                { error: "Invalid content type" },
                { status: 415 }
            );
        }

        const { endpoint, keys } = await request.json();

        if (!endpoint || !keys?.p256dh || !keys?.auth) {
            return NextResponse.json(
                { error: "잘못된 구독 정보입니다." },
                { status: 400 }
            );
        }

        // endpoint URL 형식 검증 (반드시 https://)
        if (typeof endpoint !== "string" || !endpoint.startsWith("https://") || endpoint.length > 2048) {
            return NextResponse.json(
                { error: "잘못된 엔드포인트 형식입니다." },
                { status: 400 }
            );
        }

        // 키 길이 제한 (비정상적으로 긴 값 차단)
        if (keys.p256dh.length > 512 || keys.auth.length > 512) {
            return NextResponse.json(
                { error: "잘못된 키 형식입니다." },
                { status: 400 }
            );
        }

        const supabase = await createClient();

        // upsert: 이미 같은 endpoint가 있으면 갱신
        const { error } = await supabase
            .from("push_subscriptions")
            .upsert(
                {
                    endpoint,
                    keys_p256dh: keys.p256dh,
                    keys_auth: keys.auth,
                },
                { onConflict: "endpoint" }
            );

        if (error) {
            console.error("구독 저장 실패:", error);
            return NextResponse.json(
                { error: "구독 저장에 실패했습니다." },
                { status: 500 }
            );
        }

        return NextResponse.json({ success: true });
    } catch (err) {
        console.error("Subscribe API Error:", err);
        return NextResponse.json(
            { error: "서버 오류가 발생했습니다." },
            { status: 500 }
        );
    }
}
