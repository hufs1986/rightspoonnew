-- =============================================
-- 웹툰 시스템 Database Schema
-- Supabase SQL Editor에서 실행하세요.
-- =============================================

-- ===== 1. webtoon_series 테이블 =====
CREATE TABLE public.webtoon_series (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  title text NOT NULL,
  description text,
  author text DEFAULT '드럼통119' NOT NULL,
  cover_image text,
  category text DEFAULT '역사' NOT NULL,
  status text DEFAULT 'ongoing' NOT NULL,
  total_episodes integer DEFAULT 0
);

ALTER TABLE public.webtoon_series ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view webtoon_series" ON public.webtoon_series
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can manage webtoon_series" ON public.webtoon_series
  FOR ALL USING (auth.role() = 'authenticated');


-- ===== 2. webtoon_episodes 테이블 =====
CREATE TABLE public.webtoon_episodes (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  series_id uuid REFERENCES public.webtoon_series(id) ON DELETE CASCADE NOT NULL,
  episode_number integer NOT NULL,
  title text NOT NULL,
  pages jsonb NOT NULL DEFAULT '[]',
  is_published boolean DEFAULT false,
  view_count integer DEFAULT 0,
  like_count integer DEFAULT 0,
  UNIQUE(series_id, episode_number)
);

ALTER TABLE public.webtoon_episodes ENABLE ROW LEVEL SECURITY;

-- 공개된 에피소드만 일반 사용자에게 표시
CREATE POLICY "Anyone can view published episodes" ON public.webtoon_episodes
  FOR SELECT USING (is_published = true);

-- 관리자는 모든 에피소드 관리 가능
CREATE POLICY "Authenticated users can manage episodes" ON public.webtoon_episodes
  FOR ALL USING (auth.role() = 'authenticated');


-- ===== 3. RPC 함수 =====

-- 에피소드 조회수 +1
CREATE OR REPLACE FUNCTION increment_episode_view(episode_id uuid)
RETURNS void AS $$
  UPDATE public.webtoon_episodes SET view_count = view_count + 1 WHERE id = episode_id;
$$ LANGUAGE sql SECURITY DEFINER;

-- 에피소드 좋아요 +1
CREATE OR REPLACE FUNCTION increment_episode_like(episode_id uuid)
RETURNS void AS $$
  UPDATE public.webtoon_episodes SET like_count = like_count + 1 WHERE id = episode_id;
$$ LANGUAGE sql SECURITY DEFINER;


-- ===== 4. Storage 버킷 생성 =====
-- Supabase 대시보드 > Storage에서 "webtoon-pages" 버킷을 수동으로 생성하세요.
-- ⚠️ 반드시 "Private" (비공개)로 설정!
-- 또는 아래 SQL로 생성:
INSERT INTO storage.buckets (id, name, public) VALUES ('webtoon-pages', 'webtoon-pages', false);

-- Storage RLS: 인증된 사용자만 업로드 가능
CREATE POLICY "Authenticated users can upload webtoon pages"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'webtoon-pages' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update webtoon pages"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'webtoon-pages' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete webtoon pages"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'webtoon-pages' AND auth.role() = 'authenticated');

-- 서명된 URL로만 읽기 접근 (서버 사이드에서 생성)
CREATE POLICY "Anyone can read webtoon pages via signed URL"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'webtoon-pages');
