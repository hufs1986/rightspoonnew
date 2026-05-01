import type { Metadata } from "next";
import { Noto_Sans_KR, Press_Start_2P } from "next/font/google";
import GameEngine from "./GameEngine";

const notoSansKr = Noto_Sans_KR({
    weight: ["400", "500", "700", "900"],
});

const pressStart = Press_Start_2P({
    subsets: ["latin"],
    variable: "--font-press-start",
    weight: "400",
});

export const metadata: Metadata = {
    title: "공소취소 메이커 | 오른스푼",
    description: "재판은 멈추고, 권력은 자란다 — 프린세스 메이커 스타일의 정치 풍자 웹 게임",
    openGraph: {
        title: "공소취소 메이커",
        description: "재판은 멈추고, 권력은 자란다. 당신의 선택으로 법치주의의 운명이 결정됩니다.",
    },
};

export default function IndictmentMakerPage() {
    return (
        <div className={`${notoSansKr.className} ${pressStart.variable}`}>
            <GameEngine />
        </div>
    );
}
