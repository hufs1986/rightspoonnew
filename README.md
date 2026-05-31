# 오른스푼

드럼통119의 정치·사회 해설 본진입니다. 인스타그램과 유튜브에서 흘러가는 이슈를 오른스푼 도메인에 검색 가능한 글 자산으로 쌓는 것을 목표로 합니다.

## 운영 방향

- 뉴스 원문 복사가 아니라 출처 링크, 쟁점 정리, 운영자 관점, 결론을 붙여 발행합니다.
- AI는 자동발행 도구가 아니라 초안 구조화 도구로 사용합니다.
- 관리자 글쓰기의 `AI 소재 작업대`에서 뉴스 링크나 인스타 반응 소재를 입력하면 `/api/ai/draft`가 초안을 생성합니다.
- 글 상세의 `인스타 유입 키트`는 `/api/ai/share`로 캡션, 스토리, 고정 댓글 문구를 생성합니다.
- 공유 미리보기 이미지는 `/api/og`에서 제목이 포함된 동적 OG 이미지로 생성합니다.
- `OPENAI_API_KEY`가 없거나 API 호출이 실패하면 로컬 초안 생성기로 대체됩니다.
- 공개 신뢰 페이지 `/editorial-policy`에서 편집 원칙, AI 활용 기준, 정정 문의 절차를 안내합니다.
- RSS, robots, manifest는 검색·구독·설치 환경에서 오른스푼의 현재 정체성이 드러나도록 유지합니다.
- 관리자 `/admin/site-health`에서 환경변수, 검색 배관, 콘텐츠 발행 상태를 점검합니다.

## 환경 변수

Vercel 또는 `.env.local`에 아래 값을 설정합니다.

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
OPENAI_API_KEY=
OPENAI_MODEL=gpt-5.2
NEXT_PUBLIC_VAPID_PUBLIC_KEY=
VAPID_PRIVATE_KEY=
VAPID_EMAIL=
```

`OPENAI_MODEL`은 선택값입니다. 설정하지 않으면 AI 초안 API가 기본 모델을 사용합니다.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
