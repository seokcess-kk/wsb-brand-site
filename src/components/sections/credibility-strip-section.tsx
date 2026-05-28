import { getTranslations } from "next-intl/server";

type CredibilityItem = {
  label: string;
  value: string;
  caption: string;
};

export async function CredibilityStripSection() {
  const t = await getTranslations("home.credibility");
  const items = t.raw("items") as CredibilityItem[];

  return (
    <section
      aria-label={t("ariaLabel")}
      className="border-y border-structural/10 bg-canvas"
    >
      <div className="mx-auto max-w-7xl px-6 py-6 md:py-7">
        <div className="grid gap-px bg-structural/10 sm:grid-cols-2 lg:grid-cols-6">
          {items.map((item) => (
            <dl key={item.label} className="bg-canvas p-4 md:p-5">
              <dt className="mono-label text-[11px] text-structural/50">
                {item.label}
              </dt>
              <dd className="mt-2 font-sans text-lg font-bold tracking-tight text-structural">
                {item.value}
              </dd>
              <dd className="mt-1 text-sm leading-snug text-structural/62">
                {item.caption}
              </dd>
            </dl>
          ))}
        </div>
        <p className="mt-4 text-xs leading-relaxed text-structural/50 md:max-w-3xl">
          {t("note")}
        </p>
      </div>
    </section>
  );
}
