-- =============================================
-- RightSpoon Database Schema (보안 강화 버전)
-- =============================================
-- 이 파일은 참조용입니다.
-- 실제 적용은 Supabase 대시보드 SQL Editor에서 실행하세요.

-- ===== 1. articles 테이블 =====

CREATE TABLE public.articles (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  title text NOT NULL,
  category text NOT NULL,
  youtube_id text,
  content text NOT NULL,
  author text DEFAULT '드럼통119' NOT NULL,
  view_count integer DEFAULT 0,
  like_count integer DEFAULT 0,
  read_time integer DEFAULT 5
);

ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;

-- 누구나 기사를 읽을 수 있음 (공개 콘텐츠)
CREATE POLICY "Anyone can view articles" ON public.articles
  FOR SELECT USING (true);

-- 인증된 사용자(관리자)만 기사 작성 가능
CREATE POLICY "Authenticated users can insert articles" ON public.articles
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- 인증된 사용자(관리자)만 기사 수정 가능
CREATE POLICY "Authenticated users can update articles" ON public.articles
  FOR UPDATE USING (auth.role() = 'authenticated');

-- 인증된 사용자(관리자)만 기사 삭제 가능
CREATE POLICY "Authenticated users can delete articles" ON public.articles
  FOR DELETE USING (auth.role() = 'authenticated');


-- ===== 2. site_stats 테이블 =====

CREATE TABLE public.site_stats (
  id integer PRIMARY KEY DEFAULT 1,
  visitor_count bigint DEFAULT 0,
  download_count bigint DEFAULT 0,
  CHECK (id = 1)
);

INSERT INTO public.site_stats (id, visitor_count, download_count) VALUES (1, 0, 0);

ALTER TABLE public.site_stats ENABLE ROW LEVEL SECURITY;

-- 누구나 통계를 조회할 수 있음
CREATE POLICY "Anyone can view site_stats" ON public.site_stats
  FOR SELECT USING (true);

-- 직접 UPDATE/INSERT/DELETE 차단 (RPC SECURITY DEFINER로만 수정)
-- site_stats에 대한 UPDATE/INSERT/DELETE 정책을 생성하지 않음으로써
-- anon 키로는 직접 수정이 불가능합니다.


-- ===== 3. push_subscriptions 테이블 =====

CREATE TABLE public.push_subscriptions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  endpoint text UNIQUE NOT NULL,
  keys_p256dh text NOT NULL,
  keys_auth text NOT NULL
);

ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;

-- 서버 사이드(API Route)에서만 접근하므로 anon 키 직접 접근 차단
-- API Route는 server.ts의 createClient를 사용하며,
-- RLS는 통과되지만 실제 보호는 API Route의 인증 로직에서 수행
CREATE POLICY "Server can manage push_subscriptions" ON public.push_subscriptions
  FOR ALL USING (auth.role() = 'authenticated');

-- anon 키로 구독 등록만 허용 (subscribe API에서 사용)
CREATE POLICY "Anyone can insert push_subscriptions" ON public.push_subscriptions
  FOR INSERT WITH CHECK (true);


-- ===== 4. RPC 함수 (SECURITY DEFINER = RLS 우회) =====

-- 방문자 수 +1
CREATE OR REPLACE FUNCTION increment_visitor_count()
RETURNS void AS $$
  UPDATE public.site_stats SET visitor_count = visitor_count + 1 WHERE id = 1;
$$ LANGUAGE sql SECURITY DEFINER;

-- 다운로드 수 +1
CREATE OR REPLACE FUNCTION increment_download_count()
RETURNS void AS $$
  UPDATE public.site_stats SET download_count = download_count + 1 WHERE id = 1;
$$ LANGUAGE sql SECURITY DEFINER;

-- 기사 조회수 +1
CREATE OR REPLACE FUNCTION increment_view_count(article_id uuid)
RETURNS void AS $$
  UPDATE public.articles SET view_count = view_count + 1 WHERE id = article_id;
$$ LANGUAGE sql SECURITY DEFINER;

-- 기사 좋아요 +1
CREATE OR REPLACE FUNCTION increment_like_count(article_id uuid)
RETURNS void AS $$
  UPDATE public.articles SET like_count = like_count + 1 WHERE id = article_id;
$$ LANGUAGE sql SECURITY DEFINER;


-- =============================================
-- 기존 정책 마이그레이션 (이미 운영 중인 DB에 적용 시)
-- 아래 쿼리를 Supabase SQL Editor에서 실행하세요.
-- =============================================

-- 1) 기존 articles의 위험한 INSERT 정책 교체
-- DROP POLICY IF EXISTS "Anyone can insert articles (temporary limit needed later)" ON public.articles;
-- CREATE POLICY "Authenticated users can insert articles" ON public.articles
--   FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- 2) articles UPDATE/DELETE 정책 추가
-- CREATE POLICY "Authenticated users can update articles" ON public.articles
--   FOR UPDATE USING (auth.role() = 'authenticated');
-- CREATE POLICY "Authenticated users can delete articles" ON public.articles
--   FOR DELETE USING (auth.role() = 'authenticated');
