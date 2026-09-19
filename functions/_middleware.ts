interface Env {
  [key: string]: any;
}

export const onRequest: PagesFunction<Env> = async (context) => {
  const { request, next } = context;
  const url = new URL(request.url);
  const hostname = url.hostname.toLowerCase();
  const pathname = url.pathname;

  let shouldRedirect = false;
  let targetDomain = hostname;
  let targetPath = pathname;

  // 1. Domain Canonicalization: www.anydomain.com -> anydomain.com
  if (hostname.startsWith('www.')) {
    shouldRedirect = true;
    targetDomain = hostname.substring(4);
  }

  // 2. Legacy Category Path Redirection (dari engine parenting)
  // Menggunakan regex array agar rapi dan mencakup case tanpa trailing slash
  const redirectRules = [
    { prefix: /^\/makanan(\/|$)/ },
    { prefix: /^\/balita(\/|$)/ },
    { prefix: /^\/kesehatan(\/|$)/ },
    { prefix: /^\/parenting(\/|$)/ },
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

  // 3. Deteksi path legacy (konten lama)
  const legacyPrefixes = [
    '/country/', '/sector/', '/tips-karir/', '/id/', '/us/', '/ae/', '/sg/',
    '/ca/', '/ch/', '/au/', '/wp-content/', '/wp-includes/', '/images/',
    '/flagwebp/', '/tools/', '/page/', '/feed/', '/author/', '/edukasi/',
    '/spmb/', '/contactus/', '/cookie-policy/', '/categories-grid/', '/logo-logo-online/'
  ];
  
  const isLegacyPath = legacyPrefixes.some(prefix => pathname.startsWith(prefix));

  // Ambil response asli
  const response = await next();

  // Clone headers supaya bisa dimodifikasi
  const newHeaders = new Headers(response.headers);

  if (isLegacyPath) {
    // CSP longgar khusus path lama (biar jQuery, Font Awesome, dll bisa jalan)
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
