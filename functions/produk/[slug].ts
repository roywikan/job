interface Env {
  DB?: any;
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

function formatRupiah(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0
  }).format(amount);
}

export const onRequest: PagesFunction<Env> = async (context) => {
  const { params, env, request } = context;
  const rawSlug = String(params.slug || '').trim();
  const slug = decodeURIComponent(rawSlug).toLowerCase();

  const requestUrl = new URL(request.url);
  const siteUrl = (env.SITE_URL || requestUrl.origin).replace(/\/$/, '');

  let htmlTemplate = '';
  try {
    const assetResponse = await context.next();
    if (assetResponse.ok) {
      htmlTemplate = await assetResponse.text();
    }
  } catch (err) {
    console.error('Error fetching base asset in product edge handler:', err);
  }

  if (!htmlTemplate) {
    return new Response('Template unavailable', { status: 500 });
  }

  let siteName = env.SITE_NAME || 'Portal Jualan';
  let productsNavPath = '/produk';
  let globalSellerBankAccounts = '';

  let product: any = null;

  if (env.DB) {
    try {
      const configRows = await env.DB.prepare(
        "SELECT key, value FROM configs WHERE key IN ('site_name', 'products_nav_path', 'seller_bank_accounts')"
      ).all();
      if (configRows?.results) {
        for (const row of configRows.results) {
          if (row.key === 'site_name' && row.value) siteName = row.value;
          if (row.key === 'products_nav_path' && row.value) productsNavPath = row.value;
          if (row.key === 'seller_bank_accounts' && row.value) globalSellerBankAccounts = row.value;
        }
      }

      product = await env.DB.prepare(
        'SELECT id, title, slug, description, price, image_url as imageUrl, whatsapp_number as whatsappNumber, qris_image_url as qrisImageUrl, bank_info as bankInfo, payment_mode as paymentMode, third_party_checkout_url as thirdPartyCheckoutUrl, status, created_at as createdAt FROM products WHERE LOWER(slug) = LOWER(?)'
      ).bind(slug).first();
    } catch (e) {
      console.error('Error querying D1 for product in edge handler:', e);
    }
  }

  if (!product) {
    return context.next();
  }

  const cleanNavPath = productsNavPath.startsWith('/') ? productsNavPath : `/${productsNavPath}`;
  const canonicalUrl = `${siteUrl}${cleanNavPath}/${encodeURIComponent(product.slug)}`;
  const priceFormatted = formatRupiah(product.price);
  const metaTitle = `${product.title} - ${priceFormatted} | ${siteName}`;
  const metaDescription = String(product.description || '').slice(0, 160).trim();
  const bankInfoText = (product.bankInfo && product.bankInfo.trim()) ? product.bankInfo : globalSellerBankAccounts;
  const paymentMode = product.paymentMode || 'all';
  const thirdPartyUrl = String(product.thirdPartyCheckoutUrl || '').trim();

  const showQris = (paymentMode === 'all' || paymentMode === 'qris') && Boolean(product.qrisImageUrl);
  const showBank = (paymentMode === 'all' || paymentMode === 'bank') && Boolean(bankInfoText);
  const showThirdParty = (paymentMode === 'all' || paymentMode === 'third_party') && Boolean(thirdPartyUrl);
  const showWhatsapp = paymentMode === 'all' || paymentMode === 'whatsapp';

  // JSON-LD Schema.org Product
  const productSchema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    '@id': `${canonicalUrl}#product`,
    'name': product.title,
    'description': metaDescription,
    'image': [product.imageUrl],
    'sku': `PROD-${product.id}`,
    'offers': {
      '@type': 'Offer',
      'url': canonicalUrl,
      'priceCurrency': 'IDR',
      'price': product.price,
      'priceValidUntil': '2030-12-31',
      'itemCondition': 'https://schema.org/NewCondition',
      'availability': product.status === 'available'
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock'
    }
  };

  const seoHeadTags = `
    <title>${escapeHtml(metaTitle)}</title>
    <meta name="description" content="${escapeHtml(metaDescription)}" />
    <link rel="canonical" href="${escapeHtml(canonicalUrl)}" />

    <!-- Open Graph / Facebook -->
    <meta property="og:type" content="product" />
    <meta property="og:url" content="${escapeHtml(canonicalUrl)}" />
    <meta property="og:title" content="${escapeHtml(metaTitle)}" />
    <meta property="og:description" content="${escapeHtml(metaDescription)}" />
    <meta property="og:image" content="${escapeHtml(product.imageUrl)}" />
    <meta property="product:price:amount" content="${product.price}" />
    <meta property="product:price:currency" content="IDR" />

    <!-- Twitter -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:url" content="${escapeHtml(canonicalUrl)}" />
    <meta name="twitter:title" content="${escapeHtml(metaTitle)}" />
    <meta name="twitter:description" content="${escapeHtml(metaDescription)}" />
    <meta name="twitter:image" content="${escapeHtml(product.imageUrl)}" />

    <!-- Schema.org JSON-LD -->
    <script type="application/ld+json">${JSON.stringify(productSchema, null, 2)}</script>
  `;

  // Pre-rendered HTML for Googlebot
  const preRenderedBody = `
    <div class="max-w-7xl mx-auto px-4 py-8 space-y-8">
      <nav class="flex items-center gap-2 text-xs text-slate-500">
        <a href="/" class="hover:underline">Beranda</a>
        <span>&rsaquo;</span>
        <a href="${cleanNavPath}" class="hover:underline">Produk &amp; Katalog</a>
        <span>&rsaquo;</span>
        <span class="font-bold text-slate-800">${escapeHtml(product.title)}</span>
      </nav>

      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div class="lg:col-span-7 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div class="aspect-4/3 rounded-2xl overflow-hidden bg-slate-900 border border-slate-100 flex items-center justify-center">
            <img src="${escapeHtml(product.imageUrl)}" alt="${escapeHtml(product.title)}" class="max-h-full max-w-full object-contain" />
          </div>
          <h1 class="text-2xl font-black text-slate-900">${escapeHtml(product.title)}</h1>
          <div class="text-xl font-extrabold text-rose-600">${priceFormatted}</div>
          <div class="prose prose-sm max-w-none text-slate-700 whitespace-pre-wrap leading-relaxed">${escapeHtml(product.description)}</div>
        </div>

        <div class="lg:col-span-5 bg-white p-6 rounded-3xl border border-slate-200 shadow-md space-y-6">
          <div class="space-y-2">
            <h2 class="text-lg font-bold text-slate-900">Status Produk</h2>
            <span class="inline-block px-3 py-1 rounded-full text-xs font-bold ${product.status === 'available' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}">
              ${product.status === 'available' ? 'Tersedia' : 'Terjual'}
            </span>
          </div>

          ${showBank ? `
          <div class="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-left">
            <h3 class="text-xs font-bold text-slate-800 uppercase">Rekening Penjual &amp; Info Pengiriman</h3>
            <pre class="text-xs font-mono text-slate-800 whitespace-pre-wrap leading-relaxed">${escapeHtml(bankInfoText)}</pre>
          </div>
          ` : ''}

          ${showQris ? `
          <div class="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center space-y-2">
            <h3 class="text-xs font-bold text-slate-800 uppercase">Pembayaran QRIS</h3>
            <img src="${escapeHtml(product.qrisImageUrl)}" alt="QRIS Code" class="w-48 h-48 object-contain mx-auto bg-white p-2 rounded-lg border border-slate-200" />
          </div>
          ` : ''}

          ${showThirdParty ? `
          <div class="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center space-y-3">
            <h3 class="text-xs font-bold text-slate-800 uppercase">Checkout Pihak Ketiga (Shopping Cart Service)</h3>
            <a href="${escapeHtml(thirdPartyUrl)}" target="_blank" rel="noopener noreferrer" class="block w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs uppercase tracking-wider transition-all">
              Beli / Checkout via Pihak Ketiga &rarr;
            </a>
          </div>
          ` : ''}

          ${showWhatsapp ? `
          <div class="pt-4 border-t border-slate-100">
            <a href="https://wa.me/${escapeHtml(product.whatsappNumber)}?text=${encodeURIComponent(`Halo, saya tertarik dengan produk ${product.title} seharga ${priceFormatted}`)}" target="_blank" rel="noreferrer" class="block w-full text-center py-3 bg-rose-600 text-white font-bold rounded-xl text-xs uppercase tracking-wider">
              Beli via WhatsApp
            </a>
          </div>
          ` : ''}
        </div>
      </div>
    </div>
  `;

  let finalHtml = htmlTemplate
    .replace(/<title>.*?<\/title>/i, seoHeadTags)
    .replace(/<meta[^>]*name="description"[^>]*>/gi, '')
    .replace(/<meta[^>]*property="og:[^>]*>/gi, '');

  const initialDataJson = JSON.stringify({ product, siteName, productsNavPath }).replace(/</g, '\\u003c');
  const initialDataScript = `<script>window.__INITIAL_DATA__=${initialDataJson};</script>`;

  finalHtml = finalHtml.replace(/<div id="root"><\/div>/i, `${initialDataScript}<div id="root">${preRenderedBody}</div>`);

  return new Response(finalHtml, {
    status: 200,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=86400',
      'Vary': 'Accept',
      'Link': `<${canonicalUrl}>; rel="canonical"`,
    },
  });
};
