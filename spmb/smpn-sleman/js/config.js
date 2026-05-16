/**
 * config.js - Konfigurasi Global SPMB Sleman Logic System 2026
 * Update tahunan: ganti file ini saja untuk regulasi baru
 * Validasi berdasarkan: SK BUPATI TENTANG JUKNIS SPMB TH 2026
 */

// ✅ LABEL OPTIMISME (untuk auto-calculate berdasarkan NG)
const OPTIMISME_LABEL = {
  14: "😭 Sangat Tidak Yakin",
  13: "😪 Tidak Yakin", 
  12: "😥 Kurang Yakin",
  11: "😐 Lumayan Yakin",
  10: "🙂 Agak Yakin",
  9:  "😊 Yakin",
  8:  "😆 Sangat Yakin"
};

// ✅ JADWAL KEGIATAN PER JALUR (sesuai BAB IV Huruf I Juknis 2026)
const SCHEDULES = {
  // Jalur Prestasi Khusus & Daerah (sama jadwalnya)
  khusus: [
    ["Pengajuan akun", "9–10 Juni 2026", "Online: https://sleman.spmb.id"],
    ["Verifikasi berkas", "9–10 Juni 2026 pukul 08.00–13.00", "Sekolah tujuan pertama"],
    ["Pendaftaran", "9–10 Juni 2026 pukul 08.00–14.00", "Online"],
    ["Pengumuman", "11 Juni 2026 pukul 08.00", "Sekolah"],
    ["Daftar ulang", "11 Juni 2026 pukul 09.00–11.30", "Sekolah penerima"]
  ],
  
  // Jalur Domisili Radius, Afirmasi, Mutasi (sama jadwalnya)
  domisili_radius: [
    ["Pengajuan akun", "17–18 Juni 2026", "Online: https://sleman.spmb.id"],
    ["Verifikasi berkas", "17–18 Juni 2026 pukul 08.00–13.00", "Sekolah tujuan"],
    ["Pendaftaran", "17–18 Juni 2026 pukul 08.00–14.00", "Online"],
    ["Pengumuman", "19 Juni 2026 pukul 08.00", "Sekolah"],
    ["Daftar ulang", "19 Juni 2026 pukul 09.00–11.30", "Sekolah penerima"]
  ],
  
  // Jalur Prestasi Umum
  prestasi: [
    ["Pengajuan akun", "23–24 Juni 2026", "Online: https://sleman.spmb.id"],
    ["Verifikasi berkas", "23–24 Juni 2026 pukul 08.00–13.00", "Sekolah pilihan pertama"],
    ["Pendaftaran", "23–24 Juni 2026 pukul 08.00–14.00", "Online"],
    ["Pengumuman", "25 Juni 2026 pukul 08.00", "Sekolah"],
    ["Daftar ulang", "25 Juni 2026 pukul 09.00–13.00", "Sekolah penerima"]
  ],
  
  // ✅ BARU: Jalur Domisili Wilayah (jadwal berbeda!)
  domisili_wilayah: [
    ["Pengajuan akun", "23–25 Juni 2026", "Online: https://sleman.spmb.id"],
    ["Verifikasi berkas", "23–25 Juni 2026 pukul 08.00–13.00", "Sekolah pilihan pertama"],
    ["Pendaftaran", "23–25 Juni 2026 pukul 08.00–14.00", "Online"],
    ["Pengumuman", "26 Juni 2026 pukul 08.00", "Sekolah"],
    ["Daftar ulang", "26 Juni 2026 pukul 08.00–11.00", "Sekolah penerima"]
  ],
  
  // TKAD untuk siswa luar DIY (wajib untuk jalur Prestasi & Mutasi)
  tkad: [
    ["Pendaftaran TKAD Luar Daerah", "4 Mei – 29 Mei 2026", "Online: https://bit.ly/Daftar-TKAD26"],
    ["Pelaksanaan TKAD Luar Daerah", "3 Juni 2026 pukul 07.00", "SMP Negeri 1 Sleman"],
    ["Pengumuman TKAD Luar Daerah", "5 Juni 2026", "Grup WhatsApp peserta"]
  ]
};

// ✅ TANGGAL PENTING & DEADLINE (BAB IV Juknis 2026)
const IMPORTANT_DATES = {
  // Batas waktu dokumen
  KK_DOMISILI_CUTOFF: "2025-07-01",      // KK untuk jalur Domisili harus terbit ≤ 1 Juli 2025
  SK_MUTASI_CUTOFF: "2025-07-01",         // SK mutasi untuk jalur Mutasi harus terbit ≤ 1 Juli 2025
  SERTIFIKAT_PRESTASI_CUTOFF: "2023-07-01", // Sertifikat prestasi harus terbit ≤ 1 Juli 2023 (3 tahun sebelum)
  
  // Asesmen & TKAD
  ASESMENT_DISABILITAS_START: "2026-05-01",
  ASESMENT_DISABILITAS_END: "2026-05-30",
  TKAD_PENDAFTARAN_START: "2026-05-04",
  TKAD_PENDAFTARAN_END: "2026-05-29",
  TKAD_PELAKSANAAN: "2026-06-03",
  
  // Hari pertama masuk sekolah
  FIRST_DAY_OF_SCHOOL: "2026-07-13"        // Senin, 13 Juli 2026
};

// ✅ KUOTA DAYA TAMPUNG PER JALUR (BAB IV Huruf D Juknis 2026)
const QUOTA = {
  domisili: {
    min_percent: 40,  // Minimal 40% dari daya tampung
    desc: "Domisili Radius + Domisili Wilayah"
  },
  afirmasi: {
    total_percent: 20,
    kkm_percent: 15,           // Keluarga Ekonomi Tidak Mampu
    disabilitas_percent: 5,    // Penyandang Disabilitas
    desc: "KKM dari Dinsos Sleman + Asesmen RSUD Sleman"
  },
  mutasi: {
    max_percent: 5,
    desc: "Mutasi tugas orang tua / Anak guru"
  },
  prestasi: {
    total_max_percent: 35,
    umum: {
      total_percent: 28,
      nik_sleman_percent: 18,   // Minimal 18% untuk NIK Sleman
      nik_luar_sleman_percent: 10  // Maksimal 10% untuk luar Sleman
    },
    khusus: {
      max_percent: 5,
      desc: "Prestasi Tingkat Nasional (OSN, O2SN, KSM, FLS2N, FLSSSN, Lomba Bertutur)"
    },
    daerah: {
      max_percent: 2,
      desc: "Prestasi mewakili Kab. Sleman di PORDA/POPDA/PON/POPNAS"
    }
  }
};

// ✅ ATURAN NILAI & PRESTASI (BAB IV Huruf C.3 & G Juknis 2026)
const PRESTASI_RULES = {
  // Nilai minimal untuk ikut jalur Prestasi Umum
  min_ng_prestasi: 245,
  
  // Maksimal poin tambahan prestasi yang bisa ditambahkan ke NG
  max_prestasi_cap: 15,
  
  // Rumus NG Dasar: ((TKA + TKAD) × 80%) + (Rapor × 20%)
  // Rapor = rata-rata 3 mapel (IPA, MTK, B.Indo) × 5 semester
  rumus_ng: {
    tka_tkad_weight: 0.8,
    rapor_weight: 0.2,
    mapel: ["IPA", "MTK", "BINDO"],
    semester_count: 5
  },
  
  // Jenis prestasi yang diakui (BAB IV Huruf G.1)
  accepted_competitions: {
    akademik: [
      "Kompetisi Sains Nasional (KSN/OSN)",
      "Kompetisi Sains Madrasah (KSM)",
      "Olimpiade Siswa Tingkat Internasional (via Kemendikdasmen)",
      "Karya Ilmiah Remaja / OPSI",
      "Anugerah Kita Harus Belajar (Kemendikbud)"
    ],
    seni_budaya: [
      "Festival Lomba Seni Siswa Nasional (FLS2N)",
      "Musabaqah Tilawatil Quran (MTQ) Pelajar Umum",
      "Lomba Lukis Kyoto",
      "Lomba Alih Aksara",
      "Lomba Maca Cerita Cekak",
      "Festival Dalang Anak",
      "Festival Langen Carita",
      "Lomba Macapat",
      "Lomba Maca Geguritan"
    ],
    olahraga: [
      "Kompetisi Kelompok Olahraga Pelajar (KOP)",
      "Kompetisi Klub Usia Dini",
      "Kompetisi Olahraga Siswa Nasional (KOSN/O2SN)",
      "Aksi Olahraga dan Seni Madrasah (AKSIOMA)",
      "Pekan Olahraga Pelajar (Daerah/Wilayah/Nasional)",
      "Pekan Olahraga Daerah/Nasional (PORDA/PON)",
      "Kejurkab/Kejurda/Kejurnas (KONI)",
      "Gala Siswa Indonesia (GSI)",
      "Liga Dispora U-11",
      "Gebyar Olahraga Pendidikan"
    ],
    lainnya: [
      "Pramuka: Jambore Nasional/Internasional/Pramuka Garuda",
      "Lomba Bertutur Perpustakaan Nasional RI"
    ]
  },
  
  // Bobot penambahan nilai berdasarkan tingkat kejuaraan (BAB IV Huruf G.2.a)
  prestasi_points: {
    internasional: { perorangan: 7.50, beregu: 6.50, massal: 5.50 },
    nasional: { perorangan: 6.00, beregu: 5.00, massal: 4.00 },
    provinsi: { perorangan: 4.50, beregu: 3.50, massal: 2.50 },
    kabupaten_sleman: { perorangan: 3.00, beregu: 2.00, massal: 1.00 }
  },
  
  // Aturan kurasi untuk lomba non-pemerintah
  kurasi_requirement: {
    min_bintang: 3,  // Minimal bintang 3 dari Pusat Prestasi Nasional
    kurasi_url: "https://kurasi-prestasi.kemendikdasmen.go.id/ dan https://simt.kemendikdasmen.go.id/"
  }
};

// ✅ KONSTANTA UMUM
const CONFIG = {
  // Usia
  min_age: 10,              // Usia minimal (implisit, wajar untuk SD)
  max_age: 15,              // Usia maksimal pada 1 Juli 2026 (BAB IV B.2)
  
  // Nilai
  min_ng_prestasi: 245,     // Minimal NG untuk ikut jalur Prestasi Umum
  max_prestasi_cap: 15,     // Maksimal poin tambahan prestasi
  
  // Optimisme default untuk prediksi
  default_optimisme: 10,    // Nilai default slider optimisme
  
  // Domain & URL resmi
  official_domain: "sleman.spmb.id",
  disdik_url: "https://disdik.slemankab.go.id",
  pengajuan_prestasi_url: "https://disdik.slemankab.go.id/prestasi-sleman",
  
  // Kontak layanan
  hotline_whatsapp: "628112500028",
  hotline_email: "disdik.pendidikan.sleman@gmail.com",
  call_center: "0274-868512"
};

// ✅ EKSPOR KE GLOBAL SCOPE (untuk static site tanpa bundler)
if (typeof window !== 'undefined') {
  window.APP_CONFIG = {
    OPTIMISME_LABEL,
    SCHEDULES,
    IMPORTANT_DATES,
    QUOTA,
    PRESTASI_RULES,
    CONFIG
  };
}
