// Shown during client navigation to the dynamic news route while the post
// list loads. Mirrors the card grid so the layout does not jump.
export default function NewsLoading() {
  return (
    <section className="bg-canvas">
      <div className="mx-auto max-w-7xl px-6 py-20 md:py-28 lg:py-32">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="flex flex-col gap-5 border border-structural/10 p-8 md:p-10"
            >
              <div className="aspect-[16/9] animate-pulse bg-structural/[0.06]" />
              <div className="h-3 w-24 animate-pulse bg-structural/[0.06]" />
              <div className="h-5 w-3/4 animate-pulse bg-structural/[0.06]" />
              <div className="h-12 w-full animate-pulse bg-structural/[0.04]" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
