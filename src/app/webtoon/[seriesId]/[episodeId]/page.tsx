import Header from "../../../components/Header";
import WebtoonViewer from "../../../components/WebtoonViewer";
import { createClient } from "@/utils/supabase/server";
import { Metadata } from "next";

interface ViewerPageProps {
    params: Promise<{ seriesId: string; episodeId: string }>;
}

export async function generateMetadata({ params }: ViewerPageProps): Promise<Metadata> {
    const { episodeId } = await params;
    const supabase = await createClient();
    const { data: ep } = await supabase
        .from("webtoon_episodes")
        .select("title, webtoon_series(title)")
        .eq("id", episodeId)
        .single();

    const seriesTitle = (ep?.webtoon_series as unknown as { title: string })?.title || "웹툰";

    return {
        title: ep ? `${ep.title} - ${seriesTitle} | 오른스푼` : "웹툰 | 오른스푼",
    };
}

export default async function ViewerPage({ params }: ViewerPageProps) {
    const { seriesId, episodeId } = await params;
    const supabase = await createClient();

    // 현재 에피소드 가져오기
    const { data: episode } = await supabase
        .from("webtoon_episodes")
        .select("*")
        .eq("id", episodeId)
        .single();

    if (!episode) {
        return (
            <div style={{ minHeight: "100vh", background: "var(--color-bg)" }}>
                <Header />
                <div style={{ padding: "150px 20px", textAlign: "center", color: "var(--color-text-primary)" }}>
                    <h2>존재하지 않는 에피소드입니다.</h2>
                </div>
            </div>
        );
    }

    const pages = episode.pages as { path: string; order: number }[];

    // 이전/다음 에피소드 찾기
    const { data: prevEp } = await supabase
        .from("webtoon_episodes")
        .select("id")
        .eq("series_id", seriesId)
        .eq("is_published", true)
        .lt("episode_number", episode.episode_number)
        .order("episode_number", { ascending: false })
        .limit(1)
        .single();

    const { data: nextEp } = await supabase
        .from("webtoon_episodes")
        .select("id")
        .eq("series_id", seriesId)
        .eq("is_published", true)
        .gt("episode_number", episode.episode_number)
        .order("episode_number", { ascending: true })
        .limit(1)
        .single();

    return (
        <div style={{ minHeight: "100vh", background: "#000" }}>
            <Header />
            <WebtoonViewer
                episodeId={episodeId}
                seriesId={seriesId}
                episodeTitle={episode.title}
                episodeNumber={episode.episode_number}
                prevEpisodeId={prevEp?.id || null}
                nextEpisodeId={nextEp?.id || null}
                totalPages={pages?.length || 0}
            />
        </div>
    );
}
