import { AutoLink } from '../types';

/**
 * Applies auto-linking for registered keywords on HTML content.
 * Intelligently avoids replacing keywords inside existing <a> tags, headings, attributes, or code blocks.
 */
export function applyAutoLinks(htmlContent: string, autolinks: AutoLink[]): string {
  if (!htmlContent || !autolinks || autolinks.length === 0) {
    return htmlContent;
  }

  // Sort autolinks by keyword length descending so longer phrases match first (e.g. "pola asuh anak" before "pola asuh")
  const sortedLinks = [...autolinks].sort((a, b) => b.keyword.length - a.keyword.length);

  let processedHtml = htmlContent;

  for (const link of sortedLinks) {
    if (!link.keyword || !link.targetUrl) continue;

    const keywordEscaped = link.keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    
    // Match the keyword outside of existing HTML tags or inside <a> tags
    // Regex matches HTML tags OR the keyword
    const tagOrKeywordRegex = new RegExp(
      `(<a\\b[^>]*?>[\\s\\S]*?<\\/a>|<code\\b[^>]*?>[\\s\\S]*?<\\/code>|<h[1-6]\\b[^>]*?>[\\s\\S]*?<\\/h[1-6]>|<[^>]+>)|(\\b${keywordEscaped}\\b)`,
      'gi'
    );

    let replacedCount = 0;
    const maxReplacementsPerKeyword = 2; // Prevent link spamming, max 2 links per keyword per post

    processedHtml = processedHtml.replace(tagOrKeywordRegex, (match, htmlTag, keywordMatch) => {
      if (htmlTag) {
        // Leave existing tags, links, headings, code intact
        return htmlTag;
      }

      if (keywordMatch && replacedCount < maxReplacementsPerKeyword) {
        replacedCount++;
        return `<a href="${link.targetUrl}" class="inline-flex items-center gap-0.5 text-rose-700 dark:text-rose-300 font-semibold underline decoration-rose-400 dark:decoration-rose-500 underline-offset-4 hover:bg-rose-50 dark:hover:bg-rose-950/60 px-1 py-0.5 rounded transition-colors group/autolink" title="Artikel terkait: ${link.description || link.keyword}" data-autolink-id="${link.id}">${keywordMatch}<span class="inline-block text-[10px] opacity-70 group-hover/autolink:translate-x-0.5 transition-transform">↗</span></a>`;
      }

      return match;
    });
  }

  return processedHtml;
}

/**
 * Calculates estimated reading time based on word count.
 */
export function calculateReadTime(text: string): number {
  if (!text) return 1;
  const words = text.trim().split(/\s+/).length;
  const wpm = 200; // average reading speed
  return Math.max(1, Math.ceil(words / wpm));
}

/**
 * Generates clean URL slug from title.
 */
export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Preprocesses markdown string so that multiple blank lines (consecutive newlines)
 * are preserved as visible line breaks (<br />) in rendered HTML preview and output.
 */
export function preprocessMarkdownLineBreaks(markdown: string): string {
  if (!markdown) return '';

  // Normalize \r\n to \n
  let normalized = markdown.replace(/\r\n/g, '\n');

  // Split by code blocks (```...```) so we don't alter whitespace inside code blocks
  const parts = normalized.split(/(```[\s\S]*?```)/g);

  return parts
    .map((part, index) => {
      // Odd indices are code blocks
      if (index % 2 === 1) {
        return part;
      }

      // Replace lines containing only spaces or tabs with clean newlines
      let text = part.replace(/\n[ \t]+\n/g, '\n\n');

      // Convert 2 or more consecutive newlines (i.e. 1 or more blank lines) into
      // paragraph breaks with <br /> tags
      text = text.replace(/\n{2,}/g, (match) => {
        const extraLines = match.length - 1;
        return '\n\n' + '<br />'.repeat(extraLines) + '\n\n';
      });

      return text;
    })
    .join('');
}

/**
 * Parses custom video shortcodes [youtube:url_or_id], [tiktok:url_or_id], [instagram:url_or_id]
 * and converts them into mobile-friendly, fluidly responsive HTML embed frames.
 */
export function renderResponsiveVideoEmbeds(html: string): string {
  if (!html) return '';

  // 1. YouTube [youtube:ID_or_URL]
  let result = html.replace(/\[youtube:\s*([^\s\]]+)\s*\]/gi, (match, src) => {
    let videoId = src;
    const ytMatch = src.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/ ]{11})/i);
    if (ytMatch) {
      videoId = ytMatch[1];
    }
    return `
      <div class="relative w-full pb-[56.25%] h-0 rounded-2xl overflow-hidden shadow-xs my-6 bg-slate-100 dark:bg-slate-800">
        <iframe src="https://www.youtube.com/embed/${videoId}" class="absolute top-0 left-0 w-full h-full border-0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
      </div>
    `;
  });

  // 2. TikTok [tiktok:ID_or_URL]
  result = result.replace(/\[tiktok:\s*([^\s\]]+)\s*\]/gi, (match, src) => {
    let videoId = src;
    const ttMatch = src.match(/\/video\/(\d+)/i);
    if (ttMatch) {
      videoId = ttMatch[1];
    }
    return `
      <div class="w-full flex justify-center my-6">
        <div class="relative w-full max-w-[340px] aspect-[9/16] rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-xs bg-slate-100 dark:bg-slate-800">
          <iframe src="https://www.tiktok.com/embed/v2/${videoId}" class="absolute top-0 left-0 w-full h-full border-0" allowfullscreen></iframe>
        </div>
      </div>
    `;
  });

  // 3. Instagram [instagram:ID_or_URL]
  result = result.replace(/\[instagram:\s*([^\s\]]+)\s*\]/gi, (match, src) => {
    let postId = src;
    const igMatch = src.match(/\/(?:p|reel|tv)\/([A-Za-z0-9_-]+)/i);
    if (igMatch) {
      postId = igMatch[1];
    }
    return `
      <div class="w-full flex justify-center my-6">
        <div class="relative w-full max-w-[400px] aspect-[4/5] rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-xs bg-slate-100 dark:bg-slate-800">
          <iframe src="https://www.instagram.com/p/${postId}/embed" class="absolute top-0 left-0 w-full h-full border-0" allowfullscreen></iframe>
        </div>
      </div>
    `;
  });

  return result;
}

/**
 * Parses product shortcodes [produk:slug] or [product:slug] and converts them into
 * a gorgeous, high-converting interactive product promo box inside articles.
 */
export function renderProductEmbeds(html: string, products: any[]): string {
  if (!html || !products || products.length === 0) return html;

  let result = html;
  const productRegex = /\[(?:produk|product):\s*([^\s\]]+)\s*\]/gi;

  result = result.replace(productRegex, (match, slug) => {
    const cleanSlug = slug.trim().toLowerCase();
    const product = products.find(p => p.slug.toLowerCase() === cleanSlug);

    if (!product) {
      return `<div class="p-4 my-4 rounded-xl border border-dashed border-rose-300 bg-rose-50/50 text-xs text-rose-600 font-bold">⚠️ Produk dengan slug "${slug}" tidak ditemukan.</div>`;
    }

    return `
      <div class="my-8 p-5 sm:p-6 rounded-3xl border border-rose-200 dark:border-rose-950/60 bg-gradient-to-br from-rose-50/60 via-white to-pink-50/40 dark:from-slate-900 dark:via-slate-900 dark:to-rose-950/20 shadow-md flex flex-col sm:flex-row items-center gap-5 transition-all hover:shadow-lg">
        <div class="w-full sm:w-40 h-36 flex-shrink-0 rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 shadow-inner">
          <img src="${product.imageUrl}" alt="${product.title}" class="w-full h-full object-cover" />
        </div>
        <div class="flex-1 space-y-2 text-center sm:text-left">
          <div class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 font-black text-[10px] uppercase tracking-wider">
            ⭐ Rekomendasi Produk Pilihan
          </div>
          <h4 class="text-base sm:text-lg font-black text-slate-900 dark:text-white leading-snug">
            ${product.title}
          </h4>
          <p class="text-xs text-slate-600 dark:text-slate-300 line-clamp-2">
            ${product.description}
          </p>
          <div class="flex flex-wrap items-center justify-center sm:justify-between gap-3 pt-2">
            <div class="text-rose-600 dark:text-rose-400 font-black text-base sm:text-lg">
              Rp ${Number(product.price).toLocaleString('id-ID')}
            </div>
            <a href="/produk/${product.slug}" class="relative group inline-flex items-center justify-center gap-3 px-8 py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-base tracking-wide shadow-lg shadow-emerald-600/35 hover:shadow-emerald-600/55 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200">
              <span class="text-white drop-shadow-sm">Lihat &amp; Pesan Sekarang</span>
              <span class="text-xl font-black text-white transition-transform duration-200 group-hover:translate-x-1">→</span>
            </a>
          </div>
        </div>
      </div>
    `;
  });

  return result;
}

