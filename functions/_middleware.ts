import { ensureD1Bootstrap } from './_d1_bootstrap';

interface Env {
  DB?: any;
  [key: string]: any;
}

export const onRequest: PagesFunction<Env> = async (context) => {
  const { request, next, env } = context;

  // 0. D1 auto-bootstrap (dari parenting)
  if (env?.DB) {
    try {
      await ensureD1Bootstrap(env.DB);
    } catch (dbErr) {
      console.error('D1 Auto-Bootstrap error in middleware:', dbErr);
    }
  }

  const url = new URL(request.url);
  const hostname = url.hostname.toLowerCase();
  const pathname = url.pathname;

  let shouldRedirect = false;
  let targetDomain = hostname;
  let targetPath = pathname;

  // 1. www → non-www
  if (hostname.startsWith('www.')) {
    shouldRedirect = true;
    targetDomain = hostname.substring(4);
  }

  // 2. Redirect kategori parenting (+ atscvresume → /baca/ jika memang itu niatnya)
  // CATATAN: jika /atscvresume/ harus TETAP sebagai halaman legacy (bukan redirect ke /baca/),
  // hapus baris atscvresume dari redirectRules di bawah.
  const redirectRules = [
    { prefix: /^\/makanan(\/|$)/ },
    { prefix: /^\/balita(\/|$)/ },
    { prefix: /^\/kesehatan(\/|$)/ },
    { prefix: /^\/parenting(\/|$)/ },
    // { prefix: /^\/atscvresume(\/|$)/ },  // aktifkan HANYA jika ingin redirect ke /baca/
  ];

  for (const rule of redirectRules) {
    if (rule.prefix.test(pathname)) {
      shouldRedirect = true;
      targetPath = pathname.replace(rule.prefix, '/baca/');
      break;
    }
  }

  if (shouldRedirect) {
    const redirectUrl = `https://${targetDomain}${targetPath}${url.search}`;
    return Response.redirect(redirectUrl, 301);
  }

  // 3. Path legacy → CSP longgar
  const legacyPrefixes = [
    '/country/',
    '/sector/',
    '/tips-karir/',
    '/id/',
    '/us/',
    '/ae/',
    '/sg/',
    '/ca/',
    '/ch/',
    '/au/',
    '/2016/',
    '/2023/',
    '/2024/',
    '/contactus/',
    '/cookie-policy/',
    '/categories-grid/',
    '/logo-logo-online/',
    '/edukasi/',
    '/spmb/',
    '/page/',
    '/feed/',
    '/author/',
    '/tools/',
    '/about/',
    '/privacy-policy/',
    '/disclaimer/',
    '/atscvresume/',
    '/wp-content/',
    '/wp-includes/',
    '/images/',
    '/flagwebp/',
    '/saung-plataran-resto-karawang/',
  ];

  const isLegacyPath = legacyPrefixes.some((prefix) => pathname.startsWith(prefix));

  const response = await next();
  const newHeaders = new Headers(response.headers);

  if (isLegacyPath) {
    newHeaders.set(
      'Content-Security-Policy',
      [
        "default-src 'self' https: data: blob:",
        "script-src 'self' 'unsafe-inline' 'unsafe-eval' https: data: blob:",
        "style-src 'self' 'unsafe-inline' https: data:",
        "font-src 'self' data: https: https://maxcdn.bootstrapcdn.com https://fonts.gstatic.com",
        "img-src 'self' data: https: blob:",
        "connect-src 'self' https:",
        "frame-src 'self' https:",
        "object-src 'none'",
        "base-uri 'self'",
      ].join('; ')
    );
  }

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: newHeaders,
  });
};
