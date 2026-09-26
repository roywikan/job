const rawBasePath = (process.env.NEXT_PUBLIC_BASE_PATH ?? "").trim().replace(/\/+$/, "")
const basePath = rawBasePath && !rawBasePath.startsWith("/") ? `/${rawBasePath}` : rawBasePath

// STATIC_EXPORT=1 produces plain HTML/CSS/JS in out/ for static hosts such as Cloudflare Pages.
// Static hosts cannot run Next.js redirects/headers, so those move to the host's _redirects/_headers.
const isStaticExport = process.env.STATIC_EXPORT === "1"

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
]

/** @type {import('next').NextConfig} */
const nextConfig = {
  basePath,
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  env: {
    NEXT_PUBLIC_TRAILING_SLASH: isStaticExport ? "1" : "",
    NEXT_PUBLIC_STATIC_EXPORT: isStaticExport ? "1" : "",
  },
  ...(isStaticExport
    ? { output: "export", trailingSlash: true }
    : {
        async redirects() {
          return [{ source: "/", destination: "/en", permanent: false }]
        },
        async headers() {
          return [{ source: "/:path*", headers: securityHeaders }]
        },
      }),
}

export default nextConfig
