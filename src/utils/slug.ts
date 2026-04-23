/**
 * 한글 제목을 URL-safe slug로 변환
 * 예: "586세대 국회의원 42%의 위선" → "586세대-국회의원-42의-위선"
 */
export function generateSlug(title: string): string {
    return title
        .trim()
        .toLowerCase()
        .replace(/[%]/g, '')                  // 특수기호 제거
        .replace(/[^\w\s가-힣ㄱ-ㅎ-]/g, '')   // 영문, 한글, 숫자, 공백, 하이픈만 남김
        .replace(/\s+/g, '-')                 // 공백 → 하이픈
        .replace(/-+/g, '-')                  // 연속 하이픈 정리
        .replace(/^-+|-+$/g, '')              // 앞뒤 하이픈 제거
        .substring(0, 80);                    // 최대 80자
}
