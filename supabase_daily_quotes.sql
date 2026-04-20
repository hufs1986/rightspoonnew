-- Supabase SQL Editor에서 실행해주세요.

-- 1. daily_quotes 테이블 생성
CREATE TABLE IF NOT EXISTS public.daily_quotes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    quote_text TEXT NOT NULL,
    active BOOLEAN DEFAULT false
);

-- 2. RLS 활성화
ALTER TABLE public.daily_quotes ENABLE ROW LEVEL SECURITY;

-- 3. 권한 정책 생성 (누구나 읽기 가능, 수정/생성은 서비스롤 또는 어드민만)
CREATE POLICY "Allow public read access on daily_quotes"
ON public.daily_quotes
FOR SELECT
TO public
USING (true);

-- 4. 샘플 데이터 1개 추가
INSERT INTO public.daily_quotes (quote_text, active) 
VALUES ('586세대가 절대 말하지 않는 진짜 숫자 하나, 무엇일까요?', true);
