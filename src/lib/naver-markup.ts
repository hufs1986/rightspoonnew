export const NAVER_DESC_MAX = 80;

export function naverClamp(text: string, max = NAVER_DESC_MAX): string {
  if (!text) return "";
  const trimmed = text.trim().replace(/\s+/g, " ");
  if (trimmed.length <= max) return trimmed;
  return `${trimmed.slice(0, max - 1).trimEnd()}…`;
}
