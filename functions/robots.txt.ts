interface Env {
  DB?: any;
  SITE_URL?: string;
}

export const onRequest: PagesFunction<Env> = async (context) => {
  const { env } = context;
  const requestUrl = new URL(context.request.url);
  let rawSiteUrl = env.SITE_URL || '';
  if (!rawSiteUrl || rawSiteUrl.includes('example.com') || rawSiteUrl.includes('domain.com')) {
    rawSiteUrl = requestUrl.origin;
  }

  if (env.DB) {
    try {
      const dbUrlRow = await env.DB.prepare("SELECT value FROM configs WHERE key = 'site_url'").first<string>('value');
      if (dbUrlRow) {
        let cleanDbUrl = dbUrlRow;
        try { cleanDbUrl = JSON.parse(dbUrlRow); } catch {}
        if (cleanDbUrl && typeof cleanDbUrl === 'string' && !cleanDbUrl.includes('example.com') && !cleanDbUrl.includes('domain.com')) {
          rawSiteUrl = cleanDbUrl;
        }
      }
    } catch (e) {
      console.error('Error fetching site_url in robots.txt:', e);
    }
  }

  const siteUrl = rawSiteUrl.replace(/\/$/, '');
  const txt = `User-agent: *
Allow: /
Disallow: /admin
Disallow: /redaksi-login
Disallow: /portal-redaksi
Disallow: /kelola-parenting
Disallow: /dashboard-redaksi

Sitemap: ${siteUrl}/sitemap.xml
`;

  return new Response(txt, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=86400',
    },
  });
};
