import { withBasePath } from "@/lib/base-path"
import { defaultLocale, locales, ogLocales, type Dictionary, type Locale } from "@/lib/i18n"

/**
 * Google requires absolute URLs for hreflang and structured data.
 * Override with NEXT_PUBLIC_SITE_URL (origin only, e.g. "https://job.web.id").
 */
export const siteOrigin = (process.env.NEXT_PUBLIC_SITE_URL?.trim() || "https://job.web.id").replace(/\/+$/, "")

export function absoluteUrl(path: string): string {
  return `${siteOrigin}${withBasePath(path)}`
}

// Static hosts serve /en/index.html at /en/ and redirect /en there, so canonical URLs must carry the slash.
const trailingSlash = process.env.NEXT_PUBLIC_TRAILING_SLASH === "1" ? "/" : ""

export function localeUrl(locale: Locale): string {
  return absoluteUrl(`/${locale}${trailingSlash}`)
}

export const hreflangCodes: Record<Locale, string> = {
  en: "en",
  es: "es",
  id: "id",
}

export function languageAlternates(): Record<string, string> {
  return {
    ...Object.fromEntries(locales.map((locale) => [hreflangCodes[locale], localeUrl(locale)])),
    "x-default": localeUrl(defaultLocale),
  }
}

const featureLists: Record<Locale, string[]> = {
  en: [
    "ATS-friendly single-column resume layout",
    "Live resume preview",
    "Print and save as PDF",
    "Sections for experience, education and skills",
    "ATS optimization tips",
  ],
  es: [
    "Diseño de currículum de una columna compatible con ATS",
    "Vista previa del currículum en tiempo real",
    "Imprimir y guardar como PDF",
    "Secciones de experiencia, educación y habilidades",
    "Consejos de optimización para ATS",
  ],
  id: [
    "Tata letak CV satu kolom yang ramah ATS",
    "Pratinjau CV secara langsung",
    "Cetak dan simpan sebagai PDF",
    "Bagian pengalaman, pendidikan, dan keahlian",
    "Tips optimasi ATS",
  ],
}

const homeLabel: Record<Locale, string> = {
  en: "Home",
  es: "Inicio",
  id: "Beranda",
}

export function buildJsonLd(lang: Locale, dict: Dictionary) {
  const pageUrl = localeUrl(lang)
  const inLanguage = hreflangCodes[lang]
  const organizationId = `${siteOrigin}/#organization`
  const websiteId = `${siteOrigin}/#website`
  const appId = `${absoluteUrl("/")}#webapplication`

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": organizationId,
        name: "JOB/WEB",
        url: `${siteOrigin}/`,
      },
      {
        "@type": "WebSite",
        "@id": websiteId,
        name: "JOB/WEB",
        url: `${siteOrigin}/`,
        publisher: { "@id": organizationId },
        inLanguage: locales.map((locale) => hreflangCodes[locale]),
      },
      {
        "@type": "WebPage",
        "@id": `${pageUrl}#webpage`,
        url: pageUrl,
        name: dict.meta.title,
        description: dict.meta.description,
        inLanguage,
        isPartOf: { "@id": websiteId },
        about: { "@id": appId },
        mainEntity: { "@id": appId },
        breadcrumb: { "@id": `${pageUrl}#breadcrumb` },
        potentialAction: { "@type": "UseAction", target: pageUrl },
        ...(lang !== defaultLocale && { translationOfWork: { "@id": `${localeUrl(defaultLocale)}#webpage` } }),
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${pageUrl}#breadcrumb`,
        itemListElement: [
          { "@type": "ListItem", position: 1, name: homeLabel[lang], item: `${siteOrigin}/` },
          { "@type": "ListItem", position: 2, name: dict.meta.title, item: pageUrl },
        ],
      },
      {
        "@type": "WebApplication",
        "@id": appId,
        name: dict.meta.title,
        description: dict.meta.description,
        url: pageUrl,
        inLanguage: locales.map((locale) => hreflangCodes[locale]),
        applicationCategory: "BusinessApplication",
        applicationSubCategory: "Resume Builder",
        operatingSystem: "Any",
        browserRequirements: "Requires JavaScript and a modern web browser",
        isAccessibleForFree: true,
        featureList: featureLists[lang],
        offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
        publisher: { "@id": organizationId },
      },
    ],
  }
}

export function openGraphLocales(lang: Locale) {
  return {
    locale: ogLocales[lang],
    alternateLocale: locales.filter((locale) => locale !== lang).map((locale) => ogLocales[locale]),
  }
}
