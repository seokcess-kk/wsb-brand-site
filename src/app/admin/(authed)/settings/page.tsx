import { AdminHeader } from "@/components/admin/admin-header";
import { getNotifyEmails } from "@/app/actions/settings";
import { SettingsForm } from "@/components/admin/settings-form";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const notifyEmails = await getNotifyEmails();

  return (
    <div className="px-10 py-10 space-y-10">
      <AdminHeader
        tag="SITE SETTINGS"
        title="설정"
        meta="04 / SETTINGS"
      />
      <SettingsForm initialNotifyEmails={notifyEmails} />
    </div>
  );
}
