-- =====================================================
-- 오른스푼 (rightspoonnew) — RLS 보안 패치
-- Supabase Dashboard > SQL Editor 에서 이 전체를 실행하세요
-- =====================================================

-- 1. articles 테이블 — 공개 읽기, 쓰기는 인증 유저만
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "articles_select_public" ON articles;
CREATE POLICY "articles_select_public" ON articles
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "articles_insert_auth" ON articles;
CREATE POLICY "articles_insert_auth" ON articles
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "articles_update_auth" ON articles;
CREATE POLICY "articles_update_auth" ON articles
  FOR UPDATE USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "articles_delete_auth" ON articles;
CREATE POLICY "articles_delete_auth" ON articles
  FOR DELETE USING (auth.role() = 'authenticated');


-- 2. comments 테이블 — 공개 읽기, 누구나 쓰기(insert만), 수정/삭제 불가
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "comments_select_public" ON comments;
CREATE POLICY "comments_select_public" ON comments
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "comments_insert_public" ON comments;
CREATE POLICY "comments_insert_public" ON comments
  FOR INSERT WITH CHECK (true);

-- 댓글 수정/삭제는 아무도 못함 (anon 기준)
-- 필요하면 authenticated 유저에게만 허용하는 정책 추가 가능


-- 3. daily_quotes 테이블 — 공개 읽기만
ALTER TABLE daily_quotes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "daily_quotes_select_public" ON daily_quotes;
CREATE POLICY "daily_quotes_select_public" ON daily_quotes
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "daily_quotes_insert_auth" ON daily_quotes;
CREATE POLICY "daily_quotes_insert_auth" ON daily_quotes
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "daily_quotes_update_auth" ON daily_quotes;
CREATE POLICY "daily_quotes_update_auth" ON daily_quotes
  FOR UPDATE USING (auth.role() = 'authenticated');


-- 4. site_stats 테이블 — 공개 읽기, 쓰기 차단 (RPC로만 조작)
ALTER TABLE site_stats ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "site_stats_select_public" ON site_stats;
CREATE POLICY "site_stats_select_public" ON site_stats
  FOR SELECT USING (true);

-- site_stats는 RPC(increment_visitor_count 등)가 SECURITY DEFINER로 실행되므로
-- RLS를 우회함. 직접 insert/update/delete는 차단됨.


-- 5. push_subscriptions 테이블 — 누구나 구독(insert/update), 읽기/삭제는 서버만
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "push_sub_upsert_public" ON push_subscriptions;
CREATE POLICY "push_sub_upsert_public" ON push_subscriptions
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "push_sub_update_public" ON push_subscriptions;
CREATE POLICY "push_sub_update_public" ON push_subscriptions
  FOR UPDATE USING (true);

-- SELECT, DELETE는 정책 없음 → 기본 거부 (서버 service_role로만 가능)


-- 6. webtoon_series 테이블 — 공개 읽기, 쓰기는 인증만
ALTER TABLE webtoon_series ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "webtoon_series_select_public" ON webtoon_series;
CREATE POLICY "webtoon_series_select_public" ON webtoon_series
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "webtoon_series_insert_auth" ON webtoon_series;
CREATE POLICY "webtoon_series_insert_auth" ON webtoon_series
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "webtoon_series_update_auth" ON webtoon_series;
CREATE POLICY "webtoon_series_update_auth" ON webtoon_series
  FOR UPDATE USING (auth.role() = 'authenticated');


-- 7. webtoon_episodes 테이블 — 공개 읽기, 쓰기는 인증만
ALTER TABLE webtoon_episodes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "webtoon_episodes_select_public" ON webtoon_episodes;
CREATE POLICY "webtoon_episodes_select_public" ON webtoon_episodes
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "webtoon_episodes_insert_auth" ON webtoon_episodes;
CREATE POLICY "webtoon_episodes_insert_auth" ON webtoon_episodes
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "webtoon_episodes_update_auth" ON webtoon_episodes;
CREATE POLICY "webtoon_episodes_update_auth" ON webtoon_episodes
  FOR UPDATE USING (auth.role() = 'authenticated');


-- =====================================================
-- 확인: 모든 테이블에 RLS가 활성화되었는지 검증
-- =====================================================
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY tablename;
