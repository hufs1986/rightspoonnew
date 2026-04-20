import { MetadataRoute } from 'next';
import { createClient } from '@/utils/supabase/server';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const supabase = await createClient();

    // DB에서 모든 기사 가져오기
    const { data: articles } = await supabase
        .from('articles')
        .select('id, created_at')
        .order('created_at', { ascending: false });

    // 기사 상세 페이지 URL 배열 생성
    const articleEntries: MetadataRoute.Sitemap = (articles || []).map((article) => ({
        url: `https://www.rightspoon.co.kr/article/${article.id}`,
        lastModified: new Date(article.created_at),
        changeFrequency: 'weekly',
        priority: 0.8,
    }));

    return [
        {
            url: 'https://www.rightspoon.co.kr',
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 1,
        },
        {
            url: 'https://www.rightspoon.co.kr/category/all',
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 0.8,
        },
        {
            url: 'https://www.rightspoon.co.kr/category/politics',
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 0.8,
        },
        {
            url: 'https://www.rightspoon.co.kr/category/economy',
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 0.8,
        },
        {
            url: 'https://www.rightspoon.co.kr/about',
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.5,
        },
        ...articleEntries,
    ];
}
