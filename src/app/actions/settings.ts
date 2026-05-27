"use server";

import { revalidatePath } from "next/cache";
import { sql } from "drizzle-orm";
import { z } from "zod";
import { auth } from "@/auth";
import { db, isDbConfigured, schema } from "@/db/client";

const NOTIFY_EMAILS_KEY = "notify_emails";

const SettingsSchema = z.object({
  notifyEmails: z.string().trim().min(1),
});

async function requireAdmin() {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");
}

export async function getNotifyEmails(): Promise<string> {
  if (!isDbConfigured()) {
    return process.env.INQUIRY_NOTIFY_TO ?? "";
  }
  const [row] = await db()
    .select()
    .from(schema.siteSettings)
    .where(sql`${schema.siteSettings.key} = ${NOTIFY_EMAILS_KEY}`)
    .limit(1);
  return row?.value ?? process.env.INQUIRY_NOTIFY_TO ?? "";
}

export type SettingsFormState = {
  status: "idle" | "ok" | "error";
  message?: string;
};

export async function saveNotifyEmails(
  _prev: SettingsFormState,
  formData: FormData,
): Promise<SettingsFormState> {
  await requireAdmin();
  if (!isDbConfigured()) {
    return { status: "error", message: "DATABASE_URL이 설정되지 않았습니다." };
  }

  const parsed = SettingsSchema.safeParse({
    notifyEmails: formData.get("notifyEmails"),
  });
  if (!parsed.success) {
    return { status: "error", message: "이메일 형식을 확인해 주세요." };
  }

  // upsert
  await db()
    .insert(schema.siteSettings)
    .values({ key: NOTIFY_EMAILS_KEY, value: parsed.data.notifyEmails })
    .onConflictDoUpdate({
      target: schema.siteSettings.key,
      set: { value: parsed.data.notifyEmails, updatedAt: sql`now()` },
    });

  revalidatePath("/admin/settings");
  return { status: "ok", message: "저장되었습니다." };
}
