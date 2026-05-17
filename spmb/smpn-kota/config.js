/**
 * SPMB SMPN Kota Yogyakarta - Configuration
 * Tahun Ajaran 2026/2027
 * Source: Kepka POS No. 100.3/776 Tahun 2026
 * FIX: Helper _jadwal didefinisikan di LUAR APP_CONFIG untuk menghindari error inisialisasi
 */

// ✅ HELPER DI LUAR OBJEK (Aman dari undefined reference)
const _jadwal = (kegiatan, waktu, lokasi, url) => ({ kegiatan, waktu, lokasi, url });

window.APP_CONFIG = {
  // ===== META =====
  meta: {
    title: "Kalkulator SPMB SMPN Kota Yogyakarta 2026",
    version: "1.0.0",
    lastUpdate: "2026-01-17",
    sourceDoc: "Kepka POS No. 100.3/776 Tahun 2026",
    baseUrl: "https://job.web.id/spmb/smpn-kota/",
    officialUrl: "https://yogya.spmb.id"
  },

  // ===== KONFIGURASI GLOBAL =====
  CONFIG: {
    MIN_AGE: 10,
    MAX_AGE: 15,
    MIN_NG_PRESTASI: 200,
    MAX_PRESTASI_CAP: 7.50,
    sk_mutasi_cutoff: "2025-01-01",
    rapor_coefficient: 0.6,
    ujian_weight: 0.90,
    rapor_weight: 0.10
  },

  // ===== SEKOLAH (16 SMPN Kota Yogyakarta) =====
  schools: [
    { id: "smpn1", name: "SMPN 1 Yogyakarta", code: "SMPN1", lat: -7.7956, lng: 110.3695 },
    { id: "smpn2", name: "SMPN 2 Yogyakarta", code: "SMPN2", lat: -7.7889, lng: 110.3753 },
    { id: "smpn3", name: "SMPN 3 Yogyakarta", code: "SMPN3", lat: -7.8012, lng: 110.3589 },
    { id: "smpn4", name: "SMPN 4 Yogyakarta", code: "SMPN4", lat: -7.7823, lng: 110.3812 },
    { id: "smpn5", name: "SMPN 5 Yogyakarta", code: "SMPN5", lat: -7.7734, lng: 110.3645 },
    { id: "smpn6", name: "SMPN 6 Yogyakarta", code: "SMPN6", lat: -7.8123, lng: 110.3701 },
    { id: "smpn7", name: "SMPN 7 Yogyakarta", code: "SMPN7", lat: -7.7945, lng: 110.3512 },
    { id: "smpn8", name: "SMPN 8 Yogyakarta", code: "SMPN8", lat: -7.7867, lng: 110.3923 },
    { id: "smpn9", name: "SMPN 9 Yogyakarta", code: "SMPN9", lat: -7.8034, lng: 110.3834 },
    { id: "smpn10", name: "SMPN 10 Yogyakarta", code: "SMPN10", lat: -7.8156, lng: 110.3978, note: "Unit 2: SD Negeri Mendungan 1" },
    { id: "smpn11", name: "SMPN 11 Yogyakarta", code: "SMPN11", lat: -7.7678, lng: 110.3567 },
    { id: "smpn12", name: "SMPN 12 Yogyakarta", code: "SMPN12", lat: -7.7912, lng: 110.3445 },
    { id: "smpn13", name: "SMPN 13 Yogyakarta", code: "SMPN13", lat: -7.8089, lng: 110.3623 },
    { id: "smpn14", name: "SMPN 14 Yogyakarta", code: "SMPN14", lat: -7.7756, lng: 110.3889 },
    { id: "smpn15", name: "SMPN 15 Yogyakarta", code: "SMPN15", lat: -7.8201, lng: 110.3534 },
    { id: "smpn16", name: "SMPN 16 Yogyakarta", code: "SMPN16", lat: -7.7834, lng: 110.3712 }
  ],

  // ===== RUMUS NILAI GABUNGAN =====
  formulas: {
    ng2026: {
      label: "Lulusan 2026",
      calc: (tka, tkad, raporAvg, prestasi) => {
        const ujian = (tka + tkad) * window.APP_CONFIG.CONFIG.ujian_weight;
        const rapor = (raporAvg * window.APP_CONFIG.CONFIG.rapor_coefficient) * window.APP_CONFIG.CONFIG.rapor_weight;
        return ujian + rapor + (prestasi || 0);
      },
      desc: "NG = ((TKA + TKAD) × 90%) + (Rata-rata Rapor × 0.6 × 10%) + Prestasi"
    },
    ng2025: {
      label: "Lulusan 2025",
      calc: (aspd, raporAvg, prestasi) => {
        const ujian = aspd * window.APP_CONFIG.CONFIG.ujian_weight;
        const rapor = (raporAvg * window.APP_CONFIG.CONFIG.rapor_coefficient) * window.APP_CONFIG.CONFIG.rapor_weight;
        return ujian + rapor + (prestasi || 0);
      },
      desc: "NG = (ASPD × 90%) + (Rata-rata Rapor × 0.6 × 10%) + Prestasi"
    }
  },

  // ===== SCHEDULE PER JALUR =====
  SCHEDULES: {
    prestasiKhusus: [
      _jadwal("Pengajuan Berkas", "9-10 Juni 2026, 08:00-10:00 WIB", "Disdikpora Kota", "https://yogya.spmb.id"),
      _jadwal("Verifikasi & Token", "9-10 Juni 2026, 08:00-10:00 WIB", "Disdikpora Kota", null),
      _jadwal("Pilih Sekolah", "9 Juni 08:00 - 10 Juni 13:00 WIB", "Online", "https://yogya.spmb.id"),
      _jadwal("Pengumuman", "11 Juni 2026, 08:00 WIB", "Online", "https://yogya.spmb.id"),
      _jadwal("Daftar Ulang", "11-12 Juni 2026, 08:00-14:00 WIB", "Sekolah Diterima", null)
    ],
    prestasiAkademik: [
      _jadwal("Aktivasi Token", "9 Juni 08:00 - 10 Juni 10:00 WIB", "Online", "https://yogya.spmb.id"),
      _jadwal("Pilih Sekolah", "9 Juni 08:00 - 10 Juni 13:00 WIB", "Online", "https://yogya.spmb.id"),
      _jadwal("Pengumuman", "11 Juni 2026, 08:00 WIB", "Online", "https://yogya.spmb.id"),
      _jadwal("Daftar Ulang", "11-12 Juni 2026, 08:00-14:00 WIB", "Sekolah Diterima", null)
    ],
    domisiliRadius: [
      _jadwal("Pengajuan Akun", "15-17 Juni 2026, 08:00-10:00 WIB", "Online", "https://yogya.spmb.id"),
      _jadwal("Verifikasi Berkas", "15-17 Juni 2026, 08:00-14:00 WIB", "Sekolah Pilihan 1", null),
      _jadwal("Aktivasi & Pilih Sekolah", "17 Juni 08:00 - 18 Juni 13:00 WIB", "Online", "https://yogya.spmb.id"),
      _jadwal("Pengumuman", "19 Juni 2026, 08:00 WIB", "Online", "https://yogya.spmb.id"),
      _jadwal("Daftar Ulang", "19 atau 22 Juni 2026, 08:00-14:00 WIB", "Sekolah Diterima", null)
    ],
    domisiliDaerah: [
      _jadwal("Pengajuan Akun", "29-30 Juni 2026, 08:00-10:00 WIB", "Online", "https://yogya.spmb.id"),
      _jadwal("Verifikasi Berkas", "29-30 Juni 2026, 08:00-14:00 WIB", "Sekolah Pilihan 1", null),
      _jadwal("Aktivasi & Pilih Sekolah", "29 Juni 08:00 - 1 Juli 13:00 WIB", "Online", "https://yogya.spmb.id"),
      _jadwal("Pengumuman", "2 Juli 2026, 08:00 WIB", "Online", "https://yogya.spmb.id"),
      _jadwal("Daftar Ulang", "2-3 Juli 2026, 08:00-14:00 WIB", "Sekolah Diterima", null)
    ],
    afirmasiKSJPS: [
      _jadwal("Pengajuan Akun", "29-30 Juni 2026, 08:00-10:00 WIB", "Online", "https://yogya.spmb.id"),
      _jadwal("Verifikasi Berkas", "29-30 Juni 2026, 08:00-14:00 WIB", "Sekolah Pilihan 1", null),
      _jadwal("Aktivasi & Pilih Sekolah", "29 Juni 08:00 - 1 Juli 13:00 WIB", "Online", "https://yogya.spmb.id"),
      _jadwal("Pengumuman", "2 Juli 2026, 08:00 WIB", "Online", "https://yogya.spmb.id"),
      _jadwal("Daftar Ulang", "2-3 Juli 2026, 08:00-14:00 WIB", "Sekolah Diterima", null)
    ],
    afirmasiDisabilitas: [
      _jadwal("Pengajuan Akun", "15-17 Juni 2026, 08:00-10:00 WIB", "Online", "https://yogya.spmb.id"),
      _jadwal("Verifikasi Berkas", "15-17 Juni 2026, 08:00-14:00 WIB", "UPT Disabilitas Jl. Kol. Sugiyono 9B", null),
      _jadwal("Aktivasi & Pilih Sekolah", "17 Juni 08:00 - 18 Juni 13:00 WIB", "Online", "https://yogya.spmb.id"),
      _jadwal("Pengumuman", "19 Juni 2026, 08:00 WIB", "Online", "https://yogya.spmb.id"),
      _jadwal("Daftar Ulang", "19 atau 22 Juni 2026, 08:00-14:00 WIB", "Sekolah Diterima", null)
    ],
    mutasi: [
      _jadwal("Pengajuan Berkas", "15-17 Juni 2026, 08:00-10:00 WIB", "Disdikpora Kota", null),
      _jadwal("Verifikasi & Token", "15-17 Juni 2026, 08:00-14:00 WIB", "Disdikpora Kota", null),
      _jadwal("Aktivasi & Pilih Sekolah", "17 Juni 08:00 - 18 Juni 13:00 WIB", "Online", "https://yogya.spmb.id"),
      _jadwal("Pengumuman", "19 Juni 2026, 08:00 WIB", "Online", "https://yogya.spmb.id"),
      _jadwal("Daftar Ulang", "19 atau 22 Juni 2026, 08:00-14:00 WIB", "Sekolah Diterima", null)
    ],
    prestasiUmum: [
      _jadwal("Pengajuan Akun", "22-23 Juni 2026, 08:00-10:00 WIB", "Online", "https://yogya.spmb.id"),
      _jadwal("Verifikasi Berkas", "22-23 Juni 2026, 08:00-14:00 WIB", "Sekolah Pilihan 1", null),
      _jadwal("Aktivasi & Pilih Sekolah", "22 Juni 08:00 - 24 Juni 13:00 WIB", "Online", "https://yogya.spmb.id"),
      _jadwal("Pengumuman", "25 Juni 2026, 08:00 WIB", "Online", "https://yogya.spmb.id"),
      _jadwal("Daftar Ulang", "25-26 Juni 2026, 08:00-14:00 WIB", "Sekolah Diterima", null)
    ],
    tkad: [
      _jadwal("Pendaftaran TKAD", "10-17 Juni 2026, 08:00-14:00 WIB", "Disdikpora Kota / Online", "https://dindikpora.jogjakota.go.id"),
      _jadwal("Pelaksanaan TKAD", "18 Juni 2026, 09:00-10:30 WIB", "Disdikpora Kota", null),
      _jadwal("Pengambilan Hasil", "19 Juni 2026, 09:00-14:00 WIB", "Disdikpora Kota", null)
    ]
  },

  // ===== PASSING GRADE 2025 =====
  passingGrade2025: {
    prestasiAkademik: { "SMPN1": 272.38, "SMPN2": 263.10, "SMPN3": 172.26, "SMPN4": 249.88, "SMPN5": 285.96, "SMPN6": 257.03, "SMPN7": 243.46, "SMPN8": 282.62, "SMPN9": 267.62, "SMPN10": 230.36, "SMPN11": 218.46, "SMPN12": 229.64, "SMPN13": 199.88, "SMPN14": 198.21, "SMPN15": 180.96, "SMPN16": 235.12 },
    prestasiUmum: { "SMPN1": 275.96, "SMPN2": 269.24, "SMPN3": 227.86, "SMPN4": 264.40, "SMPN5": 282.62, "SMPN6": 266.21, "SMPN7": 257.86, "SMPN8": 278.93, "SMPN9": 267.74, "SMPN10": 250.60, "SMPN11": 239.08, "SMPN12": 244.04, "SMPN13": 226.31, "SMPN14": 233.93, "SMPN15": 232.62, "SMPN16": 254.29 },
    domisiliDaerah: { "SMPN1": 257.72, "SMPN2": 248.12, "SMPN3": 213.17, "SMPN4": 240.98, "SMPN5": 269.42, "SMPN6": 244.38, "SMPN7": 233.76, "SMPN8": 266.68, "SMPN9": 247.94, "SMPN10": 231.55, "SMPN11": 219.60, "SMPN12": 226.73, "SMPN13": 220.53, "SMPN14": 216.02, "SMPN15": 219.22, "SMPN16": 234.81 },
    domisiliRadius: { "SMPN1": 292.94, "SMPN2": 316.24, "SMPN3": 334.25, "SMPN4": 233.72, "SMPN5": 420.72, "SMPN6": 284.51, "SMPN7": 262.57, "SMPN8": 324.54, "SMPN9": 278.51, "SMPN10": 416.63, "SMPN11": 211.71, "SMPN12": 250.13, "SMPN13": 230.14, "SMPN14": 379.23, "SMPN15": 472.81, "SMPN16": 256.92 },
    afirmasiKSJPS: { "SMPN1": 153.67, "SMPN2": 142.55, "SMPN3": 139.08, "SMPN4": 175.02, "SMPN5": 171.12, "SMPN6": 128.20, "SMPN7": 205.03, "SMPN8": 186.22, "SMPN9": 119.44, "SMPN10": 125.13, "SMPN11": 174.59, "SMPN12": 181.08, "SMPN13": 142.35, "SMPN14": 136.44, "SMPN15": 159.82, "SMPN16": 173.72 }
  },

  // ===== PRESTASI NON-AKADEMIK =====
  prestasi: {
    kompetitifBerjenjang: {
      internasional: { perorangan: [7.50, 7.00, 6.50], beregu3_15: [6.50, 6.00, 5.50], beregu16plus: [5.50, 5.00, 4.50] },
      nasional: { perorangan: [6.00, 5.50, 5.00], beregu3_15: [5.00, 4.50, 4.00], beregu16plus: [4.00, 3.50, 3.00] },
      provinsi: { perorangan: [4.50, 4.00, 3.50], beregu3_15: [3.50, 3.00, 2.50], beregu16plus: [2.50, 2.00, 1.50] },
      kota: { perorangan: [3.00, 2.50, 2.00], beregu3_15: [2.00, 1.50, 1.00], beregu16plus: [1.00, 0.50, 0.25] }
    },
    kompetitifTidakBerjenjang: {
      internasional: { perorangan: [2.00, 1.75, 1.50], beregu3_15: [1.50, 1.25, 1.00], beregu16plus: [1.00, 0.75, 0.50] },
      nasional: { perorangan: [1.50, 1.25, 1.00], beregu3_15: [1.00, 0.75, 0.50], beregu16plus: [0.50, 0.25, 0.13] },
      provinsi: { perorangan: [1.00, 0.75, 0.50], beregu3_15: [0.50, 0.25, 0.13], beregu16plus: [0.13, 0.06, 0.03] },
      kota: { perorangan: [0.50, 0.25, 0.13], beregu3_15: [0.13, 0.06, 0.03], beregu16plus: [0.03, 0.02, 0.01] }
    },
    nonkompetitif: {
      internasional: { perorangan: 1.00, beregu3_15: 0.75, beregu16plus: 0.50 },
      nasional: { perorangan: 0.50, beregu3_15: 0.25, beregu16plus: 0.13 },
      diy: { perorangan: 0.13, beregu3_15: 0.06, beregu16plus: 0.03 },
      kota: { perorangan: 0.03, beregu3_15: 0.02, beregu16plus: 0.01 }
    },
    rules: {
      minTingkat: { dalamKota: "Kota Yogyakarta", dalamDIY: "DIY", luarDIY: "Nasional" },
      tahunBerlaku: [2023, 2024, 2025, 2026],
      maxPrestasi: 1,
      puspresnasStars: { 5: 1.0, 4: 1.0, 3: 0.75, 2: 0.5, 1: 0.25 }
    }
  },

  // ===== RULES SELEKSI =====
  rules: {
    tieBreaker: ["urutanPilihanSekolah", "jumlahNilaiUjian", "waktuAktivasiAkun"],
    domisiliRadius: {
      source: "Dinas Pertanahan dan Tata Ruang Kota Yogyakarta",
      url: "https://yogya.spmb.id",
      smpn10Special: {
        main: "Jl. Tritunggal No.2, Sorosutan, Umbulharjo",
        unit2: "SD Negeri Mendungan 1, Jl. Malangan Raya No.470, Giwangan"
      }
    },
    requirements: {
      usiaMaks: 15,
      kkStatus: ["anak", "cucu"],
      mutasiDeadline: "2025-01-01"
    }
  },

  // ===== UTILS =====
  utils: {
    formatNilai: (n) => n?.toFixed(2) || "0.00",
    formatJarak: (m) => `${m?.toFixed(2) || 0} m`,
    getSchoolByCode: (code) => window.APP_CONFIG.schools.find(s => s.code === code),
    getPrestasiValue: (level, type, group, rank) => {
      const data = window.APP_CONFIG.prestasi;
      if (type === "kompetitifBerjenjang") return data.kompetitifBerjenjang[level]?.[group]?.[rank-1] || 0;
      if (type === "kompetitifTidakBerjenjang") return data.kompetitifTidakBerjenjang[level]?.[group]?.[rank-1] || 0;
      if (type === "nonkompetitif") return data.nonkompetitif[level]?.[group] || 0;
      return 0;
    }
  }
};

// Export helper ke global window
window._jadwal = _jadwal;
