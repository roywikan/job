import type { Metadata, Viewport } from "next"
import { notFound } from "next/navigation"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { getDictionary, isLocale, locales } from "@/lib/i18n"
import { withBasePath } from "@/lib/base-path"
import { languageAlternates, localeUrl, openGraphLocales, siteOrigin } from "@/lib/seo"
import "../globals.css"

const geist = Geist({ subsets: ["latin"], variable: "--font-geist-sans" })
const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono" })

export const dynamicParams = false

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }))
}

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params
  if (!isLocale(lang)) return {}
  const dict = getDictionary(lang)

  return {
    title: dict.meta.title,
    description: dict.meta.description,
    generator: "v0.app",
    metadataBase: new URL(siteOrigin),
    alternates: {
      canonical: localeUrl(lang),
      languages: languageAlternates(),
    },
    openGraph: {
      title: dict.meta.title,
      description: dict.meta.description,
      url: localeUrl(lang),
      siteName: "JOB/WEB",
      type: "website",
      ...openGraphLocales(lang),
    },
    robots: { index: true, follow: true },
    icons: {
      icon: [
        { url: withBasePath("/icon-light-32x32.png"), media: "(prefers-color-scheme: light)" },
        { url: withBasePath("/icon-dark-32x32.png"), media: "(prefers-color-scheme: dark)" },
        { url: withBasePath("/icon.svg"), type: "image/svg+xml" },
      ],
      apple: withBasePath("/apple-icon.png"),
    },
  }
}

export const viewport: Viewport = {
  themeColor: "#4f46e5",
}

export default async function LocaleLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode
  params: Promise<{ lang: string }>
}>) {
  const { lang } = await params
  if (!isLocale(lang)) notFound()

  return (
    <html lang={lang} className={`${geist.variable} ${geistMono.variable}`}>
      <body className="font-sans antialiased">
        {children}
        {process.env.NODE_ENV === "production" && process.env.NEXT_PUBLIC_STATIC_EXPORT !== "1" && <Analytics />}
      </body>
    </html>
  )
}
