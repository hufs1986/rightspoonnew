import { getCategoryValue, Article } from "@/app/data/articles";

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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const formatArticle = (dbRow: any): Article => {
    const yId = cleanYoutubeId(dbRow.youtube_id);
    return {
        id: dbRow.id,
        slug: dbRow.slug || undefined,
        linkId: dbRow.slug || dbRow.id,
        title: dbRow.title,
        excerpt: stripHtml(typeof dbRow.content === 'string' ? dbRow.content : '').substring(0, 100) + '...',
        category: getCategoryValue(dbRow.category),
        categoryLabel: dbRow.category,
        content: dbRow.content,
        author: dbRow.author,
        youtubeId: yId,
        thumbnailUrl: yId
            ? `https://img.youtube.com/vi/${yId}/0.jpg`
            : "/logo-character.webp",
        publishedAt: new Date(dbRow.created_at).toLocaleDateString(),
        readTime: dbRow.read_time || "5",
        views: dbRow.view_count || 0,
        likes: dbRow.like_count || 0,
    };
};
