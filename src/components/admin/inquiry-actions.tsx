"use client";

import { useState, useTransition } from "react";
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
  const [error, setError] = useState<string | null>(null);

  function run(next: "read" | "replied" | "archived") {
    setError(null);
    startTransition(async () => {
      try {
        await updateInquiryStatus(id, next);
      } catch {
        setError("상태 업데이트에 실패했습니다. 잠시 후 다시 시도해 주세요.");
      }
    });
  }

  // mailto: does not navigate the page, so the action fires alongside opening
  // the mail client. While a transition is pending we block the click to avoid
  // racing an in-flight status update.
  function handleReply(e: React.MouseEvent<HTMLAnchorElement>) {
    if (pending) {
      e.preventDefault();
      return;
    }
    run("replied");
  }

  const btn =
    "inline-flex items-center gap-2 px-4 py-2 text-sm transition-colors disabled:opacity-50";

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-3">
        <a
          href={mailto}
          onClick={handleReply}
          aria-disabled={pending}
          className={`${btn} bg-primary text-canvas hover:opacity-90 ${
            pending ? "pointer-events-none opacity-50" : ""
          }`}
        >
          <Reply size={14} />
          답장
        </a>
        {status === "archived" ? (
          <button
            type="button"
            disabled={pending}
            onClick={() => run("read")}
            className={`${btn} border border-structural/20 text-structural hover:border-primary hover:text-primary`}
          >
            <Archive size={14} />
            보관 해제
          </button>
        ) : (
          <button
            type="button"
            disabled={pending}
            onClick={() => run("archived")}
            className={`${btn} border border-structural/20 text-structural hover:border-primary hover:text-primary`}
          >
            <Archive size={14} />
            보관
          </button>
        )}
      </div>
      {error && (
        <p role="alert" className="text-sm text-rose-600">
          {error}
        </p>
      )}
    </div>
  );
}
