import { Resend } from "resend";
import { env } from "@/env";

let _resend: Resend | null = null;

function getResend() {
  if (!env.RESEND_API_KEY) return null;
  if (!_resend) _resend = new Resend(env.RESEND_API_KEY);
  return _resend;
}

export function isEmailConfigured() {
  return Boolean(env.RESEND_API_KEY);
}

type InquiryEmailPayload = {
  company: string;
  name: string;
  email: string;
  phone?: string | null;
  country?: string | null;
  category: string;
  message: string;
  locale: string;
};

/**
 * Send the internal notification to WSB staff plus an auto-reply to the
 * submitter. Returns ok:true on success. When Resend is not configured we
 * log to console and treat it as success in dev.
 */
export async function sendInquiryEmails(
  payload: InquiryEmailPayload,
  notifyToOverride?: string,
) {
  const notifyToSource = notifyToOverride || env.INQUIRY_NOTIFY_TO;

  const resend = getResend();
  if (!resend) {
    console.log("[email:fallback] RESEND_API_KEY missing, skipping send", {
      to: notifyToSource,
      payload,
    });
    return { ok: true, fallback: true };
  }

  const recipients = notifyToSource
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  const notifySubject = `[WSB Inquiry] ${payload.category} · ${payload.company}`;
  const notifyHtml = renderNotificationHtml(payload);

  const autoSubject =
    payload.locale === "ko"
      ? "[WSB] 문의가 접수되었습니다"
      : "[WSB] We received your inquiry";
  const autoHtml = renderAutoReplyHtml(payload);

  try {
    const [notify, auto] = await Promise.all([
      resend.emails.send({
        from: env.RESEND_FROM,
        to: recipients,
        replyTo: payload.email,
        subject: notifySubject,
        html: notifyHtml,
      }),
      resend.emails.send({
        from: env.RESEND_FROM,
        to: payload.email,
        subject: autoSubject,
        html: autoHtml,
      }),
    ]);

    if (notify.error || auto.error) {
      console.error("[email] partial failure", {
        notify: notify.error,
        auto: auto.error,
      });
    }

    return { ok: true, fallback: false };
  } catch (err) {
    console.error("[email] send failed", err);
    return { ok: false, fallback: false };
  }
}

function escape(s: string) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function renderNotificationHtml(p: InquiryEmailPayload) {
  const rows: [string, string][] = [
    ["Company", p.company],
    ["Name", p.name],
    ["Email", p.email],
    ["Phone", p.phone ?? "—"],
    ["Country", p.country ?? "—"],
    ["Category", p.category],
    ["Locale", p.locale],
  ];
  return `
    <div style="font-family:Pretendard,system-ui,sans-serif;color:#1A1F1B;max-width:560px;">
      <p style="font-family:'JetBrains Mono',ui-monospace,monospace;font-size:11px;letter-spacing:0.08em;text-transform:uppercase;color:#0F5132;">WSB · Partnership Inquiry</p>
      <h2 style="font-weight:700;font-size:20px;margin:8px 0 20px;">New inquiry from ${escape(p.company)}</h2>
      <table style="border-collapse:collapse;width:100%;font-size:14px;">
        ${rows
          .map(
            ([k, v]) =>
              `<tr><td style="padding:6px 12px 6px 0;color:#1A1F1B99;width:100px;">${k}</td><td style="padding:6px 0;">${escape(v)}</td></tr>`,
          )
          .join("")}
      </table>
      <hr style="border:none;border-top:1px solid #1A1F1B22;margin:20px 0;" />
      <p style="font-family:'JetBrains Mono',ui-monospace,monospace;font-size:11px;color:#1A1F1B66;">MESSAGE</p>
      <p style="white-space:pre-wrap;font-size:14px;line-height:1.7;">${escape(p.message)}</p>
    </div>
  `;
}

function renderAutoReplyHtml(p: InquiryEmailPayload) {
  const ko = p.locale === "ko";
  return `
    <div style="font-family:Pretendard,system-ui,sans-serif;color:#1A1F1B;max-width:560px;">
      <p style="font-family:'JetBrains Mono',ui-monospace,monospace;font-size:11px;letter-spacing:0.08em;text-transform:uppercase;color:#0F5132;">WSB · Engineered by Data, Grown by Design.</p>
      <h2 style="font-weight:700;font-size:20px;margin:8px 0 20px;">
        ${ko ? `${escape(p.name)} 님 안녕하세요.` : `Hi ${escape(p.name)},`}
      </h2>
      <p style="font-size:14px;line-height:1.7;">
        ${
          ko
            ? "우리스마트바이오에 문의해 주셔서 감사합니다. 영업일 기준 2일 이내에 담당자가 회신드리겠습니다."
            : "Thank you for reaching out to Woori Smart Bio. Our team will get back to you within two business days."
        }
      </p>
      <p style="font-size:14px;line-height:1.7;margin-top:16px;">
        ${
          ko
            ? "회신이 지연될 경우 dasom@woorismartbio.com 으로 다시 문의 주세요."
            : "If you do not hear back, please reach us at dasom@woorismartbio.com."
        }
      </p>
      <hr style="border:none;border-top:1px solid #1A1F1B22;margin:24px 0;" />
      <p style="font-size:12px;color:#1A1F1B99;">
        ${ko ? "(주)우리스마트바이오" : "Woori Smart Bio Co., Ltd."}<br/>
        ${ko ? "경기도 연천군 연천읍 차옥로 149" : "149 Chaok-ro, Yeoncheon-eup, Yeoncheon-gun, Gyeonggi-do, Korea"}<br/>
        woorismartbio.com
      </p>
    </div>
  `;
}
