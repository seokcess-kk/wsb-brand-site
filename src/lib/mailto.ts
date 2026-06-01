/** Build a mailto: link prefilled with a reply subject and a localized greeting. */
export function buildReplyMailto(opts: {
  email: string;
  category: string;
  name?: string | null;
  locale?: string;
}): string {
  const { email, category, name, locale } = opts;
  const subject = `Re: [WSB] ${category} inquiry`;
  const greeting =
    locale === "en"
      ? `Hello ${name ?? ""},\n\nThank you for reaching out to Woori Smart Bio.\n\n`
      : `${name ?? ""}님 안녕하세요.\n\n우리스마트바이오에 문의해 주셔서 감사합니다.\n\n`;
  const query = `subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(greeting)}`;
  return `mailto:${email}?${query}`;
}
