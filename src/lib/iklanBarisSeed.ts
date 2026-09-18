export interface IklanSeedItem {
  id: number;
  kategori: string;
  keteranganBarang: string;
  harga: string;
  nama: string;
  kota: string;
  pekerjaan: string;
  tahunLahir: number;
  phone: string;
  ipAddress: string;
  status: 'published' | 'pending' | 'rejected';
  createdAt: string;
}

// Kategorisasi Iklan Baris yang diselaraskan dengan kategori resmi admin situs
export const ALL_36_KATEGORI = [
'Aksesoris',
'Aplikasi',
'Asuransi',
'Bimbel',
'Buku',
'Daycare',
'Jasa',
'Kebersihan',
'Kehamilan',
'Keluarga',
'Kesehatan',
'Keuangan',
'Klinik',
'Konsultasi',
'Kursus',
'Les Privat',
'Lifestyle',
'Lowongan Kerja',
'Mainan',
'Mencari Kerja',
'Menyusui',
'Nutrisi Gizi',
'Obat',
'Pakaian',
'Pasca Kelahiran',
'Pendidikan',
'Pengasuh',
'Peralatan',
'Perawatan',
'Perlengkapan',
'Sekolah ',
'Sepatu',
'Seminar',
'Training',
'Transport',
'Wisata',
'Pola Asuh',
'Balita',
'Psikologi Ibu',
'Tumbuh Kembang',
'Umum',
];

const categoryTemplates: Record<string, { desc: string; harga: string; nama: string; kota: string; pekerjaan: string; phone: string }[]> = {
  'Pola Asuh': [
    { desc: 'Konsultasi Privat Pola Asuh Anak & Manajemen Tantrum Bersama Psikolog Keluarga berpengalaman 10 tahun.', harga: 'Rp 150.000 / Sesi', nama: 'Dr. Ratna, M.Psi', kota: 'Jakarta Selatan', pekerjaan: 'Psikolog Anak', phone: '0812-1001-2001' },
    { desc: 'Buku Panduan Gentle Parenting & Komunikasi Efektif Tanpa Bentak Hardcover Mulus.', harga: 'Rp 85.000', nama: 'Bunda Pustaka', kota: 'Bandung', pekerjaan: 'Penulis', phone: '0812-1001-2002' },
    { desc: 'Webinar Series Pola Asuh Remaja & Gadget Management untuk Orang Tua Millennial.', harga: 'Rp 50.000', nama: 'EduParenting ID', kota: 'Surabaya', pekerjaan: 'Konsultan', phone: '0812-1001-2003' },
    { desc: 'Kelas Online Disiplin Positif Anak Usia Dini Batch 15 Bersama Praktisi.', harga: 'Rp 120.000', nama: 'Mama Ceria', kota: 'Yogyakarta', pekerjaan: 'Trainer Parenting', phone: '0812-1001-2004' },
    { desc: 'Flashcard Sibling Rivalry & Solusi Anak Suka Rebut Mainan.', harga: 'Rp 45.000', nama: 'Smart Family', kota: 'Depok', pekerjaan: 'Wiraswasta', phone: '0812-1001-2005' },
    { desc: 'Pendampingan Home Visit Terapi Perilaku Anak Tantrum & Hiperaktif.', harga: 'Rp 250.000 / Kunjungan', nama: 'Kak Fajar, S.Psi', kota: 'Tangerang', pekerjaan: 'Terapis', phone: '0812-1001-2006' },
    { desc: 'Jasa Konseling Keluarga Harmonis & Solusi Komunikasi Suami Istri.', harga: 'Rp 200.000', nama: 'Bina Keluarga Sejahtera', kota: 'Semarang', pekerjaan: 'Konselor', phone: '0812-1001-2007' },
    { desc: 'Audiobook Dongeng Pengantar Tidur Pembentukan Karakter & Akhlak Mulia.', harga: 'Rp 35.000', nama: 'Dongeng Cilik', kota: 'Malang', pekerjaan: 'Creator', phone: '0812-1001-2008' },
    { desc: 'Workshop Parenting Islami Mendidik Anak di Era Digital Interaktif.', harga: 'Rp 75.000', nama: 'Majelis Keluarga', kota: 'Bekasi', pekerjaan: 'Pengajar', phone: '0812-1001-2009' },
    { desc: 'Konsultasi Privat Pemetaan Bakat & Minat Anak Berbasis Sidik Jari.', harga: 'Rp 300.000', nama: 'Biolink Kids', kota: 'Bogor', pekerjaan: 'Konsultan', phone: '0812-1001-2010' },
  ],
  'Tumbuh Kembang': [
    { desc: 'Matras Sensory Play & Water Splash Mat Waterproof Stimulasi Motorik Bayi.', harga: 'Rp 125.000', nama: 'Sensory Craft', kota: 'Jakarta Pusat', pekerjaan: 'Pengrajin', phone: '0813-2002-3001' },
    { desc: 'Alat Tes Milestone & Grafik Tumbuh Kembang Anak Standar WHO Lengkap.', harga: 'Rp 95.000', nama: 'Klinik Anak Sehat', kota: 'Bandung', pekerjaan: 'Bidan', phone: '0813-2002-3002' },
    { desc: 'Mainan Montessori Kayu Natural Wooden Peg Doll & Sorting Shapes.', harga: 'Rp 140.000', nama: 'Woody Toys ID', kota: 'Surabaya', pekerjaan: 'Craftsman', phone: '0813-2002-3003' },
    { desc: 'Jasa Stimulasi Fisioterapi Tumbuh Kembang Bayi Terlambat Jalan / Duduk.', harga: 'Rp 250.000', nama: 'Bidan Maya, S.Tr.Keb', kota: 'Yogyakarta', pekerjaan: 'Bidan Senior', phone: '0813-2002-3004' },
    { desc: 'Paket Mainan Edukasi Aktivitas Motorik Halus Anak Usia 1-3 Tahun.', harga: 'Rp 175.000', nama: 'ToyBox Cerdas', kota: 'Depok', pekerjaan: 'Wiraswasta', phone: '0813-2002-3005' },
    { desc: 'Baby Walker Roda Kayu Anti O Dilengkapi Rem Pengaman Stabilitas.', harga: 'Rp 220.000', nama: 'Baby Gear Store', kota: 'Tangerang', pekerjaan: 'Pedagang', phone: '0813-2002-3006' },
    { desc: 'Buku Aktivitas Sensori Quiet Book Kain Flanel Handmade Anti Robek.', harga: 'Rp 65.000', nama: 'Bunda Mitha', kota: 'Semarang', pekerjaan: 'Ibu Rumah Tangga', phone: '0813-2002-3007' },
    { desc: 'Konsultasi Nutrisi & Stimulasi Motorik Kasar Anak Bersama Dokter Spesialis.', harga: 'Rp 350.000', nama: 'Klinik Pediatrik', kota: 'Malang', pekerjaan: 'Dokter Anak', phone: '0813-2002-3008' },
    { desc: 'Kartu Flashcard Pintar Pengenalan Huruf, Angka & Hewan Suara 3 Bahasa.', harga: 'Rp 45.000', nama: 'Smart Flashcard', kota: 'Bekasi', pekerjaan: 'Penerbit', phone: '0813-2002-3009' },
    { desc: 'Playmat Puzzles Foam Mat Alas Lantai Anti Benturan Tebal 2cm.', harga: 'Rp 180.000', nama: 'Foam Mat Indonesia', kota: 'Medan', pekerjaan: 'Distributor', phone: '0813-2002-3010' },
  ],
  'Kesehatan & Gizi': [
    { desc: 'Paket Konsultasi Ahli Gizi & Penyusunan Menu MPASI Anti GTM Berbasis Berat Badan.', harga: 'Rp 100.000', nama: 'NutriKid Center', kota: 'Jakarta Selatan', pekerjaan: 'Nutrisionis', phone: '0814-3003-4001' },
    { desc: 'Vitamin D3 & Omega 3 Drops Asli Impor untuk Daya Tahan Tubuh & Otak Anak.', harga: 'Rp 210.000', nama: 'Vitamin Sehat Anak', kota: 'Surabaya', pekerjaan: 'Apoteker', phone: '0814-3003-4002' },
    { desc: 'Kaldu Jamur & Ayam Organik Bubuk Tanpa MSG Aman untuk MPASI 6 Bulan+.', harga: 'Rp 45.000', nama: 'Kaldu Alami Mama', kota: 'Bandung', pekerjaan: 'Wiraswasta', phone: '0814-3003-4003' },
    { desc: 'Buku Resep MPASI Anti Stunting & Menu Seimbang Keluarga Lengkap.', harga: 'Rp 75.000', nama: 'Dapur Sehat Bunda', kota: 'Yogyakarta', pekerjaan: 'Chef / Penulis', phone: '0814-3003-4004' },
    { desc: 'Madu Multivitamin Anak Peningkat Nafsu Makan & Imun Alami Propolis.', harga: 'Rp 90.000', nama: 'Madu Anak Pintar', kota: 'Semarang', pekerjaan: 'Herbalis', phone: '0814-3003-4005' },
    { desc: 'Termometer Infrared Digital Ear & Forehead Akurat Medis Garansi 3 Tahun.', harga: 'Rp 160.000', nama: 'Alat Kesehatanku', kota: 'Depok', pekerjaan: 'Distributor', phone: '0814-3003-4006' },
    { desc: 'Jasa Vaksinasi Anak ke Rumah (Homecare Vaccine Service) Dokter & Perawat.', harga: 'Rp 150.000 Jasa', nama: 'Homecare Medic', kota: 'Tangerang Selatan', pekerjaan: 'Perawat Medis', phone: '0814-3003-4007' },
    { desc: 'Biskuit MPASI Organik Bebas Gluten & Pengawet Rasa Buah Alami.', harga: 'Rp 35.000', nama: 'Organic Baby Food', kota: 'Bogor', pekerjaan: 'Produsen', phone: '0814-3003-4008' },
    { desc: 'Milk Warmer & Sterilizer Botol Susu Elektrik 3 in 1 Multifungsi.', harga: 'Rp 195.000', nama: 'Baby Care Store', kota: 'Malang', pekerjaan: 'Pedagang', phone: '0814-3003-4009' },
    { desc: 'Teh Herbal Alami Melancarkan ASI & Booster Laktasi Daun Katuk.', harga: 'Rp 50.000', nama: 'Booster ASI Asli', kota: 'Bekasi', pekerjaan: 'Herbalis', phone: '0814-3003-4010' },
  ],
  'Balita': [
    { desc: 'Pakaian Setelan Kaos & Celana Pendek Katun Lembut Balita Usia 1-4 Tahun Isi 3.', harga: 'Rp 75.000', nama: 'Baju Anak Lucu', kota: 'Bandung', pekerjaan: 'Konveksi', phone: '0815-4004-5001' },
    { desc: 'Sepatu Anak Bunyi Squeaker Lucu Anti Slip untuk Belajar Jalan Toddler.', harga: 'Rp 65.000', nama: 'Sepatu Ceria Kids', kota: 'Surabaya', pekerjaan: 'Pedagang', phone: '0815-4004-5002' },
    { desc: 'Tas Ransel Anak Karakter Hewan Lucu untuk Playgroup & PAUD.', harga: 'Rp 85.000', nama: 'Tas Kids Ceria', kota: 'Jakarta Timur', pekerjaan: 'Wiraswasta', phone: '0815-4004-5003' },
    { desc: 'Kolam Renang Karet Anak Portable Ukuran 1.2 Meter + Pompa Gratis.', harga: 'Rp 135.000', nama: 'Toys & Fun', kota: 'Depok', pekerjaan: 'Distributor', phone: '0815-4004-5004' },
    { desc: 'Pispot Latihan Toilet Training Anak (Potty Training Chair) Motif Bebek.', harga: 'Rp 95.000', nama: 'Baby Essentials', kota: 'Tangerang', pekerjaan: 'Pedagang', phone: '0815-4004-5005' },
    { desc: 'Sewa Mainan Perosotan & Ayunan Plastik Anak Indoor / Outdoor Bulanan.', harga: 'Rp 200.000 / Bln', nama: 'Rental Mainan Kids', kota: 'Semarang', pekerjaan: 'Rental Owner', phone: '0815-4004-5006' },
    { desc: 'Baju Muslim koko & Gamis Bayi Balita Bahan Katun Toyobo Adem.', harga: 'Rp 110.000', nama: 'Busana Muslim Anak', kota: 'Yogyakarta', pekerjaan: 'Konveksi', phone: '0815-4004-5007' },
    { desc: 'Sepeda Roda Tiga Anak Stroller Dorongan Besi Kokoh SNI.', harga: 'Rp 275.000', nama: 'Toko Sepeda Ananda', kota: 'Malang', pekerjaan: 'Pedagang', phone: '0815-4004-5008' },
    { desc: 'Mainan Balok Susun Kayu Building Blocks 100 Pcs + Tas Penyimpanan.', harga: 'Rp 120.000', nama: 'WoodToys Store', kota: 'Bekasi', pekerjaan: 'Wiraswasta', phone: '0815-4004-5009' },
    { desc: 'Jas Hujan Anak Ponco Karakter Lucu Bahan PVC Tebal Aman Anti Air.', harga: 'Rp 45.000', nama: 'Raincoat Kids', kota: 'Bogor', pekerjaan: 'Pedagang', phone: '0815-4004-5010' },
  ],
  'Psikologi Ibu': [
    { desc: 'Konseling Online Pemulihan Baby Blues & Postpartum Depression Bersama Psikolog Klinis.', harga: 'Rp 175.000 / Sesi', nama: 'Psikolog Klinis Ibu', kota: 'Jakarta Selatan', pekerjaan: 'Psikolog', phone: '0816-5005-6001' },
    { desc: 'Jurnal Harian Ibu Mindfulness & Self-Care Notebook Cetak Eksklusif.', harga: 'Rp 65.000', nama: 'Mindful Mom ID', kota: 'Bandung', pekerjaan: 'Penulis', phone: '0816-5005-6002' },
    { desc: 'Kelas Support Group Mental Health Ibu Muda & Sharing Circle Mingguan.', harga: 'Gratis Donasi', nama: 'Ibu Bahagia Community', kota: 'Surabaya', pekerjaan: 'Community Leader', phone: '0816-5005-6003' },
    { desc: 'Paket Aromaterapi Essential Oil Relaxing & Diffuser Anti Stres Ibu Rumah Tangga.', harga: 'Rp 220.000', nama: 'Aroma Calm', kota: 'Yogyakarta', pekerjaan: 'Wiraswasta', phone: '0816-5005-6004' },
    { desc: 'Buku Self-Healing untuk Ibu: Melepaskan Beban Burnout & Kelelahan Mental.', harga: 'Rp 88.000', nama: 'Pustaka Ibu', kota: 'Semarang', pekerjaan: 'Penerbit', phone: '0816-5005-6005' },
    { desc: 'Konsultasi Privat Mengatasi Kecemasan Pola Asuh & Overthinking Ibu.', harga: 'Rp 150.000', nama: 'Ibu Tenang Center', kota: 'Depok', pekerjaan: 'Konselor', phone: '0816-5005-6006' },
    { desc: 'Teh Bunga Chamomile & Lavender Organik Relaksasi Tidur Nyenyak Ibu.', harga: 'Rp 45.000', nama: 'Herbal Relax', kota: 'Malang', pekerjaan: 'Herbalis', phone: '0816-5005-6007' },
    { desc: 'Bantal Menyusui & Relaksasi Punggung Ergonomis Anti Pegal.', harga: 'Rp 130.000', nama: 'Comfort Mom', kota: 'Tangerang', pekerjaan: 'Produsen', phone: '0816-5005-6008' },
    { desc: 'Voucher Konseling Psikologi Keluarga & Hubungan Pernikahan Online.', harga: 'Rp 200.000', nama: 'Family Care Psikologi', kota: 'Bekasi', pekerjaan: 'Psikolog', phone: '0816-5005-6009' },
    { desc: 'Paket Yoga Prenatal & Postnatal Relaksasi Pernapasan Ibu Hamil & Menyusui.', harga: 'Rp 100.000', nama: 'Mom Yoga Studio', kota: 'Bali', pekerjaan: 'Instruktur Yoga', phone: '0816-5005-6010' },
  ],
  'Umum': [
    { desc: 'Jasa Pembersihan Rumah / Cleaning Service Pasca Renovasi & Cuci Kasur Bayi.', harga: 'Rp 150.000', nama: 'CleanHome Service', kota: 'Jakarta Selatan', pekerjaan: 'Penyedia Jasa', phone: '0817-6006-7001' },
    { desc: 'Jasa Dokumentasi Foto Keluarga & Newborn Studio / Home Visit Profesional.', harga: 'Rp 500.000', nama: 'Moments Photography', kota: 'Bandung', pekerjaan: 'Fotografer', phone: '0817-6006-7002' },
    { desc: 'Sewa Perlengkapan Bayi (Stroller, Car Seat, Bouncer) Mingguan / Bulanan.', harga: 'Rp 75.000 / Mgg', nama: 'Rental Perlengkapan Bayi', kota: 'Surabaya', pekerjaan: 'Rental Owner', phone: '0817-6006-7003' },
    { desc: 'Jasa Penyalur ART, Asisten Rumah Tangga & Pengasuh Bayi Bergaransi Resmi.', harga: 'Adm Rp 500.000', nama: 'Yayasan Berkah Bunda', kota: 'Depok', pekerjaan: 'Penyalur Resmi', phone: '0817-6006-7004' },
    { desc: 'Catering Harian Menu Sehat Keluarga & Anak Bebas MSG Free Delivery.', harga: 'Rp 35.000 / Porsi', nama: 'Dapur Bunda Catering', kota: 'Tangerang', pekerjaan: 'Catering Owner', phone: '0817-6006-7005' },
    { desc: 'Jasa Laundry Khusus Perlengkapan Bayi (Stroller, Car Seat, Kasur Bayi) Steril.', harga: 'Rp 60.000', nama: 'Baby Laundry Express', kota: 'Semarang', pekerjaan: 'Wiraswasta', phone: '0817-6006-7006' },
    { desc: 'Paket Souvenir Ultah Anak Custom Nama & Karakter Murah Meriah.', harga: 'Rp 10.000 / Pcs', nama: 'Souvenir Ceria', kota: 'Yogyakarta', pekerjaan: 'Konveksi', phone: '0817-6006-7007' },
    { desc: 'Jasa Perbaikan & Service Stroller / Kursi Roda Anak Panggilan ke Rumah.', harga: 'Rp 90.000', nama: 'Service Stroller Kilat', kota: 'Malang', pekerjaan: 'Teknisi', phone: '0817-6006-7008' },
    { desc: 'Sewa Kostum Karnaval & Profesi Anak (Dokter, Polisi, Pilot) Ukuran Balita.', harga: 'Rp 50.000 / Hari', nama: 'Kostum Anak Ceria', kota: 'Bekasi', pekerjaan: 'Rental', phone: '0817-6006-7009' },
    { desc: 'Tiket Masuk Wisata Edukasi Keluarga & Playground Anak Indoor Terbesar.', harga: 'Rp 75.000', nama: 'Wonderland Kids', kota: 'Bogor', pekerjaan: 'Marketing', phone: '0817-6006-7010' },
  ],
};

export function generate360ClassifiedAds(): IklanSeedItem[] {
  const result: IklanSeedItem[] = [];
  let globalId = 1;

  // We loop 15 rounds across all categories (interleaved / round-robin)
  for (let round = 0; round < 15; round++) {
    for (let catIdx = 0; catIdx < ALL_36_KATEGORI.length; catIdx++) {
      const cat = ALL_36_KATEGORI[catIdx];
      const templates = categoryTemplates[cat];

      let itemData: { desc: string; harga: string; nama: string; kota: string; pekerjaan: string; phone: string };

      if (templates && templates[round % templates.length]) {
        itemData = templates[round % templates.length];
      } else {
        const cities = ['Jakarta Selatan', 'Surabaya', 'Bandung', 'Depok', 'Tangerang', 'Bekasi', 'Yogyakarta', 'Semarang', 'Bogor', 'Malang', 'Medan', 'Makassar'];
        const city = cities[(round + catIdx) % cities.length];
        const names = ['Bunda Ratna', 'Mama Abel', 'Papa Darren', 'Kak Nurul, S.Pd', 'Siti Aminah', 'Bidan Maya', 'Ibu Claris', 'Pak Hendra', 'Mama Kenzo', 'Umi Kalsum'];
        const name = `${names[round % names.length]}`;
        
        itemData = {
          desc: `Layanan & Produk ${cat} Terbaik untuk Keluarga & Anak. Kualitas terjamin, bersih, aman & terpercaya di ${city}. Hubungi langsung.`,
          harga: `Rp ${(round + 1) * 50}.000`,
          nama: name,
          kota: city,
          pekerjaan: `Praktisi ${cat}`,
          phone: `081${(round % 9) + 1}-${catIdx + 10}00-${round + 10}00`,
        };
      }

      const daysAgo = (round % 5) + 1;
      result.push({
        id: globalId++,
        kategori: cat,
        keteranganBarang: itemData.desc,
        harga: itemData.harga,
        nama: itemData.nama,
        kota: itemData.kota,
        pekerjaan: itemData.pekerjaan,
        tahunLahir: 1985 + (round % 12),
        phone: itemData.phone,
        ipAddress: '127.0.0.1',
        status: 'published',
        createdAt: new Date(Date.now() - 3600000 * 24 * daysAgo).toISOString(),
      });
    }
  }

  return result;
}
