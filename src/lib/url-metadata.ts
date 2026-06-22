/**
 * Pure helpers that turn a fetched HTML document into news metadata.
 *
 * The network fetch lives in the news server action; everything here operates
 * on already-downloaded bytes or strings so it stays unit testable. The parser
 * leans on Open Graph and JSON-LD which most press release and news sites
 * expose, with sensible fallbacks (twitter:* tags, <title>, meta description).
 */

export type ParsedMetadata = {
  title: string | null;
  description: string | null;
  image: string | null;
  publishedTime: string | null;
  siteName: string | null;
  section: string | null;
};

const NAMED_ENTITIES: Record<string, string> = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
  nbsp: " ",
  copy: "©",
  reg: "®",
  trade: "™",
  hellip: "…",
  mdash: "—",
  ndash: "–",
  lsquo: "‘",
  rsquo: "’",
  ldquo: "“",
  rdquo: "”",
  middot: "·",
  deg: "°",
};

/** Decode the HTML entities that commonly survive into meta tag content. */
export function decodeEntities(input: string): string {
  return input.replace(
    /&(#x[0-9a-fA-F]+|#\d+|[a-zA-Z][a-zA-Z0-9]*);/g,
    (full, body: string) => {
      if (body[0] === "#") {
        const code =
          body[1] === "x" || body[1] === "X"
            ? Number.parseInt(body.slice(2), 16)
            : Number.parseInt(body.slice(1), 10);
        if (Number.isFinite(code) && code > 0) {
          try {
            return String.fromCodePoint(code);
          } catch {
            return full;
          }
        }
        return full;
      }
      const named = NAMED_ENTITIES[body] ?? NAMED_ENTITIES[body.toLowerCase()];
      return named ?? full;
    },
  );
}

function clean(value: string | null | undefined): string | null {
  if (!value) return null;
  const text = decodeEntities(value).replace(/\s+/g, " ").trim();
  return text.length ? text : null;
}

function parseAttrs(tag: string): Record<string, string> {
  const attrs: Record<string, string> = {};
  const re =
    /([a-zA-Z_:][-a-zA-Z0-9_:.]*)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'>]+))/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(tag))) {
    attrs[m[1].toLowerCase()] = m[2] ?? m[3] ?? m[4] ?? "";
  }
  return attrs;
}

/** Build a property/name -> content map from every <meta> tag (first wins). */
function collectMeta(html: string): Map<string, string> {
  const map = new Map<string, string>();
  // Tolerate quoted '>' inside attribute values (e.g. og:title="<속보> ...").
  const re = /<meta\b(?:"[^"]*"|'[^']*'|[^>])*>/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html))) {
    const attrs = parseAttrs(m[0]);
    const key = (attrs.property || attrs.name || attrs.itemprop || "")
      .trim()
      .toLowerCase();
    const content = attrs.content;
    if (key && content != null && content !== "" && !map.has(key)) {
      map.set(key, content);
    }
  }
  return map;
}

function extractTitleTag(html: string): string | null {
  const m = /<title[^>]*>([\s\S]*?)<\/title>/i.exec(html);
  return m ? clean(m[1]) : null;
}

type JsonLdPick = {
  headline: string | null;
  description: string | null;
  image: string | null;
  datePublished: string | null;
  siteName: string | null;
  section: string | null;
  articleBody: string | null;
};

function pickImageFromJsonLd(value: unknown): string | null {
  if (!value) return null;
  if (typeof value === "string") return value;
  if (Array.isArray(value)) {
    for (const item of value) {
      const found = pickImageFromJsonLd(item);
      if (found) return found;
    }
    return null;
  }
  if (typeof value === "object") {
    const url = (value as Record<string, unknown>).url;
    return typeof url === "string" ? url : null;
  }
  return null;
}

const ARTICLE_TYPES = new Set([
  "article",
  "newsarticle",
  "blogposting",
  "report",
  "pressrelease",
  "webpage",
]);

function isArticleNode(node: Record<string, unknown>): boolean {
  const type = node["@type"];
  const types = Array.isArray(type) ? type : [type];
  if (types.some((t) => typeof t === "string" && ARTICLE_TYPES.has(t.toLowerCase()))) {
    return true;
  }
  return typeof node.headline === "string";
}

function extractJsonLd(html: string): JsonLdPick {
  const result: JsonLdPick = {
    headline: null,
    description: null,
    image: null,
    datePublished: null,
    siteName: null,
    section: null,
    articleBody: null,
  };
  const re =
    /<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let m: RegExpExecArray | null;
  const nodes: Record<string, unknown>[] = [];
  while ((m = re.exec(html))) {
    // Strip CDATA / comment guards that legacy templates wrap JSON-LD in, and
    // retry on entity-decoded text when the whole block was HTML-escaped.
    const raw = m[1]
      .trim()
      .replace(/^\/\/\s*/, "")
      .replace(/^<!\[CDATA\[/, "")
      .replace(/\]\]>\s*$/, "")
      .replace(/\/\/\s*$/, "")
      .trim();
    let data: unknown;
    try {
      data = JSON.parse(raw);
    } catch {
      try {
        data = JSON.parse(decodeEntities(raw));
      } catch {
        continue;
      }
    }
    const queue = Array.isArray(data) ? [...data] : [data];
    while (queue.length) {
      const item = queue.shift();
      if (!item || typeof item !== "object") continue;
      const obj = item as Record<string, unknown>;
      if (Array.isArray(obj["@graph"])) {
        queue.push(...(obj["@graph"] as Record<string, unknown>[]));
      }
      nodes.push(obj);
    }
  }

  const article = nodes.find(isArticleNode);
  if (article) {
    if (typeof article.headline === "string") result.headline = article.headline;
    if (typeof article.description === "string")
      result.description = article.description;
    if (typeof article.datePublished === "string")
      result.datePublished = article.datePublished;
    else if (typeof article.dateCreated === "string")
      result.datePublished = article.dateCreated;
    result.image = pickImageFromJsonLd(article.image);
    const section = article.articleSection;
    if (typeof section === "string") result.section = section;
    else if (Array.isArray(section) && typeof section[0] === "string")
      result.section = section[0];
    if (typeof article.articleBody === "string")
      result.articleBody = article.articleBody;
    const publisher = article.publisher;
    if (publisher && typeof publisher === "object") {
      const name = (publisher as Record<string, unknown>).name;
      if (typeof name === "string") result.siteName = name;
    }
  }
  return result;
}

function absolutize(url: string | null, base: string): string | null {
  if (!url) return null;
  const trimmed = url.trim();
  if (!trimmed) return null;
  try {
    const resolved = new URL(trimmed, base);
    // Only surface fetchable image URLs; drop javascript:/data:/etc.
    if (resolved.protocol !== "http:" && resolved.protocol !== "https:") {
      return null;
    }
    return resolved.toString();
  } catch {
    return null;
  }
}

/**
 * Extract the title / description / image / published date / site name from a
 * page, preferring Open Graph, then Twitter cards, then JSON-LD, then plain
 * <title>/<meta description>. `baseUrl` resolves relative image URLs.
 */
export function parseHtmlMetadata(html: string, baseUrl: string): ParsedMetadata {
  // Drop HTML comments so commented-out placeholder OG tags don't win first-wins.
  const doc = html.replace(/<!--[\s\S]*?-->/g, "");
  const meta = collectMeta(doc);
  const jsonLd = extractJsonLd(doc);
  const get = (...keys: string[]): string | null => {
    for (const key of keys) {
      const value = meta.get(key);
      if (value && value.trim()) return value;
    }
    return null;
  };

  const title =
    clean(get("og:title", "twitter:title")) ??
    clean(jsonLd.headline) ??
    extractTitleTag(doc);

  const description =
    clean(
      get("og:description", "twitter:description", "description"),
    ) ?? clean(jsonLd.description);

  const rawImage =
    get(
      "og:image:secure_url",
      "og:image:url",
      "og:image",
      "twitter:image",
      "twitter:image:src",
    ) ?? jsonLd.image;

  const publishedTime =
    clean(
      get(
        "article:published_time",
        "article:modified_time",
        "datepublished",
        "date",
        "dc.date",
        "dc.date.issued",
        "og:updated_time",
      ),
    ) ?? clean(jsonLd.datePublished);

  // twitter:site is an @handle, not a publication name, so it is excluded.
  const siteName =
    clean(get("og:site_name", "application-name")) ?? clean(jsonLd.siteName);

  const section =
    clean(get("article:section", "articlesection", "section")) ??
    clean(jsonLd.section);

  return {
    title,
    description,
    image: absolutize(rawImage ? decodeEntities(rawImage) : null, baseUrl),
    publishedTime,
    siteName,
    section,
  };
}

// ---------------------------------------------------------------------------
// Charset detection + decoding (operates on bytes, still pure & testable)
// ---------------------------------------------------------------------------

export function detectCharsetFromHeader(contentType?: string | null): string | null {
  if (!contentType) return null;
  const m = /charset\s*=\s*["']?([^;"'\s]+)/i.exec(contentType);
  return m ? m[1] : null;
}

export function detectCharsetFromHtml(head: string): string | null {
  let m = /<meta[^>]+charset\s*=\s*["']?\s*([a-zA-Z0-9_-]+)/i.exec(head);
  if (m) return m[1];
  m = /<meta[^>]+content\s*=\s*["'][^"']*charset=([a-zA-Z0-9_-]+)/i.exec(head);
  return m ? m[1] : null;
}

function normalizeCharset(charset: string): string {
  const c = charset.trim().toLowerCase();
  if (c === "utf8" || c === "utf-8") return "utf-8";
  if (c === "ks_c_5601-1987" || c === "ksc5601" || c === "korean") return "euc-kr";
  if (c === "cp949" || c === "ms949" || c === "windows-949") return "euc-kr";
  if (c === "iso-8859-1" || c === "latin1") return "windows-1252";
  return c;
}

/**
 * Decode a fetched HTML byte buffer into a string. Korean press sites still
 * occasionally ship EUC-KR, so we honour the declared charset (header first,
 * then a <meta charset> sniff over the ASCII-safe head) before falling back to
 * UTF-8.
 */
export function decodeHtml(bytes: Uint8Array, contentType?: string | null): string {
  const headerCharset = detectCharsetFromHeader(contentType);
  // Sniff a generous head window: real sites sometimes push <meta charset>
  // past the first few KB behind preload/CSP tags.
  const head = new TextDecoder("latin1").decode(bytes.subarray(0, 16384));
  const htmlCharset = detectCharsetFromHtml(head);

  // Try header, then the HTML-declared charset, then UTF-8, skipping any label
  // the runtime's TextDecoder does not recognise.
  const candidates = [headerCharset, htmlCharset, "utf-8"]
    .filter((c): c is string => Boolean(c))
    .map(normalizeCharset);
  for (const label of candidates) {
    try {
      return new TextDecoder(label).decode(bytes);
    } catch {
      // unknown label, fall through to the next candidate
    }
  }
  return new TextDecoder("utf-8").decode(bytes);
}

/** Generic path words that make for collision-prone slugs (articleView.html, /news/...). */
const GENERIC_SEGMENTS = new Set([
  "view",
  "article",
  "articles",
  "articleview",
  "articledetail",
  "newsview",
  "boardview",
  "detail",
  "news",
  "read",
  "post",
  "posts",
  "story",
  "mnews",
  "amp",
  "index",
  "default",
  "m",
  "p",
]);

/** Query keys Korean/legacy CMSs use to carry the real article id (articleView.html?idxno=...). */
const ID_QUERY_KEYS = [
  "idxno",
  "idx",
  "id",
  "no",
  "seq",
  "aid",
  "artid",
  "articleid",
  "article_id",
  "articleno",
  "nttid",
  "bbsidx",
  "wr_id",
  "documentid",
  "contentid",
  "newsid",
];

function sanitizeSegment(raw: string): string {
  let s = raw;
  try {
    s = decodeURIComponent(raw);
  } catch {
    // keep the raw segment when it is not valid percent-encoding
  }
  return s
    .replace(/\.(html?|php|aspx?|jsp)$/i, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function queryId(url: URL): string | null {
  for (const key of ID_QUERY_KEYS) {
    const value = url.searchParams.get(key);
    if (value) {
      const cleaned = value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
      if (cleaned.length >= 2) return cleaned.slice(0, 40);
    }
  }
  return null;
}

/**
 * Best-effort slug suggestion from a URL. Order: a descriptive non-generic path
 * segment, then a host+query-id pair for CMS pages whose unique id lives in the
 * query string (cbci.co.kr/news/articleView.html?idxno=583344 -> cbci-583344),
 * then a non-generic numeric segment, then the host label. Always editable.
 */
export function suggestSlug(rawUrl: string): string {
  let url: URL;
  try {
    url = new URL(rawUrl);
  } catch {
    return "";
  }

  const segments = url.pathname
    .split("/")
    .filter(Boolean)
    .map(sanitizeSegment)
    .filter((s) => s.length > 0);
  const hostLabel = (url.hostname.replace(/^www\./, "").split(".")[0] ?? "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-");
  const id = queryId(url);
  const trim = (s: string) => s.slice(0, 80).replace(/-+$/, "");

  // 1. A descriptive, non-generic path segment that reads like a real slug.
  for (let i = segments.length - 1; i >= 0; i--) {
    const seg = segments[i];
    if (seg.length >= 3 && !GENERIC_SEGMENTS.has(seg) && /[a-z]/.test(seg)) {
      return trim(seg);
    }
  }

  // 2. A CMS-style id in the query string, prefixed by the host for uniqueness.
  if (id) {
    return trim(hostLabel ? `${hostLabel}-${id}` : id);
  }

  // 3. A non-generic numeric path segment (e.g. a Naver article id).
  for (let i = segments.length - 1; i >= 0; i--) {
    const seg = segments[i];
    if (seg.length >= 3 && !GENERIC_SEGMENTS.has(seg)) {
      return trim(seg);
    }
  }

  // 4. Combined non-generic segments, then the host label.
  const combined = segments.filter((s) => !GENERIC_SEGMENTS.has(s)).join("-");
  if (combined.length >= 3) return trim(combined);

  return hostLabel || "";
}

// ---------------------------------------------------------------------------
// Article body extraction. Best-effort: pull the main article text from the
// fetched HTML so it can pre-fill the editor for review. Korean news CMSs share
// a handful of body container ids/classes; JSON-LD articleBody is preferred when
// present. Always reviewed by an admin before publish.
// ---------------------------------------------------------------------------

const BODY_MIN_LENGTH = 120;
const BODY_MAX_LENGTH = 40000;

// Container ids used by common Korean/legacy news CMSs (gnews, Naver, etc.).
const BODY_ID_SELECTORS = [
  "article-view-content-div",
  "articleBody",
  "article-body",
  "articleBodyContents",
  "newsEndContents",
  "newsct_article",
  "dic_area",
  "articeBody",
  "CmAdContent",
  "content",
];

const BODY_CLASS_SELECTORS = [
  "article-body",
  "article_body",
  "article-view-content",
  "news-article-body",
  "art_text",
  "view_con",
  "news_body",
  "post-content",
  "entry-content",
  "articleView",
];

/** Extract the inner HTML of the first element matching `openRe`, balancing nested same-name tags. */
function balancedExtract(html: string, openRe: RegExp): string | null {
  const m = openRe.exec(html);
  if (!m) return null;
  const tagMatch = /^<\s*([a-zA-Z][\w-]*)/.exec(m[0]);
  if (!tagMatch) return null;
  const tag = tagMatch[1].toLowerCase();
  const start = m.index + m[0].length;
  const tagRe = new RegExp(`<(/?)\\s*${tag}\\b[^>]*>`, "gi");
  tagRe.lastIndex = start;
  let depth = 1;
  let mm: RegExpExecArray | null;
  while ((mm = tagRe.exec(html))) {
    if (mm[1]) {
      depth -= 1;
      if (depth === 0) return html.slice(start, mm.index);
    } else {
      depth += 1;
    }
  }
  return html.slice(start);
}

function normalizeBodyText(text: string): string {
  return text
    .replace(/\r/g, "")
    .split("\n")
    .map((line) => line.replace(/[ \t ]+/g, " ").trim())
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim()
    .slice(0, BODY_MAX_LENGTH);
}

/** Strip an HTML fragment to readable text, turning block boundaries into line breaks. */
function htmlFragmentToText(fragment: string): string {
  const stripped = fragment
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/<noscript\b[^>]*>[\s\S]*?<\/noscript>/gi, "")
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<(p|div|li|h[1-6]|blockquote|figcaption|tr|br)\s*\/?>/gi, "\n")
    .replace(/<\/(p|div|li|h[1-6]|blockquote|figcaption|tr)>/gi, "\n")
    .replace(/<[^>]+>/g, "");
  return normalizeBodyText(decodeEntities(stripped));
}

function findArticleContainer(html: string): string | null {
  for (const id of BODY_ID_SELECTORS) {
    const re = new RegExp(
      `<(?:div|article|section|td)\\b[^>]*\\bid=["']${id}["'][^>]*>`,
      "i",
    );
    const content = balancedExtract(html, re);
    if (content) return content;
  }
  {
    const re = /<(?:div|article|section|td)\b[^>]*\bitemprop=["']articleBody["'][^>]*>/i;
    const content = balancedExtract(html, re);
    if (content) return content;
  }
  for (const cls of BODY_CLASS_SELECTORS) {
    const re = new RegExp(
      `<(?:div|article|section)\\b[^>]*\\bclass=["'][^"']*\\b${cls}\\b[^"']*["'][^>]*>`,
      "i",
    );
    const content = balancedExtract(html, re);
    if (content) return content;
  }
  {
    const content = balancedExtract(html, /<article\b[^>]*>/i);
    if (content) return content;
  }
  return null;
}

/** Trim the copyright/byline/related-article footer Korean news articles append. */
function stripBoilerplate(text: string): string {
  let cut = text.length;
  for (const re of [/저작권자\s*©/, /무단\s*전재/, /ⓒ\s*[A-Za-z가-힣]/]) {
    const m = re.exec(text);
    if (m && m.index < cut) cut = m.index;
  }
  const out = text
    .slice(0, cut)
    .split("\n")
    .filter((line) => {
      const l = line.trim();
      if (!l) return true;
      if (/^[★▶▮◆◇■▷]/.test(l)) return false;
      if (/(다른기사 보기|투표하러 가기|기사제보)/.test(l)) return false;
      return true;
    })
    .join("\n");
  return normalizeBodyText(out);
}

/**
 * Best-effort full article body from a fetched HTML document. Prefers JSON-LD
 * articleBody, then a known content container. Returns null when nothing
 * substantial is found, so callers leave the body empty for manual entry.
 */
export function extractArticleBody(html: string): string | null {
  const doc = html.replace(/<!--[\s\S]*?-->/g, "");

  const jsonLd = extractJsonLd(doc);
  if (jsonLd.articleBody && jsonLd.articleBody.trim().length >= BODY_MIN_LENGTH) {
    const text = stripBoilerplate(normalizeBodyText(decodeEntities(jsonLd.articleBody)));
    if (text.length >= BODY_MIN_LENGTH) return text;
  }

  const fragment = findArticleContainer(doc);
  if (fragment) {
    const text = stripBoilerplate(htmlFragmentToText(fragment));
    if (text.length >= BODY_MIN_LENGTH) return text;
  }
  return null;
}
