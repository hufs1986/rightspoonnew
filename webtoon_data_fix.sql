-- 중복 시리즈 삭제 및 한글로 업데이트
-- Supabase SQL Editor에서 실행하세요.

-- 중복 삭제 (두 번째 것)
DELETE FROM public.webtoon_series WHERE id = 'ea42a5b7-9063-4ab3-bdfb-58f42661e04f';

-- 첫 번째 시리즈를 한글로 업데이트
UPDATE public.webtoon_series 
SET 
  title = '독립정신',
  description = '이승만 대통령의 독립정신을 만화로 만나보세요. 대한민국 건국의 아버지가 쓴 독립의 정신을 생생한 만화로 전합니다.'
WHERE id = 'b397c9e2-44c4-4a8d-8e35-d60dd06266f6';
