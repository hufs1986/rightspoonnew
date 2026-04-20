-- Supabase SQL Editor에서 아래 쿼리를 실행하여 기사(articles) 테이블을 생성하세요.

-- 1. articles 테이블 생성
CREATE TABLE public.articles (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  title text NOT NULL,
  category text NOT NULL,
  youtube_id text,
  content text NOT NULL,
  author text DEFAULT '드럼통119' NOT NULL,
  view_count integer DEFAULT 0,
  read_time integer DEFAULT 5
);

-- 2. Row Level Security(RLS) 활성화 (데이터 보호)
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;

-- 3. 정책(Policy) 설정: 
-- 누구나 기사를 읽을 수 있음 (SELECT 허용)
CREATE POLICY "Anyone can view articles" ON public.articles
  FOR SELECT USING (true);

-- 모든 사람이 작성 가능함 (관리자 기능만 있는 상태이므로 임시로 모두 허용)
-- 실제 운영시에는 관리자만 작성 가능하게 수정해야 합니다. 
CREATE POLICY "Anyone can insert articles (temporary limit needed later)" ON public.articles
  FOR INSERT WITH CHECK (true);
