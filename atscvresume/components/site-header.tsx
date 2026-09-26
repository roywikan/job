import Link from "next/link"
import { FileText } from "lucide-react"
import { type Dictionary, type Locale, localeNames, localeShort, locales } from "@/lib/i18n"
import { cn } from "@/lib/utils"

interface SiteHeaderProps {
  lang: Locale
  dict: Dictionary["header"]
}

export function SiteHeader({ lang, dict }: SiteHeaderProps) {
  return (
    <header className="border-b bg-background">
      <div className="container mx-auto flex h-14 items-center justify-between gap-4 px-4">
        <div className="flex items-center gap-2 sm:gap-3">
          <a
            href="https://job.web.id"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center hover:opacity-90 transition-opacity"
            title={dict.portalTitle}
          >
            <span className="sr-only">{dict.portalTitle}</span>
            <div
              aria-hidden="true"
              className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex flex-col items-center justify-center shadow-md font-black leading-none shrink-0"
            >
              <span className="text-[11px] font-black tracking-tight leading-none text-white">JOB</span>
              <span className="text-[7.5px] font-extrabold tracking-wider text-amber-300 leading-none mt-0.5">
                WEB
              </span>
            </div>
          </a>
          <span aria-hidden="true" className="text-slate-300 font-light text-lg">
            /
          </span>
          <Link
            href={`/${lang}`}
            className="flex items-center gap-1.5 font-semibold text-xs sm:text-sm text-slate-800 hover:text-indigo-600 transition-colors"
          >
            <FileText className="w-4 h-4 text-indigo-500" aria-hidden="true" />
            <span>{dict.appName}</span>
          </Link>
        </div>

        <nav aria-label={dict.language}>
          <ul className="flex items-center gap-1 rounded-lg border p-1">
            {locales.map((locale) => {
              const active = locale === lang
              return (
                <li key={locale}>
                  <Link
                    href={`/${locale}`}
                    hrefLang={locale}
                    lang={locale}
                    aria-current={active ? "page" : undefined}
                    title={localeNames[locale]}
                    className={cn(
                      "block rounded-md px-2.5 py-1 text-xs font-semibold transition-colors",
                      active ? "bg-indigo-600 text-white" : "text-slate-600 hover:bg-muted hover:text-slate-900",
                    )}
                  >
                    <span aria-hidden="true">{localeShort[locale]}</span>
                    <span className="sr-only">{localeNames[locale]}</span>
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>
      </div>
    </header>
  )
}
