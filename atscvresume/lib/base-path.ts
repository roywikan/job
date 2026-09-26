function normalizeBasePath(value: string | undefined): string {
  const trimmed = (value ?? "").trim().replace(/\/+$/, "")
  if (!trimmed) return ""
  return trimmed.startsWith("/") ? trimmed : `/${trimmed}`
}

/**
 * Configured via NEXT_PUBLIC_BASE_PATH (e.g. "/atscvresume"). Empty means the app is served from the domain root.
 * next/link, router navigation and next.config redirects apply it automatically; use withBasePath only for
 * raw URLs such as metadata icons, canonical links and plain <a>/<img> tags.
 */
export const basePath = normalizeBasePath(process.env.NEXT_PUBLIC_BASE_PATH)

export function withBasePath(path: string): string {
  if (/^[a-z][a-z\d+.-]*:/i.test(path) || path.startsWith("//")) return path
  return `${basePath}${path.startsWith("/") ? path : `/${path}`}`
}
