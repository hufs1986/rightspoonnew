-- =============================================
-- RLS 정책 수정 (기존 정책 교체)
-- Supabase SQL Editor에서 실행하세요.
-- =============================================

-- 기존 정책 삭제
DROP POLICY IF EXISTS "Authenticated users can manage webtoon_series" ON public.webtoon_series;
DROP POLICY IF EXISTS "Authenticated users can manage episodes" ON public.webtoon_episodes;

-- webtoon_series: 인증된 사용자 INSERT/UPDATE/DELETE 허용
CREATE POLICY "Auth users insert webtoon_series" ON public.webtoon_series
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Auth users update webtoon_series" ON public.webtoon_series
  FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "Auth users delete webtoon_series" ON public.webtoon_series
  FOR DELETE USING (auth.uid() IS NOT NULL);

-- webtoon_episodes: 인증된 사용자 INSERT/UPDATE/DELETE 허용
CREATE POLICY "Auth users insert episodes" ON public.webtoon_episodes
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Auth users update episodes" ON public.webtoon_episodes
  FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "Auth users delete episodes" ON public.webtoon_episodes
  FOR DELETE USING (auth.uid() IS NOT NULL);
