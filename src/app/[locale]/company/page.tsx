import { getTranslations, setRequestLocale } from "next-intl/server";
import { PageHero } from "@/components/layout/page-hero";
import { RevealOnView } from "@/components/motion/reveal-on-view";

export default async function CompanyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("pages.company");
  const overviewItems = t.raw("overview.items") as { label: string; value: string }[];
  const credentials = t.raw("ceo.credentials") as string[];
  const members = t.raw("leadership.members") as {
    name: string;
    role: string;
    bio: string;
  }[];
  const historyItems = t.raw("history.items") as {
    year: string;
    items: string[];
  }[];

  return (
    <>
      <PageHero
        tag={t("hero.tag")}
        meta={t("hero.meta")}
        title={t("hero.title")}
        lede={t("hero.lede")}
      />

      {/* AT A GLANCE strip */}
      <section className="bg-canvas">
        <div className="mx-auto max-w-7xl px-6 py-16">
          <div className="mb-8 flex items-center gap-3">
            <span aria-hidden className="h-px w-6 bg-primary" />
            <p className="mono-label text-primary">{t("overview.sectionTag")}</p>
          </div>
          <dl className="grid gap-px bg-structural/10 sm:grid-cols-2 lg:grid-cols-4">
            {overviewItems.map((it) => (
              <div key={it.label} className="bg-canvas p-6">
                <dt className="mono-label text-structural/55">{it.label}</dt>
                <dd className="mt-3 font-sans text-xl font-bold tracking-tight text-structural">
                  {it.value}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* CEO MESSAGE */}
      <section className="bg-canvas">
        <div className="mx-auto max-w-7xl px-6 py-24 md:py-32">
          <div className="mb-12 flex items-center gap-3">
            <span aria-hidden className="h-px w-6 bg-primary" />
            <p className="mono-label text-primary">{t("ceo.sectionTag")}</p>
          </div>

          <div className="grid items-start gap-16 lg:grid-cols-[1fr_1.2fr] lg:gap-20">
            {/* Photo placeholder */}
            <RevealOnView>
              <div className="relative aspect-[3/4] w-full overflow-hidden bg-structural/[0.04]">
                <div className="absolute inset-0 flex items-center justify-center">
                  <p className="mono-label text-[10px] text-structural/35">
                    {t("ceo.photoPlaceholder")}
                  </p>
                </div>
                <span aria-hidden className="absolute top-2 left-2 h-3 w-3 border-l border-t border-structural/20" />
                <span aria-hidden className="absolute top-2 right-2 h-3 w-3 border-r border-t border-structural/20" />
                <span aria-hidden className="absolute bottom-2 left-2 h-3 w-3 border-l border-b border-structural/20" />
                <span aria-hidden className="absolute bottom-2 right-2 h-3 w-3 border-r border-b border-structural/20" />
              </div>
            </RevealOnView>

            <div className="space-y-8">
              <RevealOnView delay={0.1}>
                <h2
                  className="whitespace-pre-line font-sans font-bold leading-[1.2] tracking-tight text-structural"
                  style={{ fontSize: "clamp(1.5rem, 3vw, 2.25rem)" }}
                >
                  {t("ceo.title")}
                </h2>
              </RevealOnView>
              <RevealOnView delay={0.18}>
                <p className="text-base leading-relaxed text-structural/75 max-w-prose">
                  {t("ceo.body")}
                </p>
              </RevealOnView>
              <RevealOnView delay={0.26}>
                <div className="border-t border-structural/10 pt-6 space-y-3">
                  <p className="mono-label text-structural/55">
                    {t("ceo.name").toUpperCase()} · {t("ceo.role")}
                  </p>
                  <ul className="space-y-2 text-sm text-structural/70">
                    {credentials.map((c) => (
                      <li key={c} className="flex items-start gap-2">
                        <span
                          aria-hidden
                          className="mt-[0.55em] h-1 w-1 flex-none rounded-full bg-primary/70"
                        />
                        <span>{c}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </RevealOnView>
            </div>
          </div>
        </div>
      </section>

      {/* LEADERSHIP */}
      <section className="bg-canvas border-t border-structural/10">
        <div className="mx-auto max-w-7xl px-6 py-24 md:py-32">
          <div className="mb-12 flex items-end justify-between">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <span aria-hidden className="h-px w-6 bg-primary" />
                <p className="mono-label text-primary">
                  {t("leadership.sectionTag")}
                </p>
              </div>
              <h2
                className="font-sans font-bold tracking-tight text-structural"
                style={{ fontSize: "clamp(1.5rem, 3vw, 2.25rem)" }}
              >
                {t("leadership.sectionTitle")}
              </h2>
            </div>
          </div>
          <div className="grid gap-px bg-structural/10 md:grid-cols-3">
            {members.map((m, i) => (
              <RevealOnView key={m.name} delay={0.1 + i * 0.08} className="h-full">
                <article className="flex h-full flex-col gap-5 bg-canvas p-6 md:p-8">
                  <div className="relative aspect-square w-full overflow-hidden bg-structural/[0.04]">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <p className="mono-label text-[10px] text-structural/35">
                        {t("leadership.photoPlaceholder")}
                      </p>
                    </div>
                    <span aria-hidden className="absolute top-2 left-2 h-2 w-2 border-l border-t border-structural/20" />
                    <span aria-hidden className="absolute top-2 right-2 h-2 w-2 border-r border-t border-structural/20" />
                    <span aria-hidden className="absolute bottom-2 left-2 h-2 w-2 border-l border-b border-structural/20" />
                    <span aria-hidden className="absolute bottom-2 right-2 h-2 w-2 border-r border-b border-structural/20" />
                  </div>
                  <div className="space-y-2">
                    <p className="mono-label text-primary">{m.role}</p>
                    <h3 className="font-sans text-xl font-bold tracking-tight text-structural">
                      {m.name}
                    </h3>
                  </div>
                  <p className="text-sm leading-relaxed text-structural/70">
                    {m.bio}
                  </p>
                </article>
              </RevealOnView>
            ))}
          </div>
        </div>
      </section>

      {/* HISTORY */}
      <section className="bg-canvas border-t border-structural/10">
        <div className="mx-auto max-w-7xl px-6 py-24 md:py-32">
          <div className="mb-12 flex items-center gap-3">
            <span aria-hidden className="h-px w-6 bg-primary" />
            <p className="mono-label text-primary">{t("history.sectionTag")}</p>
          </div>
          <h2
            className="mb-12 font-sans font-bold tracking-tight text-structural"
            style={{ fontSize: "clamp(1.5rem, 3vw, 2.25rem)" }}
          >
            {t("history.sectionTitle")}
          </h2>

          <ol className="space-y-px bg-structural/10">
            {historyItems.map((row, i) => (
              <RevealOnView key={row.year} delay={0.05 * i}>
                <li className="grid grid-cols-[100px_1fr] gap-6 bg-canvas px-2 py-6 md:px-6">
                  <p className="font-mono text-lg font-bold tracking-tight text-primary">
                    {row.year}
                  </p>
                  <ul className="space-y-2 text-sm text-structural/80">
                    {row.items.map((it) => (
                      <li key={it} className="flex items-start gap-2">
                        <span
                          aria-hidden
                          className="mt-[0.55em] h-1 w-1 flex-none rounded-full bg-primary/70"
                        />
                        <span>{it}</span>
                      </li>
                    ))}
                  </ul>
                </li>
              </RevealOnView>
            ))}
          </ol>
        </div>
      </section>

      {/* VISION */}
      <section className="bg-structural text-canvas">
        <div className="mx-auto max-w-7xl px-6 py-24 md:py-32">
          <div className="grid gap-10 lg:grid-cols-[1fr_1.4fr] lg:gap-16">
            <RevealOnView>
              <div className="flex items-center gap-3">
                <span aria-hidden className="h-px w-6 bg-primary" />
                <p className="mono-label text-canvas/65">
                  {t("vision.sectionTag")}
                </p>
              </div>
            </RevealOnView>
            <div className="space-y-6">
              <RevealOnView delay={0.1}>
                <h2
                  className="font-sans font-bold tracking-tight text-canvas"
                  style={{ fontSize: "clamp(2rem, 4vw, 3rem)" }}
                >
                  {t("vision.title")}
                </h2>
              </RevealOnView>
              <RevealOnView delay={0.2}>
                <p className="max-w-3xl text-base leading-relaxed text-canvas/75">
                  {t("vision.body")}
                </p>
              </RevealOnView>
            </div>
          </div>
        </div>
      </section>

      {/* LOCATION */}
      <section className="bg-canvas border-t border-structural/10">
        <div className="mx-auto max-w-7xl px-6 py-24 md:py-32">
          <div className="mb-10 flex items-center gap-3">
            <span aria-hidden className="h-px w-6 bg-primary" />
            <p className="mono-label text-primary">
              {t("location.sectionTag")}
            </p>
          </div>
          <div className="grid gap-px bg-structural/10 md:grid-cols-[1fr_1.4fr]">
            <div className="bg-canvas p-8 md:p-10 space-y-6">
              <InfoBlock
                label={t("location.addressLabel")}
                value={t("location.address")}
              />
              <InfoBlock
                label={t("location.telLabel")}
                value={t("location.tel")}
                href={`tel:${t("location.tel").replace(/[^+\d]/g, "")}`}
              />
              <InfoBlock
                label={t("location.emailLabel")}
                value={t("location.email")}
                href={`mailto:${t("location.email")}`}
              />
            </div>
            <div className="relative min-h-[320px] bg-structural/[0.04] overflow-hidden">
              <div
                aria-hidden
                className="absolute inset-0 opacity-50"
                style={{
                  backgroundImage:
                    "linear-gradient(to right, rgba(26,31,27,0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(26,31,27,0.06) 1px, transparent 1px)",
                  backgroundSize: "32px 32px",
                }}
              />
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
                <div className="relative">
                  <span
                    aria-hidden
                    className="absolute inset-0 rounded-full bg-primary/40 animate-ping"
                  />
                  <span
                    aria-hidden
                    className="relative block h-3 w-3 rounded-full bg-primary"
                  />
                </div>
                <p className="mono-label text-[10px] text-structural/45">
                  {t("location.mapPlaceholder")}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

function InfoBlock({
  label,
  value,
  href,
}: {
  label: string;
  value: string;
  href?: string;
}) {
  return (
    <div className="space-y-1.5">
      <p className="mono-label text-structural/55">{label}</p>
      {href ? (
        <a
          href={href}
          className="block text-base text-structural hover:text-primary transition-colors"
        >
          {value}
        </a>
      ) : (
        <p className="text-base text-structural">{value}</p>
      )}
    </div>
  );
}
