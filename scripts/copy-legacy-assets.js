import { cpSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';

const DIST = 'dist';

const LEGACY_FOLDERS = [
  // Negara / lokasi
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

  // Halaman statis & utilitas
  'contactus',
  'cookie-policy',
  'categories-grid',
  'logo-logo-online',
  'edukasi',
  'spmb',
  'page',
  'feed',
  'author',
  'tools',

  // Asset & WordPress residual
  'wp-content',
  'wp-includes',
  'images',
  'flagwebp',

  // Konten berdasar tahun (sebelumnya belum masuk)
  '2016',
  '2023',
  '2024',

  // Konten spesifik yang masih ada di repo
  'saung-plataran-resto-karawang',
];

const LEGACY_FILES = [
  'job-loker-lowongan-kerja.js',
];

console.log('[Legacy Assets] Mulai menyalin folder & file lama ke dist/ ...');

if (!existsSync(DIST)) {
  mkdirSync(DIST, { recursive: true });
}

let copiedFolders = 0;
let copiedFiles = 0;

// Copy folders
for (const folder of LEGACY_FOLDERS) {
  if (existsSync(folder)) {
    try {
      cpSync(folder, join(DIST, folder), { recursive: true });
      console.log(`  ✓ ${folder}/`);
      copiedFolders++;
    } catch (err) {
      console.warn(`  ✗ Gagal copy ${folder}:`, err.message);
    }
  } else {
    console.log(`  - ${folder}/ (tidak ditemukan, dilewati)`);
  }
}

// Copy single files
for (const file of LEGACY_FILES) {
  if (existsSync(file)) {
    try {
      cpSync(file, join(DIST, file));
      console.log(`  ✓ ${file}`);
      copiedFiles++;
    } catch (err) {
      console.warn(`  ✗ Gagal copy ${file}:`, err.message);
    }
  } else {
    console.log(`  - ${file} (tidak ditemukan, dilewati)`);
  }
}

console.log(`[Legacy Assets] Selesai. ${copiedFolders} folder + ${copiedFiles} file berhasil disalin.`);
