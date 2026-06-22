import { test, expect } from "@playwright/test";
import {
  parseHtmlMetadata,
  decodeEntities,
  decodeHtml,
  detectCharsetFromHeader,
  detectCharsetFromHtml,
  suggestSlug,
  extractArticleBody,
} from "../../src/lib/url-metadata";

const BASE = "https://news.example.com/articles/green-bio-2025";

test("parses Open Graph title / description / image / published time", () => {
  const html = `
    <html><head>
      <meta property="og:title" content="우리스마트바이오, 그린바이오 인증 획득" />
      <meta property="og:description" content="MAT 기술로 식물 유효성분을 정밀 생산" />
      <meta property="og:image" content="https://cdn.example.com/thumb.jpg" />
      <meta property="og:site_name" content="Example News" />
      <meta property="article:published_time" content="2025-03-12T09:00:00+09:00" />
    </head><body></body></html>`;
  const meta = parseHtmlMetadata(html, BASE);
  expect(meta.title).toBe("우리스마트바이오, 그린바이오 인증 획득");
  expect(meta.description).toBe("MAT 기술로 식물 유효성분을 정밀 생산");
  expect(meta.image).toBe("https://cdn.example.com/thumb.jpg");
  expect(meta.siteName).toBe("Example News");
  expect(meta.publishedTime).toBe("2025-03-12T09:00:00+09:00");
});

test("handles reversed attribute order and single quotes", () => {
  const html = `<meta content='Reversed Title' property='og:title'>`;
  expect(parseHtmlMetadata(html, BASE).title).toBe("Reversed Title");
});

test("falls back to twitter card, then <title>, then meta description", () => {
  const twitter = `<meta name="twitter:title" content="Twitter Title">`;
  expect(parseHtmlMetadata(twitter, BASE).title).toBe("Twitter Title");

  const titleTag = `<head><title>  Plain   Title </title></head>`;
  expect(parseHtmlMetadata(titleTag, BASE).title).toBe("Plain Title");

  const desc = `<meta name="description" content="Meta description here">`;
  expect(parseHtmlMetadata(desc, BASE).description).toBe("Meta description here");
});

test("reads JSON-LD when no OG tags are present", () => {
  const html = `
    <script type="application/ld+json">
    {"@context":"https://schema.org","@type":"NewsArticle",
     "headline":"JSON-LD Headline","description":"From structured data",
     "datePublished":"2025-01-02","image":["https://cdn.example.com/a.jpg"],
     "publisher":{"@type":"Organization","name":"LD Press"}}
    </script>`;
  const meta = parseHtmlMetadata(html, BASE);
  expect(meta.title).toBe("JSON-LD Headline");
  expect(meta.description).toBe("From structured data");
  expect(meta.publishedTime).toBe("2025-01-02");
  expect(meta.image).toBe("https://cdn.example.com/a.jpg");
  expect(meta.siteName).toBe("LD Press");
});

test("resolves relative image URLs against the page URL", () => {
  const html = `<meta property="og:image" content="/media/cover.png">`;
  expect(parseHtmlMetadata(html, BASE).image).toBe(
    "https://news.example.com/media/cover.png",
  );
});

test("decodes HTML entities in titles", () => {
  expect(decodeEntities("R&amp;D &#38; Bio &#x2014; news")).toBe("R&D & Bio — news");
  const html = `<meta property="og:title" content="A &amp; B &lt;tag&gt; &#39;q&#39;">`;
  expect(parseHtmlMetadata(html, BASE).title).toBe("A & B <tag> 'q'");
});

test("keeps og:title even when its content contains a literal '>'", () => {
  const html = `<meta property="og:title" content="우리스마트바이오 <포브스 코리아> 선정">`;
  expect(parseHtmlMetadata(html, BASE).title).toBe("우리스마트바이오 <포브스 코리아> 선정");
});

test("ignores commented-out meta tags (real value wins)", () => {
  const html = `
    <!-- <meta property="og:title" content="기본 제목"> -->
    <meta property="og:title" content="실제 기사 제목">`;
  expect(parseHtmlMetadata(html, BASE).title).toBe("실제 기사 제목");
});

test("parses JSON-LD wrapped in a CDATA guard", () => {
  const html = `
    <script type="application/ld+json">//<![CDATA[
    {"@type":"NewsArticle","headline":"CDATA Headline"}
    //]]></script>`;
  expect(parseHtmlMetadata(html, BASE).title).toBe("CDATA Headline");
});

test("drops non-http(s) og:image schemes", () => {
  const js = `<meta property="og:image" content="javascript:alert(1)">`;
  expect(parseHtmlMetadata(js, BASE).image).toBeNull();
  const data = `<meta property="og:image" content="data:image/png;base64,AAAA">`;
  expect(parseHtmlMetadata(data, BASE).image).toBeNull();
});

test("extracts article body from a CMS content container and strips the footer", () => {
  const html = `
    <html><body>
      <nav>메뉴 잡음</nav>
      <div id="article-view-content-div">
        <p>우리스마트바이오가 농림축산식품부와 기능성 식물원료 공급 계약을 체결했다고 19일 밝혔다. 이번 계약은 정밀제어 스마트팜 기반 소재의 안정적 공급을 위한 것이다.</p>
        <p>회사는 동일 품질의 식물원료를 반복 생산하는 플랫폼을 기반으로 사업을 확대하고 있다. 인삼을 시작으로 대청, 참당귀 등으로 파이프라인을 넓혀가고 있다.</p>
        <p>회사 관계자는 추가 파이프라인의 상용화도 순차적으로 준비 중이라고 설명했다.</p>
        <p>저작권자 © 테스트뉴스 무단전재 및 재배포 금지</p>
        <p>홍길동 기자</p>
      </div>
    </body></html>`;
  const body = extractArticleBody(html);
  expect(body).not.toBeNull();
  expect(body).toContain("신규 계약을 체결");
  expect(body).toContain("추가 파이프라인");
  // footer is trimmed
  expect(body).not.toContain("저작권자");
  expect(body).not.toContain("홍길동 기자");
  // paragraphs are separated by blank lines
  expect(body!.split(/\n{2,}/).length).toBeGreaterThanOrEqual(3);
});

test("prefers JSON-LD articleBody when present", () => {
  const long = "정밀제어 스마트팜으로 동일 품질의 기능성 식물원료를 생산합니다. ".repeat(4);
  const html = `<script type="application/ld+json">${JSON.stringify({
    "@type": "NewsArticle",
    headline: "x",
    articleBody: long,
  })}</script>`;
  const body = extractArticleBody(html);
  expect(body).not.toBeNull();
  expect(body).toContain("기능성 식물원료");
});

test("returns null when no article body is found", () => {
  expect(extractArticleBody("<html><body><p>짧은 글</p></body></html>")).toBeNull();
});

test("detects charset from header and from html meta", () => {
  expect(detectCharsetFromHeader("text/html; charset=EUC-KR")).toBe("EUC-KR");
  expect(detectCharsetFromHeader("text/html")).toBeNull();
  expect(
    detectCharsetFromHtml('<meta charset="utf-8">'),
  ).toBe("utf-8");
  expect(
    detectCharsetFromHtml(
      '<meta http-equiv="Content-Type" content="text/html; charset=euc-kr">',
    ),
  ).toBe("euc-kr");
});

test("decodeHtml honours a declared EUC-KR charset", () => {
  // "<meta ... charset=euc-kr><title>" + EUC-KR bytes for "안녕" + "</title>"
  const prefix =
    '<meta http-equiv="Content-Type" content="text/html; charset=euc-kr"><title>';
  const suffix = "</title>";
  const ascii = (s: string) => Array.from(s, (c) => c.charCodeAt(0));
  const eucKrAnnyeong = [0xbe, 0xc8, 0xb3, 0xe7]; // 안 녕
  const bytes = new Uint8Array([
    ...ascii(prefix),
    ...eucKrAnnyeong,
    ...ascii(suffix),
  ]);
  const decoded = decodeHtml(bytes);
  expect(decoded).toContain("안녕");
  expect(parseHtmlMetadata(decoded, BASE).title).toBe("안녕");
});

test("decodeHtml defaults to UTF-8", () => {
  const bytes = new TextEncoder().encode("<title>한글 제목</title>");
  expect(parseHtmlMetadata(decodeHtml(bytes, "text/html"), BASE).title).toBe(
    "한글 제목",
  );
});

test("suggestSlug derives a slug from the URL path", () => {
  expect(suggestSlug("https://news.example.com/articles/green-bio-2025")).toBe(
    "green-bio-2025",
  );
  expect(suggestSlug("https://news.example.com/posts/Hello_World.html")).toBe(
    "hello-world",
  );
  // Korean / non-ASCII path falls back to the host label
  expect(
    suggestSlug("https://blog.naver.com/%ED%95%9C%EA%B8%80"),
  ).toBe("blog");
  expect(suggestSlug("not a url")).toBe("");
});

test("suggestSlug keeps unique IDs and skips generic path words", () => {
  // Naver article: skip the generic "article" word, keep the numeric id
  expect(suggestSlug("https://n.news.naver.com/article/001/0014000000")).toBe(
    "0014000000",
  );
  // Yonhap: the alphanumeric article id is unique and kept
  expect(suggestSlug("https://www.yna.co.kr/view/AKR20250312001000001")).toBe(
    "akr20250312001000001",
  );
});

test("suggestSlug uses the query-string id for CMS articleView pages", () => {
  // The real id lives in ?idxno=, not the generic articleView path word
  expect(
    suggestSlug("https://www.cbci.co.kr/news/articleView.html?idxno=583344"),
  ).toBe("cbci-583344");
});

test("extracts the article section for category auto-fill", () => {
  const metaTag = `<meta property="article:section" content="산업">`;
  expect(parseHtmlMetadata(metaTag, BASE).section).toBe("산업");
  const ld = `<script type="application/ld+json">{"@type":"NewsArticle","headline":"x","articleSection":"경제"}</script>`;
  expect(parseHtmlMetadata(ld, BASE).section).toBe("경제");
});
