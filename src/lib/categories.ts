export interface CategoryItem {
  name: string;
  slug: string;
  description?: string;
}

export const MAIN_CATEGORIES: CategoryItem[] = [
  { name: 'Semua', slug: '', description: 'Semua artikel terbaru tentang parenting dan gizi anak.' },
  { name: 'Pola Asuh', slug: 'pola-asuh', description: 'Panduan strategi pola asuh anak, psikologi, dan pembentukan karakter.' },
  { name: 'Tumbuh Kembang', slug: 'tumbuh-kembang', description: 'Stimulasi motorik, permainan sensori (sensory play), dan milestone anak.' },
  { name: 'Kesehatan & Gizi', slug: 'kesehatan-gizi', description: 'Nutrisi balita, panduan MPASI, pencegahan stunting, dan kesehatan keluarga.' },
  { name: 'Balita', slug: 'balita', description: 'Edukasi dan panduan lengkap pengasuhan anak usia balita (1-5 tahun).' },
];

export function categoryToSlug(categoryName: string): string {
  if (!categoryName || categoryName === 'Semua') return '';
  const item = MAIN_CATEGORIES.find((c) => c.name.toLowerCase() === categoryName.toLowerCase());
  if (item && item.slug) return item.slug;
  return categoryName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function slugToCategory(slug: string, availableCategories: string[] = []): string | null {
  if (!slug || slug === 'semua') return 'Semua';
  const cleanSlug = slug.toLowerCase().trim();

  // Check main categories mapping
  const found = MAIN_CATEGORIES.find((c) => c.slug === cleanSlug);
  if (found && found.name !== 'Semua') return found.name;

  // Common aliases and legacy WordPress categories
  if (cleanSlug === 'kesehatan' || cleanSlug === 'gizi' || cleanSlug === 'kesehatan-dan-gizi') {
    return 'Kesehatan & Gizi';
  }
  if (cleanSlug === 'polaasuh' || cleanSlug === 'pendidikan-anak' || cleanSlug === 'keluarga' || cleanSlug === 'fikh' || cleanSlug === 'wanita' || cleanSlug === 'konsultasi') {
    return 'Pola Asuh';
  }
  if (cleanSlug === 'tumbuhkembang') return 'Tumbuh Kembang';
  if (cleanSlug === 'berita') return 'Semua';

  // Check among available post categories
  for (const cat of availableCategories) {
    if (categoryToSlug(cat) === cleanSlug) {
      return cat;
    }
  }

  // Do not fall back to capitalized string for unknown slugs to prevent route hijacking
  return null;
}
