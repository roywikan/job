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
    console.error('Failed to fetch ASSETS in /surat-pembaca:', e);
  }
  return `<!doctype html><html lang="id"><head><meta charset="UTF-8"><title>${escapeHtml(siteName)}</title></head><body><div id="root"></div></body></html>`;
}

export const onRequest: PagesFunction<Env> = async (context) => {
  const { env, request } = context;
  const url = new URL(request.url);

  let siteConfig: Record<string, any> = {};
  let letters: any[] = [];

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
      const lettersRes = await env.DB.prepare(`
        SELECT id, nama, kota, pekerjaan, judul, COALESCE(isi, '') as isi, created_at as createdAt
        FROM surat_pembaca
        WHERE status = 'published'
        ORDER BY created_at DESC LIMIT 20
      `).all();
      letters = lettersRes.results || [];
    } catch (e) {
      console.error('Error fetching surat_pembaca:', e);
    }
  }

  const siteName = resolveSiteName(siteConfig, env, url.hostname);
  const siteUrl = (env.SITE_URL && !/example\.com|domain\.com/.test(env.SITE_URL) ? env.SITE_URL : url.origin).replace(/\/$/, '');
  const pageTitle = siteConfig?.surat_pembaca_title
    ? `${siteConfig.surat_pembaca_title} | ${siteName}`
    : `Kanal Surat Pembaca | ${siteName}`;
  const pageDesc = siteConfig?.surat_pembaca_subtitle
    || `Wadah aspirasi, kritik membangun, saran, dan pengalaman orang tua di ${siteName}. Setiap surat ditinjau redaksi sebelum tayang.`;
  const canonicalUrl = `${siteUrl}/surat-pembaca`;
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
      numberOfItems: letters.length,
      itemListElement: letters.map((s, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        item: {
          '@type': 'DiscussionForumPosting',
          headline: s.judul,
          text: s.isi,
          author: {
            '@type': 'Person',
            name: s.nama,
          },
          datePublished: s.createdAt,
        },
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

  const listHtml = letters.length === 0
    ? `<p class="text-slate-600 text-sm italic py-10 text-center">Belum ada surat pembaca yang dipublikasikan.</p>`
    : letters.map((s) => `
        <article class="mb-5 p-6 rounded-2xl border border-slate-200 bg-white shadow-sm">
          <h2 class="text-xl font-bold text-slate-900 m-0">${escapeHtml(s.judul)}</h2>
          <p class="text-xs text-slate-500 mt-1 mb-3">${escapeHtml(s.nama)} &bull; ${escapeHtml(s.kota)} ${s.pekerjaan ? `(${escapeHtml(s.pekerjaan)})` : ''}</p>
          <p class="text-sm text-slate-700 leading-relaxed m-0 whitespace-pre-line">${escapeHtml(String(s.isi || '').slice(0, 500))}${String(s.isi || '').length > 500 ? '...' : ''}</p>
        </article>`).join('');

  const preRenderedBody = `
    <header class="bg-white border-b h-16"><div class="max-w-7xl mx-auto px-4 h-16 flex items-center">
      <a href="/" class="text-lg font-black text-rose-600 no-underline">${escapeHtml(siteName)}</a>
    </div></header>
    <main class="max-w-3xl mx-auto px-4 py-10">
      <h1 class="text-3xl font-black text-slate-900">${escapeHtml(siteConfig?.surat_pembaca_title || 'Kanal Surat Pembaca')}</h1>
      <p class="text-slate-600 mt-3">${escapeHtml(pageDesc)}</p>
      <div class="mt-8">
        <h2 class="text-xl font-bold mb-4">Surat Pembaca Terbaru (${letters.length})</h2>
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
