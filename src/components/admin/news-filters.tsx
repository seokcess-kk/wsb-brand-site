import Link from "next/link";
import { Search } from "lucide-react";

export function NewsFilters({
  categories,
  category,
  q,
}: {
  categories: string[];
  category: string;
  q: string;
}) {
  function catHref(c: string) {
    const params = new URLSearchParams();
    if (c) params.set("category", c);
    if (q) params.set("q", q);
    const qs = params.toString();
    return qs ? `/admin/news?${qs}` : "/admin/news";
  }

  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <nav className="flex flex-wrap gap-1">
        <Link
          href={catHref("")}
          className={`px-3 py-1.5 font-mono text-[11px] font-medium uppercase tracking-[0.08em] transition-colors ${
            !category
              ? "bg-primary text-canvas"
              : "text-structural/65 hover:bg-primary/[0.06] hover:text-primary"
          }`}
        >
          All
        </Link>
        {categories.map((c) => (
          <Link
            key={c}
            href={catHref(c)}
            className={`px-3 py-1.5 font-mono text-[11px] font-medium uppercase tracking-[0.08em] transition-colors ${
              category === c
                ? "bg-primary text-canvas"
                : "text-structural/65 hover:bg-primary/[0.06] hover:text-primary"
            }`}
          >
            {c}
          </Link>
        ))}
      </nav>

      <form action="/admin/news" method="get" className="flex items-center gap-2">
        {category && <input type="hidden" name="category" value={category} />}
        <div className="flex items-center border border-structural/20 px-3 py-1.5">
          <Search size={14} className="text-structural/65" />
          <input
            name="q"
            defaultValue={q}
            placeholder="제목·slug 검색"
            className="ml-2 w-48 bg-transparent text-sm text-structural placeholder:text-structural/35 focus:outline-none"
          />
        </div>
      </form>
    </div>
  );
}
