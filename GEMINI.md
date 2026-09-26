# Permanent Development Guidelines for Google AI Studio

## Mandatory File Protection: `coro.md`
- **NEVER DELETE, RENAME, RESTRUCTURE, OR REMOVE `coro.md` UNDER ANY CIRCUMSTANCES.**
- `coro.md` is the single source of truth for installation, Cloudflare D1 SQL schema, security protocols, API keys, and deployment procedures.
- Any documentation updates must be appended/updated directly within `coro.md` only.
- `Readme.md` and `README.md` must remain completely empty.

## Security First
- Maintain Anti Brute Force, Anti XSS, and Anti Leech protection.
- Keep `/admin` as a strict decoy 404. The admin portal is exclusively accessed via `/admin-[suffix]`.
- Provide Turnstile protection with failover and Emergency Recovery Key capabilities.

## SEO & Bot Accessibility
- Ensure Googlebot can crawl and render all pages without errors.
- Support valid JSON-LD schemas, sitemaps, RSS feeds, and LLM text files (`llms.txt`, `llms-full.txt`).

## Niche Agnostic Architecture (Anti-Hardcoding Niche/Domain)
- This project is strictly **Niche Agnostic** and must be easily adaptable to any industry, subject matter, or domain.
- In all user interfaces (human-facing UI) and search engine outputs presented to Googlebot/crawlers (HTML meta tags, title, Open Graph, JSON-LD structured data, RSS feed, sitemap, llms.txt, footer, headers, etc.), **NEVER HARDCODE** unconfigurable/unchangeable strings referencing "parenting", "parenting.my.id", or "Parenting my.id".
- All site titles, domain references, descriptions, categories, branding, and metadata MUST be dynamically loaded from database configs (`configs`), environment variables (`SITE_URL`, `SITE_NAME`, etc.), or customizable dynamic state editable via the admin settings panel.

## Instruksi dan aturan permanen operasional:
schema.sql sebagai Single Source of Truth (SSOT) Skema Database:
Seluruh inisialisasi tabel, kolom, tipe data, indeks, dan relasi database Cloudflare D1 (SQLite) berpatokan penuh pada berkas schema.sql.
Setiap kali ada kode/skrip baru yang membutuhkan query ke tabel atau kolom baru, definisi SQL-nya wajib merujuk dan diselaraskan secara konsisten dengan schema.sql.
Sinkronisasi Otomatis untuk Fitur Baru:
Setiap penambahan fitur baru di masa mendatang yang memerlukan tabel atau kolom tambahan, berkas schema.sql wajib diperbarui secara bersamaan (menggunakan pernyataan DDL aman seperti CREATE TABLE IF NOT EXISTS atau ALTER TABLE ... ADD COLUMN yang terdokumentasi rapi).
Penyelarasan ini menjamin proses instalasi dari awal (clean install) pada database Cloudflare D1 baru selalu 100% lengkap dan siap pakai tanpa ada tabel atau kolom yang tertinggal.