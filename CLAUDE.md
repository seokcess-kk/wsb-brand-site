# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

우리스마트바이오(Woori Smart Bio) 공식 브랜드 사이트. B2B 기술 신뢰 중심의 한·영 이중언어 사이트 + 단일 마스터 계정 어드민 CMS.

## Commands

Package manager는 **pnpm**. (`pnpm-lock.yaml`, `pnpm-workspace.yaml` 사용)

```bash
pnpm dev                       # Next.js dev (Turbopack), http://localhost:3000
pnpm build                     # 프로덕션 빌드
pnpm lint                      # ESLint (eslint-config-next)

pnpm test                      # Playwright 전체
pnpm test:unit                 # tests/unit 만
pnpm test:e2e                  # tests/e2e 만
pnpm exec playwright test tests/unit/inquiry-status.spec.ts   # 단일 파일
pnpm exec playwright test -g "archived"                       # 이름으로 단일 테스트

pnpm db:generate               # 스키마 변경 → 마이그레이션 SQL 생성 (drizzle/)
pnpm db:push                   # 스키마를 DB에 즉시 반영 (개발)
pnpm db:studio                 # Drizzle Studio GUI
```

시각 검증 (dev 서버 실행 중일 때):

```bash
pnpm exec playwright install chromium                          # 첫 사용 시
node scripts/screenshot.mjs / out.png                          # 전체 페이지
node scripts/screenshot.mjs / hero.png desktop "section[...]"  # 특정 selector만 (full element)
```

주의: screenshot 스크립트 기본 BASE는 `localhost:3002`인데 `pnpm dev`는 `3000`에서 뜬다. `SHOT_BASE=http://localhost:3000 node scripts/screenshot.mjs ...`로 맞추거나 dev를 3002에서 실행할 것. viewport 인자: `desktop`(1440) / `tablet`(834) / `mobile`(390).

## Architecture

Next.js 16 App Router + React 19 + Tailwind v4. 두 개의 독립적인 영역이 한 `src/app` 트리에 공존한다.

**1. 공개 사이트 `src/app/[locale]/`** — next-intl 다국어. `routing.ts`의 `localePrefix: "as-needed"`로 한국어는 prefix 없는 `/`, 영문은 `/en`. 페이지는 홈(`page.tsx`) + `company` / `technology` / `business` / `r-and-d`(라우트 슬러그 `/r-and-d`) / `news` / `contact` 6개. 각 페이지는 `src/components/sections/*`(콘텐츠 블록, FDA 매칭표 `fda-table` 포함)와 `src/components/visual/*`(커스텀 SVG·데이터 시각화: MAT 다이어그램, growth curve, match-radial 등)를 조합한다. 모션은 `motion` 패키지(ex-Framer Motion)를 `src/components/motion/*` 래퍼로 감싸 쓰고, `src/hooks/use-has-mounted`·`use-safe-reduced-motion`과 함께 hydration과 `prefers-reduced-motion`을 안전 처리한다. scroll reveal 래퍼(`reveal-on-view`, `fade-in-section`)는 mount 이후 `!reducedMotion && IntersectionObserver`일 때만 hidden으로 전환하므로 no-JS·SSR·reduced-motion 방문자에게 콘텐츠가 `opacity:0`으로 숨지 않는다. 새 reveal 컴포넌트 추가 시 이 불변식을 유지할 것. 이 둘 외에 `src/components/`에는 `layout/`(헤더·푸터·GNB), `seo/`(메타·JSON-LD), `admin/`(CMS UI)이 있다.

**2. 어드민 CMS `src/app/admin/`** — `(authed)` route group이 Auth.js로 보호된다. News / Inquiries / Files / Settings / Dashboard. 모든 어드민 라우트는 noindex. 인증은 단일 마스터 계정(`ADMIN_EMAIL`/`ADMIN_PASSWORD` env)을 Credentials provider로 검증(`src/auth.ts`). 라우트 보호는 `(authed)/layout.tsx`가 담당한다(서버에서 `await auth()` 후 세션 없으면 `/admin/sign-in`으로 redirect). `auth.ts`의 `authorized` 콜백은 `auth`를 미들웨어로 export할 때만 작동하는데 `src/proxy.ts`(Next 16 middleware 파일명)는 next-intl만 돌리고 matcher가 `/admin`을 제외하므로 사실상 호출되지 않는다. 따라서 새 어드민 페이지는 반드시 `(authed)` 그룹 안에 둘 것(밖에 두면 무보호). 서버 액션은 `requireAdmin()`(`src/lib/admin-auth.ts`)으로 별도 가드한다.

### i18n

- locale 설정: `src/i18n/routing.ts`, request 로딩: `src/i18n/request.ts`, 네비게이션 헬퍼: `src/i18n/navigation.ts`.
- 번역은 **두 네임스페이스**로 분리: `messages/{locale}.json`(홈 + 글로벌 UI)와 `messages/pages.{locale}.json`(페이지별, `pages` 키 아래 머지됨). 새 페이지 카피는 `pages.*.json`에 넣을 것.

### 데이터 계층

- ORM: Drizzle + Supabase Postgres (`postgres.js` 드라이버, `drizzle-orm/postgres-js`). 스키마: `src/db/schema.ts` (테이블: `inquiries`, `news_posts`, `site_settings`, `uploaded_files`). 클라이언트: `src/db/client.ts`.
- 연결 분리: 앱 런타임은 `DATABASE_URL`(Supabase transaction pooler, 6543, `prepare:false`), 마이그레이션(`drizzle-kit`)은 `DIRECT_DATABASE_URL`(session/direct, 5432) 사용. 미설정 시 `DATABASE_URL`(6543 pooler)로 fallback한다(`drizzle.config.ts`). 후자는 로컬·CI에서만 필요.
- 모든 쓰기는 `src/app/actions/*`의 **서버 액션** 경유(`inquiry`, `news`, `files`, `settings`). Zod로 입력 검증 후 `revalidatePath`로 어드민/공개 경로 갱신.
- 재사용 쿼리는 `src/lib/*-query.ts`(`inquiries-query`, `news-query`)로 중앙화 — 어드민 대시보드와 목록이 공유.
- 파일 업로드 실체는 Vercel Blob, 메타데이터만 `uploaded_files` 테이블에 추적.

### Graceful degradation (중요)

env가 비어 있어도 dev 빌드/렌더가 통과하도록 설계됨. 이 패턴을 깨지 말 것:

- `src/env.ts`가 주요 env(`DATABASE_URL`, `RESEND_*`, `INQUIRY_NOTIFY_TO`, `AUTH_SECRET`, `NEXT_PUBLIC_SITE_URL`)를 Zod로 파싱. 빈 문자열 = 미설정으로 취급. 누락 허용. 단 `ADMIN_EMAIL`/`ADMIN_PASSWORD`(`src/auth.ts`), `DIRECT_DATABASE_URL`(`drizzle.config.ts`), `BLOB_READ_WRITE_TOKEN`(`src/app/actions/files.ts`)은 env.ts를 거치지 않고 `process.env`에서 직접 읽는다. 환경변수 전체 목록과 Vercel 배포 절차는 `README.md`·`.env.example` 참고.
- `isDbConfigured()`(`src/db/client.ts`) / `isEmailConfigured()`(`src/lib/email.ts`)로 소비처에서 존재 여부 확인 후 사용. `db()`는 lazy 생성이고 `DATABASE_URL`이 없으면 throw하므로 모든 `db()` 호출은 `isDbConfigured()` 가드 뒤에 둘 것. DB 미설정 시 공개 문의 폼만 콘솔 로그로 fallback(`[inquiry:fallback]`, `src/app/actions/inquiry.ts`)하고, 어드민 쓰기 액션은 에러 상태를 반환하거나 no-op한다.
- 이메일(Resend)은 best-effort: 발송 실패가 폼 제출을 실패시키지 않는다.

### 테스트

- 러너는 **Playwright 하나**로 통일. `tests/unit/*`은 순수 lib 함수 검증(`file-kinds`, `inquiry-status`, `mailto`)이라 브라우저가 필요 없고, `tests/e2e/*`은 실제 플로우(문의 워크플로우)를 돈다.
- 단 `playwright.config.ts`가 모든 실행에서 자체 dev 서버를 `3100`에 띄운다(`reuseExistingServer`). 그래서 `pnpm dev`(3000)·screenshot(3002)와 포트가 다르고 `test:unit`도 이 서버 기동을 기다린다.
- e2e는 `tests/helpers/seed.ts`로 DB를 시드한다. skip되지 않으려면 `.env.local`에 `DATABASE_URL`·`ADMIN_EMAIL`·`ADMIN_PASSWORD` 3개가 필요하다(테스트는 `src/env.ts`를 우회해 `process.env`에서 직접 읽음).

## Conventions

- 경로 alias: `@/*` → `src/*`.
- 카피·코드 주석·커밋 메시지에서 **em-dash(—) 금지**, 불필요한 쉼표 지양 (프로젝트 글쓰기 스타일).
- 실 자산이 도착하기 전에는 placeholder 사용 (Hero 사진, 파트너 로고, News 썸네일, Phytopresso 외부 URL, 지도 임베드 등).
