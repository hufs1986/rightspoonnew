-- site_stats 테이블에 게임 완주 카운트 컬럼 추가
ALTER TABLE site_stats ADD COLUMN IF NOT EXISTS game_completion_count BIGINT DEFAULT 0;

-- 게임 완주 카운트 증가 RPC 함수
CREATE OR REPLACE FUNCTION increment_game_completion()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE site_stats SET game_completion_count = game_completion_count + 1 WHERE id = 1;
END;
$$;

-- 게임 완주 카운트 조회 RPC 함수
CREATE OR REPLACE FUNCTION get_game_completion_count()
RETURNS BIGINT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result BIGINT;
BEGIN
  SELECT game_completion_count INTO result FROM site_stats WHERE id = 1;
  RETURN COALESCE(result, 0);
END;
$$;
