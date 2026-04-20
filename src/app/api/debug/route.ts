import { createClient } from "@/utils/supabase/server";
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
    const supabase = await createClient();
    const { data } = await supabase.from('articles').select('title, youtube_id').order('created_at', { ascending: false }).limit(20);
    return NextResponse.json(data);
}
