import { cpSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';

const DIST = 'dist';

// Folder yang wajib dihidupkan kembali (sesuai pola URL lama)
 


const LEGACY_FOLDERS = [
  // yang sudah ada sebelumnya
  'country',
  'sector',
  'tips-karir',
  'id',
  'us',
  'ae',
  'sg',
  'ca',
  'ch',
  'au',
  'contactus',
  'cookie-policy',
  'categories-grid',
  'logo-logo-online',

  // === TAMBAHKAN INI ===
  'wp-content',
  'wp-includes',
  'images',
  'flagwebp',
  'tools',
  'page',
  'feed',
  'author',
  'edukasi',
  'spmb',
];



console.log('[Legacy Assets] Mulai menyalin folder lama ke dist/ ...');

if (!existsSync(DIST)) {
  mkdirSync(DIST, { recursive: true });
}

let copied = 0;
for (const folder of LEGACY_FOLDERS) {
  if (existsSync(folder)) {
    try {
      cpSync(folder, join(DIST, folder), { recursive: true });
      console.log(`  ✓ ${folder}/`);
      copied++;
    } catch (err) {
      console.warn(`  ✗ Gagal copy ${folder}:`, err.message);
    }
  } else {
    console.log(`  - ${folder}/ (tidak ditemukan, dilewati)`);
  }
}

console.log(`[Legacy Assets] Selesai. ${copied} folder berhasil disalin.`);

// Copy single important JS file
if (existsSync('job-loker-lowongan-kerja.js')) {
  cpSync('job-loker-lowongan-kerja.js', join(DIST, 'job-loker-lowongan-kerja.js'));
  console.log('  ✓ job-loker-lowongan-kerja.js beres dari main/scripts/copy-legacy-assets.js');
}
