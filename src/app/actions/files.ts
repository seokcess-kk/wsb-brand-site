"use server";

import { revalidatePath } from "next/cache";
import { put, del } from "@vercel/blob";
import { desc, eq } from "drizzle-orm";
import { auth } from "@/auth";
import { db, isDbConfigured, schema } from "@/db/client";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");
}

export async function uploadFile(formData: FormData) {
  await requireAdmin();
  const file = formData.get("file") as File | null;
  const kind = String(formData.get("kind") || "other");
  if (!file || file.size === 0) return { ok: false, error: "no-file" };

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return { ok: false, error: "blob-not-configured" };
  }

  const blob = await put(file.name, file, {
    access: "public",
    addRandomSuffix: true,
  });

  if (isDbConfigured()) {
    await db().insert(schema.uploadedFiles).values({
      kind,
      url: blob.url,
      pathname: blob.pathname,
      filename: file.name,
      contentType: file.type,
    });
  }

  revalidatePath("/admin/files");
  return { ok: true, url: blob.url };
}

export async function deleteFile(id: number, url: string) {
  await requireAdmin();
  try {
    await del(url);
  } catch (err) {
    console.error("[files] blob delete failed", err);
  }
  if (isDbConfigured()) {
    await db().delete(schema.uploadedFiles).where(eq(schema.uploadedFiles.id, id));
  }
  revalidatePath("/admin/files");
}

export async function listFiles() {
  if (!isDbConfigured()) return [];
  return db()
    .select()
    .from(schema.uploadedFiles)
    .orderBy(desc(schema.uploadedFiles.createdAt));
}
