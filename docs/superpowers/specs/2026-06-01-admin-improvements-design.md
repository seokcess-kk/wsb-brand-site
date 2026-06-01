# WSB 어드민 v1.1 보완·개선 설계

- 작성일: 2026-06-01
- 대상: `wsb-brand-site` 어드민 (`/admin`)
- 목표: 이미 구현된 어드민 v1.0의 기존 기능을 보완·개선한다. 신규 대형 기능은 추가하지 않는다.

## 1. 배경

어드민 v1.0은 아래가 이미 구현되어 있다.

- 인증: 단일 마스터 계정(NextAuth Credentials, JWT 8시간)
- 화면 5개: Dashboard / News(CRUD) / Inquiries(목록+CSV) / Files(업로드) / Settings(수신 이메일)
- DB 테이블 4개: `inquiries`, `news_posts`, `site_settings`, `uploaded_files`

진단 결과 다음 공백이 확인됐다.

- **문의(Inquiries)**: 상세 페이지가 없어 본문 메시지를 어드민에서 볼 수 없다(CSV로만 확인). `status` 필드는 있으나 변경 UI·액션이 없어 항상 `new`로 고정된다. 필터·검색·페이지네이션이 없다(하드 limit 200).
- **파일(Files)**: `deleteFile` 액션은 있으나 목록에 삭제 버튼이 없다. URL 복사 버튼도 없다.
- **News**: 목록에서 발행 토글 불가, 검색·필터 없음, 미리보기 링크 없음.
- **Settings**: 메모리 명세의 "1차·2차/CC 수신 이메일"이 단일 목록으로 단순화됨(이번 범위에서 변경하지 않음).

## 2. 범위

네 영역을 보완한다. 핵심은 문의 워크플로우다.

1. 문의 워크플로우 (상세 열람 + 상태 관리 + mailto 답장 + 필터/검색/페이지네이션)
2. 파일 관리 보완 (삭제, URL 복사, 종류 라벨)
3. News 운영 편의 (발행 토글, 검색/필터, 미리보기 링크)
4. 대시보드 강화 (최근 문의 + 빠른 보관)

**범위 밖**: 다중 관리자 권한, 페이지 콘텐츠 CMS, 뉴스레터, 채널톡, Settings 수신 이메일 구조 변경.

## 3. 핵심 결정사항

- **답장 방식**: `mailto:` 링크(추가 인프라 0). 어드민 내 직접 발송은 하지 않는다.
- **상태 모델(4단계)**: `new → read → replied → archived`.
  - `read`: 상세 페이지 열람 시 자동 전환(현재 `new`인 경우).
  - `replied`: **답장(mailto) 클릭 시 자동 전환**(실제 발송은 확인 불가하므로 낙관적 처리).
  - `archived`: 수동 전환.
  - 단계는 강제 선형이 아니며 버튼으로 임의 전환 가능하다.
- **신규 테이블·컬럼 없음**: 기존 `inquiries.status`(varchar)를 재사용한다.
- **구현 순서**: 가치 우선 단계별(Phase 1 → 2 → 3). 각 단계는 독립 출시·검증 가능.

## 4. 데이터 모델

신규 테이블·컬럼 없음. `inquiries.status` 허용 값을 `new | read | replied | archived`로 표준화하고, 서버 액션에서 zod enum으로 검증한다.

> 향후 `repliedAt` 등 타임스탬프가 필요하면 별도 마이그레이션으로 확장한다(이번 범위 밖).

## 5. 공통 요소 (Phase 1에서 생성, 이후 단계가 공유)

각 단위는 하나의 명확한 책임을 가지며 독립적으로 이해·테스트 가능해야 한다.

| 단위 | 경로 | 책임 |
|---|---|---|
| `requireAdmin()` | `src/lib/admin-auth.ts` | 각 액션 파일에 중복된 인증 가드를 한 곳으로 추출 |
| `StatusBadge` | `src/components/admin/status-badge.tsx` | 상태 → 색상/라벨 배지. 목록·상세·대시보드 공유 |
| `CopyButton` | `src/components/admin/copy-button.tsx` | 클립보드 복사(미지원 시 폴백) 클라이언트 컴포넌트 |

## 6. Phase 1 — 문의 워크플로우

### 6.1 서버 액션 (`src/app/actions/inquiry.ts`에 추가)

공개 제출 로직(`submitInquiry`)과 분리된 독립 export로 추가한다.

- `updateInquiryStatus(id: number, status: 'read' | 'replied' | 'archived')`
  - `requireAdmin()` → zod로 `status` enum 검증 → `isDbConfigured()` 가드 → 업데이트 → `revalidatePath('/admin/inquiries')` 및 상세 경로.
- `listInquiries({ status?, q?, page? })`
  - 상태 필터(`status`), 검색(`q`: company·name·email ILIKE), 페이지네이션(50건/페이지) 처리. 총 건수도 반환.

### 6.2 목록 페이지 `/admin/inquiries`

- 상태 필터 탭(All / New / Read / Replied / Archived): `?status=` 쿼리 링크(클라이언트 JS 불필요).
- 검색창: `?q=` GET 폼.
- 페이지네이션: 50건/페이지, `?page=`, 이전/다음. 기존 하드 limit 200 대체.
- 행: 메시지 미리보기(말줄임) 열 추가, 클릭 시 상세로 이동.

### 6.3 상세 페이지 `/admin/inquiries/[id]` (RSC, `force-dynamic`)

- 표시: 회사·이름·이메일(복사 버튼)·전화·국가·카테고리·언어·접수일시·**본문 메시지(줄바꿈 보존)**·현재 상태 배지.
- 없는 id → `notFound()`.
- **자동 읽음**: status가 `new`면 클라이언트 `<MarkRead/>`가 마운트 시 `updateInquiryStatus(id, 'read')` 호출. (RSC 렌더 중 DB 쓰기 부작용 회피)
- 액션 버튼:
  - **답장**: `ReplyButton` — `<a href="mailto:{email}?subject=Re: [WSB] {category} inquiry&body={인사말 템플릿}">`. `onClick`에서 `updateInquiryStatus(id, 'replied')`를 함께 호출(메일 클라이언트는 정상적으로 열림).
  - **보관 / 보관 해제**: archived ↔ read 전환.

### 6.4 컴포넌트

- `InquiryStatusActions` (클라이언트): 상태 전환 버튼.
- `ReplyButton` (클라이언트): mailto + 낙관적 replied 전환.
- `MarkRead` (클라이언트): 마운트 시 자동 읽음.
- `InquiryFilters`: 상태 탭(링크) + 검색 폼(최소 클라이언트).

## 7. Phase 2 — 파일 관리 보완

- **삭제 버튼**: 목록 각 행에 삭제(기존 `deleteFile` 연결). `confirm()` 후 실행하는 `FileRowActions` 클라이언트 컴포넌트.
- **URL 복사**: 각 행에 공통 `CopyButton`으로 Blob URL 복사.
- **종류 라벨**: `kind` 코드를 한국어 라벨로 매핑(예: `pdf_company_intro` → "회사소개서 PDF"). 매핑 상수 1개, 스키마 변경 없음.

## 8. Phase 2 — News 운영 편의

- **발행 토글**: 신규 액션 `toggleNewsPublished(id, next)` + `NewsPublishToggle` 클라이언트 컴포넌트로 목록에서 직접 전환.
- **검색·필터**: titleKo·slug 검색(`?q=`), 카테고리 필터(`?category=`). 서버 조회.
- **미리보기 링크**: 발행 글은 공개 페이지(`/news/{slug}`, `/en/news/{slug}`)를 새 탭으로 여는 링크. 비발행 글은 공개 라우트에 노출되지 않으므로 미리보기는 발행 후 의미가 있다고 UI에 표기.

## 9. Phase 3 — 대시보드 강화

- **최근 문의 5건**: 상태 배지 + 상세 링크. 기존 통계 카드 아래 배치.
- **빠른 처리**: 최근 문의 행에서 바로 "보관"(상세와 동일한 액션 재사용).

## 10. 에러 처리 (전 영역 공통)

- 신규 액션: `requireAdmin()`(미인증 throw) → `isDbConfigured()` 가드 → `try/catch` + `console.error` → `revalidatePath`.
- 상세 페이지: 없는/잘못된 id → `notFound()`.
- 클립보드: `navigator.clipboard` 미지원 시 폴백 또는 안내.
- mailto: 순수 링크라 실패 경로 없음. 자동 `replied` 전환 실패는 조용히 로깅하고 답장 동작은 막지 않는다.
- 상태 값: zod enum 서버 검증(허용 외 값 거부).

## 11. 검증

- 단계별로 `tsc --noEmit` + `eslint` 통과.
- 각 어드민 화면을 dev 서버로 스모크 확인(`scripts/screenshot.mjs`).
- **Playwright 스모크 테스트(포함)**: 문의 상태 전환 핵심 흐름을 자동화한다.
  - 시나리오: 로그인 → 문의 목록 → 신규 문의 상세 진입(자동 `read` 확인) → 답장 클릭으로 `replied` 전환 확인 → 보관으로 `archived` 전환 확인 → 목록 상태 필터 동작 확인.
  - 시드 데이터(테스트용 문의 1건)는 테스트 셋업에서 DB에 삽입하거나 픽스처로 준비한다.
  - 기존 `scripts/screenshot.mjs`가 쓰는 Playwright를 재사용한다.

## 12. 구현 순서 (단계별 출시)

1. **Phase 1**: 공통 요소(`admin-auth`, `StatusBadge`, `CopyButton`) → 문의 액션 → 목록 필터/검색/페이지네이션 → 상세 페이지 → 자동 읽음/답장/보관 → Playwright 스모크.
2. **Phase 2**: Files 삭제/복사/라벨 → News 발행 토글/검색/미리보기.
3. **Phase 3**: 대시보드 최근 문의 + 빠른 보관.

각 Phase 종료 시 타입 체크·린트·시각 검증을 수행한다.
