"use client";

import { useState, useTransition } from "react";
import { Trash2 } from "lucide-react";
import { deleteFile } from "@/app/actions/files";
import { CopyButton } from "@/components/admin/copy-button";

export function FileRowActions({ id, url }: { id: number; url: string }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleDelete() {
    if (!confirm("이 파일을 삭제하시겠습니까? 되돌릴 수 없습니다.")) return;
    setError(null);
    startTransition(async () => {
      try {
        await deleteFile(id, url);
      } catch {
        setError("삭제에 실패했습니다.");
      }
    });
  }

  return (
    <div className="flex flex-col items-start gap-1">
      <div className="flex items-center gap-3">
        <CopyButton value={url} label="URL" />
        <button
          type="button"
          disabled={pending}
          onClick={handleDelete}
          aria-label="파일 삭제"
          className="inline-flex items-center gap-1 text-xs text-rose-600 hover:text-rose-700 disabled:opacity-50"
        >
          <Trash2 size={12} />
          {pending ? "삭제 중" : "삭제"}
        </button>
      </div>
      {error && (
        <p role="alert" className="text-xs text-rose-600">
          {error}
        </p>
      )}
    </div>
  );
}
