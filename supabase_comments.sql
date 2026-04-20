-- Supabase SQL Editor에서 실행해주세요.

-- 1. comments 테이블 생성
CREATE TABLE IF NOT EXISTS public.comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    article_id UUID NOT NULL REFERENCES public.articles(id) ON DELETE CASCADE,
    nickname TEXT NOT NULL,
    content TEXT NOT NULL CHECK (char_length(content) <= 150),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. 인덱스 설정 (빠른 조회를 위해)
CREATE INDEX IF NOT EXISTS comments_article_id_idx ON public.comments(article_id);

-- 3. RLS 활성화
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

-- 4. 권한 정책 생성 (누구나 읽고 쓰기가능하도록 허용 - 익명 댓글)
CREATE POLICY "Allow public read access on comments"
ON public.comments
FOR SELECT
TO public
USING (true);

CREATE POLICY "Allow public insert on comments"
ON public.comments
FOR INSERT
TO public
WITH CHECK (true);
