import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET() {
    try {
        const supabase = await createClient();
        const { data, error } = await supabase
            .from('articles')
            .select('id, title, category, content, created_at')
            .order('created_at', { ascending: false });

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        const analysis = data.map((article: any) => {
            const plainText = (article.content || '').replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').trim();
            const charCount = plainText.length;
            const wordCount = plainText.split(/\s+/).length;

            let status = "✅ 길이 양호";
            if (charCount < 500) status = "⚠️ 길이 많이 부족 (애드센스 탈락 위험)";
            else if (charCount < 1000) status = "⚠️ 약간 부족 (내용 추가 권장)";

            return {
                title: article.title,
                category: article.category,
                charCount,
                wordCount,
                status,
                preview: plainText.substring(0, 100) + '...'
            };
        });

        return NextResponse.json({
            total: analysis.length,
            analysis
        });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
