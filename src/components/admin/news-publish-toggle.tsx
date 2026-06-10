"use client";

import { useState, useTransition } from "react";
import { toggleNewsPublished } from "@/app/actions/news";

export function NewsPublishToggle({
  id,
  isPublished,
}: {
  id: number;
  isPublished: boolean;
}) {
  const [pending, startTransition] = useTransition();
  const [failed, setFailed] = useState(false);

  function handleClick() {
    setFailed(false);
    startTransition(async () => {
      try {
        await toggleNewsPublished(id, !isPublished);
      } catch {
        setFailed(true);
      }
    });
  }

  return (
    <div className="flex flex-col items-start gap-1">
      <button
        type="button"
        disabled={pending}
        aria-busy={pending}
        onClick={handleClick}
        aria-label={isPublished ? "비발행으로 전환" : "발행으로 전환"}
        className={`inline-flex items-center px-2 py-0.5 font-mono text-[10px] font-medium uppercase tracking-[0.08em] transition-opacity hover:opacity-80 disabled:opacity-50 ${
          isPublished
            ? "bg-primary/10 text-primary"
            : "bg-structural/10 text-structural/65"
        }`}
      >
        {isPublished ? "Published" : "Draft"}
      </button>
      {failed && (
        <span role="alert" className="text-[10px] text-rose-600">
          변경 실패
        </span>
      )}
    </div>
  );
}
