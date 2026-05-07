-- =====================================================
-- 공소취소 방어전 (비주얼 노벨) — 엔딩 통계 테이블 & RPC
-- Supabase Dashboard > SQL Editor 에서 전체 복사 후 실행하세요
-- =====================================================

-- 1. 엔딩 통계 테이블 생성
CREATE TABLE IF NOT EXISTS ending_stats (
    id TEXT PRIMARY KEY,
    count INTEGER NOT NULL DEFAULT 0
);

-- 2. 초기 데이터 삽입 (최초 1회만 적용됨)
INSERT INTO ending_stats (id, count) VALUES
('bad_conceal', 0),
('bad_subordinate', 0),
('normal_scars', 0),
('true_justice', 0)
ON CONFLICT (id) DO NOTHING;

-- 3. RLS 활성화 및 권한 설정
ALTER TABLE ending_stats ENABLE ROW LEVEL SECURITY;

-- 누구나 읽기 가능 (타이틀 화면에서 통계 표시용)
DROP POLICY IF EXISTS "ending_stats_select_public" ON ending_stats;
CREATE POLICY "ending_stats_select_public" ON ending_stats
  FOR SELECT USING (true);

-- 클라이언트에서 직접 UPDATE를 방지하고 RPC(함수)를 통해서만 증가시키도록
-- 직접적인 UPDATE/INSERT 권한은 주지 않습니다.

-- 4. 특정 엔딩 카운트 1 증가 RPC
CREATE OR REPLACE FUNCTION increment_ending_count(ending_id_param TEXT)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
AS $$
    UPDATE ending_stats
    SET count = count + 1
    WHERE id = ending_id_param;
$$;
