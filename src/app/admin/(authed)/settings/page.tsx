import { AdminHeader } from "@/components/admin/admin-header";
import { AdminPage } from "@/components/admin/admin-page";
import { getNotifyEmails } from "@/app/actions/settings";
import { SettingsForm } from "@/components/admin/settings-form";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const notifyEmails = await getNotifyEmails();

  return (
    <AdminPage>
      <AdminHeader
        tag="SITE SETTINGS"
        title="설정"
        meta="04 / SETTINGS"
      />
      <SettingsForm initialNotifyEmails={notifyEmails} />
    </AdminPage>
  );
}
