import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

type AuditArticle = {
    id: string;
    slug?: string | null;
    title: string;
    category: string;
    content?: string | null;
    created_at: string;
    view_count?: number | null;
    like_count?: number | null;
};

export async function GET() {
    try {
        const supabase = await createClient();
        const { data, error } = await supabase
            .from('articles')
            .select('id, slug, title, category, content, created_at, view_count, like_count')
            .order('created_at', { ascending: false });

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        const now = Date.now();
        const articles = (data || []) as AuditArticle[];

        const categoryCounts = articles.reduce((acc: Record<string, number>, article) => {
            acc[article.category] = (acc[article.category] || 0) + 1;
            return acc;
        }, {});

        const analysis = articles.map((article) => {
            const html = article.content || '';
            const plainText = html.replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();
            const charCount = plainText.length;
            const wordCount = plainText ? plainText.split(/\s+/).length : 0;
            const headingCount = (html.match(/<h2|<h3/gi) || []).length;
            const linkCount = (html.match(/<a\s/gi) || []).length;
            const hasSource = /출처|source|자료|공식|보도|http/i.test(html);
            const titleLength = article.title.length;
            const created = new Date(article.created_at).getTime();
            const daysOld = Number.isFinite(created) ? Math.floor((now - created) / (1000 * 60 * 60 * 24)) : null;
            const searchFriendlyTitle = /이유|문제|전망|해설|정리|논란|뜻|쟁점|비판|비교|왜|어떻게/.test(article.title);

            const issues: string[] = [];
            if (charCount < 1200) issues.push('본문 1,200자 미만');
            if (headingCount < 3) issues.push('소제목 3개 미만');
            if (!hasSource && linkCount === 0) issues.push('출처/근거 링크 부족');
            if (titleLength < 18 || !searchFriendlyTitle) issues.push('검색형 제목 보강 필요');

            const score = [
                charCount >= 1200 ? 25 : charCount >= 800 ? 15 : 5,
                headingCount >= 3 ? 20 : headingCount >= 1 ? 10 : 0,
                hasSource || linkCount > 0 ? 20 : 0,
                searchFriendlyTitle && titleLength >= 18 ? 20 : 8,
                article.slug ? 10 : 0,
                charCount >= 1800 ? 5 : 0,
            ].reduce((sum, value) => sum + value, 0);

            let status = '보강 필요';
            if (score >= 85) status = '발행 품질 양호';
            else if (score >= 65) status = '부분 보강';

            const recommendedAction = issues.length
                ? issues[0]
                : '내부 링크와 관련 글 연결을 추가하면 더 좋습니다';

            return {
                id: article.id,
                slug: article.slug,
                title: article.title,
                category: article.category,
                createdAt: article.created_at,
                daysOld,
                charCount,
                wordCount,
                headingCount,
                linkCount,
                hasSource,
                searchFriendlyTitle,
                viewCount: article.view_count || 0,
                likeCount: article.like_count || 0,
                score,
                status,
                issues,
                recommendedAction,
                preview: plainText.substring(0, 120) + (plainText.length > 120 ? '...' : '')
            };
        });

        const readyCount = analysis.filter((item) => item.score >= 85).length;
        const needsWorkCount = analysis.filter((item) => item.score < 65).length;
        const latest = analysis[0];

        return NextResponse.json({
            total: analysis.length,
            readyCount,
            needsWorkCount,
            categoryCounts,
            latestPublishedAt: latest?.createdAt || null,
            latestDaysOld: latest?.daysOld ?? null,
            analysis
        });
    } catch (e) {
        const message = e instanceof Error ? e.message : 'Unknown error';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
