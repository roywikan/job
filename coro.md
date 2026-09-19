# Panduan Operasional, Skema Database D1, dan Kredensial CMS (coro.md)

Dokumen ini adalah dokumen rahasia dan panduan utama pengoperasian sistem, instalasi Cloudflare Pages, Cloudflare D1 SQLite, konfigurasi keamanan, dan kredensial default.

---

## 1. Kredensial Bawaan (Default Login CMS)

Saat pertama kali menginstal atau mendeploy CMS ke domain baru:

| Peran (Role) | Email / Username | Password | Keterangan |
|---|---|---|---|
| **Administrator** | `admin@domain.com` atau `admin` | `admin123` | Akses penuh seluruh portal CMS, konfigurasi, backup, dan manajemen pengguna |
| **Editor** | `editor@domain.com` atau `editor` | `editor123` | Moderasi konten, kurasi artikel, surat pembaca, dan iklan baris |
| **Penulis** | `penulis@domain.com` atau `penulis` | `writer123` | Pembuatan dan pengajuan draf artikel |

### Kunci Darurat (Emergency Recovery Key)
- **Kunci Bawaan:** `darurat123`
- **Konfigurasi Lingkungan (Opsional):** Variabel `ADMIN_EMERGENCY_KEY` di Cloudflare Pages Dashboard.
- **Fungsi:** Memungkinkan administrator masuk ke portal CMS tanpa verifikasi Turnstile jika widget Turnstile gagal memuat, terkunci, atau belum didaftarkan untuk domain baru.

---

## 2. Prosedur Standar Instalasi ke Domain Baru: Konfigurasi Turnstile

Ketika Anda memasang CMS ini pada domain baru, Cloudflare Turnstile mewajibkan pendaftaran domain pada widget. Jika domain baru belum terhubung dengan Site Key yang valid, widget Turnstile akan menolak memuat (`Domain is not authorized`).

Tersedia **2 Metode Standar** untuk mengatasi hal ini dengan sangat mudah:

### Metode 1: Set Langsung di Database D1 (Rekomendasi Utama & Paling Praktis)
Metode ini adalah cara paling bersih saat instalasi awal baru:
1. Buka **Cloudflare Dashboard** > **Workers & Pages** > **D1**.
2. Pilih database D1 proyek Anda > klik tab **Console**.
3. Jalankan query SQL berikut (ganti dengan Site Key widget Turnstile domain baru Anda):
   ```sql
   INSERT OR REPLACE INTO configs (key, value) 
   VALUES ('turnstile_site_key', '0x4AAAAAA_SITE_KEY_DOMAIN_BARU_ANDA');
   ```
   *Atau melalui Wrangler CLI di terminal komputer Anda:*
   ```bash
   npx wrangler d1 execute <NAMA_DATABASE_D1> --command="INSERT OR REPLACE INTO configs (key, value) VALUES ('turnstile_site_key', '0x4AAAAAA_SITE_KEY_DOMAIN_BARU_ANDA');" --remote
   ```
4. Selesai! Saat website dan halaman login diakses, widget Turnstile langsung valid dan berfungsi normal tanpa perlu kunci darurat.

---

### Metode 2: Masuk Menggunakan Kunci Darurat (Emergency Recovery Key)
Jika Anda belum sempat menyetel database D1:
1. Akses portal admin (`/admin-[suffix]`).
2. Klik tombol **"Turnstile error pada domain baru? Gunakan Kunci Darurat"** atau klik **"Isi Bawaan"**.
3. Kunci darurat default adalah: `darurat123` (atau sesuai nilai `ADMIN_EMERGENCY_KEY` di Environment Variables Cloudflare Pages).
4. Masukkan Email: `admin@domain.com` (atau `admin`) dan Password: `admin123`.
5. Klik **Masuk Portal CMS**.
6. Setelah masuk, buka menu **Pengaturan Situs** > ganti kolom **Turnstile Site Key** dengan kunci baru > klik **Simpan Pengaturan**. Sistem akan otomatis menyimpan nilai tersebut ke tabel `configs` database D1.

---

### Pendaftaran Domain di Cloudflare Dashboard
Agar Site Key dan Secret Key berfungsi secara penuh:
1. Buka Cloudflare Dashboard > **Turnstile**.
2. Pilih Widget Anda > **Settings** > bagian **Domains**.
3. Daftarkan domain baru Anda (misal: `domainbaru.com` dan `*.pages.dev` serta `localhost` untuk testing lokal).
4. Pastikan variabel lingkungan `TURNSTILE_SECRET_KEY` pada Cloudflare Pages Settings telah diisi dengan Secret Key dari widget tersebut.

---

### Inisialisasi Database D1 Baru (Clean Install)
- Saat membuat D1 baru melalui Cloudflare CLI/Dashboard, eksekusi berkas `schema.sql`:
  ```bash
  npx wrangler d1 execute <NAMA_DATABASE_D1> --file=schema.sql --remote
  ```
- CMS juga dilengkapi sistem **Auto-Seed Otomatis**: Jika tabel `users` kosong atau belum memiliki akun admin, sistem backend Edge secara otomatis membuat akun default `admin@domain.com` (`admin123`) pada request login pertama.

---

## 3. Database Cloudflare D1 (Single Source of Truth)

- **Berkas SSOT:** `schema.sql`
- Seluruh struktur tabel, kolom, tipe data, indeks, dan relasi D1 SQLite berpatokan 100% pada `schema.sql`.
- Setiap penambahan fitur baru yang memerlukan kolom atau tabel baru WAJIB diselaraskan secara konsisten ke dalam `schema.sql`.

---

## 4. Keamanan Sistem (Security First)

1. **Anti Brute Force:**
   - Pembatasan 5 kali percobaan login gagal per alamat IP.
   - Jika gagal 5 kali berturut-turut, alamat IP diblokir selama 15 menit.
2. **Decoy Admin Portal:**
   - Path standar `/admin` menghasilkan respons **404 Not Found** tanpa pengalihan (decoy murni).
   - Akses admin portal yang sah menggunakan URL `/admin-[suffix]` yang dikonfigurasi pada sistem.
3. **Stateless JWT Session:**
   - Sesi login diverifikasi menggunakan HMAC-SHA256 stateless token (disimpan dalam HttpOnly cookie dan Bearer header).
4. **Anti XSS & Sanitasi:**
   - Seluruh input artikel, komentar, surat pembaca, dan iklan baris disanitasi secara ketat.

---

## 5. Niche Agnostic Architecture

CMS ini dibangun tanpa keterikatan pada topik tertentu (*Niche Agnostic*):
- Seluruh judul situs, deskripsi, meta tags, schema JSON-LD, RSS feed, sitemap, dan kategori bersifat dinamis dari tabel `configs`.
- Dilarang meng-hardcode branding atau topik statis pada antarmuka pengguna maupun output Googlebot/mesin pencari.

---

## 6. Pemecahan Masalah Login Admin Default & Turnstile di Domain Baru

### Masalah: "Turnstile sudah centang hijau, tapi tetap tidak bisa login dengan email dan password bawaan"

Jika Turnstile di layar sudah centang hijau (lolos validasi frontend) namun saat menekan tombol login muncul error atau ditolak, berikut adalah penyebab dan solusinya:

#### 1. Turnstile Secret Key di Backend Belum Sinkron (Penyebab Utama)
- **Penyebab:** Widget di layar browser diverifikasi menggunakan **Site Key** publik. Namun ketika tombol login diklik, server Cloudflare Pages mengirim token tersebut ke API Cloudflare menggunakan **Secret Key** (`TURNSTILE_SECRET_KEY`). Jika Secret Key di Cloudflare Pages belum diperbarui untuk widget domain baru tersebut, server Cloudflare akan menolak token tersebut.
- **Solusi Instan:**
  - Buka opsi darurat pada form login: masukkan Kunci Darurat bawaan: `darurat123` (atau klik tombol **"Isi Bawaan"**). Kunci darurat akan mem-bypass pemeriksaan Turnstile server secara aman.
  - Atau masukkan Secret Key langsung ke tabel `configs` database D1 (tanpa perlu deploy ulang Cloudflare Pages):
    ```sql
    INSERT OR REPLACE INTO configs (key, value) VALUES ('turnstile_secret_key', '0x4AAAAAA_SECRET_KEY_DOMAIN_BARU_ANDA');
    ```

#### 2. Akun Terkunci Sementara oleh Anti Brute Force (5x Percobaan Gagal)
- **Penyebab:** Jika Anda telah mencoba login lebih dari 5 kali (misalnya karena salah password atau Turnstile gagal), IP Anda otomatis diblokir selama 15 menit demi keamanan website.
- **Solusi:**
  - Gunakan Kunci Darurat `darurat123` di form login (Kunci Darurat otomatis membuka kunci blokir brute force untuk IP Anda).
  - Atau reset tabel brute force langsung di Cloudflare D1 Console:
    ```sql
    DELETE FROM login_attempts;
    ```

#### 3. Format Kredensial Bawaan Installer
- **Email / Username:** `admin@domain.com` (atau cukup ketik `admin`)
- **Password:** `admin123` (huruf kecil semua, tanpa spasi). *Catatan: Jangan gunakan password `admin` saja.*
- **Kunci Darurat:** `darurat123`
- **Tombol Cepat:** Di halaman login admin, terdapat tombol instan: `admin@domain.com / admin123 + darurat123 (Isi Otomatis)`. Cukup klik tombol tersebut, lalu klik **Masuk Portal CMS**. Sistem akan otomatis mem-bypass kendala Turnstile dan rate-limit serta membuka dashboard seketika.

#### 4. Reset Kredensial Admin Langsung via D1 Console
Jika tabel `users` di D1 baru belum terisi atau password-nya tidak sesuai, jalankan query berikut di **Cloudflare Dashboard > Workers & Pages > D1 > Database Anda > Console**:
```sql
DELETE FROM login_attempts;
INSERT OR REPLACE INTO users (id, email, password, password_hash, name, role, title, created_at)
VALUES (1, 'admin@domain.com', 'admin123', 'admin123', 'Admin', 'admin', 'Administrator Utama', datetime('now'));
```
Setelah query berhasil dijalankan, login kembali dengan email `admin@domain.com` dan password `admin123`.

---

## 7. Fitur Mode Toleran Turnstile (Graceful Fallback) & Pengaturannya

### Apa itu Graceful Fallback Turnstile?
Saat instalasi atau migrasi ke domain baru, seringkali administrator telah memasang Site Key di frontend namun lupa atau belum sempat memasang `TURNSTILE_SECRET_KEY` di backend / Cloudflare Pages Settings. Tanpa Secret Key yang cocok, server Cloudflare akan mengembalikan error `invalid-input-secret` dan memblokir login admin.

Untuk mengatasi hal tersebut, CMS dilengkapi fitur **Mode Toleran (Graceful Fallback)**:
- **Saat Mode Toleran Aktif (`true` - Bawaan):** Backend mengenali domain baru dan tidak akan memblokir login jika pengunjung/admin telah berhasil menyelesaikan tantangan Turnstile di browser frontend (menghasilkan token resmi dari Cloudflare), meskipun Secret Key di backend belum sempat disinkronkan.
- **Saat Mode Ketat Aktif (`false` - Strict Production):** Backend mewajibkan verifikasi Cloudflare `siteverify` berhasil 100% dengan Secret Key yang cocok. Jika Secret Key salah, tidak disetel, atau token ditolak, login akan diblokir total demi keamanan maksimal dari bot & serangan terdistribusi.

### Cara Mengaktifkan dan Menonaktifkan Fitur Ini

Tersedia **2 Metode** yang sangat fleksibel:

#### Metode A: Melalui Portal Admin (GUI Tanpa Koding)
1. Masuk ke Portal Admin (`/admin-[suffix]`).
2. Masuk ke tab **⚙️ Configs Situs** atau tab **🔐 Akun Admin**.
3. Cari bagian **Cloudflare Turnstile & Mode Keamanan Login**.
4. Di sana terdapat toggle: **"Aktifkan Mode Toleran (Graceful Fallback Turnstile)"**:
   - Centang kotak untuk mengaktifkan **Mode Toleran** (direkomendasikan saat migrasi domain).
   - Hilangkan centang untuk mengaktifkan **Mode Ketat Maksimal (Strict)** (sangat direkomendasikan setelah website live di produksi dan Secret Key sudah dipasang).
5. Masukkan pula **Turnstile Secret Key** pada kolom yang tersedia jika Anda ingin menyimpannya langsung ke database D1 tanpa deploy ulang.
6. Klik **Simpan Pengaturan** / **Terapkan Mode**.

#### Metode B: Langsung dari Cloudflare D1 Console (SQL)
Anda juga dapat mengubah mode kapan saja langsung dari **Cloudflare Dashboard > Workers & Pages > D1 > Console**:

- **Mengaktifkan Mode Toleran (Fallback ON - Setup & Migrasi):**
  ```sql
  INSERT OR REPLACE INTO configs (key, value) VALUES ('enable_turnstile_fallback', 'true');
  ```

- **Mengaktifkan Mode Ketat Maksimal (Fallback OFF - Keamanan Penuh Produksi):**
  ```sql
  INSERT OR REPLACE INTO configs (key, value) VALUES ('enable_turnstile_fallback', 'false');
  ```

- **Memeriksa Status Saat Ini di D1:**
  ```sql
  SELECT key, value FROM configs WHERE key IN ('enable_turnstile_fallback', 'turnstile_site_key', 'turnstile_secret_key');
  ```

### Rekomendasi Alur Keamanan (Best Practice)
1. **Fase Instalasi / Migrasi Domain:** Biarkan Mode Toleran aktif (`enable_turnstile_fallback: true`) agar admin dapat masuk dengan mudah ke dashboard.
2. **Fase Konfigurasi:** Daftarkan domain di Cloudflare Turnstile, pasang Site Key & Secret Key di Portal Admin atau di Cloudflare Pages.
3. **Fase Hardening Produksi:** Setelah admin berhasil login dan Turnstile terbukti berjalan dengan key resmi, **nonaktifkan Mode Toleran** menjadi **Mode Ketat**. Dengan demikian, proteksi website terhadap bot otomatis dan brute force mencapai standar keamanan level tertinggi (Defense in Depth).

---

## 8. Panduan Lengkap Instalasi ke Akun Baru (Cloudflare + GitHub + Cloudinary + Domain Baru) Tanpa Terhalang Keamanan

Panduan ini disusun secara berurutan, praktis, dan anti-gagal agar Anda dapat menginstal seluruh CMS ini dari nol pada **akun Cloudflare baru, GitHub baru, Cloudinary baru, dan domain baru** tanpa menemui kesulitan atau terhalang proteksi keamanan pada login pertama.

---

### A. Persyaratan Infrastruktur & Daftar Lengkap Variabel Lingkungan (Env Vars)

Sistem CMS ini menggunakan infrastruktur serverless modern:
1. **Cloudflare Pages:** Hosting frontend (React + Tailwind + Vite) dan backend serverless edge functions (`functions/api/[[path]].ts`).
2. **Cloudflare D1 Database:** Database serverless SQLite terdistribusi global yang super cepat dan hemat biaya.
3. **GitHub:** Repositori kode sumber & pipeline CI/CD otomatis ke Cloudflare Pages, serta sinkronisasi backup artikel.
4. **Cloudinary:** Media cloud storage gratis untuk kompresi dan hosting gambar artikel/banner WebP otomatis.
5. **Google Gemini AI (Opsional):** Integrasi AI Writer & generator meta SEO otomatis.

#### Tabel Variabel Lingkungan (Environment Variables)
Seluruh variabel lingkungan ini dimasukkan ke **Cloudflare Pages > Settings > Environment Variables**:

| Nama Variabel | Wajib / Opsional | Fungsi & Deskripsi | Contoh Nilai |
|---|---|---|---|
| `SITE_URL` | **Wajib** | URL kanonikal domain utama Anda (tanpa garis miring di akhir) | `https://domainanda.com` |
| `SITE_NAME` | **Wajib** | Nama publik situs atau portal web Anda | `Portal Berita Modern` |
| `SITE_DESCRIPTION` | **Wajib** | Deskripsi singkat situs untuk meta SEO | `Portal informasi berita dan artikel terkini.` |
| `JWT_SECRET` | **Wajib** | Kunci acak rahasia untuk tanda tangan stateless session admin | `kunci-rahasia-jwt-acak-panjang-9988` |
| `ADMIN_EMERGENCY_KEY` | Opsional | Kunci darurat bypass Turnstile/blokir brute-force (default: `darurat123`) | `darurat123` |
| `TURNSTILE_SECRET_KEY` | Direkomendasikan | Secret Key dari widget Cloudflare Turnstile domain Anda | `0x4AAAAAA...` |
| `CLOUDINARY_CLOUD_NAME` | **Wajib (untuk upload gambar)** | Nama Cloud akun Cloudinary Anda | `contoh-cloud-name` |
| `CLOUDINARY_API_KEY` | **Wajib (untuk upload gambar)** | API Key akun Cloudinary Anda | `123456789012345` |
| `CLOUDINARY_API_SECRET` | **Wajib (untuk upload gambar)** | API Secret akun Cloudinary Anda | `AbCdEfGhIjKlMnOpQrStUvWxYz` |
| `CLOUDINARY_FOLDER` | Opsional | Nama folder penyimpanan gambar di Cloudinary (default: `blog-assets`) | `blog-assets` |
| `GITHUB_TOKEN` | Opsional (untuk backup) | Personal Access Token (PAT) GitHub dengan izin `repo` | `ghp_xxxxxxxxxxxxxxxxxxxx` |
| `GITHUB_OWNER` | Opsional (untuk backup) | Username atau nama organisasi GitHub Anda | `username-github` |
| `GITHUB_REPO` | Opsional (untuk backup) | Nama repositori GitHub proyek ini | `my-blog-cms` |
| `GITHUB_BRANCH` | Opsional (untuk backup) | Branch utama repositori (default: `main`) | `main` |
| `GEMINI_API_KEY` | Opsional | API Key Google Gemini untuk fitur AI Writer / Generator SEO | `AIzaSy...` |
| `NODE_VERSION` | **Wajib (pada Build Vars)** | Menjamin Cloudflare Pages menggunakan Node.js versi modern | `20` |

---

### Langkah 1: Pengaturan Akun & Repositori GitHub Baru

1. **Buat Repositori Baru:**
   - Masuk ke akun GitHub baru Anda (https://github.com).
   - Klik **New Repository**.
   - Berikan nama repositori, misalnya `portal-cms-prod`.
   - Pilih visibilitas **Private** (sangat direkomendasikan agar konfigurasi Anda terlindungi) atau **Public**.
   - Klik **Create repository**.
2. **Push Kode Sumber ke GitHub:**
   - Di komputer lokal Anda pada folder proyek ini, jalankan perintah:
     ```bash
     git init
     git add .
     git commit -m "Initial release modern edge CMS"
     git branch -M main
     git remote add origin https://github.com/USERNAME-ANDA/portal-cms-prod.git
     git push -u origin main
     ```
3. **(Opsional tapi Disarankan) Buat GitHub Personal Access Token (PAT):**
   - Di GitHub, klik foto profil Anda di kanan atas > **Settings**.
   - Gulir ke bawah di menu kiri > klik **Developer settings** > **Personal access tokens** > **Tokens (classic)**.
   - Klik **Generate new token (classic)**.
   - Note: `Backup Sinkronisasi CMS`.
   - Expiration: Pilih durasi (misal: `No expiration` atau `90 days`).
   - Centang izin: **`repo`** (Full control of private repositories).
   - Klik **Generate token**, lalu **salin token** yang diawali `ghp_...` (Token ini nantinya dimasukkan ke variabel `GITHUB_TOKEN`).

---

### Langkah 2: Pengaturan Akun Media Cloudinary Baru

Cloudinary bertindak sebagai CDN penyimpanan gambar agar website Anda tidak membebani limit database D1 dan loading gambar sangat cepat (format WebP/AVIF otomatis).

1. **Daftar Akun Gratis:**
   - Kunjungi https://cloudinary.com dan klik **Sign Up for Free**.
2. **Dapatkan Kredensial API:**
   - Setelah masuk ke Cloudinary Dashboard, lihat kartu **Product Environment Credentials**:
     - **Cloud Name**: Salin nilai ini (contoh: `dx8abcdef`).
     - **API Key**: Salin nilai ini (contoh: `987654321012345`).
     - **API Secret**: Klik tombol mata/copy untuk melihat dan menyalin API Secret Anda.
3. **Simpan Kredensial:**
   - Kredensial ini yang akan dimasukkan ke `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, dan `CLOUDINARY_API_SECRET`.
   - Tentukan nama folder rapi pada `CLOUDINARY_FOLDER`, misalnya `blog-media`.

---

### Langkah 3: Pengaturan Cloudflare Baru (Domain, D1 Database, & Turnstile)

1. **Tambahkan Domain Anda ke Cloudflare:**
   - Masuk ke dashboard Cloudflare (https://dash.cloudflare.com).
   - Klik **Add a domain** / **Add site**.
   - Masukkan domain baru Anda (misal: `domainanda.com`).
   - Pilih paket **Free** (Rp 0).
   - Cloudflare akan memindai DNS record yang ada. Klik **Continue**.
   - Cloudflare akan memberikan 2 Name Server (misal: `alice.ns.cloudflare.com` dan `bob.ns.cloudflare.com`).
   - Buka panel registrar tempat Anda membeli domain (misal: Namecheap, Niagahoster, Domainesia, GoDaddy, dll), ubah Name Server ke 2 Name Server Cloudflare tersebut.
   - Tunggu hingga domain berstatus **Active** di Cloudflare (biasanya 5–15 menit).

2. **Buat Database Cloudflare D1 Baru & Eksekusi Skema (SSOT):**
   - Di menu sebelah kiri Cloudflare Dashboard, klik **Workers & Pages** > **D1 SQL Database**.
   - Klik tombol **Create database**.
   - Berikan nama database, misalnya: `d1-blog-prod`.
   - Pilih lokasi terdekat (misal: `APAC - Asia Pacific` atau biarkan default). Klik **Create**.
   - Setelah database terbuat, klik database tersebut lalu buka tab **Console**.
   - Buka berkas `schema.sql` pada proyek ini, salin (copy) seluruh isi teks SQL dari baris pertama hingga terakhir.
   - Tempelkan (paste) ke dalam kotak input **Console** D1, lalu klik **Execute**.
   - *Hasil:* Seluruh tabel (`configs`, `posts`, `users`, `categories`, `comments`, `autolinks`, `login_attempts`, dll) beserta akun admin bawaan langsung terinisialisasi secara sempurna!

3. **Buat Widget Cloudflare Turnstile:**
   - Di menu sebelah kiri Cloudflare Dashboard, klik **Turnstile**.
   - Klik **Add widget**.
   - **Widget name:** Masukkan nama bebas (misal: `Turnstile Portal CMS`).
   - **Domains:** Masukkan:
     - Domain utama Anda: `domainanda.com`
     - Subdomain Cloudflare Pages: `*.pages.dev`
     - Lokal untuk testing: `localhost`
   - **Widget Mode:** Pilih **Managed** (rekomendasi, interaktif hanya jika dicurigai bot).
   - Klik **Create**.
   - Anda akan mendapatkan dua kunci:
     - **Site Key** (dimulai dengan `0x4AAAAAA...`): Ini adalah kunci publik.
     - **Secret Key** (dimulai dengan `0x4AAAAAA...`): Ini adalah kunci rahasia backend (`TURNSTILE_SECRET_KEY`).

4. **(Opsional tapi Praktis) Pasang Site Key Turnstile ke D1:**
   - Kembali ke **Workers & Pages** > **D1** > `d1-blog-prod` > tab **Console**.
   - Jalankan query berikut dengan mengganti Site Key baru Anda:
     ```sql
     INSERT OR REPLACE INTO configs (key, value) VALUES ('turnstile_site_key', '0x4AAAAAA_SITE_KEY_ANDA_DI_SINI');
     ```

---

### Langkah 4: Deploy ke Cloudflare Pages & Konfigurasi Binding

1. **Hubungkan Repositori GitHub ke Cloudflare Pages:**
   - Di menu kiri Cloudflare Dashboard, klik **Workers & Pages** > **Create application**.
   - Pilih tab **Pages** > klik **Connect to Git**.
   - Berikan otorisasi akun GitHub baru Anda, lalu pilih repositori `portal-cms-prod`.
   - Klik **Begin setup**.

2. **Pengaturan Build (Build Settings):**
   - **Project name:** Berikan nama project (misal: `portal-cms-prod`).
   - **Production branch:** `main`
   - **Framework preset:** Pilih **None** (atau **Vite**).
   - **Build command:**
     ```bash
     npm run build
     ```
   - **Build output directory:**
     ```bash
     dist
     ```
   - **Environment variables (Advanced):**
     - Klik **Add variable** dan tambahkan:
       - Variabel: `NODE_VERSION`
       - Nilai: `20`
   - Klik **Save and Deploy**. Tunggu hingga proses build awal selesai (status hijau sukses).

3. **Wajib: Hubungkan Binding Database D1 (`DB`):**
   - Setelah deploy selesai, buka proyek Pages Anda > masuk ke tab **Settings** > **Functions**.
   - Gulir ke bawah ke bagian **D1 database bindings**.
   - Klik **Add binding**.
   - **Variable name:** Wajib diisi persis huruf kapital: **`DB`**
   - **D1 database:** Pilih database yang tadi Anda buat (`d1-blog-prod`).
   - Klik **Save**.

4. **Wajib: Masukkan Variabel Lingkungan di Cloudflare Pages:**
   - Buka tab **Settings** > **Environment variables**.
   - Di bagian **Production**, klik **Add variables** lalu masukkan:
     - `SITE_URL` = `https://domainanda.com`
     - `SITE_NAME` = `Nama Portal Berita Anda`
     - `SITE_DESCRIPTION` = `Deskripsi singkat situs Anda.`
     - `JWT_SECRET` = `kunci-rahasia-acak-minimal-32-karakter-bebas`
     - `TURNSTILE_SECRET_KEY` = *Secret Key Turnstile dari Langkah 3*
     - `CLOUDINARY_CLOUD_NAME` = *Cloud Name dari Langkah 2*
     - `CLOUDINARY_API_KEY` = *API Key dari Langkah 2*
     - `CLOUDINARY_API_SECRET` = *API Secret dari Langkah 2*
     - `CLOUDINARY_FOLDER` = `blog-assets`
     - `ADMIN_EMERGENCY_KEY` = `darurat123`
     - `GITHUB_TOKEN` = *Token GitHub dari Langkah 1 (opsional)*
     - `GITHUB_OWNER` = *Username GitHub Anda (opsional)*
     - `GITHUB_REPO` = `portal-cms-prod (opsional)*`
     - `GITHUB_BRANCH` = `main (opsional)*`
     - `GEMINI_API_KEY` = *API Key Gemini (opsional)*
   - Klik **Save**.

5. **Hubungkan Custom Domain (Domain Baru Anda):**
   - Buka tab **Custom domains** pada proyek Cloudflare Pages Anda.
   - Klik **Set up a custom domain**.
   - Masukkan domain utama: `domainanda.com` (dan ulangi untuk `www.domainanda.com` jika diinginkan).
   - Klik **Continue** > **Activate domain**.
   - Cloudflare akan otomatis mengarahkan traffic domain ke Pages dan menerbitkan sertifikat SSL HTTPS aktif dalam beberapa saat.

6. **Lakukan Redeploy Sekali (Agar Binding D1 & Variabel Aktif):**
   - Masuk ke tab **Deployments**.
   - Pada deployment teratas, klik tombol titik tiga `...` di sebelah kanan > klik **Retry deployment** (atau lakukan commit git baru).
   - Langkah ini memastikan kode Edge Functions membaca binding database `DB` dan seluruh variabel lingkungan terbaru.

---

### Langkah 5: Login Pertama Kali Tanpa Terhalang Masalah Keamanan (Zero Friction)

Sistem ini didesain secara khusus agar administrator **tidak pernah terkunci atau gagal login** saat pertama kali instalasi ke domain baru:

#### 1. Gunakan URL Akses yang Benar (Bukan `/admin`!)
- **PERINGATAN KEAMANAN:** URL `/admin` sengaja dibuat sebagai **decoy murni (404 Not Found)** tanpa pengalihan untuk mengecoh hacker dan robot pemindai otomatis.
- **URL Akses yang Asli:** Buka browser dan akses URL portal admin Anda:
  ```text
  https://domainanda.com/admin-9999
  ```
  *(Catatan: Angka `9999` adalah akhiran bawaan / default suffix).*

#### 2. Proteksi Graceful Fallback Turnstile Aktif Otomatis
- Dalam `schema.sql`, pengaturan `enable_turnstile_fallback` disetel bernilai `'true'` secara bawaan.
- Artinya, meskipun Secret Key di backend belum sinkron dengan domain baru, Anda **tetap dapat login** selama tantangan widget Turnstile di browser diselesaikan dengan baik!

#### 3. Masukkan Kredensial Bawaan:
- **Email / Username:** `admin@domain.com` (atau cukup ketik `admin`)
- **Password:** `admin123`
- Klik centang pada widget Turnstile.
- Klik tombol **Masuk Portal CMS**.
- *Jalan Pintas Instan:* Jika widget Turnstile menampilkan pesan error domain pada saat awal, cukup klik tombol cepat di bawah form: **"admin@domain.com / admin123 + darurat123 (Isi Otomatis)"**, lalu klik **Masuk Portal CMS**. Anda akan langsung masuk ke Dashboard dalam 1 detik tanpa terhalang!

---

### Langkah 6: Personalisasi & Penguncian Keamanan Maksimal (Post-Install Hardening)

Setelah Anda berhasil masuk ke Dashboard Admin untuk pertama kali:

1. **Sesuaikan Identitas Situs:**
   - Buka menu **⚙️ Configs Situs**.
   - Ubah Nama Situs, Tagline, Deskripsi, dan Logo sesuai merek/niche Anda.
   - Periksa kolom **Turnstile Site Key**: pastikan terisi dengan Site Key produksi Anda.
2. **Ganti Kredensial Default Admin:**
   - Masuk ke menu **🔐 Akun Admin**.
   - Ganti email `admin@domain.com` dengan email pribadi Anda.
   - Ganti password `admin123` dengan password baru yang kuat.
   - Klik **Simpan Perubahan Akun**.
3. **Ubah Akhiran URL Admin (Opsional tapi Sangat Disarankan):**
   - Pada menu **⚙️ Configs Situs**, Anda dapat mengubah kolom `admin_url_suffix` dari `9999` menjadi angka rahasia Anda sendiri (misal: `7731`).
   - Setelah disimpan, URL login Anda akan berubah otomatis menjadi `https://domainanda.com/admin-7731`.
4. **Kunci Keamanan ke Mode Ketat (Strict Security):**
   - Setelah Turnstile terbukti bekerja normal dengan kunci resmi domain Anda, masuk ke menu **🔐 Akun Admin** atau **⚙️ Configs Situs**.
   - Pada kartu **Cloudflare Turnstile & Mode Keamanan Login**, klik tombol: **"Terapkan Mode Ketat (Nonaktifkan Fallback)"**.
   - Sekarang, sistem proteksi Anti-Bot dan Anti-Brute Force situs Anda telah terkunci 100% pada tingkat keamanan tertinggi (Military-grade Edge Security).

Selesai! Website dan portal admin modern Anda kini telah aktif sepenuhnya, berkecepatan tinggi di jaringan edge Cloudflare global, ramah SEO Googlebot, dan siap mempublikasikan artikel.



