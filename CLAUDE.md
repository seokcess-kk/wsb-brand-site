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
pnpm exec playwright test -g "archives"                       # 이름으로 단일 테스트

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

**1. 공개 사이트 `src/app/[locale]/`** — next-intl 다국어. `routing.ts`의 `localePrefix: "as-needed"`로 한국어는 prefix 없는 `/`, 영문은 `/en`. 페이지는 홈(`page.tsx`) + `company` / `technology` / `business` / `r-and-d`(라우트 슬러그 `/r-and-d`) / `news` / `contact` 6개. 각 페이지는 `src/components/sections/*`(콘텐츠 블록)와 `src/components/visual/*`(커스텀 SVG/데이터 시각화: FDA 매칭표, MAT 다이어그램, growth curve 등)를 조합한다. 모션은 `motion` 패키지(ex-Framer Motion)를 `src/components/motion/*` 래퍼로 감싸 쓰고, `src/hooks/use-has-mounted`·`use-safe-reduced-motion`과 함께 hydration과 `prefers-reduced-motion`을 안전 처리한다. 이 둘 외에 `src/components/`에는 `layout/`(헤더·푸터·GNB), `seo/`(메타·JSON-LD), `admin/`(CMS UI)이 있다.

**2. 어드민 CMS `src/app/admin/`** — `(authed)` route group이 Auth.js로 보호된다. News / Inquiries / Files / Settings / Dashboard. 모든 어드민 라우트는 noindex. 인증은 단일 마스터 계정(`ADMIN_EMAIL`/`ADMIN_PASSWORD` env)을 Credentials provider로 검증(`src/auth.ts`). 보호는 `src/proxy.ts`(Next 16의 middleware 파일명)가 아니라 `auth.ts`의 `authorized` 콜백이 담당하며, 서버 액션은 `requireAdmin()`(`src/lib/admin-auth.ts`)으로 별도 가드한다.

### i18n

- locale 설정: `src/i18n/routing.ts`, request 로딩: `src/i18n/request.ts`, 네비게이션 헬퍼: `src/i18n/navigation.ts`.
- 번역은 **두 네임스페이스**로 분리: `messages/{locale}.json`(홈 + 글로벌 UI)와 `messages/pages.{locale}.json`(페이지별, `pages` 키 아래 머지됨). 새 페이지 카피는 `pages.*.json`에 넣을 것.

### 데이터 계층

- ORM: Drizzle + Supabase Postgres (`postgres.js` 드라이버, `drizzle-orm/postgres-js`). 스키마: `src/db/schema.ts` (테이블: `inquiries`, `news_posts`, `site_settings`, `uploaded_files`). 클라이언트: `src/db/client.ts`.
- 연결 분리: 앱 런타임은 `DATABASE_URL`(Supabase transaction pooler, 6543, `prepare:false`), 마이그레이션(`drizzle-kit`)은 `DIRECT_DATABASE_URL`(session/direct, 5432). 후자는 로컬·CI에서만 필요.
- 모든 쓰기는 `src/app/actions/*`의 **서버 액션** 경유(`inquiry`, `news`, `files`, `settings`). Zod로 입력 검증 후 `revalidatePath`로 어드민/공개 경로 갱신.
- 재사용 쿼리는 `src/lib/*-query.ts`(`inquiries-query`, `news-query`)로 중앙화 — 어드민 대시보드와 목록이 공유.
- 파일 업로드 실체는 Vercel Blob, 메타데이터만 `uploaded_files` 테이블에 추적.

### Graceful degradation (중요)

env가 비어 있어도 dev 빌드/렌더가 통과하도록 설계됨. 이 패턴을 깨지 말 것:

- `src/env.ts`가 모든 env를 Zod로 중앙 파싱. 빈 문자열 = 미설정으로 취급. 누락 허용. 환경변수 전체 목록과 Vercel 배포 절차는 `README.md`·`.env.example` 참고.
- `isDbConfigured()` / `isEmailConfigured()`로 소비처에서 존재 여부 확인 후 사용. DB 미설정 시 폼/어드민은 콘솔 로그로 fallback (`src/app/actions/inquiry.ts` 참고).
- 이메일(Resend)은 best-effort: 발송 실패가 폼 제출을 실패시키지 않는다.

### 테스트

- 러너는 **Playwright 하나**로 통일. `tests/unit/*`은 순수 lib 함수 검증(`file-kinds`, `inquiry-status`, `mailto`)이라 브라우저가 필요 없고, `tests/e2e/*`은 실제 플로우(문의 워크플로우)를 돈다.
- e2e는 `tests/helpers/seed.ts`로 DB를 시드한다 — DB env가 설정돼 있어야 의미 있는 결과가 나온다.

## Conventions

- 경로 alias: `@/*` → `src/*`.
- 카피·코드 주석·커밋 메시지에서 **em-dash(—) 금지**, 불필요한 쉼표 지양 (프로젝트 글쓰기 스타일).
- 실 자산이 도착하기 전에는 placeholder 사용 (Hero 사진, 파트너 로고, News 썸네일, Phytopresso 외부 URL, 지도 임베드 등).
