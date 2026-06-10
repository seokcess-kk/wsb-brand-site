"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Save } from "lucide-react";
import { saveNotifyEmails, type SettingsFormState } from "@/app/actions/settings";

const INITIAL: SettingsFormState = { status: "idle" };

export function SettingsForm({
  initialNotifyEmails,
}: {
  initialNotifyEmails: string;
}) {
  const [state, formAction] = useActionState(saveNotifyEmails, INITIAL);

  return (
    <form action={formAction} className="space-y-8 max-w-2xl">
      <section className="space-y-5">
        <div className="flex items-center gap-3">
          <span aria-hidden className="h-px w-6 bg-primary" />
          <h2 className="font-mono text-[11px] font-medium uppercase tracking-[0.08em] text-primary">
            INQUIRY NOTIFICATIONS
          </h2>
        </div>

        <div className="space-y-2">
          <label
            htmlFor="notifyEmails"
            className="font-mono text-[11px] font-medium uppercase tracking-[0.08em] text-structural/65"
          >
            RECIPIENT EMAILS
          </label>
          <textarea
            id="notifyEmails"
            name="notifyEmails"
            rows={3}
            required
            defaultValue={initialNotifyEmails}
            placeholder="contact@woorismartbio.com, sales@..."
            className="w-full border border-structural/15 bg-canvas px-4 py-3 font-mono text-sm text-structural focus:border-primary focus:outline-none focus:ring-0"
          />
          <p className="text-xs text-structural/65">
            Partnership Inquiry 폼이 제출되면 이 이메일들로 알림이 갑니다. 쉼표로 구분합니다.
          </p>
        </div>
      </section>

      {state.status === "ok" && (
        <p className="border border-emerald-300 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {state.message}
        </p>
      )}
      {state.status === "error" && (
        <p className="border border-rose-300 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {state.message}
        </p>
      )}

      <SaveButton />
    </form>
  );
}

function SaveButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex items-center gap-2 bg-primary px-6 py-3 text-sm font-medium text-canvas transition-opacity hover:opacity-90 disabled:opacity-50"
    >
      <Save size={14} />
      {pending ? "저장 중..." : "변경 저장"}
    </button>
  );
}
