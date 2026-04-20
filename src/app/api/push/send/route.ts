import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import webpush from "web-push";

// VAPID 설정
const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || "BLl4wa7MIRXUj217MHJUNM0nKEniKWPnbjBfzIl7L_axXEQDc4G0rjHPLpjDaXVyWHpevSpVZGdoAmo_uI06l4Q";
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY || "3nWyjrJx8vK0P-Cnq-RbTocwt_iiJQrGa4QUHHepwnU";

webpush.setVapidDetails(
    "mailto:rightspoon@rightspoon.co.kr",
    VAPID_PUBLIC_KEY,
    VAPID_PRIVATE_KEY
);

export async function POST(request: NextRequest) {
    try {
        const { title, body, url } = await request.json();

        if (!title || !body) {
            return NextResponse.json(
                { error: "제목과 내용이 필요합니다." },
                { status: 400 }
            );
        }

        const supabase = await createClient();

        // 관리자 인증 확인
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json(
                { error: "인증이 필요합니다." },
                { status: 401 }
            );
        }

        // 모든 구독자 조회
        const { data: subscriptions, error: fetchError } = await supabase
            .from("push_subscriptions")
            .select("*");

        if (fetchError) {
            console.error("구독자 조회 실패:", fetchError);
            return NextResponse.json(
                { error: "구독자를 불러올 수 없습니다." },
                { status: 500 }
            );
        }

        if (!subscriptions || subscriptions.length === 0) {
            return NextResponse.json({ success: true, sent: 0, message: "구독자가 없습니다." });
        }

        const payload = JSON.stringify({ title, body, url: url || "/" });

        // 병렬로 모든 구독자에게 전송
        let successCount = 0;
        let failCount = 0;
        const expiredEndpoints: string[] = [];

        await Promise.allSettled(
            subscriptions.map(async (sub) => {
                try {
                    await webpush.sendNotification(
                        {
                            endpoint: sub.endpoint,
                            keys: {
                                p256dh: sub.keys_p256dh,
                                auth: sub.keys_auth,
                            },
                        },
                        payload
                    );
                    successCount++;
                } catch (err: any) {
                    failCount++;
                    // 410 Gone 또는 404 = 구독 만료됨 → 삭제 대상
                    if (err?.statusCode === 410 || err?.statusCode === 404) {
                        expiredEndpoints.push(sub.endpoint);
                    }
                    console.error(`알림 전송 실패 (${sub.endpoint.slice(-20)}):`, err?.statusCode || err);
                }
            })
        );

        // 만료된 구독 정리
        if (expiredEndpoints.length > 0) {
            await supabase
                .from("push_subscriptions")
                .delete()
                .in("endpoint", expiredEndpoints);
            console.log(`만료된 구독 ${expiredEndpoints.length}건 삭제`);
        }

        return NextResponse.json({
            success: true,
            sent: successCount,
            failed: failCount,
            cleaned: expiredEndpoints.length,
        });
    } catch (err) {
        console.error("Send Push API Error:", err);
        return NextResponse.json(
            { error: "서버 오류가 발생했습니다." },
            { status: 500 }
        );
    }
}
