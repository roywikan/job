Worked for 1m 20s
Saya sudah menulis panduan lengkap berbahasa Indonesia di DEPLOY-JOB-WEB-ID.md. Saya juga menambahkan file .env.example berisi dua pengaturan yang diperlukan, dan mengubah .gitignore supaya file itu ikut masuk repo. Panduan ini hanya saya susun berdasarkan kode; aplikasi belum diuji berjalan di job.web.id/atscvresume.

Cara termudah dan paling aman: jalankan aplikasi ini sebagai proyek terpisah, lalu situs utama meneruskan alamat /atscvresume ke sana. Dengan begitu kodenya tidak bentrok dengan situs utama.

Salin kode: masukkan seluruh isi proyek ke folder atscvresume/ di repo job.web.id, kecuali node_modules, .next dan .vercel.

Isi 2 pengaturan (environment variable):

NEXT_PUBLIC_BASE_PATH=/atscvresume
NEXT_PUBLIC_SITE_URL=https://job.web.id
Nilainya dibaca saat build, jadi setiap kali diubah aplikasi harus di-build ulang.

Deploy: di Vercel, buat proyek baru dengan Root Directory atscvresume. Kalau pakai server sendiri, jalankan pnpm build && pnpm start.

Teruskan alamat dari situs utama: buat aturan untuk /atscvresume dan /atscvresume/:path*. Panduan menyediakan contoh siap salin untuk Next.js, vercel.json, Nginx dan Apache. Jangan buang awalan /atscvresume saat meneruskan, karena aplikasi memerlukannya.

Cek setelah online: panduan berisi daftar periksa (halaman tampil lengkap, tombol bahasa, canonical, hreflang, JSON-LD, sitemap) dan tabel solusi untuk masalah yang sering muncul, misalnya CSS tidak tampil atau redirect berulang.

Ada satu hal yang wajar dan bukan error: kalau alamat Vercel dibuka langsung tanpa /atscvresume, hasilnya 404. Alamat yang benar selalu memakai awalan itu, misalnya …vercel.app/atscvresume/en.

Kalau nanti ingin mengganti nama folder, cukup ubah NEXT_PUBLIC_BASE_PATH dan aturan penerusan, lalu deploy ulang. Tidak ada path yang ditulis manual di dalam kode.
