# WSB 어드민 v1.1 보완·개선 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 기존 어드민(`/admin`)의 문의 워크플로우·파일·News·대시보드를 보완해 운영 가능한 v1.1로 만든다.

**Architecture:** 신규 테이블 없이 기존 `inquiries.status`를 4단계(`new/read/replied/archived`)로 표준화한다. 순수 로직(상태·mailto·파일종류)은 alias 없는 `src/lib/*` 모듈로 분리해 단위 테스트하고, 상태 변경은 server action으로, 목록 조회는 plain query 헬퍼로 구현한다. 답장은 mailto 링크로 처리하며 클릭 시 낙관적으로 `replied` 전환한다.

**Tech Stack:** Next.js 16 App Router(RSC + server actions), Drizzle(Neon HTTP), zod, Tailwind, lucide-react, Playwright(@playwright/test).

**스펙:** `docs/superpowers/specs/2026-06-01-admin-improvements-design.md`

---

## 파일 구조 (생성/수정 대상)

**공통 (Phase 1에서 생성)**
- Create `src/lib/admin-auth.ts` — `requireAdmin()` 단일 정의
- Create `src/lib/inquiry-status.ts` — 상태 상수·타입·zod enum·배지 메타
- Create `src/components/admin/status-badge.tsx` — 상태 배지 (목록·상세·대시보드 공유)
- Create `src/components/admin/copy-button.tsx` — 클립보드 복사 클라이언트 컴포넌트
- Modify `src/app/actions/news.ts`, `files.ts`, `settings.ts`, `inquiry.ts` — 중복 `requireAdmin` 제거 후 공통 모듈 사용

**Phase 1 — 문의 워크플로우**
- Create `src/lib/mailto.ts` — `buildReplyMailto()`
- Create `src/lib/inquiries-query.ts` — `listInquiries()` (필터·검색·페이지네이션)
- Modify `src/app/actions/inquiry.ts` — `updateInquiryStatus()` 추가
- Modify `src/app/admin/(authed)/inquiries/page.tsx` — 필터/검색/페이지네이션
- Create `src/components/admin/inquiry-filters.tsx` — 상태 탭 + 검색 폼
- Create `src/app/admin/(authed)/inquiries/[id]/page.tsx` — 상세
- Create `src/components/admin/mark-read.tsx` — 열람 시 자동 읽음
- Create `src/components/admin/inquiry-actions.tsx` — 답장(mailto+replied) + 보관
- Create `playwright.config.ts`, `tests/helpers/seed.ts`, `tests/unit/*.spec.ts`, `tests/e2e/inquiry-workflow.spec.ts`
- Modify `package.json` — test 스크립트

**Phase 2 — Files·News**
- Create `src/lib/file-kinds.ts` — kind 라벨 매핑
- Create `src/components/admin/file-row-actions.tsx` — 삭제 + URL 복사
- Modify `src/app/admin/(authed)/files/page.tsx`
- Create `src/lib/news-query.ts` — `listNews()`
- Modify `src/app/actions/news.ts` — `toggleNewsPublished()`
- Create `src/components/admin/news-publish-toggle.tsx`
- Create `src/components/admin/news-filters.tsx`
- Modify `src/app/admin/(authed)/news/page.tsx`

**Phase 3 — 대시보드**
- Create `src/components/admin/quick-archive-button.tsx`
- Modify `src/app/admin/(authed)/page.tsx`

---

# Phase 1 — 문의 워크플로우

## Task 1: 공통 `requireAdmin` 추출

**Files:**
- Create: `src/lib/admin-auth.ts`
- Modify: `src/app/actions/news.ts`, `src/app/actions/files.ts`, `src/app/actions/settings.ts`, `src/app/actions/inquiry.ts`

- [ ] **Step 1: 공통 모듈 생성**

`src/lib/admin-auth.ts`:

```ts
import { auth } from "@/auth";

/** Throws "Unauthorized" if the current request is not an authenticated admin. */
export async function requireAdmin() {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");
}
```

- [ ] **Step 2: news.ts 리팩터**

`src/app/actions/news.ts` 상단 import에 추가하고 로컬 `requireAdmin` 정의(함수 블록 전체)를 삭제한다.

추가 import (기존 `import { auth } from "@/auth";` 줄을 대체):

```ts
import { requireAdmin } from "@/lib/admin-auth";
```

삭제할 블록:

```ts
async function requireAdmin() {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");
}
```

- [ ] **Step 3: files.ts 리팩터**

`src/app/actions/files.ts`에서 `import { auth } from "@/auth";`를 `import { requireAdmin } from "@/lib/admin-auth";`로 바꾸고 로컬 `requireAdmin` 정의 블록을 삭제한다(news.ts와 동일한 블록).

- [ ] **Step 4: settings.ts 리팩터**

`src/app/actions/settings.ts`에서 `import { auth } from "@/auth";`를 `import { requireAdmin } from "@/lib/admin-auth";`로 바꾸고 로컬 `requireAdmin` 정의 블록을 삭제한다.

- [ ] **Step 5: 타입 체크**

Run: `npx tsc --noEmit`
Expected: 에러 0 (EXIT 0). `auth` 미사용 import가 남아 lint 경고가 나면 해당 줄 제거.

- [ ] **Step 6: 커밋**

```bash
git add src/lib/admin-auth.ts src/app/actions/news.ts src/app/actions/files.ts src/app/actions/settings.ts
git commit -m "Extract shared requireAdmin into src/lib/admin-auth

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Task 2: 문의 상태 모듈 (단위 테스트 우선)

**Files:**
- Create: `src/lib/inquiry-status.ts`
- Test: `tests/unit/inquiry-status.spec.ts`

- [ ] **Step 1: 실패하는 테스트 작성**

`tests/unit/inquiry-status.spec.ts`:

```ts
import { test, expect } from "@playwright/test";
import {
  isInquiryStatus,
  settableStatusSchema,
  STATUS_META,
  INQUIRY_STATUSES,
} from "../../src/lib/inquiry-status";

test("isInquiryStatus accepts known, rejects unknown", () => {
  expect(isInquiryStatus("new")).toBe(true);
  expect(isInquiryStatus("archived")).toBe(true);
  expect(isInquiryStatus("bogus")).toBe(false);
});

test("settableStatusSchema rejects 'new'", () => {
  expect(settableStatusSchema.safeParse("read").success).toBe(true);
  expect(settableStatusSchema.safeParse("new").success).toBe(false);
});

test("every status has badge meta", () => {
  for (const s of INQUIRY_STATUSES) {
    expect(STATUS_META[s].label.length).toBeGreaterThan(0);
  }
});
```

- [ ] **Step 2: 테스트 실패 확인**

Run: `npx playwright test tests/unit/inquiry-status.spec.ts`
Expected: FAIL — 모듈을 찾을 수 없음 (Cannot find module). (Playwright 미설정 시 Task 11에서 config를 만들기 전이라면 이 Task의 테스트 실행은 Task 11 완료 후 일괄 수행해도 된다. 그 경우 Step 2/4는 "작성만" 하고 Task 11에서 green 확인.)

- [ ] **Step 3: 구현**

`src/lib/inquiry-status.ts`:

```ts
import { z } from "zod";

export const INQUIRY_STATUSES = ["new", "read", "replied", "archived"] as const;
export type InquiryStatus = (typeof INQUIRY_STATUSES)[number];

/** Statuses an admin can set explicitly (excludes the implicit initial "new"). */
export const SETTABLE_STATUSES = ["read", "replied", "archived"] as const;
export type SettableStatus = (typeof SETTABLE_STATUSES)[number];

export const settableStatusSchema = z.enum(SETTABLE_STATUSES);

export function isInquiryStatus(value: string): value is InquiryStatus {
  return (INQUIRY_STATUSES as readonly string[]).includes(value);
}

export const STATUS_META: Record<
  InquiryStatus,
  { label: string; className: string }
> = {
  new: { label: "New", className: "bg-primary/10 text-primary" },
  read: { label: "Read", className: "bg-structural/10 text-structural/65" },
  replied: { label: "Replied", className: "bg-emerald-100 text-emerald-700" },
  archived: { label: "Archived", className: "bg-structural/5 text-structural/40" },
};
```

- [ ] **Step 4: 테스트 통과 확인**

Run: `npx playwright test tests/unit/inquiry-status.spec.ts`
Expected: PASS (Task 11에서 config 생성 후 실행하는 경우 그때 확인).

- [ ] **Step 5: 커밋**

```bash
git add src/lib/inquiry-status.ts tests/unit/inquiry-status.spec.ts
git commit -m "Add inquiry status model with unit tests

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Task 3: StatusBadge 컴포넌트

**Files:**
- Create: `src/components/admin/status-badge.tsx`
- Modify: `src/app/admin/(authed)/inquiries/page.tsx` (로컬 `StatusBadge` 제거, 공통 사용)

- [ ] **Step 1: 컴포넌트 생성**

`src/components/admin/status-badge.tsx`:

```tsx
import { isInquiryStatus, STATUS_META } from "@/lib/inquiry-status";

export function StatusBadge({ status }: { status: string }) {
  const meta = isInquiryStatus(status)
    ? STATUS_META[status]
    : { label: status, className: "bg-structural/10 text-structural/65" };
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 font-mono text-[10px] font-medium uppercase tracking-[0.08em] ${meta.className}`}
    >
      {meta.label}
    </span>
  );
}
```

- [ ] **Step 2: inquiries 목록 페이지에서 공통 사용**

`src/app/admin/(authed)/inquiries/page.tsx` 하단의 로컬 `function StatusBadge(...)` 정의 전체를 삭제하고, 상단에 import 추가:

```ts
import { StatusBadge } from "@/components/admin/status-badge";
```

(이 파일은 Task 8에서 전면 교체되므로, 여기서는 import만 추가하고 로컬 정의를 지워 중복을 없앤다.)

- [ ] **Step 3: 타입 체크**

Run: `npx tsc --noEmit`
Expected: EXIT 0.

- [ ] **Step 4: 커밋**

```bash
git add src/components/admin/status-badge.tsx "src/app/admin/(authed)/inquiries/page.tsx"
git commit -m "Add shared StatusBadge component

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Task 4: CopyButton 컴포넌트

**Files:**
- Create: `src/components/admin/copy-button.tsx`

- [ ] **Step 1: 컴포넌트 생성**

`src/components/admin/copy-button.tsx`:

```tsx
"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";

export function CopyButton({
  value,
  label = "Copy",
  className,
}: {
  value: string;
  label?: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(value);
      } else {
        const ta = document.createElement("textarea");
        ta.value = value;
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard blocked; the value is still visible for manual copy.
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={
        className ??
        "inline-flex items-center gap-1 text-xs text-structural/60 hover:text-primary"
      }
    >
      {copied ? <Check size={12} /> : <Copy size={12} />}
      {copied ? "Copied" : label}
    </button>
  );
}
```

- [ ] **Step 2: 타입 체크**

Run: `npx tsc --noEmit`
Expected: EXIT 0. (`Copy`/`Check`가 lucide-react에 없다고 에러나면 import를 `Clipboard`/`ClipboardCheck`로 교체.)

- [ ] **Step 3: 커밋**

```bash
git add src/components/admin/copy-button.tsx
git commit -m "Add CopyButton component with clipboard fallback

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Task 5: mailto 빌더 (단위 테스트 우선)

**Files:**
- Create: `src/lib/mailto.ts`
- Test: `tests/unit/mailto.spec.ts`

- [ ] **Step 1: 실패하는 테스트 작성**

`tests/unit/mailto.spec.ts`:

```ts
import { test, expect } from "@playwright/test";
import { buildReplyMailto } from "../../src/lib/mailto";

test("builds mailto with encoded subject and body", () => {
  const url = buildReplyMailto({
    email: "lead@acme.com",
    category: "Sourcing",
    name: "Kim",
    locale: "ko",
  });
  expect(url.startsWith("mailto:lead@acme.com?")).toBe(true);
  expect(url).toContain("subject=Re%3A%20%5BWSB%5D%20Sourcing%20inquiry");
  expect(url).toContain("body=");
});

test("english locale greeting", () => {
  const url = buildReplyMailto({
    email: "a@b.com",
    category: "Partnership",
    name: "Lee",
    locale: "en",
  });
  expect(decodeURIComponent(url)).toContain("Hello Lee");
});
```

- [ ] **Step 2: 테스트 실패 확인**

Run: `npx playwright test tests/unit/mailto.spec.ts`
Expected: FAIL — Cannot find module (또는 Task 11 이후 일괄 실행).

- [ ] **Step 3: 구현**

`src/lib/mailto.ts`:

```ts
/** Build a mailto: link prefilled with a reply subject and a localized greeting. */
export function buildReplyMailto(opts: {
  email: string;
  category: string;
  name?: string | null;
  locale?: string;
}): string {
  const { email, category, name, locale } = opts;
  const subject = `Re: [WSB] ${category} inquiry`;
  const greeting =
    locale === "en"
      ? `Hello ${name ?? ""},\n\nThank you for reaching out to Woori Smart Bio.\n\n`
      : `${name ?? ""}님 안녕하세요.\n\n우리스마트바이오에 문의해 주셔서 감사합니다.\n\n`;
  const query = `subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(greeting)}`;
  return `mailto:${email}?${query}`;
}
```

- [ ] **Step 4: 테스트 통과 확인**

Run: `npx playwright test tests/unit/mailto.spec.ts`
Expected: PASS (Task 11 이후 실행 시).

- [ ] **Step 5: 커밋**

```bash
git add src/lib/mailto.ts tests/unit/mailto.spec.ts
git commit -m "Add reply mailto builder with unit tests

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Task 6: `updateInquiryStatus` server action

**Files:**
- Modify: `src/app/actions/inquiry.ts`

- [ ] **Step 1: import 추가**

`src/app/actions/inquiry.ts` 상단 import 블록에 추가:

```ts
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { requireAdmin } from "@/lib/admin-auth";
import { settableStatusSchema, type SettableStatus } from "@/lib/inquiry-status";
```

(`db`, `isDbConfigured`, `schema`는 이미 import되어 있다.)

- [ ] **Step 2: 액션 추가**

`src/app/actions/inquiry.ts` 파일 끝에 append:

```ts
/** Admin-only: change an inquiry's status. Silently no-ops without a DB. */
export async function updateInquiryStatus(id: number, status: SettableStatus) {
  await requireAdmin();
  if (!isDbConfigured()) return;

  const parsed = settableStatusSchema.safeParse(status);
  if (!parsed.success) throw new Error("Invalid status");

  try {
    await db()
      .update(schema.inquiries)
      .set({ status: parsed.data })
      .where(eq(schema.inquiries.id, id));
  } catch (err) {
    console.error("[inquiry] status update failed", err);
    return;
  }

  revalidatePath("/admin/inquiries");
  revalidatePath(`/admin/inquiries/${id}`);
  revalidatePath("/admin");
}
```

- [ ] **Step 3: 타입 체크**

Run: `npx tsc --noEmit`
Expected: EXIT 0.

- [ ] **Step 4: 커밋**

```bash
git add src/app/actions/inquiry.ts
git commit -m "Add updateInquiryStatus server action

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Task 7: `listInquiries` 조회 헬퍼

**Files:**
- Create: `src/lib/inquiries-query.ts`

- [ ] **Step 1: 헬퍼 생성**

`src/lib/inquiries-query.ts`:

```ts
import { and, count, desc, eq, ilike, or } from "drizzle-orm";
import { db, isDbConfigured, schema } from "@/db/client";
import { isInquiryStatus, type Inquiry } from "@/lib/inquiry-status-row";

export const INQUIRIES_PAGE_SIZE = 50;

export type InquiryListResult = {
  rows: Inquiry[];
  total: number;
  page: number;
  totalPages: number;
};

export async function listInquiries(opts: {
  status?: string;
  q?: string;
  page?: number;
}): Promise<InquiryListResult> {
  if (!isDbConfigured()) {
    return { rows: [], total: 0, page: 1, totalPages: 1 };
  }

  const page = Math.max(1, opts.page ?? 1);
  const conditions = [];

  if (opts.status && isInquiryStatus(opts.status)) {
    conditions.push(eq(schema.inquiries.status, opts.status));
  }
  if (opts.q && opts.q.trim()) {
    const like = `%${opts.q.trim()}%`;
    conditions.push(
      or(
        ilike(schema.inquiries.company, like),
        ilike(schema.inquiries.name, like),
        ilike(schema.inquiries.email, like),
      ),
    );
  }

  const where = conditions.length ? and(...conditions) : undefined;

  const [{ value: total }] = await db()
    .select({ value: count() })
    .from(schema.inquiries)
    .where(where);

  const rows = await db()
    .select()
    .from(schema.inquiries)
    .where(where)
    .orderBy(desc(schema.inquiries.createdAt))
    .limit(INQUIRIES_PAGE_SIZE)
    .offset((page - 1) * INQUIRIES_PAGE_SIZE);

  return {
    rows,
    total,
    page,
    totalPages: Math.max(1, Math.ceil(total / INQUIRIES_PAGE_SIZE)),
  };
}
```

- [ ] **Step 2: Inquiry 타입 재노출 모듈 생성**

`inquiry-status.ts`는 `zod`만 의존해 단위 테스트가 alias 없이 import한다. 타입 `Inquiry`는 DB 스키마에서 오므로 별도 얇은 재노출 파일을 둔다.

`src/lib/inquiry-status-row.ts`:

```ts
export type { Inquiry } from "@/db/schema";
export { isInquiryStatus } from "@/lib/inquiry-status";
```

- [ ] **Step 3: 타입 체크**

Run: `npx tsc --noEmit`
Expected: EXIT 0.

- [ ] **Step 4: 커밋**

```bash
git add src/lib/inquiries-query.ts src/lib/inquiry-status-row.ts
git commit -m "Add listInquiries query helper with filter/search/pagination

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Task 8: 문의 목록 페이지 (필터·검색·페이지네이션)

**Files:**
- Create: `src/components/admin/inquiry-filters.tsx`
- Modify: `src/app/admin/(authed)/inquiries/page.tsx`

- [ ] **Step 1: 필터 컴포넌트 생성**

`src/components/admin/inquiry-filters.tsx` (서버 컴포넌트, 링크 + GET 폼이라 클라이언트 JS 불필요):

```tsx
import Link from "next/link";
import { Search } from "lucide-react";
import { INQUIRY_STATUSES } from "@/lib/inquiry-status";

const TABS = [{ key: "", label: "All" }, ...INQUIRY_STATUSES.map((s) => ({ key: s, label: s }))];

export function InquiryFilters({
  current,
  q,
}: {
  current: string;
  q: string;
}) {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <nav className="flex flex-wrap gap-1">
        {TABS.map((t) => {
          const params = new URLSearchParams();
          if (t.key) params.set("status", t.key);
          if (q) params.set("q", q);
          const href = params.toString()
            ? `/admin/inquiries?${params.toString()}`
            : "/admin/inquiries";
          const active = current === t.key;
          return (
            <Link
              key={t.key || "all"}
              href={href}
              className={`px-3 py-1.5 font-mono text-[11px] font-medium uppercase tracking-[0.08em] transition-colors ${
                active
                  ? "bg-primary text-canvas"
                  : "text-structural/60 hover:bg-primary/[0.06] hover:text-primary"
              }`}
            >
              {t.label}
            </Link>
          );
        })}
      </nav>

      <form action="/admin/inquiries" method="get" className="flex items-center gap-2">
        {current && <input type="hidden" name="status" value={current} />}
        <div className="flex items-center border border-structural/20 px-3 py-1.5">
          <Search size={14} className="text-structural/40" />
          <input
            name="q"
            defaultValue={q}
            placeholder="회사·이름·이메일 검색"
            className="ml-2 w-48 bg-transparent text-sm text-structural placeholder:text-structural/35 focus:outline-none"
          />
        </div>
      </form>
    </div>
  );
}
```

- [ ] **Step 2: 목록 페이지 전면 교체**

`src/app/admin/(authed)/inquiries/page.tsx` 전체를 아래로 교체:

```tsx
import Link from "next/link";
import { Download } from "lucide-react";
import { AdminHeader } from "@/components/admin/admin-header";
import { StatusBadge } from "@/components/admin/status-badge";
import { InquiryFilters } from "@/components/admin/inquiry-filters";
import { listInquiries } from "@/lib/inquiries-query";
import { isDbConfigured } from "@/db/client";

export const dynamic = "force-dynamic";

export default async function InquiriesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string; page?: string }>;
}) {
  const sp = await searchParams;
  const status = sp.status ?? "";
  const q = sp.q ?? "";
  const page = Number(sp.page) || 1;

  const { rows, total, totalPages } = await listInquiries({ status, q, page });

  function pageHref(p: number) {
    const params = new URLSearchParams();
    if (status) params.set("status", status);
    if (q) params.set("q", q);
    if (p > 1) params.set("page", String(p));
    const qs = params.toString();
    return qs ? `/admin/inquiries?${qs}` : "/admin/inquiries";
  }

  return (
    <div className="px-10 py-10 space-y-8">
      <AdminHeader
        tag="PARTNERSHIP INQUIRIES"
        title="문의 내역"
        meta={`02 / ${total} ROWS`}
        action={
          <Link
            href="/admin/inquiries/export"
            className="inline-flex items-center gap-2 border border-structural/20 px-4 py-2 text-sm text-structural transition-colors hover:border-primary hover:text-primary"
          >
            <Download size={14} />
            CSV
          </Link>
        }
      />

      {!isDbConfigured() && (
        <div className="border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          DATABASE_URL이 비어있어 문의 내역을 표시할 수 없습니다.
        </div>
      )}

      <InquiryFilters current={status} q={q} />

      {rows.length === 0 ? (
        <p className="py-12 text-center text-sm text-structural/55">
          조건에 맞는 문의가 없습니다.
        </p>
      ) : (
        <>
          <div className="overflow-hidden border border-structural/10">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-structural/[0.04] text-left font-mono text-[10px] font-medium uppercase tracking-[0.08em] text-structural/55">
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Company</th>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Message</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr
                    key={r.id}
                    className="border-t border-structural/10 transition-colors hover:bg-primary/[0.03]"
                  >
                    <td className="px-4 py-4 font-mono text-xs text-structural/65">
                      {new Date(r.createdAt).toISOString().slice(0, 16).replace("T", " ")}
                    </td>
                    <td className="px-4 py-4 font-medium text-structural">
                      <Link
                        href={`/admin/inquiries/${r.id}`}
                        className="hover:text-primary"
                      >
                        {r.company}
                      </Link>
                    </td>
                    <td className="px-4 py-4 text-structural/85">{r.name}</td>
                    <td className="px-4 py-4 text-structural/85">{r.category}</td>
                    <td className="px-4 py-4 max-w-xs truncate text-structural/55">
                      {r.message}
                    </td>
                    <td className="px-4 py-4">
                      <StatusBadge status={r.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between text-sm">
              <Link
                href={pageHref(Math.max(1, page - 1))}
                aria-disabled={page <= 1}
                className={`px-3 py-1.5 ${page <= 1 ? "pointer-events-none text-structural/30" : "text-structural/70 hover:text-primary"}`}
              >
                ← 이전
              </Link>
              <span className="font-mono text-xs text-structural/55">
                {page} / {totalPages}
              </span>
              <Link
                href={pageHref(Math.min(totalPages, page + 1))}
                aria-disabled={page >= totalPages}
                className={`px-3 py-1.5 ${page >= totalPages ? "pointer-events-none text-structural/30" : "text-structural/70 hover:text-primary"}`}
              >
                다음 →
              </Link>
            </div>
          )}
        </>
      )}
    </div>
  );
}
```

- [ ] **Step 3: 타입 체크**

Run: `npx tsc --noEmit`
Expected: EXIT 0.

- [ ] **Step 4: 시각 확인**

```bash
npx next dev -p 3002 &
# 준비 후:
MSYS_NO_PATHCONV=1 node scripts/screenshot.mjs /admin/inquiries .shots/admin-inquiries.png desktop
```
Expected: 로그인 페이지로 리다이렉트되거나(미인증) 목록이 보임. 로그인 상태에서 상태 탭·검색창·테이블이 렌더링되는지 확인.

- [ ] **Step 5: 커밋**

```bash
git add "src/app/admin/(authed)/inquiries/page.tsx" src/components/admin/inquiry-filters.tsx
git commit -m "Add inquiry list filters, search, and pagination

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Task 9: MarkRead · InquiryActions 클라이언트 컴포넌트

**Files:**
- Create: `src/components/admin/mark-read.tsx`
- Create: `src/components/admin/inquiry-actions.tsx`

- [ ] **Step 1: MarkRead 생성**

`src/components/admin/mark-read.tsx`:

```tsx
"use client";

import { useEffect, useRef } from "react";
import { updateInquiryStatus } from "@/app/actions/inquiry";

/** Fires once on mount to flip a "new" inquiry to "read". */
export function MarkRead({ id }: { id: number }) {
  const done = useRef(false);
  useEffect(() => {
    if (done.current) return;
    done.current = true;
    updateInquiryStatus(id, "read").catch(() => {});
  }, [id]);
  return null;
}
```

- [ ] **Step 2: InquiryActions 생성**

`src/components/admin/inquiry-actions.tsx`:

```tsx
"use client";

import { useTransition } from "react";
import { Reply, Archive } from "lucide-react";
import { updateInquiryStatus } from "@/app/actions/inquiry";

export function InquiryActions({
  id,
  status,
  mailto,
}: {
  id: number;
  status: string;
  mailto: string;
}) {
  const [pending, startTransition] = useTransition();

  function handleReply() {
    startTransition(async () => {
      await updateInquiryStatus(id, "replied").catch(() => {});
    });
  }

  function setStatus(next: "read" | "archived") {
    startTransition(async () => {
      await updateInquiryStatus(id, next).catch(() => {});
    });
  }

  const btn =
    "inline-flex items-center gap-2 px-4 py-2 text-sm transition-colors disabled:opacity-50";

  return (
    <div className="flex flex-wrap items-center gap-3">
      <a
        href={mailto}
        onClick={handleReply}
        className={`${btn} bg-primary text-canvas hover:opacity-90`}
      >
        <Reply size={14} />
        답장
      </a>
      {status === "archived" ? (
        <button
          type="button"
          disabled={pending}
          onClick={() => setStatus("read")}
          className={`${btn} border border-structural/20 text-structural hover:border-primary hover:text-primary`}
        >
          <Archive size={14} />
          보관 해제
        </button>
      ) : (
        <button
          type="button"
          disabled={pending}
          onClick={() => setStatus("archived")}
          className={`${btn} border border-structural/20 text-structural hover:border-primary hover:text-primary`}
        >
          <Archive size={14} />
          보관
        </button>
      )}
    </div>
  );
}
```

- [ ] **Step 3: 타입 체크**

Run: `npx tsc --noEmit`
Expected: EXIT 0. (`Reply`/`Archive` 미존재 시 각각 `Mail`/`Inbox`로 교체.)

- [ ] **Step 4: 커밋**

```bash
git add src/components/admin/mark-read.tsx src/components/admin/inquiry-actions.tsx
git commit -m "Add MarkRead and InquiryActions client components

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Task 10: 문의 상세 페이지

**Files:**
- Create: `src/app/admin/(authed)/inquiries/[id]/page.tsx`

- [ ] **Step 1: 상세 페이지 생성**

`src/app/admin/(authed)/inquiries/[id]/page.tsx`:

```tsx
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { db, isDbConfigured, schema } from "@/db/client";
import { AdminHeader } from "@/components/admin/admin-header";
import { StatusBadge } from "@/components/admin/status-badge";
import { CopyButton } from "@/components/admin/copy-button";
import { MarkRead } from "@/components/admin/mark-read";
import { InquiryActions } from "@/components/admin/inquiry-actions";
import { buildReplyMailto } from "@/lib/mailto";

export const dynamic = "force-dynamic";

export default async function InquiryDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const numericId = Number(id);
  if (!Number.isFinite(numericId)) notFound();

  if (!isDbConfigured()) {
    return (
      <div className="px-10 py-10">
        <p className="text-sm text-structural/65">
          DATABASE_URL이 설정되지 않았습니다.
        </p>
      </div>
    );
  }

  const [row] = await db()
    .select()
    .from(schema.inquiries)
    .where(eq(schema.inquiries.id, numericId))
    .limit(1);

  if (!row) notFound();

  const mailto = buildReplyMailto({
    email: row.email,
    category: row.category,
    name: row.name,
    locale: row.locale,
  });

  return (
    <div className="px-10 py-10 space-y-10">
      {row.status === "new" && <MarkRead id={row.id} />}

      <AdminHeader
        tag="INQUIRY"
        title={row.company}
        meta={`02 / ID ${row.id}`}
        action={<StatusBadge status={row.status} />}
      />

      <InquiryActions id={row.id} status={row.status} mailto={mailto} />

      <dl className="grid gap-px border border-structural/10 bg-structural/10 sm:grid-cols-2">
        <DetailField label="NAME">{row.name}</DetailField>
        <DetailField label="EMAIL">
          <span className="flex items-center gap-3">
            <a href={`mailto:${row.email}`} className="hover:text-primary">
              {row.email}
            </a>
            <CopyButton value={row.email} />
          </span>
        </DetailField>
        <DetailField label="PHONE">{row.phone || "—"}</DetailField>
        <DetailField label="COUNTRY">{row.country || "—"}</DetailField>
        <DetailField label="CATEGORY">{row.category}</DetailField>
        <DetailField label="LOCALE">{row.locale}</DetailField>
        <DetailField label="RECEIVED">
          {new Date(row.createdAt).toISOString().slice(0, 16).replace("T", " ")}
        </DetailField>
      </dl>

      <section className="space-y-3">
        <div className="flex items-center gap-3">
          <span aria-hidden className="h-px w-6 bg-primary" />
          <h2 className="font-mono text-[11px] font-medium uppercase tracking-[0.08em] text-primary">
            MESSAGE
          </h2>
        </div>
        <p className="whitespace-pre-wrap text-sm leading-relaxed text-structural/85">
          {row.message}
        </p>
      </section>
    </div>
  );
}

function DetailField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-canvas p-5">
      <dt className="font-mono text-[10px] font-medium uppercase tracking-[0.08em] text-structural/45">
        {label}
      </dt>
      <dd className="mt-2 text-sm text-structural/85">{children}</dd>
    </div>
  );
}
```

- [ ] **Step 2: 타입 체크**

Run: `npx tsc --noEmit`
Expected: EXIT 0.

- [ ] **Step 3: 시각 확인**

dev 서버에서 `/admin/inquiries/<실제ID>` 진입 → 본문·필드·답장/보관 버튼 표시, 진입 직후 상태가 Read로 바뀌는지 확인(새로고침).

- [ ] **Step 4: 커밋**

```bash
git add "src/app/admin/(authed)/inquiries/[id]/page.tsx"
git commit -m "Add inquiry detail page with auto-read, reply, archive

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Task 11: Playwright 설정 + 단위 테스트 실행 + 문의 스모크 e2e

**Files:**
- Create: `playwright.config.ts`
- Create: `tests/helpers/seed.ts`
- Create: `tests/e2e/inquiry-workflow.spec.ts`
- Modify: `package.json`

- [ ] **Step 1: Playwright config 생성**

`playwright.config.ts`:

```ts
import { defineConfig, devices } from "@playwright/test";
import { config as loadEnv } from "dotenv";

loadEnv({ path: ".env.local" });

const PORT = 3100;

export default defineConfig({
  testDir: "./tests",
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: "list",
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: "on-first-retry",
  },
  webServer: {
    command: `npx next dev -p ${PORT}`,
    url: `http://localhost:${PORT}/admin/sign-in`,
    reuseExistingServer: true,
    timeout: 120_000,
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
});
```

- [ ] **Step 2: 시드 헬퍼 생성**

`tests/helpers/seed.ts`:

```ts
import { neon } from "@neondatabase/serverless";

function sqlClient() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL required for e2e seeding");
  return neon(url);
}

export async function seedInquiry(): Promise<number> {
  const sql = sqlClient();
  const rows = (await sql`
    insert into inquiries (company, name, email, category, message, locale, status)
    values ('E2E Test Co', 'E2E Tester', 'e2e@example.com', 'Sourcing',
            'This is an automated e2e seed message.', 'ko', 'new')
    returning id
  `) as { id: number }[];
  return rows[0].id;
}

export async function deleteInquiry(id: number): Promise<void> {
  const sql = sqlClient();
  await sql`delete from inquiries where id = ${id}`;
}
```

- [ ] **Step 3: e2e 스모크 작성**

`tests/e2e/inquiry-workflow.spec.ts`:

```ts
import { test, expect } from "@playwright/test";
import { seedInquiry, deleteInquiry } from "../helpers/seed";

const EMAIL = process.env.ADMIN_EMAIL;
const PASSWORD = process.env.ADMIN_PASSWORD;
const ready = Boolean(process.env.DATABASE_URL && EMAIL && PASSWORD);

test.describe("inquiry workflow", () => {
  test.skip(!ready, "requires DATABASE_URL + ADMIN_EMAIL + ADMIN_PASSWORD");

  let id: number;
  test.beforeAll(async () => {
    id = await seedInquiry();
  });
  test.afterAll(async () => {
    await deleteInquiry(id);
  });

  test("new -> read -> replied -> archived", async ({ page }) => {
    // Sign in
    await page.goto("/admin/sign-in");
    await page.fill('input[name="email"]', EMAIL!);
    await page.fill('input[name="password"]', PASSWORD!);
    await page.click('button:has-text("Sign in")');
    await page.waitForURL("**/admin");

    // Detail auto-marks read
    await page.goto(`/admin/inquiries/${id}`);
    await page.waitForTimeout(800);
    await page.reload();
    await expect(page.getByText("Read", { exact: true })).toBeVisible();

    // Reply -> replied (mailto click also fires the status action)
    await page.getByRole("link", { name: "답장" }).click();
    await page.waitForTimeout(800);
    await page.reload();
    await expect(page.getByText("Replied", { exact: true })).toBeVisible();

    // Archive
    await page.getByRole("button", { name: "보관" }).click();
    await page.waitForTimeout(800);
    await page.reload();
    await expect(page.getByText("Archived", { exact: true })).toBeVisible();

    // List filter shows it under archived
    await page.goto("/admin/inquiries?status=archived");
    await expect(page.getByText("E2E Test Co")).toBeVisible();
  });
});
```

- [ ] **Step 4: package.json 스크립트 추가**

`package.json`의 `scripts`에 추가:

```json
    "test": "playwright test",
    "test:unit": "playwright test tests/unit",
    "test:e2e": "playwright test tests/e2e",
```

- [ ] **Step 5: 브라우저 설치**

Run: `npx playwright install chromium`
Expected: 설치 완료.

- [ ] **Step 6: 단위 테스트 green 확인 (Task 2·5에서 작성한 것 포함)**

Run: `npx playwright test tests/unit`
Expected: inquiry-status·mailto 테스트 모두 PASS.

- [ ] **Step 7: e2e 실행**

Run: `npx playwright test tests/e2e`
Expected: `.env.local`에 DB·관리자 자격증명이 있으면 PASS, 없으면 SKIPPED. (헤드리스에서 mailto 링크 클릭은 네비게이션을 일으키지 않으므로 후속 reload/assert가 정상 동작.)

- [ ] **Step 8: 커밋**

```bash
git add playwright.config.ts tests package.json
git commit -m "Add Playwright config, unit tests, and inquiry workflow smoke test

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

# Phase 2 — Files · News

## Task 12: 파일 종류 라벨 (단위 테스트 우선)

**Files:**
- Create: `src/lib/file-kinds.ts`
- Test: `tests/unit/file-kinds.spec.ts`

- [ ] **Step 1: 실패하는 테스트 작성**

`tests/unit/file-kinds.spec.ts`:

```ts
import { test, expect } from "@playwright/test";
import { fileKindLabel } from "../../src/lib/file-kinds";

test("maps known kinds and falls back to raw value", () => {
  expect(fileKindLabel("pdf_company_intro")).toBe("회사소개서 PDF");
  expect(fileKindLabel("cert")).toBe("인증서");
  expect(fileKindLabel("mystery")).toBe("mystery");
});
```

- [ ] **Step 2: 테스트 실패 확인**

Run: `npx playwright test tests/unit/file-kinds.spec.ts`
Expected: FAIL — Cannot find module.

- [ ] **Step 3: 구현**

`src/lib/file-kinds.ts`:

```ts
export const FILE_KIND_LABELS: Record<string, string> = {
  pdf_company_intro: "회사소개서 PDF",
  cert: "인증서",
  news_thumbnail: "News 썸네일",
  other: "기타",
};

export function fileKindLabel(kind: string): string {
  return FILE_KIND_LABELS[kind] ?? kind;
}
```

- [ ] **Step 4: 테스트 통과 확인**

Run: `npx playwright test tests/unit/file-kinds.spec.ts`
Expected: PASS.

- [ ] **Step 5: 커밋**

```bash
git add src/lib/file-kinds.ts tests/unit/file-kinds.spec.ts
git commit -m "Add file kind label map with unit test

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Task 13: 파일 삭제·URL 복사

**Files:**
- Create: `src/components/admin/file-row-actions.tsx`
- Modify: `src/app/admin/(authed)/files/page.tsx`

- [ ] **Step 1: FileRowActions 생성**

`src/components/admin/file-row-actions.tsx`:

```tsx
"use client";

import { useTransition } from "react";
import { Trash2 } from "lucide-react";
import { deleteFile } from "@/app/actions/files";
import { CopyButton } from "@/components/admin/copy-button";

export function FileRowActions({ id, url }: { id: number; url: string }) {
  const [pending, startTransition] = useTransition();

  function handleDelete() {
    if (!confirm("이 파일을 삭제하시겠습니까? 되돌릴 수 없습니다.")) return;
    startTransition(async () => {
      await deleteFile(id, url).catch(() => {});
    });
  }

  return (
    <div className="flex items-center gap-4">
      <CopyButton value={url} label="URL" />
      <button
        type="button"
        disabled={pending}
        onClick={handleDelete}
        className="inline-flex items-center gap-1 text-xs text-rose-600 hover:text-rose-700 disabled:opacity-50"
      >
        <Trash2 size={12} />
        {pending ? "삭제 중" : "삭제"}
      </button>
    </div>
  );
}
```

- [ ] **Step 2: Files 페이지 수정**

`src/app/admin/(authed)/files/page.tsx`에서 import 추가:

```ts
import { fileKindLabel } from "@/lib/file-kinds";
import { FileRowActions } from "@/components/admin/file-row-actions";
```

테이블 헤더의 `<th className="px-4 py-3">URL</th>`를 다음으로 교체:

```tsx
                <th className="px-4 py-3">Actions</th>
```

`kind` 셀을 라벨로 교체:

```tsx
                  <td className="px-4 py-3 text-xs text-structural/65">
                    {fileKindLabel(r.kind)}
                  </td>
```

URL 셀(`<a ... Open ...>` 포함 `<td>`)을 다음으로 교체:

```tsx
                  <td className="px-4 py-3">
                    <FileRowActions id={r.id} url={r.url} />
                  </td>
```

`ExternalLink` import가 더 이상 쓰이지 않으면 제거.

- [ ] **Step 3: 타입 체크 + 시각 확인**

Run: `npx tsc --noEmit`
Expected: EXIT 0. dev 서버 `/admin/files`에서 종류 라벨·URL 복사·삭제 버튼 확인.

- [ ] **Step 4: 커밋**

```bash
git add src/components/admin/file-row-actions.tsx "src/app/admin/(authed)/files/page.tsx"
git commit -m "Add file delete and copy-URL actions with kind labels

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Task 14: News 발행 토글 액션 + 조회 헬퍼

**Files:**
- Modify: `src/app/actions/news.ts`
- Create: `src/lib/news-query.ts`

- [ ] **Step 1: toggleNewsPublished 추가**

`src/app/actions/news.ts` 파일 끝에 append:

```ts
/** Admin-only: flip a post's published flag from the list view. */
export async function toggleNewsPublished(id: number, next: boolean) {
  await requireAdmin();
  if (!isDbConfigured()) return;
  try {
    await db()
      .update(schema.newsPosts)
      .set({ isPublished: next, updatedAt: sql`now()` })
      .where(eq(schema.newsPosts.id, id));
  } catch (err) {
    console.error("[news] toggle publish failed", err);
    return;
  }
  revalidatePath("/admin/news");
  revalidatePath("/", "layout");
}
```

(`eq`, `sql`, `revalidatePath`, `requireAdmin`, `db`, `isDbConfigured`, `schema`는 이미 import되어 있다. 없으면 추가.)

- [ ] **Step 2: news-query 헬퍼 생성**

`src/lib/news-query.ts`:

```ts
import { and, desc, eq, ilike, or } from "drizzle-orm";
import { db, isDbConfigured, schema } from "@/db/client";
import type { NewsPost } from "@/db/schema";

export async function listNews(opts: {
  q?: string;
  category?: string;
}): Promise<NewsPost[]> {
  if (!isDbConfigured()) return [];

  const conditions = [];
  if (opts.q && opts.q.trim()) {
    const like = `%${opts.q.trim()}%`;
    conditions.push(
      or(ilike(schema.newsPosts.titleKo, like), ilike(schema.newsPosts.slug, like)),
    );
  }
  if (opts.category && opts.category.trim()) {
    conditions.push(eq(schema.newsPosts.category, opts.category.trim()));
  }
  const where = conditions.length ? and(...conditions) : undefined;

  return db()
    .select()
    .from(schema.newsPosts)
    .where(where)
    .orderBy(desc(schema.newsPosts.createdAt));
}

export async function listNewsCategories(): Promise<string[]> {
  if (!isDbConfigured()) return [];
  const rows = await db()
    .selectDistinct({ category: schema.newsPosts.category })
    .from(schema.newsPosts);
  return rows.map((r) => r.category).filter(Boolean).sort();
}
```

- [ ] **Step 3: 타입 체크**

Run: `npx tsc --noEmit`
Expected: EXIT 0.

- [ ] **Step 4: 커밋**

```bash
git add src/app/actions/news.ts src/lib/news-query.ts
git commit -m "Add toggleNewsPublished action and listNews query helper

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Task 15: News 목록 — 발행 토글·검색·미리보기

**Files:**
- Create: `src/components/admin/news-publish-toggle.tsx`
- Create: `src/components/admin/news-filters.tsx`
- Modify: `src/app/admin/(authed)/news/page.tsx`

- [ ] **Step 1: NewsPublishToggle 생성**

`src/components/admin/news-publish-toggle.tsx`:

```tsx
"use client";

import { useTransition } from "react";
import { toggleNewsPublished } from "@/app/actions/news";

export function NewsPublishToggle({
  id,
  isPublished,
}: {
  id: number;
  isPublished: boolean;
}) {
  const [pending, startTransition] = useTransition();

  function handleClick() {
    startTransition(async () => {
      await toggleNewsPublished(id, !isPublished).catch(() => {});
    });
  }

  return (
    <button
      type="button"
      disabled={pending}
      onClick={handleClick}
      className={`inline-flex items-center px-2 py-0.5 font-mono text-[10px] font-medium uppercase tracking-[0.08em] transition-opacity hover:opacity-80 disabled:opacity-50 ${
        isPublished
          ? "bg-primary/10 text-primary"
          : "bg-structural/10 text-structural/55"
      }`}
    >
      {isPublished ? "Published" : "Draft"}
    </button>
  );
}
```

- [ ] **Step 2: NewsFilters 생성**

`src/components/admin/news-filters.tsx` (서버 컴포넌트):

```tsx
import Link from "next/link";
import { Search } from "lucide-react";

export function NewsFilters({
  categories,
  category,
  q,
}: {
  categories: string[];
  category: string;
  q: string;
}) {
  function catHref(c: string) {
    const params = new URLSearchParams();
    if (c) params.set("category", c);
    if (q) params.set("q", q);
    const qs = params.toString();
    return qs ? `/admin/news?${qs}` : "/admin/news";
  }

  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <nav className="flex flex-wrap gap-1">
        <Link
          href={catHref("")}
          className={`px-3 py-1.5 font-mono text-[11px] font-medium uppercase tracking-[0.08em] transition-colors ${
            !category
              ? "bg-primary text-canvas"
              : "text-structural/60 hover:bg-primary/[0.06] hover:text-primary"
          }`}
        >
          All
        </Link>
        {categories.map((c) => (
          <Link
            key={c}
            href={catHref(c)}
            className={`px-3 py-1.5 font-mono text-[11px] font-medium uppercase tracking-[0.08em] transition-colors ${
              category === c
                ? "bg-primary text-canvas"
                : "text-structural/60 hover:bg-primary/[0.06] hover:text-primary"
            }`}
          >
            {c}
          </Link>
        ))}
      </nav>

      <form action="/admin/news" method="get" className="flex items-center gap-2">
        {category && <input type="hidden" name="category" value={category} />}
        <div className="flex items-center border border-structural/20 px-3 py-1.5">
          <Search size={14} className="text-structural/40" />
          <input
            name="q"
            defaultValue={q}
            placeholder="제목·slug 검색"
            className="ml-2 w-48 bg-transparent text-sm text-structural placeholder:text-structural/35 focus:outline-none"
          />
        </div>
      </form>
    </div>
  );
}
```

- [ ] **Step 3: News 목록 페이지 교체**

`src/app/admin/(authed)/news/page.tsx` 전체를 교체:

```tsx
import Link from "next/link";
import { Plus, ExternalLink } from "lucide-react";
import { AdminHeader } from "@/components/admin/admin-header";
import { NewsFilters } from "@/components/admin/news-filters";
import { NewsPublishToggle } from "@/components/admin/news-publish-toggle";
import { listNews, listNewsCategories } from "@/lib/news-query";
import { isDbConfigured } from "@/db/client";

export const dynamic = "force-dynamic";

export default async function NewsListPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string }>;
}) {
  const sp = await searchParams;
  const q = sp.q ?? "";
  const category = sp.category ?? "";

  const [rows, categories] = await Promise.all([
    listNews({ q, category }),
    listNewsCategories(),
  ]);

  return (
    <div className="px-10 py-10 space-y-8">
      <AdminHeader
        tag="NEWS POSTS"
        title="보도자료"
        meta={`01 / ${rows.length} POSTS`}
        action={
          <Link
            href="/admin/news/new"
            className="inline-flex items-center gap-2 bg-primary px-4 py-2 text-sm text-canvas transition-opacity hover:opacity-90"
          >
            <Plus size={14} />
            새 글
          </Link>
        }
      />

      {!isDbConfigured() && (
        <div className="border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          DATABASE_URL이 비어있어 News를 표시할 수 없습니다.
        </div>
      )}

      <NewsFilters categories={categories} category={category} q={q} />

      {rows.length === 0 ? (
        <p className="py-12 text-center text-sm text-structural/55">
          조건에 맞는 News가 없습니다.
        </p>
      ) : (
        <div className="overflow-hidden border border-structural/10">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-structural/[0.04] text-left font-mono text-[10px] font-medium uppercase tracking-[0.08em] text-structural/55">
                <th className="px-4 py-3">Published</th>
                <th className="px-4 py-3">Slug</th>
                <th className="px-4 py-3">Title (KO)</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Preview</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr
                  key={r.id}
                  className="border-t border-structural/10 transition-colors hover:bg-primary/[0.03]"
                >
                  <td className="px-4 py-4 font-mono text-xs text-structural/65">
                    {r.publishedAt
                      ? new Date(r.publishedAt).toISOString().slice(0, 10)
                      : "—"}
                  </td>
                  <td className="px-4 py-4 font-mono text-xs text-structural/65">
                    {r.slug}
                  </td>
                  <td className="px-4 py-4">
                    <Link
                      href={`/admin/news/${r.id}`}
                      className="font-medium text-structural hover:text-primary"
                    >
                      {r.titleKo}
                    </Link>
                  </td>
                  <td className="px-4 py-4 text-structural/65">{r.category}</td>
                  <td className="px-4 py-4">
                    <NewsPublishToggle id={r.id} isPublished={r.isPublished} />
                  </td>
                  <td className="px-4 py-4">
                    {r.isPublished ? (
                      <a
                        href={`/news/${r.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-primary hover:opacity-80"
                      >
                        <ExternalLink size={12} />
                        보기
                      </a>
                    ) : (
                      <span className="text-xs text-structural/35">발행 후</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 4: 미리보기 경로 확인**

공개 News 상세 라우트가 `/news/[slug]` 형태인지 확인한다.

Run: `ls "src/app/[locale]/news"`
Expected: `[slug]` 디렉토리 존재. 없거나 다른 패턴이면 Step 3의 `href={`/news/${r.slug}`}`를 실제 라우트에 맞게 수정한다(예: 슬러그 라우트가 없으면 목록 `/news`로 링크하거나 Preview 열 제거).

- [ ] **Step 5: 타입 체크 + 시각 확인**

Run: `npx tsc --noEmit`
Expected: EXIT 0. dev 서버 `/admin/news`에서 카테고리 탭·검색·발행 토글·미리보기 링크 확인.

- [ ] **Step 6: 커밋**

```bash
git add src/components/admin/news-publish-toggle.tsx src/components/admin/news-filters.tsx "src/app/admin/(authed)/news/page.tsx"
git commit -m "Add news list publish toggle, search/filter, preview link

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

# Phase 3 — 대시보드

## Task 16: 대시보드 최근 문의 + 빠른 보관

**Files:**
- Create: `src/components/admin/quick-archive-button.tsx`
- Modify: `src/app/admin/(authed)/page.tsx`

- [ ] **Step 1: QuickArchiveButton 생성**

`src/components/admin/quick-archive-button.tsx`:

```tsx
"use client";

import { useTransition } from "react";
import { Archive } from "lucide-react";
import { updateInquiryStatus } from "@/app/actions/inquiry";

export function QuickArchiveButton({ id }: { id: number }) {
  const [pending, startTransition] = useTransition();
  return (
    <button
      type="button"
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          await updateInquiryStatus(id, "archived").catch(() => {});
        })
      }
      className="inline-flex items-center gap-1 text-xs text-structural/55 hover:text-primary disabled:opacity-50"
    >
      <Archive size={12} />
      보관
    </button>
  );
}
```

- [ ] **Step 2: 대시보드에 최근 문의 추가**

`src/app/admin/(authed)/page.tsx`의 import 블록에 추가:

```ts
import { desc } from "drizzle-orm";
import { StatusBadge } from "@/components/admin/status-badge";
import { QuickArchiveButton } from "@/components/admin/quick-archive-button";
```

`getCounts` 함수 바로 아래에 최근 문의 조회 함수를 추가:

```tsx
async function getRecentInquiries() {
  if (!isDbConfigured()) return [];
  return db()
    .select()
    .from(schema.inquiries)
    .orderBy(desc(schema.inquiries.createdAt))
    .limit(5);
}
```

`AdminDashboard` 컴포넌트 본문에서 counts 조회 직후에 추가:

```tsx
  const recent = await getRecentInquiries();
```

`QUICK ACTIONS` 섹션 `</section>` 다음에 새 섹션을 추가:

```tsx
      <section className="space-y-4">
        <h2 className="font-mono text-[11px] font-medium uppercase tracking-[0.08em] text-structural/55">
          RECENT INQUIRIES
        </h2>
        {recent.length === 0 ? (
          <p className="text-sm text-structural/55">최근 문의가 없습니다.</p>
        ) : (
          <div className="overflow-hidden border border-structural/10">
            <table className="w-full text-sm">
              <tbody>
                {recent.map((r) => (
                  <tr key={r.id} className="border-t border-structural/10 first:border-t-0">
                    <td className="px-4 py-3 font-mono text-xs text-structural/55">
                      {new Date(r.createdAt).toISOString().slice(0, 10)}
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/inquiries/${r.id}`}
                        className="font-medium text-structural hover:text-primary"
                      >
                        {r.company}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-structural/65">{r.category}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={r.status} />
                    </td>
                    <td className="px-4 py-3 text-right">
                      {r.status !== "archived" && <QuickArchiveButton id={r.id} />}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
```

- [ ] **Step 3: 타입 체크 + 시각 확인**

Run: `npx tsc --noEmit`
Expected: EXIT 0. dev 서버 `/admin`에서 최근 문의 5건·상태 배지·보관 버튼 확인.

- [ ] **Step 4: 커밋**

```bash
git add src/components/admin/quick-archive-button.tsx "src/app/admin/(authed)/page.tsx"
git commit -m "Add recent inquiries with quick archive to dashboard

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

# 최종 검증

- [ ] **전체 타입 체크**: `npx tsc --noEmit` → EXIT 0
- [ ] **린트**: `npx eslint` → 에러 0
- [ ] **단위 테스트**: `npx playwright test tests/unit` → PASS
- [ ] **e2e 스모크**: `npx playwright test tests/e2e` → PASS 또는 SKIPPED(자격증명 없을 때)
- [ ] **시각 점검**: `/admin`, `/admin/inquiries`, `/admin/inquiries/[id]`, `/admin/files`, `/admin/news` 각 화면 스크린샷 확인

---

# 참고: 잠재적 함정

- **lucide-react 아이콘**: `Reply`, `Archive`, `Copy`, `Check`, `Search` 미존재 시 `npx tsc --noEmit`가 잡는다. 대체: `Reply→Mail`, `Archive→Inbox`, `Copy→Clipboard`, `Check→ClipboardCheck`.
- **단위 테스트 import 경로**: 단위 테스트는 `@/` alias가 아닌 상대경로로 import하며, 대상 모듈(`inquiry-status.ts`·`mailto.ts`·`file-kinds.ts`)은 `@/` alias를 쓰지 않는다. 이 분리를 유지할 것.
- **mailto 클릭과 e2e**: 헤드리스 크로미움에서 mailto 링크 클릭은 페이지 네비게이션을 일으키지 않으므로 onClick의 server action만 실행된다. 후속 `reload()` 후 상태를 검증한다.
- **revalidate vs force-dynamic**: 상세·목록 페이지는 `force-dynamic`이라 항상 최신이지만, 클라이언트 transition 후 라우터 캐시 갱신을 위해 server action에서 `revalidatePath`를 유지한다.
- **Neon HTTP 트랜잭션**: 시드 헬퍼는 단발 INSERT/DELETE만 사용한다(neon-http는 인터랙티브 트랜잭션 미지원).
