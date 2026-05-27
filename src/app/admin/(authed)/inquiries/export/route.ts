import { desc } from "drizzle-orm";
import { auth } from "@/auth";
import { db, isDbConfigured, schema } from "@/db/client";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return new Response("Unauthorized", { status: 401 });
  }

  if (!isDbConfigured()) {
    return new Response("DATABASE_URL not configured", { status: 503 });
  }

  const rows = await db()
    .select()
    .from(schema.inquiries)
    .orderBy(desc(schema.inquiries.createdAt));

  const headers = [
    "id",
    "created_at",
    "company",
    "name",
    "email",
    "phone",
    "country",
    "category",
    "locale",
    "status",
    "message",
  ];
  const escape = (v: unknown) => {
    if (v == null) return "";
    const s = String(v).replace(/"/g, '""');
    return /[",\n]/.test(s) ? `"${s}"` : s;
  };
  const csv = [
    headers.join(","),
    ...rows.map((r) =>
      [
        r.id,
        new Date(r.createdAt).toISOString(),
        r.company,
        r.name,
        r.email,
        r.phone ?? "",
        r.country ?? "",
        r.category,
        r.locale,
        r.status,
        r.message,
      ]
        .map(escape)
        .join(","),
    ),
  ].join("\n");

  const filename = `wsb-inquiries-${new Date().toISOString().slice(0, 10)}.csv`;

  return new Response("﻿" + csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
