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
