"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Trash2, Save } from "lucide-react";
import {
  createOrUpdateNews,
  deleteNews,
  type NewsFormState,
} from "@/app/actions/news";
import type { NewsPost } from "@/db/schema";

const INITIAL: NewsFormState = { status: "idle" };

export function NewsForm({ post }: { post?: NewsPost }) {
  const action = createOrUpdateNews.bind(null, post?.id ?? null);
  const [state, formAction] = useActionState(action, INITIAL);

  async function handleDelete() {
    if (!post) return;
    if (!confirm("정말 삭제하시겠습니까?")) return;
    await deleteNews(post.id);
    window.location.href = "/admin/news";
  }

  return (
    <form action={formAction} className="space-y-10">
      {/* Meta block */}
      <Section title="META">
        <div className="grid gap-6 md:grid-cols-2">
          <Field
            label="SLUG"
            name="slug"
            required
            defaultValue={post?.slug ?? ""}
            placeholder="green-bio-recognition-2025"
            error={state.fieldErrors?.slug}
          />
          <Field
            label="CATEGORY"
            name="category"
            required
            defaultValue={post?.category ?? ""}
            placeholder="Partnership / Certification / Business / Clinical / R&D"
            error={state.fieldErrors?.category}
          />
          <Field
            label="PUBLISHED AT"
            name="publishedAt"
            type="datetime-local"
            defaultValue={
              post?.publishedAt
                ? new Date(post.publishedAt).toISOString().slice(0, 16)
                : ""
            }
          />
          <Field
            label="THUMBNAIL URL"
            name="thumbnailUrl"
            type="url"
            defaultValue={post?.thumbnailUrl ?? ""}
            placeholder="https://..."
          />
          <Field
            label="EXTERNAL URL (optional)"
            name="externalUrl"
            type="url"
            defaultValue={post?.externalUrl ?? ""}
            placeholder="https://news.example.com/..."
          />
          <div className="flex items-center gap-3 self-end pb-2">
            <input
              id="news-published"
              type="checkbox"
              name="isPublished"
              defaultChecked={post?.isPublished ?? false}
              className="h-4 w-4 cursor-pointer appearance-none border border-structural/30 bg-canvas checked:border-primary checked:bg-primary"
            />
            <label
              htmlFor="news-published"
              className="cursor-pointer text-sm text-structural/80"
            >
              발행 상태
            </label>
          </div>
        </div>
      </Section>

      {/* Korean content */}
      <Section title="KOREAN">
        <Field
          label="TITLE"
          name="titleKo"
          required
          defaultValue={post?.titleKo ?? ""}
          error={state.fieldErrors?.titleKo}
        />
        <Textarea
          label="SUMMARY"
          name="summaryKo"
          required
          rows={3}
          defaultValue={post?.summaryKo ?? ""}
          error={state.fieldErrors?.summaryKo}
        />
        <Textarea
          label="BODY"
          name="bodyKo"
          rows={10}
          defaultValue={post?.bodyKo ?? ""}
          placeholder="Markdown 지원 예정"
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
        <Textarea
          label="BODY"
          name="bodyEn"
          rows={10}
          defaultValue={post?.bodyEn ?? ""}
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
      className="ml-auto inline-flex items-center gap-2 bg-primary px-6 py-3 text-sm font-medium text-canvas transition-opacity hover:opacity-90 disabled:opacity-50"
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
    <section className="space-y-5">
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
  defaultValue,
  placeholder,
  error,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  defaultValue?: string;
  placeholder?: string;
  error?: string[];
}) {
  const id = `news-${name}`;
  return (
    <div className="space-y-2">
      <Label htmlFor={id} label={label} required={required} />
      <input
        id={id}
        name={name}
        type={type}
        required={required}
        defaultValue={defaultValue}
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
  defaultValue,
  placeholder,
  error,
}: {
  label: string;
  name: string;
  required?: boolean;
  rows?: number;
  defaultValue?: string;
  placeholder?: string;
  error?: string[];
}) {
  const id = `news-${name}`;
  return (
    <div className="space-y-2">
      <Label htmlFor={id} label={label} required={required} />
      <textarea
        id={id}
        name={name}
        required={required}
        rows={rows}
        defaultValue={defaultValue}
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
}: {
  htmlFor: string;
  label: string;
  required?: boolean;
}) {
  return (
    <label
      htmlFor={htmlFor}
      className="flex items-center gap-2 font-mono text-[11px] font-medium uppercase tracking-[0.08em] text-structural/65"
    >
      {label}
      {required && <span className="text-primary">*</span>}
    </label>
  );
}
