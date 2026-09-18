import fs from 'fs';
import path from 'path';

const categories = [
  "Aksesoris", "Aplikasi", "Asuransi", "Bimbel", "Buku", "Daycare", "Jasa", "Kebersihan", 
  "Kehamilan", "Keluarga", "Kesehatan", "Keuangan", "Klinik", "Konsultasi", "Kursus", 
  "Les Privat", "Lifestyle", "Lowongan Kerja", "Mainan", "Mencari Kerja", "Menyusui", 
  "Nutrisi", "Obat", "Pakaian", "Pasca Kelahiran", "Pendidikan", "Pengasuh", "Peralatan", 
  "Perawatan", "Perlengkapan", "Sekolah", "Sepatu", "Seminar", "Training", "Transport", "Wisata"
];

const cities = ["Jakarta Selatan", "Surabaya", "Bandung", "Depok", "Tangerang Selatan", "Bekasi", "Bogor", "Yogyakarta", "Semarang", "Malang", "Medan", "Makassar", "Solo", "Sidoarjo", "Palembang"];
const occupations = ["Ibu Rumah Tangga", "Karyawan Swasta", "Wiraswasta", "Guru / Pengajar", "Bidan Praktisi", "Dokter Spesialis", "Penyalur Resmi", "Desainer", "Terapis Anak", "Pengelola Daycare"];

// Sample template generators per category (10 ads each)
const categoryAds = {
  "Aksesoris": [
    { nama: "Bunda Rara", telp: "0812-1111-2201", desc: "Jepit Rambut Anak & Bando Pita Handmade Set 10 Pcs. Bahan kain lembut tidak sakit di kepala balita.", harga: "Rp 45.000" },
    { nama: "Mama Cello", telp: "0813-2222-3302", desc: "Kacamata Anti Radiasi Gadget Anak Screen Guard Blueray. Frame lentur karet anti patah.", harga: "Rp 65.000" },
    { nama: "Toko BabyAccess", telp: "0857-3333-4403", desc: "Empeng Orthodontik Silicone BPA Free + Rantai Clip Gantung Motif Hewan Lucu.", harga: "Rp 35.000" },
    { nama: "Bunda Astrid", telp: "0878-4444-5504", desc: "Bib Celemek Makan Baby Silicone Waterproof dengan Kantong Penampung Makanan.", harga: "Rp 28.000" },
    { nama: "Ibu Vania", telp: "0821-5555-6605", desc: "Topi Kupluk Rajut Bayi Motif Telinga Kucing Hangat u/ Usia 0-2 Tahun.", harga: "Rp 30.000" },
    { nama: "Papa Gio", telp: "0811-6666-7706", desc: "Jam Tangan GPS Tracker Anak Waterproof. Bisa Telepon, SOS Button & Lacak Lokasi Realtime.", harga: "Rp 245.000" },
    { nama: "Mama Callysta", telp: "0852-7777-8807", desc: "Sabuk Pengaman Boncengan Motor Anak Ergonomis dengan Busa Tebal & Double Buckle.", harga: "Rp 75.000" },
    { nama: "Bunda Nadya", telp: "0819-8888-9908", desc: "Kaos Kaki Bayi Anti Slip Semata Kaki Motif Boneka Timbul Paket 5 Pasang.", harga: "Rp 50.000" },
    { nama: "Mama Kenzo", telp: "0812-9999-0009", desc: "Tas Ransel Mini Anak TK Motif Dinosaurus 3D Waterproof Ringan.", harga: "Rp 85.000" },
    { nama: "Bunda Elsa", telp: "0813-1010-2010", desc: "Topi Pelindung Keramas Bayi Adjustable Shower Cap Bahan EVA Empuk Anti Air Mata.", harga: "Rp 22.000" }
  ],
  "Aplikasi": [
    { nama: "Dev KidsApp", telp: "0812-1111-2202", desc: "Aplikasi Android/iOS Pelacak Tumbuh Kembang Bayi & Grafik WHO. Gratis Download & Tanpa Iklan.", harga: "Gratis / App" },
    { nama: "Tim Posyandu Digital", telp: "0813-2222-3303", desc: "Aplikasi Pengingat Jadwal Imunisasi Anak & Catatan Riwayat Medis Keluarga.", harga: "Freemium" },
    { nama: "Nusantara Baby", telp: "0857-3333-4404", desc: "Aplikasi 500+ Resep MPASI Organik Sehat Berdasarkan Usia Bayi (6-24 Bulan).", harga: "Rp 15.000 Premium" },
    { nama: "Bunda Studio", telp: "0878-4444-5505", desc: "Aplikasi Jurnal Harian Menyusui, Catatan Tidur & Popok Bayi Kembar.", harga: "Gratis Download" },
    { nama: "Dongengku Media", telp: "0821-5555-6606", desc: "Aplikasi Dongeng Anak Audio Interaktif Bahasa Indonesia & Inggris Sebelum Tidur.", harga: "Rp 29.000 / Bln" },
    { nama: "Kids Safe Tech", telp: "0811-6666-7707", desc: "Aplikasi Screen Time Control & Pembatas Durasi Gadget Anak u/ Orang Tua.", harga: "Rp 49.000 / Thn" },
    { nama: "Hijaiyah Ceria", telp: "0852-7777-8808", desc: "Aplikasi Belajar Mengaji Hijaiyah & Doa Harian Anak Berbasis Edugame Suara.", harga: "Gratis" },
    { nama: "Parenting Hub App", telp: "0819-8888-9909", desc: "Aplikasi Komunitas Diskusi Tanya Jawab Dokter Spesialis Anak 24 Jam.", harga: "Rp 19.000 / Sesi" },
    { nama: "Keuangan Bunda", telp: "0812-9999-0010", desc: "Aplikasi Pencatat Anggaran Rumah Tangga & Dana Pendidikan Anak Otomatis.", harga: "Gratis" },
    { nama: "Dokter Cilik App", telp: "0813-1010-2011", desc: "Aplikasi Simulasi Pertolongan Pertama (P3K) Darurat Anak u/ Orang Tua.", harga: "Gratis" }
  ],
  "Asuransi": [
    { nama: "Agen Asuransi Syariah", telp: "0812-1111-2203", desc: "Asuransi Pendidikan Anak Syariah. Proteksi Dana Sekolah dari SD hingga Perguruan Tinggi.", harga: "Premi Rp 300rb/Bln" },
    { nama: "Prudential Life", telp: "0813-2222-3304", desc: "Asuransi Kesehatan Rawat Inap Keluarga Cashless Tanpa Batas Kamar RS.", harga: "Premi Rp 500rb/Bln" },
    { nama: "Manulife Indonesia", telp: "0857-3333-4405", desc: "Asuransi Jiwa Utama Orang Tua Penanggung Jawab Finansial Keluarga. Uang Pertanggungan 1 Miliar.", harga: "Premi Rp 450rb/Bln" },
    { nama: "AXA Mandiri Care", telp: "0878-4444-5506", desc: "Asuransi Proteksi Kehamilan & Proses Melahirkan Normal / Caesar.", harga: "Premi Rp 600rb/Bln" },
    { nama: "Allianz Indonesia", telp: "0821-5555-6607", desc: "Asuransi Penyakit Kritis Anak Tercover 100+ Kondisi Medis Sejak Usia 30 Hari.", harga: "Premi Rp 350rb/Bln" },
    { nama: "FWD Insurance", telp: "0811-6666-7708", desc: "Tabungan Proteksi Masa Depan Anak Plus Investasi Reksadana Aman.", harga: "Premi Rp 400rb/Bln" },
    { nama: "BCA Life Family", telp: "0852-7777-8809", desc: "Asuransi Kecelakaan Diri Anak & Keluarga Saat Traveling / Liburan.", harga: "Premi Rp 150rb/Thn" },
    { nama: "Sequis Life", telp: "0819-8888-9910", desc: "Asuransi Perawatan Gigi & Kesehatan Mata Anak Terlengkap.", harga: "Premi Rp 250rb/Bln" },
    { nama: "BRI Life Edukasi", telp: "0812-9999-0011", desc: "Program Unit Link Edukasi Anak dengan Kepastian Dana Beasiswa Tahapan.", harga: "Premi Rp 350rb/Bln" },
    { nama: "Sinarmas MSIG", telp: "0813-1010-2012", desc: "Asuransi Rawat Jalan & Dokter Spesialis Anak Tanpa Antri.", harga: "Premi Rp 280rb/Bln" }
  ],
  "Bimbel": [
    { nama: "Kak Nurul, S.Pd", telp: "0812-1111-2204", desc: "Bimbel Calistung Fun Learning Anak Usia 4-6 Tahun. Metode Bermain Sambil Belajar.", harga: "Rp 150.000 / Bulan" },
    { nama: "Bimbel Kumon Bintaro", telp: "0813-2222-3305", desc: "Bimbel Matematika & Bahasa Inggris Metode Kumon u/ Anak SD & SMP.", harga: "Rp 450.000 / Bulan" },
    { nama: "Little Einstein Science", telp: "0857-3333-4406", desc: "Bimbel IPA & Sains Eksperimen Seru Anak SD. Peralatan Praktikum Lengkap.", harga: "Rp 250.000 / Bulan" },
    { nama: "English First Kids", telp: "0878-4444-5507", desc: "Bimbel Bahasa Inggris Komunikasi Anak Usia 3-10 Tahun Native Speaker.", harga: "Rp 600.000 / Bulan" },
    { nama: "Bimbel Persiapan SD", telp: "0821-5555-6608", desc: "Bimbingan Belajar Persiapan Masuk SD Favorit / Sekolah Inter. Latihan Psikotes.", harga: "Rp 300.000 / Bulan" },
    { nama: "Sanggar Melukis Ceria", telp: "0811-6666-7709", desc: "Bimbel Menggambar, Mewarnai & Sketsa Anak Melatih Motorik Halus.", harga: "Rp 200.000 / Bulan" },
    { nama: "Jarimatika Center", telp: "0852-7777-8810", desc: "Bimbel Berhitung Cepat Jarimatika Tanpa Alat u/ Anak Usia 5-9 Tahun.", harga: "Rp 180.000 / Bulan" },
    { nama: "RoboKids Academy", telp: "0819-8888-9911", desc: "Bimbel Coding & Robotik Anak SD. Belajar Membuat Game Scratch & Robot LEGO.", harga: "Rp 500.000 / Bulan" },
    { nama: "Bimbel Mengetik Cepat", telp: "0812-9999-0012", desc: "Bimbel Komputer & Dasar Pemrograman Anak SD Usia 7-12 Tahun.", harga: "Rp 250.000 / Bulan" },
    { nama: "Olimpiade Sains Cilik", telp: "0813-1010-2013", desc: "Bimbel Khusus Pembinaan Olimpiade Matematika & Sains Anak SD.", harga: "Rp 400.000 / Bulan" }
  ],
  "Buku": [
    { nama: "Bunda Nisa", telp: "0812-1111-2205", desc: "Buku Seri Halo Balita Preloved 25 Jilid Hardcover Mulus 90% Lengkap E-Pen.", harga: "Rp 2.800.000" },
    { nama: "Toko Buku Edukasi", telp: "0813-2222-3306", desc: "Buku Ensiklopedia Bocah Muslim Sampul Tebal Kertas Glossy Gambar Warna.", harga: "Rp 1.500.000" },
    { nama: "Mama Abel", telp: "0857-3333-4407", desc: "Buku Board Book Dongeng Nusantara u/ Balita Anti Sobek & Ujung Tumpul.", harga: "Rp 120.000 (3 Buku)" },
    { nama: "Bunda Sarah", telp: "0878-4444-5508", desc: "Buku Panduan MPASI Sehat 1000 Hari Pertama Kemenkes RI Lengkap Menu Harian.", harga: "Rp 65.000" },
    { nama: "Penerbit Ceria", telp: "0821-5555-6609", desc: "Buku Komik Edukasi Karakter & Pembiasaan Adab Anak Islam Set 5 Jilid.", harga: "Rp 145.000" },
    { nama: "Mama Kiki", telp: "0811-6666-7710", desc: "Buku Pop-Up Interaktif Mengenal Hewan Laut & Hutan u/ Usia 1-4 Tahun.", harga: "Rp 95.000" },
    { nama: "Umi Kalsum", telp: "0852-7777-8811", desc: "Buku Wipe & Clean Belajar Menulis Angka & Hijaiyah + Spidol Terhapus.", harga: "Rp 48.000" },
    { nama: "Bunda Vania", telp: "0819-8888-9912", desc: "Buku Parenting Stimulasi Sensori & Motorik Anak Menurut Psikolog.", harga: "Rp 78.000" },
    { nama: "Toko Buku Kids", telp: "0812-9999-0013", desc: "Buku Cerita Bahasa Inggris Usia Dini Usborne First Reading Paket 10 Buku.", harga: "Rp 220.000" },
    { nama: "Papa Darren", telp: "0813-1010-2014", desc: "Buku Kain Sound Book Baby Touch and Feel Bermusik u/ Bayi 0-12 Bulan.", harga: "Rp 85.000" }
  ],
  "Daycare": [
    { nama: "Daycare Ceria Bintaro", telp: "0812-1111-2206", desc: "Daycare / Penitipan Anak Harian & Bulanan Usia 3 Bln - 4 Thn Bintaro Sektor 9. CCTV 24Jam.", harga: "Rp 1.800.000 / Bln" },
    { nama: "Daycare Syariah Surabaya", telp: "0813-2222-3307", desc: "Penitipan Anak Syariah & Tahfidz Jus 30 Surabaya. Pengasuh Bidan & Konsumsi Organik.", harga: "Rp 2.100.000 / Bln" },
    { nama: "Daycare Executive BSD", telp: "0857-3333-4408", desc: "Executive Daycare & Preschool BSD Serpong. Fasilitas Kolam Renang & Kelas Musik.", harga: "Rp 2.900.000 / Bln" },
    { nama: "Daycare Montessori Kelapa Gading", telp: "0878-4444-5509", desc: "Penitipan Anak Berbasis Metode Montessori. Laporan Tumbuh Kembang Harian via App.", harga: "Rp 2.500.000 / Bln" },
    { nama: "Daycare Seminyak Bali", telp: "0821-5555-6610", desc: "Daycare Harian u/ Turis & WNA di Seminyak Bali. Pengasuh Bintang 5 Bahasa Inggris.", harga: "Rp 250.000 / Hari" },
    { nama: "Daycare Rumah Pohon Bandung", telp: "0811-6666-7711", desc: "Penitipan Anak Asri Nuansa Alam di Dago Bandung. Bebas Gadget & Banyak Outdoor Play.", harga: "Rp 1.600.000 / Bln" },
    { nama: "Daycare Karyawan SCBD", telp: "0852-7777-8812", desc: "Penitipan Anak Khusus Karyawan Kawasan SCBD Jakarta. Jam Buka 07.00 - 19.00 WIB.", harga: "Rp 3.200.000 / Bln" },
    { nama: "Daycare Ramah Bayi Depok", telp: "0819-8888-9913", desc: "Penitipan Bayi Baru Lahir (Newborn - 12 Bulan) Depok. Perawat Medis Standar RS.", harga: "Rp 2.300.000 / Bln" },
    { nama: "Daycare & Rumah Main Semarang", telp: "0812-9999-0014", desc: "Daycare & Playgroup Semarang Kota. Menu MPASI Dimasak Fresh Oleh Ahli Gizi.", harga: "Rp 1.750.000 / Bln" },
    { nama: "Daycare Kebon Jeruk", telp: "0813-1010-2015", desc: "Penitipan Anak Kebon Jeruk Jakbar. Ruang Tidur Ber-AC & Ruang Bermain Sensori.", harga: "Rp 2.000.000 / Bln" }
  ],
  "Jasa": [
    { nama: "RentBabyku Surabaya", telp: "0812-1111-2207", desc: "Jasa Sewa Stroller & Car Seat Steril UV Area Surabaya & Sidoarjo. Terjangkau.", harga: "Rp 35.000 / Hari" },
    { nama: "Studio Impresi 3D", telp: "0813-2222-3308", desc: "Jasa Pembuatan Cetakan Tangan & Kaki Bayi 3D Kaca Krystal Emas Abadi.", harga: "Rp 450.000 / Set" },
    { nama: "Party Decor Ceria", telp: "0857-3333-4409", desc: "Jasa Dekorasi Ulang Tahun Anak Minimalis Tema Dinosaurus / Princess.", harga: "Rp 850.000 Paket" },
    { nama: "Newborn Photography", telp: "0878-4444-5510", desc: "Jasa Foto Bayi Baru Lahir (Newborn) Home Visit. Properti Lengkap & Aman Bayi.", harga: "Rp 1.200.000 Sesi" },
    { nama: "Clean&Dry Hydrovacuum", telp: "0821-5555-6611", desc: "Jasa Sedot Tungau Hydro-Vacuum Kasur Bayi, Stroller & Sofa Bebas Debu Alergi.", harga: "Rp 150.000 / Kasur" },
    { nama: "Safety Home Kids", telp: "0811-6666-7712", desc: "Jasa Pemasangan Pagar Pengaman Tangga & Safety Net Balkon u/ Rumah Balita.", harga: "Rp 350.000 / Pintu" },
    { nama: "Shuttle Kids Antar-Jemput", telp: "0852-7777-8813", desc: "Jasa Antar Jemput Sekolah Anak Mobil Ber-AC & Supir Berpengalaman Sabar.", harga: "Rp 600.000 / Bln" },
    { nama: "Kamar Anak Neat", telp: "0819-8888-9914", desc: "Jasa Organisasi & Penataan Lemari Pakaian Bayi / Kamar Mainan Anak.", harga: "Rp 250.000 / Ruang" },
    { nama: "Baby Laundry Hygiene", telp: "0812-9999-0015", desc: "Jasa Laundry Khusus Pakaian Bayi Sensitif. Deterjen Organic & Tanpa Pewangi Kimia.", harga: "Rp 15.000 / Kg" },
    { nama: "Jasa Pendamping Liburan", telp: "0813-1010-2016", desc: "Jasa Pendamping / Nanny Companion Liburan Luar Kota & Luar Negeri.", harga: "Rp 400.000 / Hari" }
  ],
  "Kebersihan": [
    { nama: "Mama Kiki", telp: "0812-1111-2208", desc: "Sterilizer Botol Bayi UV Haenim 4G Rose Gold Second Mulus Lampu Baru.", harga: "Rp 1.650.000" },
    { nama: "Sleek Baby Store", telp: "0813-2222-3309", desc: "Sabun Cuci Botol Bayi Sleek Bottle Cleanser Liquid Refill 900ml Paket 3 Pcs.", harga: "Rp 85.000" },
    { nama: "Bunda Fira", telp: "0857-3333-4410", desc: "Deterjen Khusus Pakaian Bayi Hypoallergenic Pure Baby 1 Liter Anti Iritasi.", harga: "Rp 45.000" },
    { nama: "Toko Baby Clean", telp: "0878-4444-5511", desc: "Tissue Basah Pure Baby Pure Water 50s Bebas Alkohol & Parfum Paket 6 Pack.", harga: "Rp 60.000" },
    { nama: "Mama Dhea", telp: "0821-5555-6612", desc: "Cairan Pembersih Mainan Anak Toy Sanitizer Spray Food Grade Safe 500ml.", harga: "Rp 38.000" },
    { nama: "Sanitizer Room Kids", telp: "0811-6666-7713", desc: "Disinfektan Air Spray Ruang Kamar Bayi Organic Eucalyptus Safe for Newborn.", harga: "Rp 55.000" },
    { nama: "Bunda Astrid", telp: "0852-7777-8814", desc: "Air Purifier HEPA Filter Sharp u/ Kamar Bayi Anti Debu & Virus.", harga: "Rp 1.100.000" },
    { nama: "Mama Gio", telp: "0819-8888-9915", desc: "Handuk Bayi Microfiber Ultra Soft Daya Serap Tinggi Ukuran 70x140cm.", harga: "Rp 42.000" },
    { nama: "Toko Diaper Pail", telp: "0812-9999-0016", desc: "Place Pail Tempat Sampah Popok Bayi Khusus Kedap Bau Anti Kuman.", harga: "Rp 320.000" },
    { nama: "Bunda Sarah", telp: "0813-1010-2017", desc: "Sikat Botol Bayi Silicone Soft 360 Derajat Bebas Goresan + Sikat Dot.", harga: "Rp 25.000" }
  ],
  "Kehamilan": [
    { nama: "Mama Zhafira", telp: "0812-1111-2209", desc: "Bantal Hamil Maternity Pillow U-Shape Katun Dingin Empuk Bebas Pegal.", harga: "Rp 135.000" },
    { nama: "Prenatal Yoga Studio", telp: "0813-2222-3310", desc: "Kelas Prenatal Yoga & Senam Hamil Online Zoom u/ Kelancaran Persalinan.", harga: "Rp 50.000 / Sesi" },
    { nama: "Bunda Elsa", telp: "0857-3333-4411", desc: "Korset Penopang Perut Hamil Sorex Second Mulus Mengurangi Nyeri Pinggang.", harga: "Rp 75.000" },
    { nama: "Toko Nutrisi Hamil", telp: "0878-4444-5512", desc: "Vitamin Hamil Blackmores Pregnancy & Breastfeeding Gold 180 Kapsul.", harga: "Rp 340.000" },
    { nama: "Mama Olivia", telp: "0821-5555-6613", desc: "Minyak Zaitun Organik Anti Stretchmark Mama's Choice 100ml.", harga: "Rp 98.000" },
    { nama: "Bunda Nadya", telp: "0811-6666-7714", desc: "Tes Pack Digital Clearblue & Strip Tes Ovulasi Kesuburan Paket 10 Pcs.", harga: "Rp 185.000" },
    { nama: "Mama Callysta", telp: "0852-7777-8815", desc: "Celana Dalam Hamil High Waist Katun Seamless Paket 5 Pcs Jumbo Size.", harga: "Rp 85.000" },
    { nama: "Susu Hamil Store", telp: "0819-8888-9916", desc: "Susu Ibu Hamil Anmum Materna Cokelat 400g Asupan Nutrisi Fetal.", harga: "Rp 78.000" },
    { nama: "Bunda Ratna", telp: "0812-9999-0017", desc: "Baju Hamil Kerja & Menyusui Formil Katun Rayon Adem Usia 1-9 Bulan.", harga: "Rp 110.000" },
    { nama: "Mama Abel", telp: "0813-1010-2018", desc: "Monitor Detak Jantung Fetal Doppler Alat Dengar Detak Jantung Bayi Hamil.", harga: "Rp 210.000" }
  ],
  "Keluarga": [
    { nama: "Tour Keluarga Jogja", telp: "0812-1111-2210", desc: "Paket Tour Liburan Keluarga Jogja 3D2N Mobil Avanza + Driver & Hotel.", harga: "Rp 2.500.000 / Paket" },
    { nama: "Papa Darren", telp: "0813-2222-3311", desc: "Tenda Camping Anak Indoor / Outdoor Ukuran 2x2 Meter Mulus Komplit.", harga: "Rp 280.000" },
    { nama: "Bunda Claris", telp: "0857-3333-4412", desc: "Hammock Ayunan Gantung Keluarga Kain Kanvas Kuat Beban 150kg.", harga: "Rp 95.000" },
    { nama: "Studio Pigura Kayu", telp: "0878-4444-5513", desc: "Bingkai Foto Keluarga Custom Kayu Jati Minimalis Ukuran 40x60cm.", harga: "Rp 180.000" },
    { nama: "Foto Studio Ceria", telp: "0821-5555-6614", desc: "Paket Foto Keluarga Studio Tematik 10 Cetak + All Files Softcopy.", harga: "Rp 499.000" },
    { nama: "Taman Kebun Raya", telp: "0811-6666-7715", desc: "Voucher Piknik Keluarga Kebun Raya Bogor include Tiket & Tikar Piknik.", harga: "Rp 120.000" },
    { nama: "Pak Hendra", telp: "0852-7777-8816", desc: "Sepeda Tandem Orang Tua & Anak Roda 3 Kondisi Mulus Terawat.", harga: "Rp 1.400.000" },
    { nama: "Mama Fira", telp: "0819-8888-9917", desc: "Matras Piknik Waterproof Lipat motif Kotak Aesthetic Ukuran 200x150cm.", harga: "Rp 65.000" },
    { nama: "Toko Boardgame", telp: "0812-9999-0018", desc: "Board Game Keluarga Catan Junior Bahasa Indonesia Seru u/ Anak 6 thn+.", harga: "Rp 195.000" },
    { nama: "Papa Gio", telp: "0813-1010-2019", desc: "Barbeque Grill Set Portabel u/ Acara Keluarga Akhir Pekan Lengkap Arang.", harga: "Rp 150.000" }
  ],
  "Kesehatan": [
    { nama: "Apotek Medika", telp: "0812-1111-2211", desc: "Termometer Dahi Infra Merah Omron Non-Contact Hasil Cepat & Akurat.", harga: "Rp 320.000" },
    { nama: "Medika Baby Rent", telp: "0813-2222-3312", desc: "Sewa Nebulizer Omron Portable Mesh Silent u/ Anak Batuk Pilek.", harga: "Rp 20.000 / Hari" },
    { nama: "Toko Obat Sehat", telp: "0857-3333-4413", desc: "Vitamin Imboost Force Kids Syrup Penambah Daya Tahan Tubuh Anak 120ml.", harga: "Rp 75.000" },
    { nama: "Madu Herbal Ceria", telp: "0878-4444-5514", desc: "Madu Gemuk Anak Syifa Kids Penambah Nafsu Makan & Berat Badan Sehat.", harga: "Rp 45.000" },
    { nama: "Mama Kiki", telp: "0821-5555-6615", desc: "Salep Ruam Popok Sudocrem Healing Cream 125g Original Asli UK.", harga: "Rp 140.000" },
    { nama: "Bunda Sarah", telp: "0811-6666-7716", desc: "Plester Penurun Panas Bye Bye Fever Anak Paket isi 10 Lembar.", harga: "Rp 68.000" },
    { nama: "Minyak Telon Bidara", telp: "0852-7777-8817", desc: "Minyak Telon Bidara Anti Nyamuk & Kembung Bayi Hangat Lembut 100ml.", harga: "Rp 35.000" },
    { nama: "Apotek Sehat", telp: "0819-8888-9918", desc: "Obat Cacing Anak Combantrin Syrup Rasa Jeruk Usia 2 Tahun Keatas.", harga: "Rp 22.000" },
    { nama: "Bunda Astrid", telp: "0812-9999-0019", desc: "Steril Saline Spray Hidung Bayi Sterimar Baby u/ Melegakan Hidung Tersumbat.", harga: "Rp 155.000" },
    { nama: "P3K Family Pack", telp: "0813-1010-2020", desc: "Kotak P3K Lengkap Isi Kassa Steril, Alkohol Pad, Betadine & Plester Anak.", harga: "Rp 95.000" }
  ],
  "Keuangan": [
    { nama: "Perencana Finansial", telp: "0812-1111-2212", desc: "Konsultasi Perencanaan Keuangan Keluarga & Dana Pendidikan Anak.", harga: "Rp 300.000 / Sesi" },
    { nama: "Pegadaian Emas", telp: "0813-2222-3313", desc: "Tabungan Emas Syariah u/ Dana Sekolah Anak Bebas Biaya Admin 1 Tahun.", harga: "Mulai Rp 50.000" },
    { nama: "Bank Syariah Edukasi", telp: "0857-3333-4414", desc: "Deposito Syariah Masa Depan Anak Bagi Hasil Kompetitif Safe & Secure.", harga: "Mulai Rp 1 Juta" },
    { nama: "Audit Finansial RT", telp: "0878-4444-5515", desc: "Jasa Audit & Rapikan Anggaran Rumah Tangga u/ Pasangan Muda.", harga: "Rp 250.000" },
    { nama: "E-Book Keuangan", telp: "0821-5555-6616", desc: "E-Book Panduan Manajemen Gaji 5 Juta Cukup u/ Kebutuhan Bayi & Tabungan.", harga: "Rp 49.000" },
    { nama: "Pelatihan Reksadana", telp: "0811-6666-7717", desc: "Workshop Online Investasi Reksadana Pasar Uang u/ Dana Darurat Keluarga.", harga: "Rp 99.000" },
    { nama: "Konsultan Pajak RT", telp: "0852-7777-8818", desc: "Jasa Konsultasi & Pelaporan SPT Pajak Tahunan Perorangan Keluarga.", harga: "Rp 200.000" },
    { nama: "Asistensi Wasiat", telp: "0819-8888-9919", desc: "Jasa Konsultasi Pembuatan Wasiat & Hibah Aset u/ Anak Sesuai Hukum.", harga: "Rp 500.000" },
    { nama: "Voucher Saham Kids", telp: "0812-9999-0020", desc: "Voucher Tabungan Saham Perusahaan Bluechip u/ Investasi Jangka Panjang Anak.", harga: "Rp 100.000" },
    { nama: "Dana Pensiun Family", telp: "0813-1010-2021", desc: "Perencanaan Dana Hari Tua Orang Tua Tanpa Menyusahkan Anak kelak.", harga: "Rp 350.000 / Sesi" }
  ],
  "Klinik": [
    { nama: "Klinik Medika Depok", telp: "0812-1111-2213", desc: "Klinik Spesialis Anak & Imunisasi Depok. Dokter Ramah & Bebas Antre Panjang.", harga: "Konsul Rp 175.000" },
    { nama: "Klinik Tumbuh Kembang", telp: "0813-2222-3314", desc: "Klinik Terapi Wicara, Okupasi & Sensori Integrasi Anak Jaksel. Ruang AC.", harga: "Konsul Rp 250.000" },
    { nama: "Klinik Gigi Pediatrik", telp: "0857-3333-4415", desc: "Klinik Gigi Khusus Anak Bandung. Perawatan Tambal Gigi & Penambalan Fluoride.", harga: "Konsul Rp 150.000" },
    { nama: "Klinik Laktasi Surabaya", telp: "0878-4444-5516", desc: "Klinik Laktasi & Tumbuh Kembang Surabaya. Solusi Puting Lecet & Pelekatan.", harga: "Konsul Rp 200.000" },
    { nama: "Klinik Kebidanan", telp: "0821-5555-6617", desc: "Klinik Poliklinik Kebidanan & Kandungan USG 4D HD Live Canggih.", harga: "USG Rp 220.000" },
    { nama: "Klinik Fisioterapi Bayi", telp: "0811-6666-7718", desc: "Klinik Fisioterapi Bayi & Balita u/ Terapi Keterlambatan Motorik Kasar.", harga: "Terapi Rp 180.000" },
    { nama: "Klinik Imunisasi Drive-Thru", telp: "0852-7777-8819", desc: "Klinik Layanan Vaksin & Imunisasi Anak Drive-Thru Praktis Bebas Kontak.", harga: "Sesuai Vaksin" },
    { nama: "Klinik Kulit Bayi", telp: "0819-8888-9920", desc: "Klinik Dermatologi Khusus Bayi Sensitif, Dermatitis Atopik & Ruam.", harga: "Konsul Rp 220.000" },
    { nama: "Klinik THT Anak", telp: "0812-9999-0021", desc: "Klinik THT Khusus Anak Pembersihan Kotoran Telinga & Tes Pendengaran.", harga: "Konsul Rp 200.000" },
    { nama: "Klinik Mata Anak", telp: "0813-1010-2022", desc: "Klinik Spesialis Mata Anak Pemeriksaan Mata Silinder & Mata Juling.", harga: "Konsul Rp 210.000" }
  ],
  "Konsultasi": [
    { nama: "Psikolog Anak Ceria", telp: "0812-1111-2214", desc: "Konsultasi Psikolog Anak Online/Offline u/ Masalah Tantrum & Kecanduan Gadget.", harga: "Rp 250.000 / 60 Mnt" },
    { nama: "Dokter Spesialis Anak", telp: "0813-2222-3315", desc: "Konsultasi Online Dokter Spesialis Anak (Sp.A) via Telemedicine Resep Obat.", harga: "Rp 100.000 / Sesi" },
    { nama: "Konselor Laktasi", telp: "0857-3333-4416", desc: "Konsultasi Laktasi Homecare Penanganan ASI Seret, Bingung Puting & Pumping.", harga: "Rp 200.000 / Visit" },
    { nama: "Ahli Gizi MPASI", telp: "0878-4444-5517", desc: "Konsultasi Nutrisionis & Gizi Anak u/ Berat Badan Stagnan / Picky Eater.", harga: "Rp 150.000 / Sesi" },
    { nama: "Sleep Trainer Bayi", telp: "0821-5555-6618", desc: "Konsultasi Sleep Training Bayi Mandiri Tidur Nyenyak Sepanjang Malam.", harga: "Rp 350.000 / Paket" },
    { nama: "Konsultan Montessori", telp: "0811-6666-7719", desc: "Konsultasi Penataan Penyiapan Lingkungan Main Montessori di Rumah.", harga: "Rp 200.000 / Sesi" },
    { nama: "Konselor Pernikahan", telp: "0852-7777-8820", desc: "Konsultasi Pasangan Suami Istri u/ Pembagian Peran Pengasuhan Anak.", harga: "Rp 300.000 / Sesi" },
    { nama: "Konsultan Anak ABK", telp: "0819-8888-9921", desc: "Konsultasi Pendampingan Orang Tua Anak Berkebutuhan Khusus (Autisme/ADHD).", harga: "Rp 280.000 / Sesi" },
    { nama: "Konsultan Behavior", telp: "0812-9999-0022", desc: "Konsultasi Penanganan Masalah Perilaku Agresif & Emosi Anak Usia Dini.", harga: "Rp 220.000 / Sesi" },
    { nama: "Konsultan Remaja", telp: "0813-1010-2023", desc: "Konsultasi Komunikasi Efektif Orang Tua dengan Anak Usia Remaja.", harga: "Rp 250.000 / Sesi" }
  ],
  "Kursus": [
    { nama: "Aqua Tots Club", telp: "0812-1111-2215", desc: "Kursus Kelas Renang Bayi & Balita (Baby Swim 6 Bln - 3 Thn) Air Hangat.", harga: "Rp 200.000 / Visit" },
    { nama: "Little Chef Cooking", telp: "0813-2222-3316", desc: "Kursus Memasak & Membuat Roti Khas Anak Little Chef Melatih Kemandirian.", harga: "Rp 175.000 / Sesi" },
    { nama: "RoboKids Academy", telp: "0857-3333-4417", desc: "Kursus Robotik & Coding Scratch Kids u/ Anak SD Pertemuan Tiap Sabtu.", harga: "Rp 400.000 / Bulan" },
    { nama: "Sanggar Tari Ceria", telp: "0878-4444-5518", desc: "Kursus Seni Tari Tradisional & Modern Dance Anak Usia 4-10 Tahun.", harga: "Rp 150.000 / Bulan" },
    { nama: "Mandarin Kids Center", telp: "0821-5555-6619", desc: "Kursus Bahasa Mandarin Anak Metode Lagu & Permainan Interaktif.", harga: "Rp 350.000 / Bulan" },
    { nama: "Public Speaking Kids", telp: "0811-6666-7720", desc: "Kursus Public Speaking & Melatih Keberanian Bicara Anak di Depan Umum.", harga: "Rp 450.000 / Bulan" },
    { nama: "Sempoa Aritmatika", telp: "0852-7777-8821", desc: "Kursus Sempoa & Berhitung Bayangan u/ Anak TK & SD Melatih Otak Kanan.", harga: "Rp 200.000 / Bulan" },
    { nama: "Studio Melukis Canvas", telp: "0819-8888-9922", desc: "Kursus Melukis Cat Akrilik di Atas Kanvas u/ Anak Usia 6-12 Tahun.", harga: "Rp 250.000 / Bulan" },
    { nama: "Dojo Taekwondo Kids", telp: "0812-9999-0023", desc: "Kursus Bela Diri Taekwondo Anak u/ Melatih Kedisiplinan & Fisik.", harga: "Rp 180.000 / Bulan" },
    { nama: "Kriya Jahit Anak", telp: "0813-1010-2024", desc: "Kursus Jahit & Kriya Kerajinan Tangan Pakaian Anak Melatih Konsentrasi.", harga: "Rp 220.000 / Bulan" }
  ],
  "Les Privat": [
    { nama: "Kak Dian, S.Pd", telp: "0812-1111-2216", desc: "Les Privat Calistung (Baca, Tulis, Hitung) Datang ke Rumah Balita 4-6 Thn.", harga: "Rp 75.000 / Sesi" },
    { nama: "Miss Rina", telp: "0813-2222-3317", desc: "Les Privat Bahasa Inggris Phonics & Conversation Anak SD. Pengajar Ramah.", harga: "Rp 120.000 / 90 Mnt" },
    { nama: "Pak Teguh", telp: "0857-3333-4418", desc: "Les Privat Musik Organ & Piano Anak Usia Dini Menggunakan Lagu Anak.", harga: "Rp 150.000 / Datang" },
    { nama: "Ustadz Fatur", telp: "0878-4444-5519", desc: "Les Privat Mengaji Tahsin & Hifdzul Qur'an Juz Amma Khusus Anak ke Rumah.", harga: "Infaq Sukarela" },
    { nama: "Coach Faisal", telp: "0821-5555-6620", desc: "Les Privat Renang Anak Takut Air / Trauma Air Pendampingan Sabar.", harga: "Rp 500.000 / 4 Pertemuan" },
    { nama: "Guru Matematika SD", telp: "0811-6666-7721", desc: "Les Privat Matematika & IPA SD Kurikulum Merdeka Terbukti Nilai Naik.", harga: "Rp 90.000 / Sesi" },
    { nama: "Sanggar Seni Gambar", telp: "0852-7777-8822", desc: "Les Privat Gambar & Komik Manga Anak Datang ke Rumah Peralatan Lengkap.", harga: "Rp 110.000 / Sesi" },
    { nama: "Kak Bayu Sains", telp: "0819-8888-9923", desc: "Les Privat Sains Eksperimen Fisika Cilik & Biologi Menyenangkan.", harga: "Rp 130.000 / Sesi" },
    { nama: "Privat Komputer Kids", telp: "0812-9999-0024", desc: "Les Privat Desain Grafis Canva & Typing Komputer Anak SD.", harga: "Rp 100.000 / Sesi" },
    { nama: "Sensei Yulia", telp: "0813-1010-2025", desc: "Les Privat Bahasa Jepang Percakapan & Anime Kids u/ Anak Usia 7-12 Thn.", harga: "Rp 125.000 / Sesi" }
  ],
  "Lifestyle": [
    { nama: "Mama Callysta", telp: "0812-1111-2217", desc: "Diaper Backpack Leather Fashionable Tas Bayi Stylish Kompartemen Banyak.", harga: "Rp 280.000" },
    { nama: "Bunda Astrid", telp: "0813-2222-3318", desc: "Tumbler Stainless Anak Hot & Cold Thermo Flask 500ml Tahan 24 Jam.", harga: "Rp 115.000" },
    { nama: "Mama Olivia", telp: "0857-3333-4419", desc: "Pakaian Couple Ibu & Anak Perempuan Matching Dress Bahan Katun Rayon.", harga: "Rp 195.000 / Set" },
    { nama: "Diffuser Aromaterapi", telp: "0878-4444-5520", desc: "Diffuser Aromaterapi Humidifier Wood + Essential Oil Lavender u/ Tidur Bayi.", harga: "Rp 160.000" },
    { nama: "Bunda Nisa", telp: "0821-5555-6621", desc: "Mukena & Sajadah Anak Karakter Lucu Pouch Travel Bahan BSY Adem.", harga: "Rp 85.000" },
    { nama: "Papa Gio", telp: "0811-6666-7722", desc: "Smartwatch Anak Waterproof GPS Tracker Camera & Dual-Way Call.", harga: "Rp 210.000" },
    { nama: "Sepeda Listrik Ibu", telp: "0852-7777-8823", desc: "Sepeda Listrik Anak & Ibu Boncengan Mulus Merk Exotic Jarang Pakai.", harga: "Rp 2.900.000" },
    { nama: "Mama Fira", telp: "0819-8888-9924", desc: "Dompet Organizer Uang Belanja Bulanan Ibu Rumah Tangga 32 Slot Tanggal.", harga: "Rp 45.000" },
    { nama: "Slipper Rumah Empuk", telp: "0812-9999-0025", desc: "Sandal Slipper Rumah Empuk Anti Slip Karakter Kelinci u/ Ibu & Anak.", harga: "Rp 35.000" },
    { nama: "Bunda Vania", telp: "0813-1010-2026", desc: "Matras Yoga & Gym Ibu Hamil TPE Eco-Friendly Tebal 8mm Empuk.", harga: "Rp 135.000" }
  ],
  "Lowongan Kerja": [
    { nama: "Yayasan Ananda Ceria", telp: "0812-1111-2218", desc: "Dibutuhkan Babysitter Menginap Gaji 3.5jt - 4.2jt/bln. Jujur, Telaten & SKCK.", harga: "Gaji 3.5jt - 4.2jt" },
    { nama: "Keluarga Ibu Siska", telp: "0813-2222-3319", desc: "Dibutuhkan Perawat Lansia & Balita Menginap Jaksel. Fasilitas Kamar & Makan.", harga: "Gaji Rp 3.800.000" },
    { nama: "Pak Hendra", telp: "0857-3333-4420", desc: "Dibutuhkan Asisten Rumah Tangga (ART) Harian Bekasi Barat. Jam Kerja 08-16.", harga: "Gaji Rp 1.800.000" },
    { nama: "TKIT An-Nahl", telp: "0878-4444-5521", desc: "Dibutuhkan Guru PAUD / TK Islam S1 PGPAUD Depok. Penyayang Anak & Sabar.", harga: "Gaji UMR + Tunj" },
    { nama: "Lembaga Les Ceria", telp: "0821-5555-6622", desc: "Dibutuhkan Pengajar Les Privat Calistung Part-Time Surabaya. Pria/Wanita.", harga: "Rp 75rb / Sesi" },
    { nama: "Klinik Medika Anak", telp: "0811-6666-7723", desc: "Dibutuhkan Terapis Wicara & Okupasi Anak Lulusan D3/S1 Keterapian Fisik.", harga: "Gaji Rp 4.500.000" },
    { nama: "Catering MPASI Fresh", telp: "0852-7777-8824", desc: "Dibutuhkan Cooker / Jurumasak MPASI Katering Bayi Tangerang.", harga: "Gaji Rp 2.500.000" },
    { nama: "Papa Darren", telp: "0819-8888-9925", desc: "Dibutuhkan Driver Antar-Jemput Sekolah Anak Mobil Pribadi Ber-SIM A.", harga: "Gaji Rp 2.800.000" },
    { nama: "Daycare Ceria Bintaro", telp: "0812-9999-0026", desc: "Dibutuhkan Staff Admin & Front Office Daycare Bintaro Wanita Minimal SMA.", harga: "Gaji Rp 2.700.000" },
    { nama: "Toko Mainan Pangeran", telp: "0813-1010-2027", desc: "Dibutuhkan Karyawan Toko Mainan Anak & Kasir Bandung.", harga: "Gaji Rp 2.300.000" }
  ],
  "Mainan": [
    { nama: "Pangeran Toys", telp: "0812-1111-2219", desc: "Busy Board Montessori Kayu Edukasi Motorik Halus 12 Aktivitas Lengkap.", harga: "Rp 220.000" },
    { nama: "Mama Gio", telp: "0813-2222-3320", desc: "Perosotan Anak & Ayunan 3 in 1 Merk Labeille Bahan HDTE Tebal Kokoh.", harga: "Rp 750.000" },
    { nama: "Bunda Astrid", telp: "0857-3333-4421", desc: "Lego Duplo Classic Brick Box 10913 Original Complete 65 Pcs Dus Komplit.", harga: "Rp 380.000" },
    { nama: "Mama Callysta", telp: "0878-4444-5522", desc: "Wooden Kitchen Set Play House Mainan Masak-Masakan Dapur Kayu + Peralatan.", harga: "Rp 650.000" },
    { nama: "Pak Hendra", telp: "0821-5555-6623", desc: "Balance Bike London Taxi 12 Inchi Merah Sepeda Keseimbangan Mulus.", harga: "Rp 850.000" },
    { nama: "Papa Tristan", telp: "0811-6666-7724", desc: "Playmat Busa Lipat XPE Waterproof Ukuran 180x200cm Empuk u/ Balita.", harga: "Rp 145.000" },
    { nama: "Bunda Elsa", telp: "0852-7777-8825", desc: "Trampolin Mini Indoor Anak Diameter 1.4 Meter Pagar Pengaman Busa.", harga: "Rp 550.000" },
    { nama: "Mama Kenzo", telp: "0819-8888-9926", desc: "Kolam Renang Karet Balita Intex + Pompa Listrik Ukuran 1.5 Meter.", harga: "Rp 175.000" },
    { nama: "Toko Mainan Edukasi", telp: "0812-9999-0027", desc: "Mainan Pasir Kinetik Magic Sand 2kg + Nampan Inflatable & 12 Cetakan.", harga: "Rp 95.000" },
    { nama: "Papa Cello", telp: "0813-1010-2028", desc: "Tenda Mainan Anak Castle Princess/Prince Diameter 135cm Parasut.", harga: "Rp 110.000" }
  ],
  "Mencari Kerja": [
    { nama: "Siti Aminah", telp: "0812-1111-2220", desc: "Mencari Lowongan Perawat Bayi / Nanny Menginap. Pengalaman 4 thn. SKCK Komplit.", harga: "Gaji Nego" },
    { nama: "Kak Nurul, S.Pd", telp: "0813-2222-3321", desc: "Mencari Kerja Pendamping Belajar Anak (Governess) PAUD-SD. Lulusan PGPAUD.", harga: "Gaji Rp 3.500.000" },
    { nama: "Mbak Sri", telp: "0857-3333-4422", desc: "Mencari Kerja ART / Perawat Harian Non-Menginap Area Bekasi & Jaktim.", harga: "Rp 120.000 / Hari" },
    { nama: "Pak Agus Driver", telp: "0878-4444-5523", desc: "Mencari Kerja Sopir Pribadi Khusus Antar-Jemput Anak Sekolah SIM A Aktif.", harga: "Gaji Nego" },
    { nama: "Bidan Ratna", telp: "0821-5555-6624", desc: "Mencari Kerja Caregiver Bayi Kembar / Prematur Shift Malam / Homevisit.", harga: "Sesuai Shift" },
    { nama: "Ibu Dian Terapis", telp: "0811-6666-7725", desc: "Mencari Kerja Terapis Wicara Anak ABK Berpengalaman 5 Tahun Klinik.", harga: "Gaji Rp 4.000.000" },
    { nama: "Bidan Yuni", telp: "0852-7777-8826", desc: "Mencari Kerja Bidan Swasta / Konselor Laktasi Homecare Part-Time.", harga: "Nego Per Visit" },
    { nama: "Ustadz Fatur", telp: "0819-8888-9927", desc: "Mencari Kerja Pengajar Mengaji Privat Anak-Anak & Tahfidz Jus Amma.", harga: "Infaq Sukarela" },
    { nama: "Chef MPASI Sehat", telp: "0812-9999-0028", desc: "Mencari Kerja Juru Masak Katering Bayi / MPASI Sehat Bebas MSG.", harga: "Gaji Nego" },
    { nama: "Mbak Yanti", telp: "0813-1010-2029", desc: "Mencari Kerja Perawat Lansia & Nanny Menginap Jabodetabek Siap Kerja.", harga: "Gaji Rp 3.200.000" }
  ],
  "Menyusui": [
    { nama: "Bunda Nadya", telp: "0812-1111-2221", desc: "Pompa ASI Elektrik Handsfree Spectra S1 Plus Double Pump Rechargeable Mulus.", harga: "Rp 1.800.000" },
    { nama: "Mama Zhafira", telp: "0813-2222-3322", desc: "Kantong ASI Gabag BPA Free 120ml Paket 4 Box (120 Lembar) Anti Bocor.", harga: "Rp 110.000" },
    { nama: "Cooler Bag Store", telp: "0857-3333-4423", desc: "Cooler Bag ASI Gabag Thermal Bag + 2 Ice Gel Pack Tahan Cold 20 Jam.", harga: "Rp 195.000" },
    { nama: "Mama Kiki", telp: "0878-4444-5524", desc: "Breastpad Dicuci Ulang Organic Katun Bamboo Paket 8 Pcs + Pouch Cuci.", harga: "Rp 45.000" },
    { nama: "Bunda Elsa", telp: "0821-5555-6625", desc: "Apron / Kain Penutup Menyusui Katun Premium Melengkung Boning Rigid.", harga: "Rp 65.000" },
    { nama: "Almond Milk Booster", telp: "0811-6666-7726", desc: "Susu Pelancar ASI Almond Milk Formula Kalsium High Folat Kemasan 500g.", harga: "Rp 85.000" },
    { nama: "Mama Olivia", telp: "0852-7777-8827", desc: "Nipple Cream Medela Purelan 100 37g u/ Puting Lecet Lanolin 100% Safe.", harga: "Rp 135.000" },
    { nama: "Bunda Sarah", telp: "0819-8888-9928", desc: "Pompa ASI Manual Medela Harmony Flex Suction Lembut Nyaman Digunakan.", harga: "Rp 320.000" },
    { nama: "Bra Menyusui Shop", telp: "0812-9999-0029", desc: "Bra Menyusui Katun Seamless Buka Depan Tanpa Kawat Paket 3 Pcs.", harga: "Rp 95.000" },
    { nama: "Botol Kaca ASI Store", telp: "0813-1010-2030", desc: "Botol Kaca Kapsul Simpan ASI 100ml Tutup Karet Steril Paket 30 Pcs.", harga: "Rp 90.000" }
  ],
  "Nutrisi": [
    { nama: "YummyBaby Kitchen", telp: "0812-1111-2222", desc: "Catering MPASI Organik Harian Bebas Pengawet & MSG. Diolah Nutrisionis.", harga: "Rp 25.000 / Porsi" },
    { nama: "Apotek Sehat Nutrisi", telp: "0813-2222-3323", desc: "Minyak Ikan Cod Liver Oil Scott's Emulsion 400ml u/ Perkembangan Otak.", harga: "Rp 68.000" },
    { nama: "Susu Formula Store", telp: "0857-3333-4424", desc: "Susu Nutrilon Royal 3 Rasa Madu / Vanila 800g Asupan Nutrisi Anak SD.", harga: "Rp 185.000" },
    { nama: "Snack Bayi Organik", telp: "0878-4444-5525", desc: "Biskuit Bayi Yummy Bites Rice Crackers Paket 5 Varian Rasa.", harga: "Rp 75.000" },
    { nama: "Puree Buah Store", telp: "0821-5555-6626", desc: "Puree Buah Organik Gerber Pouches 90g Tanpa Gula Tambahan Pack 6 Pcs.", harga: "Rp 120.000" },
    { nama: "Bubur Bayi Milna", telp: "0811-6666-7727", desc: "Bubur Bayi Fortifikasi Milna Organic 6+ Rasa Beras Merah Paket 4 Box.", harga: "Rp 55.000" },
    { nama: "Gummy Vitamin Kids", telp: "0852-7777-8828", desc: "Vitamin C & Zinc Gummy Anak Nature's Way Kids Smart 60 Pastilles.", harga: "Rp 145.000" },
    { nama: "Superfood MPASI", telp: "0819-8888-9929", desc: "Chia Seed Organik & Rolled Oats MPASI Paket Nutrisi Serat Bayi.", harga: "Rp 50.000" },
    { nama: "Kaldu Organik Bayi", telp: "0812-9999-0030", desc: "Kaldu Jamur & Ayam Kampung Non-MSG Pawon Ibuk u/ Bumbu MPASI.", harga: "Rp 35.000" },
    { nama: "Madu Murni Akasia", telp: "0813-1010-2031", desc: "Madu Murni Akasia u/ Anak Usia 2 Thn+ Penjaga Kesehatan Alami 500g.", harga: "Rp 95.000" }
  ],
  "Obat": [
    { nama: "Apotek Medika", telp: "0812-1111-2223", desc: "Sanmol Syrup Sirup Demam & Nyeri Anak Rasa Jeruk 60ml Original.", harga: "Rp 22.000" },
    { nama: "Apotek Sehat", telp: "0813-2222-3324", desc: "Mucohexin Sirup Batuk Berdahak Anak Rasa Buah 60ml Terdaftar BPOM.", harga: "Rp 28.000" },
    { nama: "Bunda Kiki", telp: "0857-3333-4425", desc: "Salep Ruam Popok Sebamed Baby Rash Cream 100ml Anti Iritasi Kulit.", harga: "Rp 125.000" },
    { nama: "Lacto-B Probiotik", telp: "0878-4444-5526", desc: "Lacto-B Probiotik Penanganan Diare & Pencernaan Bayi Box 10 Sachet.", harga: "Rp 78.000" },
    { nama: "Obat Cacing Combantrin", telp: "0821-5555-6627", desc: "Combantrin Rasa Jeruk Obat Cacing Anak Usia 2-12 Tahun Botol 10ml.", harga: "Rp 20.000" },
    { nama: "Tetes Mata Steril", telp: "0811-6666-7728", desc: "Tetes Mata Anak Steril Refresh Contacts u/ Mata Merah & Gatal.", harga: "Rp 38.000" },
    { nama: "Aloclair Kids Spray", telp: "0852-7777-8829", desc: "Aloclair Plus Spray Obat Sariawan Anak Bebas Perih Mudah Disemprot.", harga: "Rp 98.000" },
    { nama: "Caladine Lotion Kids", telp: "0819-8888-9930", desc: "Caladine Lotion Anti Gatal & Biang Keringat Anak Botol 95ml.", harga: "Rp 24.000" },
    { nama: "Tetes Telinga Forumen", telp: "0812-9999-0031", desc: "Forumen Ear Drops Tetes Pembersih Kotoran Telinga Anak Botol 10ml.", harga: "Rp 35.000" },
    { nama: "Ferriz Drops Bayi", telp: "0813-1010-2032", desc: "Ferriz Drops Suplemen Zat Besi Penambah Darah Bayi & Balita 15ml.", harga: "Rp 48.000" }
  ],
  "Pakaian": [
    { nama: "Mama Arka", telp: "0812-1111-2224", desc: "Borongan Baju Bayi Newborn (0-6 Bln) Velvet Junior & Libby 20 Pcs Mulus.", harga: "Rp 150.000 / Lot" },
    { nama: "Bunda Elsa", telp: "0813-2222-3325", desc: "Jaket Winter Anak Uniqlo Light Warm Padded Size 110 (Usia 4-5 Thn) Yellow.", harga: "Rp 220.000" },
    { nama: "Mama Olivia", telp: "0857-3333-4426", desc: "Gaun Pesta Tutu Anak Perempuan Usia 2-3 Tahun + Bando Bunga Cantik.", harga: "Rp 120.000" },
    { nama: "Toko Baju Anak", telp: "0878-4444-5527", desc: "Piyama Katun Anak Lengan Panjang Motif Dinosaurus Usia 2-6 Tahun.", harga: "Rp 55.000" },
    { nama: "Mama Cello", telp: "0821-5555-6628", desc: "Kaos Polos Katun Combed 30s Anak Warna Pastel Pack 5 Pcs All Size.", harga: "Rp 95.000" },
    { nama: "Papa Tristan", telp: "0811-6666-7729", desc: "Celana Jeans Anak Stretch Mulus Merk Oskosh Size 4 (Usia 3-4 Thn).", harga: "Rp 75.000" },
    { nama: "Bunda Nisa", telp: "0852-7777-8830", desc: "Setelan Baju Koko & Sarung Instan Anak Laki-Laki Motif Bordir.", harga: "Rp 85.000" },
    { nama: "Mama Kiki", telp: "0819-8888-9931", desc: "Swimwear / Baju Renang UV Protection Anak Panjang + Topi Renang.", harga: "Rp 110.000" },
    { nama: "Bunda Astrid", telp: "0812-9999-0032", desc: "Setelan Overall Corduroy Anak Perempuan Vintage Style Size M.", harga: "Rp 90.000" },
    { nama: "Underwear Kids Shop", telp: "0813-1010-2033", desc: "Celana Dalam Katun Anak Motif Lucu Lembut Paket 6 Pcs All Size.", harga: "Rp 45.000" }
  ],
  "Pasca Kelahiran": [
    { nama: "Mama Zhafira", telp: "0812-1111-2225", desc: "Bengkung Tradisional Ibu Melahirkan 10 Meter Kain Belacu Tebal Nyaman.", harga: "Rp 85.000" },
    { nama: "Toko Jamu Bersalin", telp: "0813-2222-3326", desc: "Jamu Bersalin Lengkap Herbal Air Mancur Paket 40 Hari Pemulihan.", harga: "Rp 165.000" },
    { nama: "Bunda Elsa", telp: "0857-3333-4427", desc: "Gurita Ibu Melahirkan Kancing Sorex Katun Lembut Ukuran L.", harga: "Rp 55.000" },
    { nama: "Korset Postpartum Shop", telp: "0878-4444-5528", desc: "Korset Postpartum Bamboo Fiber 3 in 1 (Perut, Pinggang, Pinggul).", harga: "Rp 195.000" },
    { nama: "Spa Bersalin Homecare", telp: "0821-5555-6629", desc: "Paket Spa Pasca Melahirkan Homecare (Pijat Nifas, Lulur, Pilis & Tapel).", harga: "Rp 350.000 / Visit" },
    { nama: "Bidan Yuni Care", telp: "0811-6666-7730", desc: "Pijat Oksitosin & Pelancar Laktasi Home Visit u/ Ibu Baru Melahirkan.", harga: "Rp 180.000 / Visit" },
    { nama: "Mama Olivia", telp: "0852-7777-8831", desc: "Cream Pembakar Lemak Perut Pasca Caesar / Normal Clarins Mulus.", harga: "Rp 240.000" },
    { nama: "Disposable Underwear", telp: "0819-8888-9932", desc: "Celana Dalam Postpartum Disposable Sekali Pakai Pack 10 Pcs Jumbo.", harga: "Rp 40.000" },
    { nama: "Maternity Pads Store", telp: "0812-9999-0033", desc: "Pembalut Bersalin Maternity Pads Softex 45cm Panjang isi 20 Pcs.", harga: "Rp 45.000" },
    { nama: "Apotek Pemulihan", telp: "0813-1010-2034", desc: "Vitamin Pemulihan Luka Operasi Caesar Ekstrak Ikan Gabus Pujiang.", harga: "Rp 120.000" }
  ],
  "Pendidikan": [
    { nama: "TKIT An-Nahl Depok", telp: "0812-1111-2226", desc: "Pendaftaran Siswa Baru KB/TK Islam Terpadu Ceria. Diskon Uang Pangkal 20%.", harga: "Disc 20% Pangkal" },
    { nama: "SD Inklusi Montessori", telp: "0813-2222-3327", desc: "Pendaftaran Sekolah Dasar (SD) Inklusi & Montessori Bintaro. Kuota Terbatas.", harga: "Form Rp 250.000" },
    { nama: "Homeschooling Ceria", telp: "0857-3333-4428", desc: "Paket Kurikulum Homeschooling SD Usia Dini Berbasis Karakter & Minat Anak.", harga: "Rp 750.000 / Bln" },
    { nama: "SMP IT Smart Kids", telp: "0878-4444-5529", desc: "Voucher Diskon Uang Pangkal SMP IT Boarding School Beasiswa Tahfidz.", harga: "Voucher Rp 2 Juta" },
    { nama: "Program Tahfidz Cilik", telp: "0821-5555-6630", desc: "Program Karantina Tahfidz Anak Usia Dini Liburan Sekolah 1 Minggu.", harga: "Rp 850.000 / Paket" },
    { nama: "Beasiswa Sekolah Swasta", telp: "0811-6666-7731", desc: "Informasi Beasiswa Pendidikan Sekolah Swasta Nasional Plus u/ Anak Berprestasi.", harga: "Gratis Info" },
    { nama: "International School", telp: "0852-7777-8832", desc: "Kelas Preparatory International Primary School Kurikulum Cambridge.", harga: "Form Rp 350.000" },
    { nama: "KB Playgroup Ceria", telp: "0819-8888-9933", desc: "Pendaftaran Playgroup & KB Usia 2-4 Tahun. Fasilitas Playground Indoor.", harga: "Rp 800.000 / Bln" },
    { nama: "Workshop Parenting Edu", telp: "0812-9999-0034", desc: "Workshop Parenting Pendidikan Karakter Anak Gen-Alpha u/ Orang Tua.", harga: "Rp 120.000 / Sesi" },
    { nama: "Free Trial Playgroup", telp: "0813-1010-2035", desc: "Free Trial Class 1 Hari Playgroup Montessori BSD u/ Calon Siswa Baru.", harga: "Gratis Trial" }
  ],
  "Pengasuh": [
    { nama: "Yayasan Ananda Ceria", telp: "0812-1111-2227", desc: "Penyaluran Babysitter & Nanny Terlatih Bersertifikasi Pengalaman Min 3 Thn.", harga: "Gaji 2.8jt - 4.2jt" },
    { nama: "Penyalur Nanny Infant", telp: "0813-2222-3328", desc: "Nanny Infant Khusus Perawat Bayi Baru Lahir (Newborn) Terlatih Rumah Sakit.", harga: "Gaji Rp 4.000.000" },
    { nama: "Governess Pendamping", telp: "0857-3333-4429", desc: "Governess Pendamping Belajar & Karakter Anak Lulusan S1 PGPAUD / Psikologi.", harga: "Gaji Rp 4.500.000" },
    { nama: "Pengasuh Bayi Kembar", telp: "0878-4444-5530", desc: "Caregiver Khusus Bayi Kembar Telaten, Sabar & Paham Pengaturan MPASI Dual.", harga: "Gaji Rp 4.200.000" },
    { nama: "Mbak Sri Bekasi", telp: "0821-5555-6631", desc: "Pengasuh Harian Non-Menginap (08.00-17.00) Area Bekasi Barat & Jaktim.", harga: "Rp 120.000 / Hari" },
    { nama: "Companion Nanny Travel", telp: "0811-6666-7732", desc: "Nanny Companion Pendamping Liburan Keluarga Luar Kota / Luar Negeri.", harga: "Rp 350.000 / Hari" },
    { nama: "Perawat Bayi Prematur", telp: "0852-7777-8833", desc: "Perawat Medis Khusus Bayi Prematur / BBLR Penanganan Alat Kesehatan.", harga: "Gaji Rp 5.000.000" },
    { nama: "Pengasuh ABK Specialist", telp: "0819-8888-9934", desc: "Pengasuh Anak Special Needs (ABK / Autisme) Bersertifikat Terapis.", harga: "Gaji Rp 4.800.000" },
    { nama: "Yayasan Kasih Ibu", telp: "0812-9999-0035", desc: "Penyalur Nanny Menginap Jabodetabek Garansi Ganti 3x Dalam 1 Tahun.", harga: "Adm Rp 1.500.000" },
    { nama: "Pengasuh Balita 2-5 Thn", telp: "0813-1010-2036", desc: "Nanny Pengasuh Anak Usia Balita Cepat Akrab, Telaten & Pandai Mendongeng.", harga: "Gaji Rp 3.200.000" }
  ],
  "Peralatan": [
    { nama: "Mama Kiki", telp: "0812-1111-2228", desc: "High Chair Chicco Polly 2 in 1 Reclining 3 Posisi Meja Double Tray Mulus.", harga: "Rp 600.000" },
    { nama: "Bunda Nadya", telp: "0813-2222-3329", desc: "Sterilizer Botol UV Haenim 4G Rose Gold Second Fungsi Normal 100%.", harga: "Rp 1.650.000" },
    { nama: "Mama Zhafira", telp: "0857-3333-4430", desc: "Baby Food Processor Oomoor 5 in 1 Kukus, Blender & Steril Mulus.", harga: "Rp 450.000" },
    { nama: "Bunda Nisa", telp: "0878-4444-5531", desc: "Bak Mandi Bayi Lipat Hippo + Matras Mandi Apung Praktis Storage.", harga: "Rp 120.000" },
    { nama: "Mama Kenzo", telp: "0821-5555-6632", desc: "Changing Table Kayu Mahoni Putih Minimalis Roda Pengunci Kokoh.", harga: "Rp 1.200.000" },
    { nama: "Bottle Warmer Avent", telp: "0811-6666-7733", desc: "Fast Bottle Warmer Penghangat Susu Bayi Philips Avent Elektrik.", harga: "Rp 280.000" },
    { nama: "Baby Monitor Wireless", telp: "0852-7777-8834", desc: "Baby Monitor Camera Wireless Night Vision & Interkom 2 Arah.", harga: "Rp 350.000" },
    { nama: "Ibu Hani", telp: "0819-8888-9935", desc: "Slow Cooker Baby Safe 0.8L + Thermal Jar Stainless Zojirushi 350ml.", harga: "Rp 280.000 (Paket)" },
    { nama: "Humidifier Cool Mist", telp: "0812-9999-0036", desc: "Humidifier Cool Mist Ruang Anak Crane Frog 3.7L Silent Operation.", harga: "Rp 380.000" },
    { nama: "Set Teether Silicone", telp: "0813-1010-2037", desc: "Empeng & Teether Gigitan Bayi Silicone Fruit Feeder BPA Free Pack 4 Pcs.", harga: "Rp 65.000" }
  ],
  "Perawatan": [
    { nama: "Ceria Baby Spa", telp: "0812-1111-2229", desc: "Layanan Hydrotherapy & Baby Massage Kolam Air Hangat Steril Promo 5x Gratis 1x.", harga: "Rp 135.000 / Visit" },
    { nama: "Bidan Yuni Care", telp: "0813-2222-3330", desc: "Jasa Pijat Bayi Kolik, Batuk Pilek & Pijat Nafsu Makan Homevisit.", harga: "Rp 120.000 / Visit" },
    { nama: "Potong Rambut Botak", telp: "0857-3333-4431", desc: "Jasa Potong Rambut Bayi Newborn Botak Licin Syukuran Pukulan Halus.", harga: "Rp 85.000 / Visit" },
    { nama: "Skincare Baby Mustela", telp: "0878-4444-5532", desc: "Skincare Bayi Mustela Hydra Bebe Body Lotion 300ml Original Asli.", harga: "Rp 165.000" },
    { nama: "Cussons Baby Store", telp: "0821-5555-6633", desc: "Lotion Nyamuk Cussons Baby Natural Anti Mosquito Spray 100ml.", harga: "Rp 32.000" },
    { nama: "Cetaphil Baby Shop", telp: "0811-6666-7734", desc: "Cetaphil Baby Wash & Shampoo Organic Calendula 400ml Botol Pump.", harga: "Rp 145.000" },
    { nama: "Penumbuh Rambut Bayi", telp: "0852-7777-8835", desc: "Hair Lotion Minyak Kemiri Penumbuh Rambut Bayi Cantiqa Kemiri 100ml.", harga: "Rp 75.000" },
    { nama: "Massage Oil Baby", telp: "0819-8888-9936", desc: "Massage Oil Baby Organic Olive Oil & Chamomile u/ Pijat Bayi 100ml.", harga: "Rp 58.000" },
    { nama: "Mustela Cream Pipi", telp: "0812-9999-0037", desc: "Mustela Facial Cream u/ Ruam Pipi Bayi Akibat ASI & Air Liur 40ml.", harga: "Rp 115.000" },
    { nama: "Nail Trimmer Bayi", telp: "0813-1010-2038", desc: "Nail Trimmer Elektrik Pemotong Kuku Bayi Aman Bebas Luka + 6 Head Pads.", harga: "Rp 85.000" }
  ],
  "Perlengkapan": [
    { nama: "Ibu Maya", telp: "0812-1111-2230", desc: "Box Bayi Kayu Solid Merk Pliko + Kasur Busa Latex + Kelambu 120x70cm Mulus.", harga: "Rp 850.000" },
    { nama: "Bapak Aris", telp: "0813-2222-3331", desc: "Kasur Busa Bayi Latex Anti Alergi & Anti Kempes Ukuran 120x70cm.", harga: "Rp 320.000" },
    { nama: "Mama Cello", telp: "0857-3333-4432", desc: "Kelambu Box Bayi Lipat Portable Anti Nyamuk Rangka Baja Elastis.", harga: "Rp 65.000" },
    { nama: "Mama Fira", telp: "0878-4444-5533", desc: "Bantal Menyusui Omiland + Kasur Bayi Set Kelambu Karakter Dino Mulus.", harga: "Rp 150.000" },
    { nama: "Umi Kalsum", telp: "0821-5555-6634", desc: "Paket Cloth Diaper (Clodi) 10 Pcs + 20 Insert Microfiber Steril Air Panas.", harga: "Rp 250.000 Borongan" },
    { nama: "Matras Busa Edukasi", telp: "0811-6666-7735", desc: "Karpet Matras Busa Puzzle Abjad & Angka 30x30cm 36 Lembar Tebal 1cm.", harga: "Rp 110.000" },
    { nama: "Mama Kenzo", telp: "0852-7777-8836", desc: "Kasur Bayi Set Kelambu karakter Animal Crown Busa Dacron Empuk.", harga: "Rp 180.000" },
    { nama: "Napolly Storage Kids", telp: "0819-8888-9937", desc: "Lemari Pakaian Anak Plastik Napolly 4 Susun Karakter Frozen / Cars.", harga: "Rp 290.000" },
    { nama: "Hanger Baju Bayi", telp: "0812-9999-0038", desc: "Hanger Baju Bayi Warna-Warni Plastik Flexible Pack 12 Pcs.", harga: "Rp 18.000" },
    { nama: "Storage Container Toy", telp: "0813-1010-2039", desc: "Storage Box Container Mainan Anak Roda 55 Litre Plastik Tebal Transparan.", harga: "Rp 95.000" }
  ],
  "Sekolah": [
    { nama: "SD IT Al-Azhar Ceria", telp: "0812-1111-2231", desc: "Pendaftaran Siswa Baru SD IT Al-Azhar Kurikulum Merdeka & Tahfidz.", harga: "Form Rp 300.000" },
    { nama: "Sekolah Alam Bandung", telp: "0813-2222-3332", desc: "Sekolah Alam Kids Bandung. Belajar Ekosistem, Pertanian & Outbound.", harga: "Form Rp 250.000" },
    { nama: "Montessori Preschool", telp: "0857-3333-4433", desc: "KB & TK Montessori Bintaro. Lingkungan Asri, Bebas Gadget & Bilingual.", harga: "Rp 1.500.000 / Bln" },
    { nama: "Sekolah Inklusi Ceria", telp: "0878-4444-5534", desc: "Sekolah Inklusi ABK & Normal Gabung dengan Pendamping Shadow Teacher.", harga: "Form Rp 200.000" },
    { nama: "International Preschool", telp: "0821-5555-6635", desc: "International Preschool Kelapa Gading Kurikulum Singapore IPC.", harga: "Form Rp 500.000" },
    { nama: "Homeschooling Primary", telp: "0811-6666-7736", desc: "Sekolah Rumah (Homeschooling) Primary SD Ujian Kesetaraan Paket A.", harga: "Rp 600.000 / Bln" },
    { nama: "Open House SD IT", telp: "0852-7777-8837", desc: "Undangan Open House SD Islam Terpadu & Free Trial Class Sabtu Ini.", harga: "Gratis Masuk" },
    { nama: "Preschool BSD Serpong", telp: "0819-8888-9938", desc: "Trial Class Gratis Preschool BSD u/ Calon Usia 2-4 Tahun.", harga: "Gratis Trial" },
    { nama: "SMP Boarding School", telp: "0812-9999-0039", desc: "Pendaftaran SMP Boarding School Putra/Putri Kampus Modern.", harga: "Form Rp 350.000" },
    { nama: "TK Karakter Depok", telp: "0813-1010-2040", desc: "TK Karakter & Agamis Depok. Pembentukan Adab & Hafalan Juz 30.", harga: "Rp 700.000 / Bln" }
  ],
  "Sepatu": [
    { nama: "Papa Tristan", telp: "0812-1111-2232", desc: "Sepatu Prewalker Anak Nike Pico 5 Original Size 22 (Insole 12cm) Putih Mulus.", harga: "Rp 250.000" },
    { nama: "Toko Sepatu Kids", telp: "0813-2222-3333", desc: "Sepatu Lampu LED Anak Sneaker Bunyi Cit-Cit Size 21-25 Warna Red Blue.", harga: "Rp 85.000" },
    { nama: "Mama Cello", telp: "0857-3333-4434", desc: "Sandal Anak Porto Slip On Rubber Empuk Anti Slip Size 24.", harga: "Rp 35.000" },
    { nama: "Bunda Elsa", telp: "0878-4444-5535", desc: "Sepatu Boot Hujan Anak Motif Dinosaurus Waterproof Karet Size 26.", harga: "Rp 65.000" },
    { nama: "Mama Olivia", telp: "0821-5555-6636", desc: "Sepatu Pesta Anak Perempuan Shiny Pink Pita Mutiara Size 23.", harga: "Rp 95.000" },
    { nama: "Papa Gio", telp: "0811-6666-7737", desc: "Sepatu Roda Anak Adjustable Size 31-34 Komplek Helm & Pelindung.", harga: "Rp 280.000" },
    { nama: "Vans Kids Original", telp: "0852-7777-8838", desc: "Sepatu Canvas Vans Kids Original Slip-On Checkerboard Size 25 Mulus.", harga: "Rp 320.000" },
    { nama: "Sepatu Futsal Anak", telp: "0819-8888-9939", desc: "Sepatu Sepakbola / Futsal Anak Specs Original Size 30 Sol Karet.", harga: "Rp 140.000" },
    { nama: "Sandal Rubber Kids", telp: "0812-9999-0040", desc: "Sepatu Sandal Rubber Anti-Slip Karakter Shark u/ Anak 1-3 Tahun.", harga: "Rp 40.000" },
    { nama: "Baby Sock Shoes", telp: "0813-1010-2041", desc: "Kaos Kaki Sepatu Baby Sock Shoes Prewalker Karet Sol Empuk Pack 3 Pcs.", harga: "Rp 55.000" }
  ],
  "Seminar": [
    { nama: "Parenting Club Indonesia", telp: "0812-1111-2233", desc: "Seminar Parenting 'Mengatasi Tantrum Tanpa Emosi' Bersama Psikolog Anak.", harga: "Rp 75.000 / Tiket" },
    { nama: "Komunitas MPASI Sehat", telp: "0813-2222-3334", desc: "Seminar Online 'MPASI Perdana Bebas GTM' Lengkap Buku Resep PDF.", harga: "Rp 50.000 / Zoom" },
    { nama: "Digital Parent Academy", telp: "0857-3333-4435", desc: "Web Seminar 'Mendidik Anak Digital Native di Era AI' u/ Orang Tua Millennial.", harga: "Rp 60.000 / Sesi" },
    { nama: "Finansial Edukasi", telp: "0878-4444-5536", desc: "Seminar 'Persiapan Dana Pendidikan Anak Tanpa Utang' Bersama CFP.", harga: "Rp 99.000 / Tiket" },
    { nama: "Klinik Tumbuh Kembang", telp: "0821-5555-6637", desc: "Seminar 'Deteksi Dini Keterlambatan Bicara (Speech Delay) & ADHD'.", harga: "Rp 100.000 / Tiket" },
    { nama: "Asosiasi Ibu Menyusui", telp: "0811-6666-7738", desc: "Seminar 'Manajemen Stress & Dukungan Suami Saat Ibu Menyusui'.", harga: "Rp 45.000 / Zoom" },
    { nama: "Sex Education Kids", telp: "0852-7777-8839", desc: "Seminar 'Cara Tepat Memberikan Edukasi Seksual Sejak Dini pada Anak'.", harga: "Rp 80.000 / Tiket" },
    { nama: "Montessori Indonesia", telp: "0819-8888-9940", desc: "Seminar 'Pola Asuh Positif Montessori di Rumah Sederhana'.", harga: "Rp 85.000 / Sesi" },
    { nama: "Anti Bullying Movement", telp: "0812-9999-0041", desc: "Seminar 'Menghadapi Bullying & Membangun Kepercayaan Diri Anak'.", harga: "Rp 65.000 / Tiket" },
    { nama: "Gizi 1000 HPK", telp: "0813-1010-2042", desc: "Seminar 'Gizi & Nutrisi Optimal 1000 Hari Pertama Kehidupan Babysitter'.", harga: "Rp 50.000 / Zoom" }
  ],
  "Training": [
    { nama: "Palang Merah Indonesia", telp: "0812-1111-2234", desc: "Training Pertolongan Pertama (P3K) Bayi & Anak Tersedak / Kejang Demam.", harga: "Rp 150.000 / Sertif" },
    { nama: "Yayasan Babysitter", telp: "0813-2222-3335", desc: "Training Certified Nanny & Babysitter Profesional Penanganan MPASI & Babycare.", harga: "Rp 500.000 / Orang" },
    { nama: "Potty Training Center", telp: "0857-3333-4436", desc: "Training Potty Training Anak Tanpa Stres Lulus Lulus Lepas Popok 3 Hari.", harga: "Rp 95.000 / Kelas" },
    { nama: "Sensory Play Training", telp: "0878-4444-5537", desc: "Training Pembuatan Media Mainan Sensori Play Homemade Bebas Racun.", harga: "Rp 75.000 / Workshop" },
    { nama: "Chef MPASI Academy", telp: "0821-5555-6638", desc: "Training Pembuatan Katering MPASI Organik Bisnis Rumah Tangga.", harga: "Rp 250.000 / Modul" },
    { nama: "AIMI Konselor", telp: "0811-6666-7739", desc: "Training Pelatihan Konselor Laktasi & Menyusui Sertifikat Resmi 40 Jam.", harga: "Rp 1.500.000" },
    { nama: "Storytelling Academy", telp: "0852-7777-8840", desc: "Training Teknik Mendongeng & Storytelling Suara Karakter u/ Orang Tua.", harga: "Rp 120.000 / Sesi" },
    { nama: "Terapi Wicara Mandiri", telp: "0819-8888-9941", desc: "Training Terapi Wicara Mandiri di Rumah u/ Anak Speech Delay.", harga: "Rp 180.000 / Modul" },
    { nama: "Financial Freedom Kids", telp: "0812-9999-0042", desc: "Training Financial Literacy u/ Orang Tua Mengajari Anak Kelola Uang.", harga: "Rp 100.000 / Sesi" },
    { nama: "Choking Emergency", telp: "0813-1010-2043", desc: "Training Pertolongan Tersedak Heimlich Maneuver Khusus Bayi & Balita.", harga: "Rp 85.000 / Sesi" }
  ],
  "Transport": [
    { nama: "Mama Abel", telp: "0812-1111-2235", desc: "Stroller Bugaboo Bee 5 Second Mulus 92% Navy Blue Kanopi Utuh Bonus Seatliner.", harga: "Rp 4.200.000" },
    { nama: "RentBabyku", telp: "0813-2222-3336", desc: "Stroller Cabin Size Babyzen Yoyo2 Steril UV Komplit Pouch Travel.", harga: "Rp 35.000 / Hari" },
    { nama: "Ibu Claris", telp: "0857-3333-4437", desc: "Car Seat Joie Steadi Isofix 0-4 Tahun Mulus Kain Busa Empuk Bersih.", harga: "Rp 1.100.000" },
    { nama: "Bunda Sarah", telp: "0878-4444-5538", desc: "Baby Carrier Ergobaby Omni 360 Cool Air Mesh Midnight Blue Original Dus Utuh.", harga: "Rp 1.350.000" },
    { nama: "Papa Darren", telp: "0821-5555-6639", desc: "Carseat Convertible Graco Extend2Fit Posisi Legrest Ekstra Mulus.", harga: "Rp 1.650.000" },
    { nama: "Stroller Labeille Compact", telp: "0811-6666-7740", desc: "Stroller Labeille Compact Traveler Ringan Lipat Satu Tangan Bumper Bar.", harga: "Rp 650.000" },
    { nama: "Bunda Elsa", telp: "0852-7777-8841", desc: "Gendongan Kaos (Geos) Instan Katun Premium M-Shape Size M & L.", harga: "Rp 65.000" },
    { nama: "Sepeda Boncengan Kids", telp: "0819-8888-9942", desc: "Sepeda Boncengan Anak Front Seat Kursi Depan Komplit Sabuk Pengaman.", harga: "Rp 135.000" },
    { nama: "Booster Seat Car", telp: "0812-9999-0043", desc: "Car Seat Booster Seat u/ Anak Usia 4-8 Tahun Portable Ringan Sabuk.", harga: "Rp 180.000" },
    { nama: "Hipseat Babybjorn", telp: "0813-1010-2044", desc: "Hipseat Carrier Babybjorn Original Ergonomis Bebas Pegal Pundak.", harga: "Rp 850.000" }
  ],
  "Wisata": [
    { nama: "Taman Safari Bogor", telp: "0812-1111-2236", desc: "Tiket Masuk Taman Safari Bogor Family Pack (2 Dewasa + 2 Anak) E-Ticket Fast Pass.", harga: "Rp 750.000 / Paket" },
    { nama: "Hotel Kid Friendly Bandung", telp: "0813-2222-3337", desc: "Voucher Staycation Hotel Kid-Friendly Bandung (Include Breakfast & Playground).", harga: "Rp 850.000 / Malam" },
    { nama: "Outbound Sentul Family", telp: "0857-3333-4438", desc: "Paket Outbound Keluarga & Camping Sentul Bogor Edukasi Tangkap Ikan.", harga: "Rp 350.000 / Pax" },
    { nama: "Trans Studio Playland", telp: "0878-4444-5539", desc: "Tiket Trans Studio Mini Playland All Rides Pas Sepuasnya u/ Anak.", harga: "Rp 120.000 / Kartu" },
    { nama: "Wisata Sapi Perah", telp: "0821-5555-6640", desc: "Paket Wisata Edukasi Peternakan Sapi Perah & Memerah Susu Cisarua.", harga: "Rp 60.000 / Anak" },
    { nama: "Glamping Ciwidey", telp: "0811-6666-7741", desc: "Voucher Glamping Keluarga Ciwidey Danau Patengan Tenda Mewah Ber-Pemanas.", harga: "Rp 1.100.000 / Nite" },
    { nama: "Sea World & Ancol", telp: "0852-7777-8842", desc: "Tiket Masuk Sea World Ancol + Ocean Dream Samudra Bundle Hemat Anak.", harga: "Rp 160.000 / Tiket" },
    { nama: "Kebun Raya Purwodadi", telp: "0819-8888-9943", desc: "Paket Piknik Keluarga Kebun Raya Purwodadi Pasuruan Include Sepeda Listrik.", harga: "Rp 95.000 / Pax" },
    { nama: "Kidzania Jakarta", telp: "0812-9999-0044", desc: "Tiket Masuk Waterpark & Profession Park Kidzania Jakarta Sesi 1.", harga: "Rp 210.000 / Tiket" },
    { nama: "Museum Anak Edukasi", telp: "0813-1010-2045", desc: "Tour Wisata Edukasi Museum Anak Interaktif & Planetarium Jakarta.", harga: "Rp 45.000 / Tiket" }
  ]
};

// Build interleaved SQL statements
// Round robin: 10 rounds, 36 categories per round = 360 statements
let sqlStatements = [];
for (let round = 0; round < 10; round++) {
  for (let c = 0; c < categories.length; c++) {
    const cat = categories[c];
    const item = categoryAds[cat][round];
    const city = cities[(round * 36 + c) % cities.length];
    const job = occupations[(round * 36 + c) % occupations.length];
    const birthYear = 1982 + ((round * 7 + c * 3) % 18);
    
    // Escape single quotes for SQL
    const nameEsc = item.nama.replace(/'/g, "''");
    const descEsc = item.desc.replace(/'/g, "''");
    const hargaEsc = item.harga.replace(/'/g, "''");
    const catEsc = cat.replace(/'/g, "''");
    
    const sql = `INSERT INTO iklan_baris (nama, kota, pekerjaan, tahun_lahir, phone, kategori, keterangan_barang, harga, status) VALUES ('${nameEsc}', '${city}', '${job}', ${birthYear}, '${item.telp}', '${catEsc}', '${descEsc}', '${hargaEsc}', 'published');`;
    sqlStatements.push(sql);
  }
}

console.log(`Generated ${sqlStatements.length} SQL INSERT statements.`);

// Append to coro.md
const coroPath = path.join(process.cwd(), 'coro.md');
let coroContent = fs.readFileSync(coroPath, 'utf8');

const sectionHeader = `\n\n---

## 📰 25. Data Seed SQL Iklan Baris Parenting (360 Iklan Interleaved / Selang-Seling)

Berikut adalah **360 data seed SQL** untuk tabel \`iklan_baris\` di Cloudflare D1. Terdiri dari 36 kategori parenting (masing-masing 10 iklan) yang disajikan secara **selang-seling (interleaved / round-robin)** dari kategori 1 hingga 36 sebanyak 10 putaran:

\`\`\`sql
-- ==========================================================
-- SEED DATA IKLAN BARIS PARENTING (36 KATEGORI x 10 IKLAN = 360 ITEMS INTERLEAVED)
-- Engine: Cloudflare D1 / SQLite
-- ==========================================================

${sqlStatements.join('\n')}
\`\`\`
`;

fs.writeFileSync(coroPath, coroContent + sectionHeader, 'utf8');
console.log('Successfully appended 360 SQL seed statements to coro.md!');
