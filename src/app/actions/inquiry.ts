"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { db, isDbConfigured, schema } from "@/db/client";
import { sendInquiryEmails } from "@/lib/email";
import { requireAdmin } from "@/lib/admin-auth";
import { settableStatusSchema, type SettableStatus } from "@/lib/inquiry-status";

const InquirySchema = z.object({
  company: z.string().trim().min(1).max(200),
  name: z.string().trim().min(1).max(100),
  email: z.string().trim().email().max(200),
  phone: z.string().trim().max(50).optional().or(z.literal("")),
  country: z.string().trim().max(100).optional().or(z.literal("")),
  category: z.string().trim().min(1).max(50),
  message: z.string().trim().min(1).max(5000),
  consent: z
    .union([z.literal("on"), z.literal("true"), z.boolean()])
    .transform(() => true),
  locale: z.string().trim().max(8).default("ko"),
  // Honeypot: bots fill this; real users don't see it.
  website: z.string().max(0).optional().or(z.literal("")),
});

export type InquiryFormState = {
  status: "idle" | "ok" | "error";
  message?: string;
  fieldErrors?: Record<string, string[] | undefined>;
};

export async function submitInquiry(
  _prev: InquiryFormState,
  formData: FormData,
): Promise<InquiryFormState> {
  const raw = Object.fromEntries(formData.entries());

  const parsed = InquirySchema.safeParse(raw);
  if (!parsed.success) {
    return {
      status: "error",
      message: "입력 항목을 다시 확인해 주세요.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }
  const data = parsed.data;

  // Persist (DB optional in dev)
  if (isDbConfigured()) {
    try {
      await db().insert(schema.inquiries).values({
        company: data.company,
        name: data.name,
        email: data.email,
        phone: data.phone || null,
        country: data.country || null,
        category: data.category,
        message: data.message,
        locale: data.locale,
      });
    } catch (err) {
      console.error("[inquiry] DB insert failed", err);
      return {
        status: "error",
        message: "일시적인 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.",
      };
    }
  } else {
    console.log("[inquiry:fallback] DB not configured, logging only:", data);
  }

  // Notify + auto-reply (best-effort; we don't fail the submission if email fails)
  const notifyTo = process.env.INQUIRY_NOTIFY_TO ?? "";
  await sendInquiryEmails(
    {
      company: data.company,
      name: data.name,
      email: data.email,
      phone: data.phone || null,
      country: data.country || null,
      category: data.category,
      message: data.message,
      locale: data.locale,
    },
    notifyTo || undefined,
  ).catch((err) => {
    console.error("[inquiry] email send error", err);
  });

  return { status: "ok" };
}

/** Admin-only: change an inquiry's status. Silently no-ops without a DB. */
export async function updateInquiryStatus(id: number, status: SettableStatus) {
  await requireAdmin();
  if (!Number.isInteger(id) || id <= 0) throw new Error("Invalid inquiry id");
  if (!isDbConfigured()) return;

  const parsed = settableStatusSchema.safeParse(status);
  if (!parsed.success) throw new Error("Invalid status");

  try {
    await db()
      .update(schema.inquiries)
      .set({ status: parsed.data })
      .where(eq(schema.inquiries.id, id));
  } catch (err) {
    console.error("[inquiry] status update failed", err);
    throw new Error("상태 업데이트에 실패했습니다.");
  }

  revalidatePath("/admin/inquiries");
  revalidatePath(`/admin/inquiries/${id}`);
  revalidatePath("/admin");
}
