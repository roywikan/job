/**
 * config.js - Konfigurasi Global SPMB Sleman Logic System
 * Update tahunan: ganti file ini saja untuk regulasi baru
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

// ✅ JADWAL KEGIATAN PER JALUR (update tiap tahun sesuai juknis)
const SCHEDULES = {
  prestasi: [
    ["Pengajuan akun", "23–24 Juni 2026", "Online: https://sleman.spmb.id"],
    ["Verifikasi berkas", "23–24 Juni 2026 pukul 08.00–13.00", "Sekolah pilihan pertama"],
    ["Pendaftaran", "23–24 Juni 2026", "Online"],
    ["Pengumuman", "25 Juni 2026 pukul 08.00", "Sekolah"],
    ["Daftar ulang", "25 Juni 2026 pukul 09.00–13.00", "Sekolah penerima"]
  ],
  domisili: [
    ["Pengajuan akun", "17–18 Juni 2026", "Online"],
    ["Verifikasi", "17–18 Juni 2026 pukul 08.00–13.00", "Sekolah tujuan"],
    ["Pendaftaran", "17–18 Juni 2026", "Online"],
    ["Pengumuman", "19 Juni 2026 pukul 08.00", "Sekolah"],
    ["Daftar ulang", "19 Juni 2026 pukul 09.00–11.30", "Sekolah penerima"]
  ],
  khusus: [
    ["Pengajuan akun", "9–10 Juni 2026", "Online"],
    ["Verifikasi", "9–10 Juni 2026 pukul 08.00–13.00", "Sekolah tujuan"],
    ["Pendaftaran", "9–10 Juni 2026", "Online"],
    ["Pengumuman", "11 Juni 2026 pukul 08.00", "Sekolah"],
    ["Daftar ulang", "11 Juni 2026 pukul 09.00–11.30", "Sekolah penerima"]
  ],
  tkad: [
    ["Pendaftaran TKAD Luar Daerah", "4 Mei – 29 Mei 2026", "Online"],
    ["Pelaksanaan TKAD Luar Daerah", "3 Juni 2026 pukul 07.00", "SMP Negeri 1 Sleman"],
    ["Pengumuman TKAD Luar Daerah", "5 Juni 2026", "Grup WhatsApp peserta Luar Daerah"]
  ]
};

// ✅ KONSTANTA LAIN (bisa ditambah sesuai kebutuhan)
const CONFIG = {
  MIN_NG_PRESTASI: 245,
  MAX_PRESTASI_CAP: 15,
  MIN_AGE: 10,
  MAX_AGE: 15,
  DEFAULT_OPTIMISME: 10
};

// ✅ Auto-export ke global scope (untuk static site tanpa bundler)
if (typeof window !== 'undefined') {
  window.APP_CONFIG = { OPTIMISME_LABEL, SCHEDULES, CONFIG };
}
