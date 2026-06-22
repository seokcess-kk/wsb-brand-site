import { AdminHeader } from "@/components/admin/admin-header";
import { AdminPage } from "@/components/admin/admin-page";
import { NewsForm } from "@/components/admin/news-form";
import { listNewsCategories } from "@/lib/news-query";

export default async function NewNewsPage() {
  const categories = await listNewsCategories();
  return (
    <AdminPage>
      <AdminHeader tag="NEW NEWS POST" title="새 글 작성" meta="01 / NEW" />
      <NewsForm categories={categories} />
    </AdminPage>
  );
}
