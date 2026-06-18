# WSB Brand Site

우리스마트바이오(Woori Smart Bio) 공식 브랜드 사이트.

> Engineered by Data, Grown by Design.

## Stack

- Next.js 16 (App Router, Turbopack)
- React 19, Tailwind v4
- next-intl (`/` 한국어 기본, `/en` 영문)
- Drizzle ORM + Supabase Postgres
- Resend (transactional email)
- Vercel Blob (file uploads)
- Auth.js v5 (admin)
- Motion (`motion` package, ex-Framer Motion)
- Playwright (자체 시각 검증)

## Local development

```bash
pnpm install
cp .env.example .env.local   # 또는 직접 작성
pnpm dev
```

http://localhost:3000 (포트 사용 중이면 자동으로 다음 포트)

### 환경 변수

`.env.example` 참고. 모든 변수는 비어있어도 dev 빌드는 통과합니다 (graceful fallback).

| Key | 용도 | 비고 |
|---|---|---|
| `DATABASE_URL` | Supabase Postgres (transaction pooler, 6543) | 없으면 폼/어드민이 콘솔 로그로 fallback |
| `DIRECT_DATABASE_URL` | 마이그레이션 전용 (direct/session, 5432) | `drizzle-kit`에서만 사용. 로컬·CI |
| `RESEND_API_KEY` | 알림·자동회신 메일 | 없으면 콘솔 로그로 fallback |
| `RESEND_FROM` | 발신 주소 | 도메인 verification 필요 |
| `INQUIRY_NOTIFY_TO` | 폼 알림 수신 (콤마 구분) | 어드민 설정에서 override 가능 |
| `AUTH_SECRET` | NextAuth 세션 서명 | `openssl rand -base64 32` |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | 마스터 계정 | 단일 사용자 |
| `BLOB_READ_WRITE_TOKEN` | Vercel Blob | 어드민 파일 업로드 |
| `NEXT_PUBLIC_GA_ID` / `NEXT_PUBLIC_GTM_ID` | 분석 | 선택 |
| `NEXT_PUBLIC_SITE_URL` | 절대 URL | sitemap·이메일·OG |

## DB

```bash
pnpm db:generate    # 스키마 변경 후 마이그레이션 SQL 생성
pnpm db:push        # 스키마를 DB에 즉시 반영 (개발 단계)
pnpm db:studio      # Drizzle Studio (GUI)
```

## Admin

- 경로: `/admin/sign-in`
- 단일 마스터 계정 (env에 `ADMIN_EMAIL` / `ADMIN_PASSWORD`)
- 페이지: Dashboard / News / Inquiries / Files / Settings
- 모든 어드민 라우트는 `robots: noindex`

## Visual verification

```bash
pnpm exec playwright install chromium       # 첫 사용 시
node scripts/screenshot.mjs / out.png       # 전체 페이지
node scripts/screenshot.mjs / hero.png desktop "section[aria-labelledby=hero-heading]"
```

`.shots/` 폴더는 git ignored.

## Deploy on Vercel

1. Vercel에서 새 프로젝트 import (이 레포)
2. **Storage** 탭에서 Neon Postgres + Vercel Blob 추가
   - 자동으로 `DATABASE_URL`, `BLOB_READ_WRITE_TOKEN` 환경변수가 프로젝트에 주입됩니다
3. **Settings → Environment Variables**에서 추가:
   - `RESEND_API_KEY` (Resend 대시보드에서 발급)
   - `RESEND_FROM` (예: `dasom@woorismartbio.com`. 도메인 verification 완료된 주소)
   - `INQUIRY_NOTIFY_TO` (콤마 구분 가능)
   - `AUTH_SECRET` (`openssl rand -base64 32`)
   - `ADMIN_EMAIL`, `ADMIN_PASSWORD`
   - `NEXT_PUBLIC_SITE_URL` (`https://woorismartbio.com`)
   - (선택) `NEXT_PUBLIC_GA_ID`, `NEXT_PUBLIC_GTM_ID`
4. **Deploy** 첫 배포가 끝나면:

   ```bash
   vercel env pull .env.local        # 로컬에서 production env 가져오기
   pnpm db:push                       # production DB에 스키마 적용
   ```

5. **Domain**: Vercel `Settings → Domains`에서 `woorismartbio.com` 연결

## Asset placeholders

다음은 placeholder로 처리되어 있고, 실 자산이 도착하면 교체합니다:

- Hero 우측: 정밀제어 스마트팜 사진
- Traction: 파트너 10곳 로고
- News: 카드별 썸네일
- Phytopresso 외부 판매사이트 URL
- Google Maps 임베드 (현재 시각적 placeholder)

자세한 자산 요청 리스트는 `memory/project_wsb_asset_requests.md` 참고.
