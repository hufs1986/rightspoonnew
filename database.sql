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

-- ===== 사이트 전체 통계 =====

-- site_stats 테이블: 방문자 수, 다운로드 수를 단일 행으로 관리
CREATE TABLE public.site_stats (
  id integer PRIMARY KEY DEFAULT 1,
  visitor_count bigint DEFAULT 0,
  download_count bigint DEFAULT 0,
  CHECK (id = 1)
);

INSERT INTO public.site_stats (id, visitor_count, download_count) VALUES (1, 0, 0);

ALTER TABLE public.site_stats ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view site_stats" ON public.site_stats FOR SELECT USING (true);

-- RPC: 방문자 수 +1
CREATE OR REPLACE FUNCTION increment_visitor_count()
RETURNS void AS $$
  UPDATE public.site_stats SET visitor_count = visitor_count + 1 WHERE id = 1;
$$ LANGUAGE sql SECURITY DEFINER;

-- RPC: 다운로드 수 +1
CREATE OR REPLACE FUNCTION increment_download_count()
RETURNS void AS $$
  UPDATE public.site_stats SET download_count = download_count + 1 WHERE id = 1;
$$ LANGUAGE sql SECURITY DEFINER;
