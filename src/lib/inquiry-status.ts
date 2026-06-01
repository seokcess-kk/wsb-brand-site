import { z } from "zod";

export const INQUIRY_STATUSES = ["new", "read", "replied", "archived"] as const;
export type InquiryStatus = (typeof INQUIRY_STATUSES)[number];

/** Statuses an admin can set explicitly (excludes the implicit initial "new"). */
export const SETTABLE_STATUSES = ["read", "replied", "archived"] as const;
export type SettableStatus = (typeof SETTABLE_STATUSES)[number];

export const settableStatusSchema = z.enum(SETTABLE_STATUSES);

export function isInquiryStatus(value: string): value is InquiryStatus {
  return (INQUIRY_STATUSES as readonly string[]).includes(value);
}

export const STATUS_META: Record<
  InquiryStatus,
  { label: string; className: string }
> = {
  new: { label: "New", className: "bg-primary/10 text-primary" },
  read: { label: "Read", className: "bg-structural/10 text-structural/65" },
  replied: { label: "Replied", className: "bg-primary text-canvas" },
  archived: { label: "Archived", className: "bg-structural/5 text-structural/40" },
};
