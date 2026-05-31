import { ImageResponse } from "next/og";

export const runtime = "edge";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const title = searchParams.get("title") || "오른스푼";
    const category = searchParams.get("category") || "정치·사회 해설";

    return new ImageResponse(
        (
            <div
                style={{
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    background: "linear-gradient(135deg, #151515 0%, #2b1414 55%, #5a1717 100%)",
                    color: "white",
                    padding: "72px",
                    fontFamily: "sans-serif",
                }}
            >
                <div style={{ display: "flex", alignItems: "center", gap: "18px" }}>
                    <div
                        style={{
                            width: "58px",
                            height: "58px",
                            borderRadius: "14px",
                            background: "#d32f2f",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "32px",
                            fontWeight: 900,
                        }}
                    >
                        R
                    </div>
                    <div style={{ display: "flex", flexDirection: "column" }}>
                        <div style={{ fontSize: "30px", fontWeight: 900 }}>오른스푼</div>
                        <div style={{ fontSize: "20px", color: "rgba(255,255,255,0.72)" }}>
                            드럼통119의 정치·사회 해설 본진
                        </div>
                    </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
                    <div
                        style={{
                            alignSelf: "flex-start",
                            padding: "10px 18px",
                            borderRadius: "999px",
                            background: "rgba(255,255,255,0.12)",
                            border: "1px solid rgba(255,255,255,0.22)",
                            fontSize: "22px",
                            fontWeight: 800,
                        }}
                    >
                        {category}
                    </div>
                    <div
                        style={{
                            fontSize: title.length > 34 ? "58px" : "68px",
                            lineHeight: 1.12,
                            fontWeight: 900,
                            letterSpacing: "-1px",
                            maxWidth: "1040px",
                            wordBreak: "keep-all",
                        }}
                    >
                        {title}
                    </div>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ fontSize: "24px", color: "rgba(255,255,255,0.72)" }}>
                        흘러가는 이슈를 오른쪽 시각으로 다시 씁니다
                    </div>
                    <div style={{ fontSize: "24px", fontWeight: 800 }}>rightspoon.co.kr</div>
                </div>
            </div>
        ),
        {
            width: 1200,
            height: 630,
        }
    );
}
