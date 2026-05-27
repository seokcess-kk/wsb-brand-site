import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { db, isDbConfigured, schema } from "@/db/client";
import { AdminHeader } from "@/components/admin/admin-header";
import { NewsForm } from "@/components/admin/news-form";

export const dynamic = "force-dynamic";

export default async function EditNewsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const numericId = Number(id);
  if (!Number.isFinite(numericId)) notFound();

  if (!isDbConfigured()) {
    return (
      <div className="px-10 py-10">
        <p className="text-sm text-structural/65">DATABASE_URL이 설정되지 않았습니다.</p>
      </div>
    );
  }

  const [post] = await db()
    .select()
    .from(schema.newsPosts)
    .where(eq(schema.newsPosts.id, numericId))
    .limit(1);

  if (!post) notFound();

  return (
    <div className="px-10 py-10 space-y-10">
      <AdminHeader
        tag="EDIT NEWS POST"
        title={post.titleKo}
        meta={`01 / ID ${post.id}`}
      />
      <NewsForm post={post} />
    </div>
  );
}
