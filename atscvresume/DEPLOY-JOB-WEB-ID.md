# Panduan: Memasang ATS CV Resume di job.web.id/atscvresume (Cloudflare Pages)

Aplikasi ini sepenuhnya berjalan di browser (tidak memakai database, D1, atau API), jadi cukup
di-build menjadi file statis lalu ditaruh di folder `atscvresume/` dalam repo
`github.com/roywikan/job`. Cloudflare Pages akan menyajikannya seperti file statis lain.
D1 dan Pages Functions situs utama tidak perlu diubah.

Hasil akhir:

- `https://job.web.id/atscvresume/`    -> diarahkan (302) ke `/atscvresume/en/`
- `https://job.web.id/atscvresume/en/` -> English
- `https://job.web.id/atscvresume/es/` -> Espanol
- `https://job.web.id/atscvresume/id/` -> Bahasa Indonesia

---

## Langkah 0 — Cek folder output Cloudflare Pages (sekali saja)

Buka **Cloudflare Dashboard > Workers & Pages > job-web-id > Settings > Build**.

| Yang terlihat | Folder tujuan di repo job |
| --- | --- |
| Build command `npm run build` / `vite build`, output `dist` | `public/atscvresume/` (Vite menyalin `public/` ke `dist/`) |
| Tanpa build command, output `/` (root repo) | `atscvresume/` di root repo |

Di bawah ini contohnya memakai `public/atscvresume/`. Ganti jika situs Anda termasuk kasus kedua.
Hal yang sama berlaku untuk `_redirects`, `_headers`, dan `_routes.json`: edit file yang ikut
masuk ke folder output (untuk Vite: yang ada di `public/`).

## Langkah 1 — Siapkan dua repo di komputer

```bash
git clone https://github.com/roywikan/job.git
git clone <repo-aplikasi-ini> atscvresume-app   # atau download ZIP dari v0
cd atscvresume-app
pnpm install        # atau: npm install
```

## Langkah 2 — Build dan salin ke repo job

```bash
bash scripts/copy-to-job-repo.sh ../job public/atscvresume
```

Script ini menjalankan `pnpm run build:cloudflare` (static export dengan base path
`/atscvresume` dan origin `https://job.web.id`), lalu menyalin isi `out/` ke
`../job/public/atscvresume/`.

Tanpa script (manual):

```bash
pnpm run build:cloudflare
mkdir -p ../job/public/atscvresume
cp -R out/. ../job/public/atscvresume/
```

## Langkah 3 — Edit file routing Cloudflare di repo job

**a) `public/_routes.json`** — tambahkan `"/atscvresume/*"` ke `exclude`, agar request ke
aplikasi ini langsung dilayani sebagai file statis dan tidak memanggil Pages Functions
(lebih cepat, tidak memakan kuota Functions):

```json
"exclude": [
  "/atscvresume/*",
  "/assets/*",
  ...
]
```

**b) `public/_redirects`** — tempel isi `cloudflare/_redirects.snippet` di PALING ATAS:

```
/atscvresume  /atscvresume/en/  302
/atscvresume/ /atscvresume/en/  302
```

**c) `public/_headers`** (opsional, disarankan) — tambahkan isi `cloudflare/_headers.snippet`.

## Langkah 4 — Commit dan push

```bash
cd ../job
git add public/atscvresume public/_routes.json public/_redirects public/_headers
git commit -m "feat: tambah ATS CV Resume di /atscvresume"
git push origin main
```

Cloudflare Pages akan otomatis build dan deploy dari branch `main`.

## Langkah 5 — Cek setelah online

1. Buka `https://job.web.id/atscvresume/`, harus diarahkan ke `/atscvresume/en/`.
2. Ganti bahasa EN / ES / ID di pojok kanan atas.
3. View source: `canonical`, `hreflang`, dan JSON-LD harus berisi `https://job.web.id/atscvresume/.../`.
4. Uji di [Rich Results Test](https://search.google.com/test/rich-results) untuk ketiga URL.
5. Tambahkan ketiga URL ke sitemap job.web.id (`functions/sitemap.xml.ts` atau sitemap
   statisnya), lalu submit di Google Search Console.

## Update di kemudian hari

Setiap ada perubahan di aplikasi ini, ulangi Langkah 2 dan Langkah 4. Langkah 3 cukup sekali.

## Masalah umum

| Gejala | Penyebab / solusi |
| --- | --- |
| Halaman tampil tanpa CSS | Folder salah. Cek Langkah 0; file `_next/` harus ada di `atscvresume/_next/`. |
| `/atscvresume/` 404 | Baris `_redirects` belum ditambahkan atau berada di bawah aturan wildcard lain. |
| Halaman dirender oleh situs utama | `"/atscvresume/*"` belum masuk `exclude` di `_routes.json`, dan Functions menangkap path itu. |
| URL di canonical salah | Build ulang dengan `NEXT_PUBLIC_SITE_URL` yang benar. |

## Mengganti subdirectory

```bash
NEXT_PUBLIC_BASE_PATH=/cv bash scripts/copy-to-job-repo.sh ../job public/cv
```

Lalu sesuaikan path di `_routes.json`, `_redirects`, dan `_headers`.

## Tetap bisa di-host di Vercel

`pnpm build` (tanpa `:cloudflare`) tetap menghasilkan versi Next.js biasa dengan redirect dan
header bawaan. Base path diatur lewat `NEXT_PUBLIC_BASE_PATH` (lihat `.env.example`).
