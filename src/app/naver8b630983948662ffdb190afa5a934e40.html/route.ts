import { NextResponse } from 'next/server';

export async function GET() {
    return new NextResponse('naver-site-verification: naver8b630983948662ffdb190afa5a934e40.html', {
        headers: {
            'Content-Type': 'text/html; charset=utf-8',
        },
    });
}
