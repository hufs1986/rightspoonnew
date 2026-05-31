import { getCategoryValue, Article } from "@/app/data/articles";

type ArticleDbRow = {
    id: string;
    slug?: string | null;
    title?: string | null;
    content?: string | null;
    category?: string | null;
    author?: string | null;
    youtube_id?: string | null;
    created_at?: string | null;
    read_time?: string | number | null;
    view_count?: number | null;
    like_count?: number | null;
};

export const cleanYoutubeId = (id: string | null | undefined): string => {
    if (!id) return '';
    const match = id.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))([\w-]{11})/);
    if (match) return match[1];
    const cleaned = id.replace(/[\/?#&].*/g, '').trim();
    return /^[\w-]{11}$/.test(cleaned) ? cleaned : '';
};

export const stripHtml = (html: string | null | undefined): string => {
    return html ? html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim() : '';
};

export const formatArticle = (dbRow: ArticleDbRow): Article => {
    const yId = cleanYoutubeId(dbRow.youtube_id);
    const content = typeof dbRow.content === 'string' ? dbRow.content : '';
    const title = dbRow.title || '제목 없음';
    const categoryLabel = dbRow.category || '정치';

    return {
        id: dbRow.id,
        slug: dbRow.slug || undefined,
        linkId: dbRow.slug || dbRow.id,
        title,
        excerpt: stripHtml(content).substring(0, 100) + '...',
        category: getCategoryValue(categoryLabel),
        categoryLabel,
        content,
        author: dbRow.author || '드럼통119',
        youtubeId: yId,
        thumbnailUrl: yId
            ? `https://img.youtube.com/vi/${yId}/0.jpg`
            : "/logo-character.webp",
        publishedAt: dbRow.created_at ? new Date(dbRow.created_at).toLocaleDateString() : '',
        readTime: String(dbRow.read_time || "5"),
        views: dbRow.view_count || 0,
        likes: dbRow.like_count || 0,
    };
};
