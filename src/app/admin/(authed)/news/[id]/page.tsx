import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { db, isDbConfigured, schema } from "@/db/client";
import { AdminHeader } from "@/components/admin/admin-header";
import { AdminPage } from "@/components/admin/admin-page";
import { NewsForm } from "@/components/admin/news-form";
import { listNewsCategories } from "@/lib/news-query";

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
      <div className="px-6 py-7 md:px-8">
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

  const categories = await listNewsCategories();

  return (
    <AdminPage>
      <AdminHeader
        tag="EDIT NEWS POST"
        title={post.titleKo}
        meta={`01 / ID ${post.id}`}
      />
      <NewsForm post={post} categories={categories} />
    </AdminPage>
  );
}
