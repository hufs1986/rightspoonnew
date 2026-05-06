-- =====================================================
-- 공소취소 방어전 — 랭킹 테이블 & RPC
-- Supabase Dashboard > SQL Editor 에서 실행하세요
-- =====================================================

-- 1. 랭킹 테이블
CREATE TABLE IF NOT EXISTS game_leaderboard (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nickname TEXT NOT NULL,
    survived_months INTEGER NOT NULL DEFAULT 0,
    democracy_score INTEGER NOT NULL DEFAULT 0,
    awareness_score INTEGER NOT NULL DEFAULT 0,
    cancel_progress INTEGER NOT NULL DEFAULT 0,
    ending_id TEXT NOT NULL,
    is_victory BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS 활성화
ALTER TABLE game_leaderboard ENABLE ROW LEVEL SECURITY;

-- 누구나 읽기 가능
DROP POLICY IF EXISTS "leaderboard_select_public" ON game_leaderboard;
CREATE POLICY "leaderboard_select_public" ON game_leaderboard
  FOR SELECT USING (true);

-- 누구나 등록 가능 (점수 제출)
DROP POLICY IF EXISTS "leaderboard_insert_public" ON game_leaderboard;
CREATE POLICY "leaderboard_insert_public" ON game_leaderboard
  FOR INSERT WITH CHECK (true);

-- 수정/삭제는 불가
-- (service_role로만 가능)

-- 2. 상위 랭킹 조회 RPC
CREATE OR REPLACE FUNCTION get_game_leaderboard(limit_count INTEGER DEFAULT 20)
RETURNS TABLE (
    id UUID,
    nickname TEXT,
    survived_months INTEGER,
    democracy_score INTEGER,
    awareness_score INTEGER,
    cancel_progress INTEGER,
    ending_id TEXT,
    is_victory BOOLEAN,
    created_at TIMESTAMPTZ
)
LANGUAGE sql
SECURITY DEFINER
AS $$
    SELECT id, nickname, survived_months, democracy_score, awareness_score,
           cancel_progress, ending_id, is_victory, created_at
    FROM game_leaderboard
    ORDER BY
        is_victory DESC,
        survived_months DESC,
        democracy_score DESC,
        created_at ASC
    LIMIT limit_count;
$$;

-- 3. 총 승리자 수 조회 RPC (기존 get_game_completion_count 대체)
CREATE OR REPLACE FUNCTION get_game_completion_count()
RETURNS INTEGER
LANGUAGE sql
SECURITY DEFINER
AS $$
    SELECT COALESCE(COUNT(*)::INTEGER, 0)
    FROM game_leaderboard
    WHERE is_victory = true;
$$;

-- 4. 인덱스
CREATE INDEX IF NOT EXISTS idx_leaderboard_ranking
    ON game_leaderboard (is_victory DESC, survived_months DESC, democracy_score DESC);
