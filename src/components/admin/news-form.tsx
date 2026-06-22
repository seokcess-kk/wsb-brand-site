"use client";

import { useState } from "react";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Trash2, Save, Download, Loader2, Sparkles } from "lucide-react";
import {
  createOrUpdateNews,
  deleteNews,
  fetchNewsMetadata,
  type NewsFormState,
} from "@/app/actions/news";
import type { NewsPost } from "@/db/schema";

const INITIAL: NewsFormState = { status: "idle" };

/** Convert a stored/scraped date into the value a datetime-local input expects. */
function toDatetimeLocal(value: string | Date | null | undefined): string {
  if (!value) return "";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 16);
}

type FetchState = { ok: boolean; message: string } | null;

export function NewsForm({
  post,
  categories = [],
}: {
  post?: NewsPost;
  categories?: string[];
}) {
  const action = createOrUpdateNews.bind(null, post?.id ?? null);
  const [state, formAction] = useActionState(action, INITIAL);

  // Fields that the URL auto-fill can populate are controlled so a fetch can
  // update them; everything else stays uncontrolled with defaultValue.
  const [fields, setFields] = useState({
    slug: post?.slug ?? "",
    category: post?.category ?? "",
    publishedAt: toDatetimeLocal(post?.publishedAt),
    thumbnailUrl: post?.thumbnailUrl ?? "",
    externalUrl: post?.externalUrl ?? "",
    titleKo: post?.titleKo ?? "",
    summaryKo: post?.summaryKo ?? "",
  });
  const [fetching, setFetching] = useState(false);
  const [fetchState, setFetchState] = useState<FetchState>(null);
  const [filled, setFilled] = useState<Set<string>>(new Set());
  const [thumbBroken, setThumbBroken] = useState(false);
  const [published, setPublished] = useState(post?.isPublished ?? false);

  const setField = (name: keyof typeof fields, value: string) => {
    setFields((prev) => ({ ...prev, [name]: value }));
    // A manual edit means the value is no longer "auto", so drop its badge.
    setFilled((prev) => {
      if (!prev.has(name)) return prev;
      const next = new Set(prev);
      next.delete(name);
      return next;
    });
    if (name === "thumbnailUrl") setThumbBroken(false);
  };

  async function handleFetch() {
    const url = fields.externalUrl.trim();
    if (!url || fetching) return;
    setFetching(true);
    setFetchState(null);
    try {
      const result = await fetchNewsMetadata(url);
      if (!result.ok) {
        setFetchState({ ok: false, message: result.error });
        return;
      }
      const d = result.data;
      // Only mark a field "auto" when the fetch actually changed it.
      const next = { ...fields };
      const applied = new Set<string>();
      const apply = (key: keyof typeof fields, value: string) => {
        if (value && value !== next[key]) {
          next[key] = value;
          applied.add(key);
        }
      };
      apply("titleKo", d.titleKo);
      apply("summaryKo", d.summaryKo);
      apply("thumbnailUrl", d.thumbnailUrl);
      apply("externalUrl", d.externalUrl);
      apply("publishedAt", d.publishedAt ? toDatetimeLocal(d.publishedAt) : "");
      // Never clobber a slug or category the admin already chose.
      if (!next.slug && d.slug) {
        next.slug = d.slug;
        applied.add("slug");
      }
      if (!next.category && d.category) {
        next.category = d.category;
        applied.add("category");
      }

      setFields(next);
      if (applied.has("thumbnailUrl")) setThumbBroken(false);
      setFilled(applied);
      setFetchState({
        ok: true,
        message: applied.size
          ? `${applied.size}개 항목을 채웠어요. 내용을 확인한 뒤 저장하세요.`
          : "가져올 수 있는 새 정보가 없습니다. 직접 입력해 주세요.",
      });
    } catch (err) {
      console.error("[news-form] metadata fetch failed", err);
      setFetchState({ ok: false, message: "불러오기에 실패했습니다." });
    } finally {
      setFetching(false);
    }
  }

  async function handleDelete() {
    if (!post) return;
    if (!confirm("정말 삭제하시겠습니까?")) return;
    await deleteNews(post.id);
    window.location.href = "/admin/news";
  }

  return (
    <form action={formAction} className="space-y-8">
      {/* Quick fill from a published URL */}
      <section className="space-y-4 border border-primary/25 bg-primary/[0.03] p-5">
        <div className="flex items-center gap-3">
          <span aria-hidden className="h-px w-6 bg-primary" />
          <h2 className="font-mono text-[11px] font-medium uppercase tracking-[0.08em] text-primary">
            URL 자동 채우기
          </h2>
        </div>
        <p className="text-sm text-structural/70">
          보도자료·뉴스 기사 URL을 붙여넣고 불러오면 제목·요약·썸네일·발행일을 자동으로 채웁니다.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-stretch">
          <input
            type="url"
            value={fields.externalUrl}
            onChange={(e) => setField("externalUrl", e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleFetch();
              }
            }}
            placeholder="https://news.example.com/article/123"
            aria-label="발행 URL"
            className="flex-1 border-0 border-b border-structural/25 bg-transparent px-0 py-2.5 text-sm text-structural placeholder:text-structural/30 focus:border-primary focus:outline-none focus:ring-0"
          />
          <button
            type="button"
            onClick={handleFetch}
            disabled={fetching || !fields.externalUrl.trim()}
            className="inline-flex shrink-0 items-center justify-center gap-2 bg-structural px-5 py-2.5 text-sm font-medium text-canvas transition-opacity hover:opacity-90 disabled:opacity-40"
          >
            {fetching ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Download size={14} />
            )}
            {fetching ? "불러오는 중..." : "불러오기"}
          </button>
        </div>
        {fetchState && (
          <p
            role="status"
            className={`text-sm ${
              fetchState.ok ? "text-primary" : "text-rose-600"
            }`}
          >
            {fetchState.message}
          </p>
        )}
      </section>

      {/* Meta block */}
      <Section title="META">
        <div className="grid gap-5 md:grid-cols-2">
          <Field
            label="SLUG"
            name="slug"
            required
            value={fields.slug}
            onValueChange={(v) => setField("slug", v)}
            filled={filled.has("slug")}
            placeholder="green-bio-recognition-2025"
            error={state.fieldErrors?.slug}
          />
          <Field
            label="CATEGORY"
            name="category"
            required
            value={fields.category}
            onValueChange={(v) => setField("category", v)}
            filled={filled.has("category")}
            list={categories.length ? "news-categories" : undefined}
            placeholder="Partnership / Certification / Business / Clinical / R&D"
            error={state.fieldErrors?.category}
          />
          {categories.length > 0 && (
            <datalist id="news-categories">
              {categories.map((c) => (
                <option key={c} value={c} />
              ))}
            </datalist>
          )}
          <Field
            label="PUBLISHED AT"
            name="publishedAt"
            type="datetime-local"
            value={fields.publishedAt}
            onValueChange={(v) => setField("publishedAt", v)}
            filled={filled.has("publishedAt")}
          />
          <Field
            label="THUMBNAIL URL"
            name="thumbnailUrl"
            type="url"
            value={fields.thumbnailUrl}
            onValueChange={(v) => setField("thumbnailUrl", v)}
            filled={filled.has("thumbnailUrl")}
            placeholder="https://..."
            error={state.fieldErrors?.thumbnailUrl}
          />
          {/* externalUrl is captured by the quick-fill input above and submitted here. */}
          <input type="hidden" name="externalUrl" value={fields.externalUrl} />
          <div className="md:col-span-2">
            <Label htmlFor="news-published" label="공개 여부" />
            <label
              htmlFor="news-published"
              className="mt-2 flex cursor-pointer items-start gap-3 border border-structural/15 bg-canvas p-4"
            >
              <input
                id="news-published"
                type="checkbox"
                name="isPublished"
                checked={published}
                onChange={(e) => setPublished(e.target.checked)}
                aria-label="공개 여부"
                className="peer sr-only"
              />
              <span
                aria-hidden
                className={`mt-0.5 flex h-5 w-9 shrink-0 items-center p-0.5 transition-colors peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-primary ${
                  published ? "bg-primary" : "bg-structural/25"
                }`}
              >
                <span
                  className={`h-4 w-4 bg-canvas transition-transform ${
                    published ? "translate-x-4" : "translate-x-0"
                  }`}
                />
              </span>
              <span className="min-w-0">
                <span
                  className={`block text-sm font-medium ${
                    published ? "text-primary" : "text-structural"
                  }`}
                >
                  {published ? "공개" : "비공개 · 임시저장"}
                </span>
                <span className="mt-0.5 block text-xs leading-relaxed text-structural/55">
                  {published
                    ? "저장하면 사이트 News 목록과 홈에 바로 노출됩니다."
                    : "사이트에 노출되지 않습니다. 작성 후 나중에 공개로 바꿀 수 있습니다."}
                </span>
              </span>
            </label>
          </div>
        </div>
        {fields.thumbnailUrl && !thumbBroken && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={fields.thumbnailUrl}
            alt="썸네일 미리보기"
            className="mt-2 h-32 w-auto border border-structural/15 object-cover"
            onError={() => setThumbBroken(true)}
          />
        )}
      </Section>

      {/* Korean content */}
      <Section title="KOREAN">
        <Field
          label="TITLE"
          name="titleKo"
          required
          value={fields.titleKo}
          onValueChange={(v) => setField("titleKo", v)}
          filled={filled.has("titleKo")}
          error={state.fieldErrors?.titleKo}
        />
        <Textarea
          label="SUMMARY"
          name="summaryKo"
          required
          rows={3}
          value={fields.summaryKo}
          onValueChange={(v) => setField("summaryKo", v)}
          filled={filled.has("summaryKo")}
          error={state.fieldErrors?.summaryKo}
        />
      </Section>

      {/* English content */}
      <Section title="ENGLISH">
        <Field
          label="TITLE"
          name="titleEn"
          defaultValue={post?.titleEn ?? ""}
        />
        <Textarea
          label="SUMMARY"
          name="summaryEn"
          rows={3}
          defaultValue={post?.summaryEn ?? ""}
        />
      </Section>

      {state.status === "error" && (
        <div
          role="alert"
          className="border border-rose-300 bg-rose-50 px-4 py-3 text-sm text-rose-700"
        >
          {state.message}
        </div>
      )}

      <div className="flex items-center justify-between border-t border-structural/10 pt-6">
        {post && (
          <button
            type="button"
            onClick={handleDelete}
            className="inline-flex items-center gap-2 text-sm text-rose-600 hover:text-rose-700"
          >
            <Trash2 size={14} />
            삭제
          </button>
        )}
        <SaveButton hasPost={Boolean(post)} />
      </div>
    </form>
  );
}

function SaveButton({ hasPost }: { hasPost: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="ml-auto inline-flex items-center gap-2 bg-primary px-5 py-2.5 text-sm font-medium text-canvas transition-opacity hover:opacity-90 disabled:opacity-50"
    >
      <Save size={14} />
      {pending ? "저장 중..." : hasPost ? "변경 저장" : "새 글 등록"}
    </button>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-4">
      <div className="flex items-center gap-3">
        <span aria-hidden className="h-px w-6 bg-primary" />
        <h2 className="font-mono text-[11px] font-medium uppercase tracking-[0.08em] text-primary">
          {title}
        </h2>
      </div>
      {children}
    </section>
  );
}

function Field({
  label,
  name,
  type = "text",
  required,
  value,
  onValueChange,
  defaultValue,
  placeholder,
  error,
  filled,
  list,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  value?: string;
  onValueChange?: (value: string) => void;
  defaultValue?: string;
  placeholder?: string;
  error?: string[];
  filled?: boolean;
  list?: string;
}) {
  const id = `news-${name}`;
  const controlled = value !== undefined && onValueChange !== undefined;
  return (
    <div className="space-y-2">
      <Label htmlFor={id} label={label} required={required} filled={filled} />
      <input
        id={id}
        name={name}
        type={type}
        required={required}
        list={list}
        {...(controlled
          ? { value, onChange: (e) => onValueChange(e.target.value) }
          : { defaultValue })}
        placeholder={placeholder}
        aria-invalid={error?.length ? true : undefined}
        className={`w-full border-0 border-b bg-transparent px-0 py-2.5 text-sm text-structural placeholder:text-structural/30 focus:outline-none focus:ring-0 ${
          error?.length
            ? "border-rose-400 focus:border-rose-500"
            : "border-structural/25 focus:border-primary"
        }`}
      />
    </div>
  );
}

function Textarea({
  label,
  name,
  required,
  rows = 4,
  value,
  onValueChange,
  defaultValue,
  placeholder,
  error,
  filled,
}: {
  label: string;
  name: string;
  required?: boolean;
  rows?: number;
  value?: string;
  onValueChange?: (value: string) => void;
  defaultValue?: string;
  placeholder?: string;
  error?: string[];
  filled?: boolean;
}) {
  const id = `news-${name}`;
  const controlled = value !== undefined && onValueChange !== undefined;
  return (
    <div className="space-y-2">
      <Label htmlFor={id} label={label} required={required} filled={filled} />
      <textarea
        id={id}
        name={name}
        required={required}
        rows={rows}
        {...(controlled
          ? { value, onChange: (e) => onValueChange(e.target.value) }
          : { defaultValue })}
        placeholder={placeholder}
        aria-invalid={error?.length ? true : undefined}
        className={`w-full resize-y border bg-canvas px-4 py-3 font-sans text-sm text-structural placeholder:text-structural/30 focus:outline-none focus:ring-0 ${
          error?.length
            ? "border-rose-400 focus:border-rose-500"
            : "border-structural/15 focus:border-primary"
        }`}
      />
    </div>
  );
}

function Label({
  htmlFor,
  label,
  required,
  filled,
}: {
  htmlFor: string;
  label: string;
  required?: boolean;
  filled?: boolean;
}) {
  return (
    <label
      htmlFor={htmlFor}
      className="flex items-center gap-2 font-mono text-[11px] font-medium uppercase tracking-[0.08em] text-structural/65"
    >
      {label}
      {required && <span className="text-primary">*</span>}
      {filled && (
        <span className="inline-flex items-center gap-1 rounded-sm bg-primary/10 px-1.5 py-0.5 text-[9px] font-medium text-primary">
          <Sparkles size={9} />
          자동
        </span>
      )}
    </label>
  );
}
