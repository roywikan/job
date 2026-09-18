interface Env {
  DB?: any;
  SITE_URL?: string;
}

function escapeXml(unsafe: any): string {
  if (unsafe == null) return '';
  return String(unsafe)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function resolveSiteUrl(env: Env, requestUrl: URL): string {
  let raw = (env.SITE_URL || requestUrl.origin || '').replace(/\/$/, '');
  if (
    !raw ||
    raw.includes('example.com') ||
    raw.includes('domain.com')
  ) {
    raw = (requestUrl.origin || '').replace(/\/$/, '');
  }
  return raw;
}

function toDateOnly(v: any): string {
  if (!v) return new Date().toISOString().split('T')[0];
  return String(v).split('T')[0].split(' ')[0];
}

const INITIAL_SLUGS = [
  { slug: 'panduan-lengkap-pola-asuh-demokratis-anak-masa-kini', updatedAt: '2026-08-08' },
  { slug: '5-aktivitas-sensory-play-seru-untuk-melatih-motorik-balita', updatedAt: '2026-08-09' },
  { slug: 'mengenal-bahaya-stunting-dan-cara-pencegahannya-sejak-1000-hpk', updatedAt: '2026-08-10' },
];

const FALLBACK_CATEGORIES = [
  'pola-asuh',
  'tumbuh-kembang',
  'kesehatan-gizi',
  'balita',
];

export const onRequest: PagesFunction<Env> = async (context) => {
  const { env } = context;
  const requestUrl = new URL(context.request.url);
  const siteUrl = resolveSiteUrl(env, requestUrl);

  let posts: { slug: string; updatedAt: string }[] = INITIAL_SLUGS;
  let products: { slug: string; updatedAt: string }[] = [];
  let categories: { slug: string; updatedAt?: string }[] = FALLBACK_CATEGORIES.map((slug) => ({ slug }));
  let productsNavPath = '/produk';

  if (env.DB) {
    try {
      const { results } = await env.DB.prepare(
        "SELECT slug, updated_at as updatedAt FROM posts WHERE status = 'published' ORDER BY id DESC"
      ).all();
      if (results && results.length > 0) {
        posts = results.map((r: any) => ({
          slug: r.slug,
          updatedAt: toDateOnly(r.updatedAt),
        }));
      }

      const prodRes = await env.DB.prepare(
        "SELECT slug, updated_at as updatedAt FROM products WHERE status = 'available' ORDER BY id DESC"
      ).all();
      if (prodRes?.results && prodRes.results.length > 0) {
        products = prodRes.results.map((r: any) => ({
          slug: r.slug,
          updatedAt: toDateOnly(r.updatedAt),
        }));
      }

      // Kategori dari tabel categories (slug / name)
      try {
        const catRes = await env.DB.prepare(
          "SELECT slug, name, updated_at as updatedAt FROM categories ORDER BY id ASC"
        ).all();
        if (catRes?.results && catRes.results.length > 0) {
          categories = catRes.results
            .map((r: any) => {
              const slug = (r.slug || r.name || '')
                .toString()
                .trim()
                .toLowerCase()
                .replace(/\s+/g, '-')
                .replace(/[^a-z0-9\-]/g, '')
                .replace(/-+/g, '-');
              return slug
                ? { slug, updatedAt: toDateOnly(r.updatedAt) }
                : null;
            })
            .filter(Boolean) as { slug: string; updatedAt?: string }[];
        }
      } catch (catErr) {
        // fallback: distinct category dari posts
        try {
          const dist = await env.DB.prepare(
            "SELECT DISTINCT category FROM posts WHERE status = 'published' AND category IS NOT NULL AND category != ''"
          ).all();
          if (dist?.results?.length) {
            categories = dist.results
              .map((r: any) => {
                const slug = String(r.category || '')
                  .trim()
                  .toLowerCase()
                  .replace(/\s+/g, '-')
                  .replace(/[^a-z0-9\-]/g, '')
                  .replace(/-+/g, '-');
                return slug ? { slug } : null;
              })
              .filter(Boolean) as { slug: string }[];
          }
        } catch (_) {}
      }

      const pathRow = await env.DB.prepare(
        "SELECT value FROM configs WHERE key = 'products_nav_path'"
      ).first<string>('value');
      if (pathRow) {
        productsNavPath = pathRow.startsWith('/') ? pathRow : `/${pathRow}`;
      }
    } catch (e) {
      console.error('Error fetching data for sitemap:', e);
    }
  }

  const postUrls = posts
    .map(
      (p) => `
  <url>
    <loc>${escapeXml(`${siteUrl}/baca/${encodeURIComponent(p.slug)}`)}</loc>
    <lastmod>${escapeXml(p.updatedAt)}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`
    )
    .join('');

  const productUrls = products
    .map(
      (p) => `
  <url>
    <loc>${escapeXml(`${siteUrl}${productsNavPath}/${encodeURIComponent(p.slug)}`)}</loc>
    <lastmod>${escapeXml(p.updatedAt)}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>`
    )
    .join('');

  // Halaman kategori /kategori/{slug}
  const categoryUrls = categories
    .map(
      (c) => `
  <url>
    <loc>${escapeXml(`${siteUrl}/kategori/${encodeURIComponent(c.slug)}`)}</loc>
    ${c.updatedAt ? `<lastmod>${escapeXml(c.updatedAt)}</lastmod>` : ''}
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`
    )
    .join('');

  // Listing pages (hanya index — App.tsx tidak punya detail route per-ID)
  const listingPages = [
    { path: '/iklan-baris', priority: '0.7', changefreq: 'daily' },
    { path: '/surat-pembaca', priority: '0.7', changefreq: 'daily' },
    { path: '/balita', priority: '0.6', changefreq: 'weekly' },
  ];

  const listingUrls = listingPages
    .map(
      (p) => `
  <url>
    <loc>${escapeXml(`${siteUrl}${p.path}`)}</loc>
    <changefreq>${p.changefreq}</changefreq>
    <priority>${p.priority}</priority>
  </url>`
    )
    .join('');

  const staticPages = [
    { url: `${siteUrl}/privacy`, priority: '0.5' },
    { url: `${siteUrl}/about`, priority: '0.6' },
    { url: `${siteUrl}/contact`, priority: '0.6' },
    { url: `${siteUrl}/disclaimer`, priority: '0.5' },
    { url: `${siteUrl}/terms`, priority: '0.5' },
  ];

  const staticUrls = staticPages
    .map(
      (p) => `
  <url>
    <loc>${escapeXml(p.url)}</loc>
    <changefreq>monthly</changefreq>
    <priority>${escapeXml(p.priority)}</priority>
  </url>`
    )
    .join('');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${escapeXml(siteUrl)}/</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>${staticUrls}${listingUrls}${categoryUrls}${postUrls}${productUrls}
</urlset>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
};
