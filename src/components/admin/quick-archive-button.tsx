"use client";

import { useState, useTransition } from "react";
import { Archive } from "lucide-react";
import { updateInquiryStatus } from "@/app/actions/inquiry";

export function QuickArchiveButton({ id }: { id: number }) {
  const [pending, startTransition] = useTransition();
  const [failed, setFailed] = useState(false);

  function handleClick() {
    setFailed(false);
    startTransition(async () => {
      try {
        await updateInquiryStatus(id, "archived");
      } catch {
        setFailed(true);
      }
    });
  }

  return (
    <span className="inline-flex items-center gap-2">
      <button
        type="button"
        disabled={pending}
        aria-busy={pending}
        onClick={handleClick}
        className="inline-flex items-center gap-1 text-xs text-structural/55 hover:text-primary disabled:opacity-50"
      >
        <Archive size={12} />
        보관
      </button>
      {failed && (
        <span role="alert" className="text-xs text-rose-600">
          보관 실패
        </span>
      )}
    </span>
  );
}
