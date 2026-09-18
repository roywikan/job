/**
 * AI Assistant for Site Editor
 * Proxies through server-side API route for secure Gemini integration
 */
export async function generateSEOMeta(title: string, content: string, siteName?: string) {
  try {
    const res = await fetch('/api/ai/generate-meta', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, content }),
    });

    if (res.ok) {
      const data = await res.json();
      return data;
    }
  } catch (err) {
    console.error('Gemini API Error via /api/ai/generate-meta:', err);
  }

  const sName = siteName || 'Blog';
  return {
    metaTitle: `${title} | ${sName}`,
    metaDescription: content.slice(0, 150).replace(/[#*`_]/g, '') + '...',
    tags: 'artikel, edukasi, informasi, panduan, wawasan',
    excerpt: content.slice(0, 180).replace(/[#*`_]/g, '') + '...',
    aiGenerated: false,
  };
}

export const generateParentingSEOMeta = generateSEOMeta;


