import { TELEGRAM_URL, WHATSAPP_URL, PHONE_TEL } from "./contacts";
import { reviews } from "./reviews";

const AVERAGE_RATING =
  reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;

export function getOrganizationSchema(siteUrl: string) {
  return {
    "@context": "https://schema.org",
    "@type": "AutoPartsStore",
    name: "Юггидросоюз",
    url: siteUrl,
    telephone: PHONE_TEL,
    address: {
      "@type": "PostalAddress",
      streetAddress: "пр-кт Ленина, зд. 43, офис 18",
      addressLocality: "Аксай",
      addressRegion: "Ростовская область",
      postalCode: "346720",
      addressCountry: "RU",
    },
    sameAs: [TELEGRAM_URL, WHATSAPP_URL],
    ...(reviews.length > 0 && {
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: Number(AVERAGE_RATING.toFixed(1)),
        reviewCount: reviews.length,
      },
    }),
  };
}
