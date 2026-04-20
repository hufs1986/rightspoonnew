import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function POST(request: NextRequest) {
    try {
        const { endpoint, keys } = await request.json();

        if (!endpoint || !keys?.p256dh || !keys?.auth) {
            return NextResponse.json(
                { error: "잘못된 구독 정보입니다." },
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
