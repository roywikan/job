interface Env {
  DB?: any;
  ASSETS?: { fetch: (request: Request | string) => Promise<Response> };
  SITE_NAME?: string;
  SITE_URL?: string;
}

function escapeHtml(unsafe: any): string {
  if (unsafe == null) return '';
  return String(unsafe)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function isTemplateName(name?: string): boolean {
  return !name || /modern edge/i.test(name);
}

function resolveSiteName(siteConfig: Record<string, any> | undefined, env: Env, hostname: string): string {
  if (!isTemplateName(siteConfig?.site_name)) return String(siteConfig.site_name);
  if (!isTemplateName(env.SITE_NAME)) return String(env.SITE_NAME);
  return hostname.replace(/^www\./, '') || 'Blog Engine';
}

async function loadHtmlTemplate(context: EventContext<Env, any, any>, siteName: string): Promise<string> {
  try {
    if (context.env.ASSETS) {
      const assetRes = await context.env.ASSETS.fetch(new URL('/index.html', context.request.url));
      if (assetRes.ok) return await assetRes.text();
    }
  } catch (e) {
    console.error('Failed to fetch ASSETS in /iklan-baris:', e);
  }
  return `<!doctype html><html lang="id"><head><meta charset="UTF-8"><title>${escapeHtml(siteName)}</title></head><body><div id="root"></div></body></html>`;
}

export const onRequest: PagesFunction<Env> = async (context) => {
  const { env, request } = context;
  const url = new URL(request.url);

  let siteConfig: Record<string, any> = {};
  let ads: any[] = [];

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
    } catch (e) {
      console.error('Error fetching configs:', e);
    }

    try {
      const adsRes = await env.DB.prepare(`
        SELECT id, nama, kota, kategori, keterangan_barang as keteranganBarang, harga, created_at as createdAt
        FROM iklan_baris
        WHERE status = 'published'
          AND (expires_at IS NULL OR expires_at = '' OR date(expires_at) >= date('now'))
        ORDER BY created_at DESC LIMIT 30
      `).all();
      ads = adsRes.results || [];
    } catch (e) {
      console.error('Error fetching iklan_baris:', e);
    }
  }

  const siteName = resolveSiteName(siteConfig, env, url.hostname);
  const siteUrl = (env.SITE_URL && !/example\.com|domain\.com/.test(env.SITE_URL) ? env.SITE_URL : url.origin).replace(/\/$/, '');
  const pageTitle = `Iklan Baris Gratis | ${siteName}`;
  const pageDesc = `Pasang dan temukan iklan baris kebutuhan anak, keluarga, les privat, babysitter, dan jasa parenting di ${siteName}. Gratis, dimoderasi redaksi.`;
  const canonicalUrl = `${siteUrl}/iklan-baris`;
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
      numberOfItems: ads.length,
      itemListElement: ads.map((ad, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        name: `${ad.kategori}: ${String(ad.keteranganBarang || '').slice(0, 50)}`,
        description: ad.keteranganBarang,
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

  const listHtml = ads.length === 0
    ? `<p class="text-slate-600 text-sm italic py-10 text-center">Belum ada iklan baris yang aktif saat ini.</p>`
    : ads.map((ad) => `
        <article class="mb-4 p-5 rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div class="flex items-center justify-between gap-2 border-b border-slate-100 pb-2 mb-2">
            <span class="inline-block px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-900 uppercase">${escapeHtml(ad.kategori || 'Umum')}</span>
            <span class="text-sm font-black text-rose-600">${escapeHtml(ad.harga || 'Hubungi Kontak')}</span>
          </div>
          <p class="text-sm text-slate-800 my-2 leading-relaxed">${escapeHtml(ad.keteranganBarang || '')}</p>
          <div class="text-xs text-slate-500 flex items-center justify-between pt-2 border-t border-slate-50">
            <span>${escapeHtml(ad.nama)} &bull; ${escapeHtml(ad.kota)}</span>
          </div>
        </article>`).join('');

  const preRenderedBody = `
    <header class="bg-white border-b h-16"><div class="max-w-7xl mx-auto px-4 h-16 flex items-center">
      <a href="/" class="text-lg font-black text-rose-600 no-underline">${escapeHtml(siteName)}</a>
    </div></header>
    <main class="max-w-4xl mx-auto px-4 py-10">
      <h1 class="text-3xl font-black text-slate-900 uppercase">Iklan Baris Gratis</h1>
      <p class="text-slate-600 mt-2">${escapeHtml(pageDesc)}</p>
      <div class="mt-8">
        <h2 class="text-xl font-bold mb-4">Daftar Iklan Baris (${ads.length})</h2>
        ${listHtml}
      </div>
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
