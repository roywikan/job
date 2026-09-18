export interface GlossaryTermMatch {
  id?: string;
  term: string;
  aliases?: string[];
  shortDefinition: string;
  slug: string;
  anchorUrl?: string;
  postSlug?: string;
  postTitle?: string;
}

export interface AutoLinkOptions {
  autoLinkMaxPerTerm?: number;
  minTermLength?: number;
  caseSensitive?: boolean;
}

let cachedGlossaryTerms: GlossaryTermMatch[] | null = null;
let fetchPromise: Promise<GlossaryTermMatch[]> | null = null;

/**
 * Fetches all published glossary terms from API endpoint
 */
export async function fetchGlossaryTerms(): Promise<GlossaryTermMatch[]> {
  if (cachedGlossaryTerms) return cachedGlossaryTerms;
  if (fetchPromise) return fetchPromise;

  fetchPromise = (async () => {
    try {
      const res = await fetch('/api/glossary-terms');
      if (!res.ok) return [];
      const data = (await res.json()) as any;
      if (data && Array.isArray(data.terms)) {
        cachedGlossaryTerms = data.terms;
        return data.terms;
      }
    } catch (e) {
      console.warn('Gagal memuat glosarium terms:', e);
    }
    return [];
  })();

  return fetchPromise;
}

/**
 * Automatically parses HTML content and injects glossary term tooltips
 */
export function autoLinkGlossaryTerms(
  htmlContent: string,
  termsList: GlossaryTermMatch[],
  options: AutoLinkOptions = {}
): string {
  if (!htmlContent || !termsList || termsList.length === 0) return htmlContent;

  const maxPerTerm = options.autoLinkMaxPerTerm ?? 3;
  const minLength = options.minTermLength ?? 3;
  const isCaseSensitive = options.caseSensitive ?? false;

  interface TargetMatch {
    matchText: string;
    termData: GlossaryTermMatch;
  }

  const targets: TargetMatch[] = [];
  termsList.forEach((t) => {
    if (t.term && t.term.length >= minLength) {
      targets.push({ matchText: t.term, termData: t });
    }
    if (t.aliases && Array.isArray(t.aliases)) {
      t.aliases.forEach((alias) => {
        if (alias && alias.length >= minLength) {
          targets.push({ matchText: alias, termData: t });
        }
      });
    }
  });

  // Sort longest term first to prevent shorter terms from overriding longer phrases
  targets.sort((a, b) => b.matchText.length - a.matchText.length);

  if (targets.length === 0) return htmlContent;

  const replacementCounts = new Map<string, number>();

  // Tokenize HTML to separate tags from printable text
  const tagRegex = /<[^>]+>/g;
  const tokens: { text: string; isTag: boolean }[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = tagRegex.exec(htmlContent)) !== null) {
    if (match.index > lastIndex) {
      tokens.push({ text: htmlContent.substring(lastIndex, match.index), isTag: false });
    }
    tokens.push({ text: match[0], isTag: true });
    lastIndex = tagRegex.lastIndex;
  }
  if (lastIndex < htmlContent.length) {
    tokens.push({ text: htmlContent.substring(lastIndex), isTag: false });
  }

  let insideForbidden = 0;
  const forbiddenTagPattern = /^<\/?(a|code|pre|h1|h2|h3|h4|h5|h6|script|style|button|textarea|select|option)\b/i;
  const glossarySpanPattern = /^<span\b[^>]*class="[^"]*glossary-term/i;

  const processedTokens = tokens.map((token) => {
    if (token.isTag) {
      if (forbiddenTagPattern.test(token.text) || glossarySpanPattern.test(token.text)) {
        if (token.text.startsWith('</')) {
          insideForbidden = Math.max(0, insideForbidden - 1);
        } else if (!token.text.endsWith('/>')) {
          insideForbidden++;
        }
      }
      return token.text;
    }

    if (insideForbidden > 0) {
      return token.text;
    }

    let currentText = token.text;

    for (const target of targets) {
      const termKey = target.termData.slug || target.termData.term;
      const currentCount = replacementCounts.get(termKey) || 0;
      if (currentCount >= maxPerTerm) continue;

      const escapedMatch = target.matchText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regexFlags = isCaseSensitive ? 'g' : 'gi';
      const termRegex = new RegExp(`\\b(${escapedMatch})\\b`, regexFlags);

      currentText = currentText.replace(termRegex, (matchedStr) => {
        const count = replacementCounts.get(termKey) || 0;
        if (count >= maxPerTerm) return matchedStr;

        replacementCounts.set(termKey, count + 1);

        const shortDefEscaped = (target.termData.shortDefinition || '')
          .replace(/"/g, '&quot;')
          .replace(/'/g, '&#39;');
        const termNameEscaped = (target.termData.term || matchedStr).replace(/"/g, '&quot;');
        const anchorUrl =
          target.termData.anchorUrl ||
          `/baca/${target.termData.postSlug || ''}#term-${target.termData.slug}`;

        return `<span class="glossary-term relative inline-block border-b-2 border-dashed border-rose-400 dark:border-rose-500 cursor-help group font-medium text-slate-900 dark:text-slate-100" data-glossary-term="${termNameEscaped}" data-glossary-def="${shortDefEscaped}" data-glossary-url="${anchorUrl}">${matchedStr}<span class="glossary-tooltip opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all duration-200 absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 bg-slate-900 dark:bg-slate-800 text-white rounded-xl shadow-xl text-xs z-50 border border-slate-700 font-normal"><strong class="block text-rose-300 font-semibold mb-1">${termNameEscaped}</strong>${target.termData.shortDefinition}<a href="${anchorUrl}" class="mt-2 text-[11px] text-rose-400 hover:underline flex items-center gap-1 font-medium">Lihat di glosarium &rarr;</a></span></span>`;
      });
    }

    return currentText;
  });

  return processedTokens.join('');
}
