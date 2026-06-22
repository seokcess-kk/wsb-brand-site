import { AdminHeader } from "@/components/admin/admin-header";
import { NewsForm } from "@/components/admin/news-form";
import { listNewsCategories } from "@/lib/news-query";

export default async function NewNewsPage() {
  const categories = await listNewsCategories();
  return (
    <div className="px-10 py-10 space-y-10">
      <AdminHeader tag="NEW NEWS POST" title="새 글 작성" meta="01 / NEW" />
      <NewsForm categories={categories} />
    </div>
  );
}
