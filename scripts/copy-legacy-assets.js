import { cpSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';

const DIST = 'dist';

// Folder yang wajib dihidupkan kembali (sesuai pola URL lama)
const LEGACY_FOLDERS = [
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
