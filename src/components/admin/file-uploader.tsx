"use client";

import { useRef, useState } from "react";
import { Upload } from "lucide-react";
import { uploadFile } from "@/app/actions/files";

const KINDS = [
  { value: "pdf_company_intro", label: "회사 소개서 PDF" },
  { value: "cert", label: "인증서" },
  { value: "news_thumbnail", label: "News 썸네일" },
  { value: "other", label: "기타" },
] as const;

export function FileUploader({ disabled }: { disabled?: boolean }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(formData: FormData) {
    setBusy(true);
    setError(null);
    const res = await uploadFile(formData);
    setBusy(false);
    if (!res.ok) {
      setError(
        res.error === "blob-not-configured"
          ? "Blob 토큰이 없어 업로드할 수 없습니다."
          : "업로드 실패. 파일을 다시 확인해 주세요.",
      );
      return;
    }
    formRef.current?.reset();
  }

  return (
    <form
      ref={formRef}
      action={handleSubmit}
      className="flex flex-wrap items-end gap-4 border border-structural/10 bg-canvas p-6"
    >
      <div className="space-y-2">
        <label
          htmlFor="file-kind"
          className="font-mono text-[11px] font-medium uppercase tracking-[0.08em] text-structural/65"
        >
          KIND
        </label>
        <select
          id="file-kind"
          name="kind"
          defaultValue="pdf_company_intro"
          className="border border-structural/20 bg-canvas px-3 py-2 text-sm"
        >
          {KINDS.map((k) => (
            <option key={k.value} value={k.value}>
              {k.label}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <label
          htmlFor="file-input"
          className="font-mono text-[11px] font-medium uppercase tracking-[0.08em] text-structural/65"
        >
          FILE
        </label>
        <input
          id="file-input"
          name="file"
          type="file"
          required
          accept=".pdf,.png,.jpg,.jpeg,.webp,.svg"
          className="block text-sm text-structural file:mr-3 file:border file:border-structural/20 file:bg-canvas file:px-3 file:py-2 file:text-xs file:text-structural"
        />
      </div>

      <button
        type="submit"
        disabled={disabled || busy}
        className="inline-flex items-center gap-2 bg-primary px-5 py-2.5 text-sm font-medium text-canvas transition-opacity hover:opacity-90 disabled:opacity-40"
      >
        <Upload size={14} />
        {busy ? "Uploading..." : "Upload"}
      </button>

      {error && (
        <p role="alert" className="w-full text-sm text-rose-600">
          {error}
        </p>
      )}
    </form>
  );
}
