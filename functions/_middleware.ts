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
  if (pathname.startsWith('/makanan/')) {
    shouldRedirect = true;
    targetPath = pathname.replace(/^\/makanan\//, '/baca/');
  } else if (pathname.startsWith('/balita/')) {
    shouldRedirect = true;
    targetPath = pathname.replace(/^\/balita\//, '/baca/');
  } else if (pathname.startsWith('/kesehatan/')) {
    shouldRedirect = true;
    targetPath = pathname.replace(/^\/kesehatan\//, '/baca/');
  } else if (pathname.startsWith('/parenting/')) {
    shouldRedirect = true;
    targetPath = pathname.replace(/^\/parenting\//, '/baca/');
  }

  if (shouldRedirect) {
    const redirectUrl = `https://${targetDomain}${targetPath}${url.search}`;
    return Response.redirect(redirectUrl, 301);
  }

  // 3. Deteksi path legacy (konten lama)
  const isLegacyPath =
    pathname.startsWith('/country/') ||
    pathname.startsWith('/sector/') ||
    pathname.startsWith('/tips-karir/') ||
    pathname.startsWith('/id/') ||
    pathname.startsWith('/us/') ||
    pathname.startsWith('/ae/') ||
    pathname.startsWith('/sg/') ||
    pathname.startsWith('/ca/') ||
    pathname.startsWith('/ch/') ||
    pathname.startsWith('/au/') ||
    pathname.startsWith('/wp-content/') ||
    pathname.startsWith('/wp-includes/') ||
    pathname.startsWith('/images/') ||
    pathname.startsWith('/flagwebp/') ||
    pathname.startsWith('/tools/') ||
    pathname.startsWith('/page/') ||
    pathname.startsWith('/feed/') ||
    pathname.startsWith('/author/') ||
    pathname.startsWith('/edukasi/') ||
    pathname.startsWith('/spmb/') ||
    pathname.startsWith('/contactus/') ||
    pathname.startsWith('/cookie-policy/') ||
    pathname.startsWith('/categories-grid/') ||
    pathname.startsWith('/logo-logo-online/');

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
