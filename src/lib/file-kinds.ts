export const FILE_KIND_LABELS: Record<string, string> = {
  pdf_company_intro: "회사소개서 PDF",
  cert: "인증서",
  news_thumbnail: "News 썸네일",
  other: "기타",
};

export function fileKindLabel(kind: string): string {
  return FILE_KIND_LABELS[kind] ?? kind;
}
