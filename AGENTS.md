# Instruksi Baku Pengembang (Konfidensial & Permanen)

Dokumen ini dibaca dan diinjeksikan secara otomatis oleh Google AI Studio ke dalam instruksi sistem (system instructions) pada setiap sesi pengembangan.


Ini repo job.web.id (Cloudflare Pages + Vite/React + D1).
Berasal dari transplant engine parenting-my-id, lalu di-customise untuk site static HTML legacy.

## JANGAN timpa / usulkan hapus:
- wrangler.toml (identity job-web-id, D1 job-cms-db, SITE_URL job.web.id)
- functions/_middleware.ts (legacyPrefixes, CSP longgar, D1 bootstrap)
- scripts/copy-legacy-assets.js (folder 2016, 2023, 2024, country, atscvresume, tips-karir, dll)
- folder static: country/, id/, us/, 2016/, tips-karir/, atscvresume/, wp-content/, data/
- package.json script "build" yang memanggil copy-legacy-assets.js

## Boleh review & usulkan perbaikan:
- src/ (React), functions/api jika ada, bug TypeScript, keamanan, performa
- default branding yang masih parenting (placeholder AdminPortal)
- konsistensi path kategori job vs legacy

Tujuan: stabil di Cloudflare Pages, legacy URL tetap hidup, CMS admin untuk konten karir/lowongan.

## Baca file yang saya unggah. Ringkas:
1) Alur build (package.json → dist + legacy copy)
2) Routing: mana SPA React, mana path legacy static
3) Risiko jika middleware/copy-legacy diubah
Jangan tulis ulang seluruh file; beri daftar temuan saja.

## Review login admin, Turnstile, emergency bypass, API yang butuh auth.
Jangan sarankan menghapus Turnstile; sarankan hardening yang cocok Cloudflare Pages + D1.

Usulkan patch MINIMAL (diff / blok replace), jangan rewrite file 5000+ baris.
Prioritas: bug build, path legacy putus, default editor masih salah.

## Yang tidak perlu dilakukan oleh AI Studio

- Jangan “gabungkan ulang dari parenting” tanpa batasan file di atas
- Jangan generate ulang seluruh AdminPortal.tsx
- Jangan menghapus folder tahun / country / atscvresume
- Jangan mengganti name / database_id di wrangler.toml
- Jangan menghapus langkah copy-legacy-assets.js dari build

## Deploy Cloudflare Pages → uji:
- / (SPA)
- /country/
- /id/
- /2016/
- /tips-karir/
- /atscvresume/
- /admin-9999 (atau suffix lain)


## 1. Proteksi Berkas `coro.md` 
- 
- `coro.md` adalah dokumen utama dalam hal panduan operasi, skema database D1, dan instalasi script ini.
- Semua pembaruan dokumentasi WAJIB dilakukan ke dalam `coro.md` saja.
- Berkas `Readme.md` dan `README.md` wajib dikosongkan (0 bytes) dan isinya selalu diadaptasikan ke dalam `coro.md`.

## 2. Prioritas Keamanan (Security First)
- Keamanan website adalah prioritas utama.
- Pastikan sistem selalu memiliki perlindungan Anti Brute Force, Anti XSS, dan Anti Leech.
- Selalu lakukan pemeriksaan keamanan ekstra pada area `/admin-[suffix]`. Path `/admin` wajib decoy (404 Not Found) tanpa redirect.

## 3. SEO dan Aksesibilitas Googlebot
- Semua sistem yang melakukan render atau menghasilkan file XML, CSS, RSS, dan HTML harus dipastikan outputnya ramah SEO dan memungkinkan kode google Adsense memuat iklan yang fresh sesuai konteks isi halaman saat itu.
- Pastikan hasil HTML dapat di-crawl dengan baik oleh Googlebot tanpa error (homepage, tags, category, page, post page).

## 4. Klarifikasi Proaktif
- Jika prompt atau instruksi yang diberikan belum jelas atau memiliki ambiguitas, wajib berhenti dan bertanya kembali kepada user sebelum mengeksekusi perubahan.

## 5. Bersifat Niche Agnostic (Anti-Hardcoding Niche/Domain)
- Proyek ini dirancang sepenuhnya bersifat **Job Website Oriented** (dapat digunakan untuk topik atau domain job/pekerjaan/karir tanpa terikat pada satu topik spesifik).
- Dalam antarmuka pengguna (UI), interaksi manusia, maupun output yang disajikan ke hadapan Googlebot/mesin pencari (HTML meta tags, title, Open Graph, JSON-LD schema, RSS feed, sitemap, llms.txt, footer, dsb.), **DILARANG MENG-HARDCODE** kata "job", "job.web.id", atau "Job Web" sebagai teks statis yang tidak dapat diubah (unconfigurable/unchangeable).
- Seluruh nama situs, nama domain, deskripsi, meta title, kategori, topik, dan branding WAJIB selalu bersumber secara dinamis dari pengaturan konfigurasi database/sistem (`configs`), variabel lingkungan (`SITE_URL`, `SITE_NAME`, dsb.), atau state dinamis yang dapat diubah secara bebas oleh pemilik situs melalui portal konfigurasi admin.

## 6. Instruksi dan aturan permanen operasional:
schema.sql sebagai Single Source of Truth (SSOT) Skema Database:
Seluruh inisialisasi tabel, kolom, tipe data, indeks, dan relasi database Cloudflare D1 (SQLite) berpatokan penuh pada berkas schema.sql.
Setiap kali ada kode/skrip baru yang membutuhkan query ke tabel atau kolom baru, definisi SQL-nya wajib merujuk dan diselaraskan secara konsisten dengan schema.sql.
Sinkronisasi Otomatis untuk Fitur Baru:
Setiap penambahan fitur baru di masa mendatang yang memerlukan tabel atau kolom tambahan, berkas schema.sql wajib diperbarui secara bersamaan (menggunakan pernyataan DDL aman seperti CREATE TABLE IF NOT EXISTS atau ALTER TABLE ... ADD COLUMN yang terdokumentasi rapi).
Penyelarasan ini menjamin proses instalasi dari awal (clean install) pada database Cloudflare D1 baru selalu 100% lengkap dan siap pakai tanpa ada tabel atau kolom yang tertinggal.
