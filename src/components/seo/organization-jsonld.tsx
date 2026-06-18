/**
 * JSON-LD for the public site: an Organization node (knowledge-panel data) plus
 * a WebSite node, linked through @graph so search engines tie them together.
 */
export function OrganizationJsonLd({ locale }: { locale: string }) {
  const isKo = locale === "ko";
  const data = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": "https://woorismartbio.com/#organization",
        name: isKo ? "우리스마트바이오" : "Woori Smart Bio",
        legalName: isKo
          ? "주식회사 우리스마트바이오"
          : "Woori Smart Bio Co., Ltd.",
        alternateName: "WSB",
        url: "https://woorismartbio.com",
        logo: "https://woorismartbio.com/wsb-logo.png",
        slogan: "Engineered by Data, Grown by Design.",
        foundingDate: "2018-06-01",
        description: isKo
          ? "데이터 기반 정밀제어 스마트팜과 MAT 바이오 기술을 결합하여 모든 배치에서 동일한 품질의 기능성 식물원료를 생산하는 그린바이오 기업."
          : "A green bio company producing standardized functional botanical materials across every batch by combining a data-driven precision smart farm with proprietary MAT bio technology.",
        address: {
          "@type": "PostalAddress",
          streetAddress: isKo ? "차옥로 149" : "149 Chaok-ro, Yeoncheon-eup",
          addressLocality: isKo ? "연천군" : "Yeoncheon-gun",
          addressRegion: isKo ? "경기도" : "Gyeonggi-do",
          addressCountry: "KR",
        },
        contactPoint: {
          "@type": "ContactPoint",
          telephone: "+82-31-834-4515",
          email: "dasom@woorismartbio.com",
          contactType: "Partnership",
          areaServed: ["KR", "CN", "JP", "TW", "HK", "US"],
          availableLanguage: ["Korean", "English"],
        },
        sameAs: [],
      },
      {
        "@type": "WebSite",
        "@id": "https://woorismartbio.com/#website",
        name: isKo ? "우리스마트바이오" : "Woori Smart Bio",
        url: "https://woorismartbio.com",
        inLanguage: isKo ? "ko-KR" : "en-US",
        publisher: { "@id": "https://woorismartbio.com/#organization" },
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      // Safe: we serialize a static object, no untrusted input.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
