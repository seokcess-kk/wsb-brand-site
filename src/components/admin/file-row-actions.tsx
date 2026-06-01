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
