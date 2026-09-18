interface Env {
  DB?: any;
  ASSETS?: { fetch: (request: Request | string) => Promise<Response> };
  SITE_NAME?: string;
  SITE_URL?: string;
}

const CATEGORY_META: Array<{ slug: string; name: string; description: string; aliases?: string[] }> = [
  { slug: 'pola-asuh', name: 'Pola Asuh', description: 'Panduan strategi pola asuh anak, psikologi, dan pembentukan karakter.', aliases: ['polaasuh', 'parenting', 'pendidikan-anak', 'keluarga'] },
  { slug: 'tumbuh-kembang', name: 'Tumbuh Kembang', description: 'Stimulasi motorik, permainan sensori (sensory play), dan milestone anak.', aliases: ['tumbuhkembang'] },
  { slug: 'kesehatan-gizi', name: 'Kesehatan & Gizi', description: 'Nutrisi balita, panduan MPASI, pencegahan stunting, dan kesehatan keluarga.', aliases: ['kesehatan-dan-gizi', 'gizi'] },
  { slug: 'balita', name: 'Balita', description: 'Edukasi dan panduan lengkap pengasuhan anak usia balita (1-5 tahun).' },
];

function escapeHtml(unsafe: any): string {
  if (unsafe == null) return '';
  return String(unsafe)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function slugify(value: any): string {
  return String(value || '').toLowerCase().trim()
    .replace(/&/g, ' ').replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-').replace(/^-|-$/g, '');
}

function titleFromSlug(slug: string): string {
  return slug.split('-').filter(Boolean).map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

function isTemplateName(name?: string): boolean {
  return !name || /modern edge/i.test(name);
}

function resolveSiteName(siteConfig: Record<string, any> | undefined, env: Env, hostname: string): string {
  if (!isTemplateName(siteConfig?.site_name)) return String(siteConfig.site_name);
  if (!isTemplateName(env.SITE_NAME)) return String(env.SITE_NAME);
  return hostname.replace(/^www\./, '') || 'Blog Engine';
}

function postMatchesSlug(postCategory: string, slug: string): boolean {
  const postSlug = slugify(postCategory);
  if (!postSlug) return false;
  if (postSlug === slug) return true;
  const meta = CATEGORY_META.find((c) => c.slug === slug);
  if (meta) {
    if (slugify(meta.name) === postSlug) return true;
    if (meta.aliases?.includes(postSlug)) return true;
  }
  return false;
}

async function loadHtmlTemplate(context: EventContext<Env, any, any>, siteName: string): Promise<string> {
  try {
    if (context.env.ASSETS) {
      const assetRes = await context.env.ASSETS.fetch(new URL('/index.html', context.request.url));
      if (assetRes.ok) return await assetRes.text();
    }
  } catch (e) {
    console.error('Failed to fetch ASSETS in /kategori/[slug]:', e);
  }
  return `<!doctype html><html lang="id"><head><meta charset="UTF-8"><title>${escapeHtml(siteName)}</title></head><body><div id="root"></div></body></html>`;
}

export const onRequest: PagesFunction<Env> = async (context) => {
  const { env, request, params } = context;
  const url = new URL(request.url);
  const slug = slugify(decodeURIComponent(String(params.slug || '')).replace(/\/$/, ''));
  if (!slug) return Response.redirect(new URL('/kategori', request.url).toString(), 302);

  let siteConfig: Record<string, any> = {};
  let posts: any[] = [];
  let categoryNameFromDb = '';

  if (env.DB) {
    try {
      const configRes = await env.DB.prepare('SELECT key, value FROM configs').all();
      if (configRes.results?.length) {
        const SENSITIVE = ['admin_email', 'admin_password', 'admin_name', 'password', 'secret', 'token'];
        for (const row of configRes.results) {
          const kLower = String(row.key).toLowerCase();
          if (SENSITIVE.includes(row.key) || kLower.includes('password') || kLower.includes('secret') || kLower.includes('token')) continue;
          try { siteConfig[row.key] = JSON.parse(row.value); } catch { siteConfig[row.key] = row.value; }
        }
      }
    } catch (e) { console.error(e); }

    try {
      const catRes = await env.DB.prepare('SELECT slug, name FROM categories WHERE LOWER(slug) = ? OR LOWER(name) = ? LIMIT 1')
        .bind(slug, slug.replace(/-/g, ' ')).first();
      if (catRes?.name) categoryNameFromDb = String(catRes.name);
    } catch (_) {}

    try {
      const postsRes = await env.DB.prepare(`
        SELECT p.title, p.slug, p.excerpt, p.category, p.featured_image as featuredImage, p.created_at as createdAt
        FROM posts p WHERE p.status = 'published' ORDER BY p.id DESC LIMIT 80
      `).all();
      posts = postsRes.results || [];
    } catch (e) { console.error(e); }
  }

  const siteName = resolveSiteName(siteConfig, env, url.hostname);
  const siteUrl = (env.SITE_URL && !/example\.com|domain\.com/.test(env.SITE_URL) ? env.SITE_URL : url.origin).replace(/\/$/, '');
  const known = CATEGORY_META.find((c) => c.slug === slug);
  const matchedPosts = posts.filter((p) => postMatchesSlug(p.category, slug));
  const displayName = known?.name || categoryNameFromDb || (matchedPosts[0]?.category ? String(matchedPosts[0].category) : titleFromSlug(slug));
  const pageDesc = known?.description || `Kumpulan artikel, tips pengasuhan anak, dan panduan edukasi bertema ${displayName} di ${siteName}.`;
  const pageTitle = `Artikel Kategori ${displayName} | ${siteName}`;
  const canonicalUrl = `${siteUrl}/kategori/${encodeURIComponent(slug)}`;
  const ogImage = siteConfig?.seo_default_og_image || siteConfig?.site_logo || 'https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?auto=format&fit=crop&w=1200&h=630&q=80&fm=webp';

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: pageTitle,
    description: pageDesc,
    url: canonicalUrl,
    publisher: { '@type': 'Organization', name: siteName, url: siteUrl },
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: matchedPosts.length,
      itemListElement: matchedPosts.map((p, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        url: `${siteUrl}/baca/${p.slug}`,
        name: p.title,
      })),
    },
  };

  const seoHeadTags = `
    <title>${escapeHtml(pageTitle)}</title>
    <meta name="description" content="${escapeHtml(pageDesc)}" />
    <link rel="canonical" href="${escapeHtml(canonicalUrl)}" />
    <meta property="og:title" content="${escapeHtml(pageTitle)}" />
    <meta property="og:description" content="${escapeHtml(pageDesc)}" />
    <meta property="og:url" content="${escapeHtml(canonicalUrl)}" />
    <meta property="og:type" content="website" />
    <meta property="og:image" content="${escapeHtml(ogImage)}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${escapeHtml(pageTitle)}" />
    <meta name="twitter:description" content="${escapeHtml(pageDesc)}" />
    <meta name="twitter:image" content="${escapeHtml(ogImage)}" />
    <script type="application/ld+json">${JSON.stringify(schema)}</script>
  `;

  const listHtml = matchedPosts.length === 0
    ? `<p class="text-slate-600 text-sm italic py-10 text-center">Belum ada tulisan dalam kategori ini.</p>`
    : matchedPosts.map((p) => `
        <article class="mb-5 p-5 rounded-2xl border border-slate-200 bg-white">
          <h2 class="text-lg font-black m-0"><a href="/baca/${escapeHtml(p.slug)}" class="text-slate-900 no-underline">${escapeHtml(p.title)}</a></h2>
          <p class="text-sm text-slate-600 mt-2 mb-0">${escapeHtml(p.excerpt || '')}</p>
        </article>`).join('');

  const preRenderedBody = `
    <header class="bg-white border-b h-16"><div class="max-w-7xl mx-auto px-4 h-16 flex items-center">
      <a href="/" class="text-lg font-black text-rose-600 no-underline">${escapeHtml(siteName)}</a>
    </div></header>
    <main class="max-w-3xl mx-auto px-4 py-10">
      <h1 class="text-3xl font-black text-slate-900">${escapeHtml(displayName)}</h1>
      <p class="text-slate-600 mt-3">${escapeHtml(pageDesc)}</p>
      <h2 class="text-xl font-black mt-8 mb-4">Menampilkan ${matchedPosts.length} Artikel</h2>
      ${listHtml}
    </main>
  `;

  let html = await loadHtmlTemplate(context, siteName);
  html = html.replace(/<meta[^>]*name="description"[^>]*>/gi, '').replace(/<meta[^>]*property="og:[^>]*>/gi, '');
  html = html.includes('<title>') ? html.replace(/<title>.*?<\/title>/i, seoHeadTags) : html.replace('</head>', `${seoHeadTags}</head>`);
  html = html.replace(/<div\s+id="root"[^>]*>[\s\S]*?<\/div>/i, `<div id="root">${preRenderedBody}</div>`);

  return new Response(html, {
    status: 200,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'public, max-age=300, s-maxage=3600',
      Link: `<${canonicalUrl}>; rel="canonical"`,
    },
  });
};
