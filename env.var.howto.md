# Panduan Lengkap Mendapatkan Environment Variables untuk Pemula

Dokumen ini berisi panduan langkah demi langkah bagi pemula untuk mendapatkan dan mengisi seluruh variabel lingkungan (**Environment Variables**) yang dibutuhkan oleh sistem CMS / Blog Engine ini, baik untuk dijalankan di komputer lokal maupun di-deploy ke **Cloudflare Pages**.

---

## 📌 Daftar Isi Variabel
1. [Identitas Situs (SITE_URL, SITE_NAME, SITE_DESCRIPTION)](#1-identitas-situs)
2. [Keamanan Autentikasi (JWT_SECRET & ADMIN_EMERGENCY_KEY)](#2-keamanan-autentikasi)
3. [Cloudflare Turnstile (TURNSTILE_SECRET_KEY)](#3-cloudflare-turnstile)
4. [GitHub Auto-Sync & Backup (GITHUB_TOKEN, GITHUB_OWNER, GITHUB_REPO, GITHUB_BRANCH)](#4-github-integration)
5. [Google Gemini AI (GEMINI_API_KEY)](#5-google-gemini-ai)
6. [Cloudinary Media Storage (CLOUDINARY_*)](#6-cloudinary-media-storage)
7. [Cara Memasukkan Nilai ke Cloudflare Pages (Production)](#7-cara-memasang-di-cloudflare-pages)

---

## 1. Identitas Situs

Variabel ini menentukan identitas dasar dan alamat kanonikal website Anda. Bersifat bebas topik (**Niche-Agnostic**), sesuaikan dengan brand atau topik web yang Anda buat.

### `SITE_URL`
- **Fungsi**: URL utama domain website Anda (digunakan untuk SEO canonical, sitemap.xml, RSS feed, OpenGraph).
- **Contoh Nilai**: `https://namadomainanda.com` (atau subdomain Pages sementara seperti `https://namaproject.pages.dev`).
- **Aturan**: 
  - Wajib diawali `https://`.
  - **Dilarang** menyertakan tanda garis miring di akhir (`/`). Contoh yang salah: `https://domain.com/`. Contoh yang benar: `https://domain.com`.

### `SITE_NAME`
- **Fungsi**: Nama publik website Anda yang muncul di Header, Footer, Meta Title, dan Feed.
- **Contoh Nilai**: `Portal Berita Masa Kini`, `Katalog Karya Desain`, atau `Tech Update ID`.

### `SITE_DESCRIPTION`
- **Fungsi**: Deskripsi singkat website untuk keperluan mesin pencari Google dan kartu sosial media (Open Graph).
- **Contoh Nilai**: `Portal informasi, artikel mendalam, dan berita teknologi terkini.`

---

## 2. Keamanan Autentikasi

### `JWT_SECRET`
- **Fungsi**: Kunci rahasia enkripsi token sesi login admin/penulis agar tidak bisa dipalsukan oleh pihak luar.
- **Cara Membuat**:
  1. Anda bisa membuat kombinasi karakter acak sepanjang 32 hingga 64 karakter.
  2. **Cara Otomatis**: Buka browser ke website generator aman seperti:
     - [RandomKeygen (Bagian Fort Knox Passwords)](https://randomkeygen.com/)
     - Atau jalankan perintah terminal:
       ```bash
       openssl rand -hex 32
       ```
  3. **Contoh Nilai**: `8f4b62d1a3c5e79021bcdef4567890abcdef1234567890abcdef12345678`

### `ADMIN_EMERGENCY_KEY`
- **Fungsi**: Kunci darurat rahasia (**Emergency Master Key**). Jika Cloudflare Turnstile bermasalah, database terkunci, atau lupa password, kunci ini memungkinkan Anda masuk ke portal admin dengan memasukkan key ini di kolom "Kunci Pemulihan Darurat / Emergency Key".
- **Cara Membuat**: Buat kata sandi yang sangat kuat, unik, dan simpan di tempat aman (misalnya di Password Manager seperti Bitwarden/1Password).
- **Contoh Nilai**: `KunciDaruratSuperAman_2026!#xYz`

---

## 3. Cloudflare Turnstile

Cloudflare Turnstile adalah proteksi anti-bot / anti-brute-force gratis dan ramah pengunjung (tanpa teka-teki gambar yang menjengkelkan).

### Dua Kunci Turnstile yang Dibutuhkan:
1. **Site Key (Kunci Publik Frontend)**: Ditampilkan di browser pengunjung untuk memunculkan widget validasi Turnstile.
2. **Secret Key (Kunci Rahasia Backend)**: Disimpan di Environment Variables Cloudflare Pages untuk verifikasi token ke server Cloudflare.

### `TURNSTILE_SECRET_KEY`
- **URL Pendaftaran**: [https://dash.cloudflare.com/](https://dash.cloudflare.com/)
- **Langkah Mendapatkannya**:
  1. Login ke **Cloudflare Dashboard**.
  2. Pada menu bilah samping (sidebar) sebelah kiri, klik **Turnstile**.
  3. Klik tombol **Add site** (Tambah Situs).
  4. Masukkan informasi:
     - **Site name**: Nama web Anda (misal: `My CMS Site`).
     - **Domain**: Masukkan domain Anda (misal: `namadomainanda.com` atau `*.pages.dev` jika masih tahap preview/staging, serta `localhost` untuk pengujian lokal).
     - **Widget Mode**: Pilih **Managed** (disarankan) atau **Non-interactive**.
  5. Klik **Create**.
  6. Cloudflare akan menampilkan dua kunci:
     - **Site Key**: Kunci publik untuk frontend (lihat cara memasangnya di bawah).
     - **Secret Key**: Ini yang diisikan ke variabel `TURNSTILE_SECRET_KEY` (Encrypt) di Settings > Environment Variables Cloudflare Pages.
- **Format Nilai**: Biasanya berawalan `0x4AAAAAA...`

---

### ⚡ PROSEDUR STANDAR: Cara Memasang Turnstile Site Key Saat Install di Domain Baru
Agar tidak mengalami kendala *Turnstile Error / Domain Not Authorized* saat memasang di domain baru, Anda dapat langsung mengisinya ke database Cloudflare D1:

#### Cara 1: Lewat Cloudflare Dashboard (Paling Mudah)
1. Buka **Cloudflare Dashboard** > **Workers & Pages** > **D1**.
2. Pilih database D1 proyek Anda > klik tab **Console**.
3. Jalankan query SQL berikut:
   ```sql
   INSERT OR REPLACE INTO configs (key, value) 
   VALUES ('turnstile_site_key', '0x4AAAAAA_SITE_KEY_DOMAIN_BARU_ANDA');
   ```
4. Selesai! Saat halaman web dibuka, widget Turnstile langsung aktif dan mengenali Site Key domain baru Anda.

#### Cara 2: Lewat Terminal (Wrangler CLI)
```bash
npx wrangler d1 execute <NAMA_DATABASE_D1> --command="INSERT OR REPLACE INTO configs (key, value) VALUES ('turnstile_site_key', '0x4AAAAAA_SITE_KEY_DOMAIN_BARU_ANDA');" --remote
```

#### Cara 3: Masuk ke Portal Admin Menggunakan Kunci Darurat
Jika belum disetel di database, Anda tetap bisa masuk ke portal admin dengan mengklik **"Gunakan Kunci Darurat"** pada form login admin, masukkan kunci darurat bawaan: `darurat123` (atau nilai variabel `ADMIN_EMERGENCY_KEY`). Setelah berhasil masuk, buka menu **Pengaturan Situs** > isi kolom **Turnstile Site Key** > Simpan.

---

---

## 4. GitHub Integration

Digunakan agar setiap kali Anda mempublikasikan artikel atau mengubah pengaturan, CMS secara otomatis melakukan sinkronisasi file cadangan (`public/feed.xml`, `public/sitemap.xml`, `public/llms.txt`, dan data JSON) langsung ke repositori GitHub Anda.

### `GITHUB_TOKEN`
- **URL Pembuatan Token**: [https://github.com/settings/tokens](https://github.com/settings/tokens)
- **Langkah Mendapatkannya**:
  1. Login ke akun GitHub Anda.
  2. Buka menu **Settings** > scroll ke paling bawah sidebar kiri, pilih **Developer settings**.
  3. Klik **Personal access tokens** > pilih **Tokens (classic)**.
  4. Klik tombol **Generate new token** > **Generate new token (classic)**.
  5. Berikan nama di kolom **Note**, misalnya: `Cloudflare Pages CMS Sync`.
  6. Pilih **Expiration**: Disarankan pilih `No expiration` atau sesuaikan kebutuhan.
  7. Pada bagian **Select scopes**, centang kotak:
     - ✅ **`repo`** (Full control of private repositories - mencakup `repo:status`, `repo_deployment`, `public_repo`, dll.).
  8. Scroll ke bawah dan klik tombol hijau **Generate token**.
  9. **Salin token yang muncul segera** (berawalan `ghp_...`). Token ini hanya muncul sekali!

### `GITHUB_OWNER`
- **Fungsi**: Username akun GitHub Anda (atau nama Organisasi).
- **Contoh**: Jika URL profil Anda adalah `https://github.com/budi-santoso`, maka nilai `GITHUB_OWNER` adalah: `budi-santoso`.

### `GITHUB_REPO`
- **Fungsi**: Nama repositori GitHub tempat kode ini berada.
- **Contoh**: Jika URL repositori Anda adalah `https://github.com/budi-santoso/portal-berita-cms`, maka nilai `GITHUB_REPO` adalah: `portal-berita-cms`.

### `GITHUB_BRANCH`
- **Fungsi**: Nama cabang (branch) utama repositori Anda.
- **Nilai Standar**: `main` (atau `master` tergantung branch default repositori Anda).

---

## 5. Google Gemini AI

Digunakan oleh fitur AI CMS untuk menghasilkan judul SEO otomatis, meta description, analisis konten, tag otomatis, dan ringkasan artikel.

### `GEMINI_API_KEY`
- **URL Pembuatan Key**: [https://aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey)
- **Langkah Mendapatkannya**:
  1. Masuk menggunakan akun Google Anda ke [Google AI Studio](https://aistudio.google.com/).
  2. Klik tombol **Get API key** atau **Create API key**.
  3. Pilih proyek Google Cloud yang ada atau klik **Create API key in new project**.
  4. Salin kode API Key yang diberikan (berawalan `AIzaSy...`).
- **Biaya**: Google menyediakan kuota gratis (Free Tier) yang sangat cukup untuk kebutuhan blog harian.

---

## 6. Cloudinary Media Storage

Digunakan untuk kompresi otomatis gambar ke format WebP modern, manipulasi resolusi responsif, dan CDN pengiriman gambar cepat. *(Opsional, jika tidak diisi sistem otomatis menggunakan penyimpanan media lokal/GitHub).*

### Kredensial Cloudinary:
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`
- `CLOUDINARY_FOLDER`

### Langkah Mendapatkannya:
1. Buka [https://cloudinary.com/users/register_free](https://cloudinary.com/users/register_free) dan buat akun gratis.
2. Setelah login, buka **Dashboard / Console**: [https://console.cloudinary.com/](https://console.cloudinary.com/)
3. Di halaman beranda Dashboard (bagian **Product Environment Credentials**):
   - **Cloud Name**: Salin teks di kolom *Cloud name*. Masukkan ke `CLOUDINARY_CLOUD_NAME`.
   - **API Key**: Salin teks di kolom *API Key*. Masukkan ke `CLOUDINARY_API_KEY`.
   - **API Secret**: Klik tombol mata/copy pada kolom *API Secret*. Masukkan ke `CLOUDINARY_API_SECRET`.
4. Untuk `CLOUDINARY_FOLDER`:
   - Isi dengan nama folder penyimpanan Anda, misalnya: `cms-uploads` atau `media-blog`.

---

## 7. Cara Memasang di Cloudflare Pages

Saat Anda mendeploy aplikasi ke Cloudflare Pages, masukkan nilai-nilai di atas dengan cara berikut:

1. Buka **[Cloudflare Dashboard](https://dash.cloudflare.com/)**.
2. Di menu kiri, pilih **Workers & Pages**.
3. Klik nama project Cloudflare Pages Anda.
4. Masuk ke tab **Settings** > pilih submenu **Environment variables**.
5. Klik **Add variables**:
   - Untuk variabel publik/konfigurasi biasa (`SITE_URL`, `SITE_NAME`, `SITE_DESCRIPTION`, `GITHUB_OWNER`, `GITHUB_REPO`, `GITHUB_BRANCH`, `CLOUDINARY_FOLDER`), masukkan sebagai variabel biasa (**Plain text**).
   - Untuk data sensitif (**Sangat Disarankan di-Encrypt sebagai Secret**):
     - `GITHUB_TOKEN` ➔ Pilih **Encrypt**
     - `JWT_SECRET` ➔ Pilih **Encrypt**
     - `ADMIN_EMERGENCY_KEY` ➔ Pilih **Encrypt**
     - `TURNSTILE_SECRET_KEY` ➔ Pilih **Encrypt**
     - `GEMINI_API_KEY` ➔ Pilih **Encrypt**
     - `CLOUDINARY_API_KEY` ➔ Pilih **Encrypt**
     - `CLOUDINARY_API_SECRET` ➔ Pilih **Encrypt**
6. Klik **Save**.
7. **Penting**: Setelah menyimpan variabel lingkungan baru, lakukan **Redeploy** pada deployment terakhir Anda di tab **Deployments** agar nilai environment variables yang baru aktif sepenuhnya pada runtime Worker Functions.

---

## 🔒 Ringkasan File `.env` untuk Uji Coba Lokal

Jika Anda menjalankan aplikasi di komputer lokal (Development mode), buat file bernama `.env` di folder utama proyek (sejajar dengan `.env.example`) dan isi seperti format berikut:

```env
# Identitas Web
SITE_URL=http://localhost:3000
SITE_NAME=Portal Berita Saya
SITE_DESCRIPTION=Platform publikasi konten independen.

# Keamanan Sesi & Pemulihan
JWT_SECRET=buat_kombinasi_acak_panjang_minimal_32_karakter
ADMIN_EMERGENCY_KEY=kunci_darurat_rahasia_anda_123

# Cloudflare Turnstile
TURNSTILE_SECRET_KEY=0x4AAAAAA...

# Sinkronisasi GitHub
GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxx
GITHUB_OWNER=username_github_anda
GITHUB_REPO=nama_repo_anda
GITHUB_BRANCH=main

# AI Asisten
GEMINI_API_KEY=AIzaSy...

# Cloudinary (Opsional)
CLOUDINARY_CLOUD_NAME=nama_cloud_anda
CLOUDINARY_API_KEY=123456789012345
CLOUDINARY_API_SECRET=abcdefghijklmnopqrstuvwxyz123
CLOUDINARY_FOLDER=cms-uploads
```

> ⚠️ **Peringatan Keamanan**: Jangan pernah membagikan atau mengunggah (commit) file `.env` asli yang berisi token/kunci rahasia Anda ke repositori publik GitHub. File `.env` telah didaftarkan di `.gitignore` untuk mencegah kebocoran secara tidak sengaja.
