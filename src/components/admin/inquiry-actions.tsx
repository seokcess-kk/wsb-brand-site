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
