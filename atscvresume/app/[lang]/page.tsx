import { notFound } from "next/navigation"
import { ResumeForm } from "@/components/resume-form"
import { SiteHeader } from "@/components/site-header"
import { getDictionary, isLocale } from "@/lib/i18n"
import { buildJsonLd } from "@/lib/seo"

export default async function Home({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  if (!isLocale(lang)) notFound()
  const dict = getDictionary(lang)

  const jsonLd = JSON.stringify(buildJsonLd(lang, dict)).replace(/</g, "\\u003c")

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd }} />
      <SiteHeader lang={lang} dict={dict.header} />
      <div className="container mx-auto py-8 px-4">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold mb-2 text-balance">{dict.page.title}</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto text-pretty">{dict.page.intro}</p>
        </div>
        <main>
          <ResumeForm key={lang} dict={dict} />
        </main>
      </div>
    </>
  )
}
