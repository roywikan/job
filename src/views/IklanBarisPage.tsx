import React, { useState, useEffect, useMemo } from 'react';
import { Tag, Send, CheckCircle2, AlertCircle, ChevronLeft, ChevronRight, Phone, MapPin, Briefcase, Filter, ShieldCheck, Newspaper, LayoutGrid, FileText } from 'lucide-react';
import { IklanBarisItem, SiteConfig } from '../types';
import TurnstileWidget from '../components/TurnstileWidget';
import NewspaperClassifiedGrid from '../components/NewspaperClassifiedGrid';
import SEOHelper from '../components/SEOHelper';

interface IklanBarisPageProps {
  siteConfig?: SiteConfig;
  onNavigate?: (view: string, param?: string) => void;
}

export default function IklanBarisPage({ siteConfig, onNavigate }: IklanBarisPageProps) {
  const siteName = siteConfig?.site_name || 'Portal Digital';

  const KATEGORI_OPTIONS = useMemo(() => {
    if (siteConfig?.classified_categories) {
      return siteConfig.classified_categories.split(',').map(s => s.trim()).filter(Boolean);
    }
    return [
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
      'Sekolah',
      'Sepatu',
      'Seminar',
      'Training',
      'Transport',
      'Wisata',
      'Pola Asuh',
      'Balita',
      'Psikologi Ibu',
      'Tumbuh Kembang',
      'Umum'
    ];
  }, [siteConfig?.classified_categories]);
    
  // View Mode State: 'newspaper' (Default print newspaper grid) or 'cards' (Modern card list)
    const [viewMode, setViewMode] = useState<'newspaper' | 'cards'>('newspaper');
    const [ads, setAds] = useState<IklanBarisItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [totalAllCount, setTotalAllCount] = useState(0);
    const [selectedKategori, setSelectedKategori] = useState('Semua');
    const [categoryCounts, setCategoryCounts] = useState<Record<string, number>>({});

    const formatCount = (count: number): string => {
      if (count > 999) return '> 1000';
      return String(count);
    };

    const getCategoryCount = (katName: string): number => {
      if (categoryCounts[katName] !== undefined) return Number(categoryCounts[katName]) || 0;
      if (categoryCounts[katName.toUpperCase()] !== undefined) return Number(categoryCounts[katName.toUpperCase()]) || 0;
      const clean = katName.trim().toLowerCase();
      for (const [key, val] of Object.entries(categoryCounts)) {
        if (key.trim().toLowerCase() === clean) return Number(val) || 0;
      }
      return 0;
    };

    const totalSumFromCategories = useMemo(() => {
      return (Object.values(categoryCounts) as number[]).reduce<number>((acc, c) => acc + (typeof c === 'number' ? c : (Number(c) || 0)), 0);
    }, [categoryCounts]);

    const displayTotalAll = totalAllCount || (selectedKategori === 'Semua' ? totalCount : 0) || totalSumFromCategories || totalCount;
  
    // Form State
    const [showForm, setShowForm] = useState(false);
    const [nama, setNama] = useState('');
    const [kota, setKota] = useState('');
    const [pekerjaan, setPekerjaan] = useState('');
    const [tahunLahir, setTahunLahir] = useState<number | ''>('');
    const [phone, setPhone] = useState('');
    const [kategori, setKategori] = useState('');
    const [keteranganBarang, setKeteranganBarang] = useState('');
    const [harga, setHarga] = useState('');
    const [expiresAt, setExpiresAt] = useState('');

    useEffect(() => {
      const opts = siteConfig?.classified_categories ? siteConfig.classified_categories.split(',').map(s => s.trim()).filter(Boolean) : ['Aksesoris',
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
'Sekolah',
'Sepatu',
'Seminar',
'Training',
'Transport',
'Wisata',
'Pola Asuh',
'Balita',
'Psikologi Ibu',
'Tumbuh Kembang',
'Umum'];
      if (opts.length > 0 && (!kategori || !opts.includes(kategori))) {
        setKategori(opts[0]);
      }
    }, [siteConfig?.classified_categories]);
  const [turnstileToken, setTurnstileToken] = useState('');
  const [turnstileLoadFailed, setTurnstileLoadFailed] = useState(false);
  const [websiteUrlHp, setWebsiteUrlHp] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState('');
  const [submitError, setSubmitError] = useState('');

  // Initial fetch for category counts across all categories
  useEffect(() => {
    const fetchInitialCounts = async () => {
      try {
        const res = await fetch('/api/iklan-baris?page=1&limit=1');
        if (res.ok) {
          const data = await res.json();
          if (data.categoryCounts && Object.keys(data.categoryCounts).length > 0) {
            setCategoryCounts(data.categoryCounts);
          }
          if (data.totalAll !== undefined) {
            setTotalAllCount(data.totalAll);
          } else if (data.total !== undefined) {
            setTotalAllCount(data.total);
          }
        }
      } catch (err) {
        console.error('Failed to load initial category counts:', err);
      }
    };
    fetchInitialCounts();
  }, []);

  // Read initial URL Search Parameters on mount (e.g., ?kat=nanny&page=2 or ?kategori=nanny&page=2)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const pageParam = parseInt(params.get('page') || '1', 10);
      const katParam = params.get('kategori') || params.get('kat');
      if (!isNaN(pageParam) && pageParam > 0) {
        setCurrentPage(pageParam);
      }
      if (katParam) {
        setSelectedKategori(katParam);
      }
    }
  }, []);

  // Fetch Ads with STRICT MAX 20 ADS PER PAGE LIMIT and update URL parameters
  const fetchAds = async (page: number, kat: string) => {
    try {
      setLoading(true);
      const queryKat = kat !== 'Semua' ? `&kategori=${encodeURIComponent(kat)}` : '';
      const res = await fetch(`/api/iklan-baris?page=${page}&limit=20${queryKat}`);
      if (res.ok) {
        const data = await res.json();
        setAds(data.items || []);
        setTotalPages(data.totalPages || 1);
        setTotalCount(data.total || 0);
        if (data.totalAll !== undefined) {
          setTotalAllCount(data.totalAll);
        } else if (kat === 'Semua') {
          setTotalAllCount(data.total || 0);
        }
        if (data.categoryCounts && Object.keys(data.categoryCounts).length > 0) {
          setCategoryCounts(data.categoryCounts);
        }
      }
    } catch (err) {
      console.error('Failed to fetch iklan baris:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAds(currentPage, selectedKategori);

    // Sync URL parameters for clean crawler navigation
    if (typeof window !== 'undefined' && window.history) {
      const params = new URLSearchParams();
      if (currentPage > 1) params.set('page', String(currentPage));
      if (selectedKategori && selectedKategori !== 'Semua') {
        params.set('kategori', selectedKategori);
      }
      const newSearch = params.toString() ? `?${params.toString()}` : window.location.pathname;
      window.history.replaceState(null, '', newSearch);
    }
  }, [currentPage, selectedKategori]);

  // Inject <link rel="prev"> and <link rel="next"> into document.head for Googlebot SEO crawling
  useEffect(() => {
    if (typeof document === 'undefined') return;
    const origin = window.location.origin;
    const path = window.location.pathname;
    const katQuery = selectedKategori !== 'Semua' ? `&kategori=${encodeURIComponent(selectedKategori)}` : '';

    // Clean up existing rel=prev / rel=next
    document.querySelectorAll('link[rel="prev"], link[rel="next"]').forEach((el) => el.remove());

    if (currentPage > 1) {
      const prevLink = document.createElement('link');
      prevLink.rel = 'prev';
      prevLink.href = `${origin}${path}?page=${currentPage - 1}${katQuery}`;
      document.head.appendChild(prevLink);
    }
    if (currentPage < totalPages) {
      const nextLink = document.createElement('link');
      nextLink.rel = 'next';
      nextLink.href = `${origin}${path}?page=${currentPage + 1}${katQuery}`;
      document.head.appendChild(nextLink);
    }
  }, [currentPage, totalPages, selectedKategori]);

  // Dynamic JSON-LD Structured Data Schema for Googlebot Crawling & Indexing
  const jsonLdData = useMemo(() => {
    const origin = typeof window !== 'undefined' ? window.location.origin : (siteConfig?.site_url || '');
    const pageUrl = `${origin}/iklan-baris?page=${currentPage}${selectedKategori !== 'Semua' ? `&kategori=${encodeURIComponent(selectedKategori)}` : ''}`;

    // Ensure ads are deduplicated by id to strictly avoid duplicate ItemList entries in Google validator
    const uniqueAds = Array.from(new Map<number, IklanBarisItem>(ads.map((item) => [item.id, item])).values());
    const seenDescriptions = new Set<string>();

    return {
      "@context": "https://schema.org",
      "@type": "ItemList",
      "@id": `${pageUrl}#classified-ads-list`,
      "name": `Daftar Iklan Baris ${selectedKategori} (Halaman ${currentPage})`,
      "numberOfItems": uniqueAds.length,
      "itemListElement": uniqueAds.map((item, index) => {
        let cleanDesc = (item.keteranganBarang || '').trim();
        // Prevent "Identical property values given" by ensuring unique description per ListItem
        if (!cleanDesc) {
          cleanDesc = `${item.kategori} - ${item.nama} (#${item.id})`;
        } else if (seenDescriptions.has(cleanDesc)) {
          cleanDesc = `${cleanDesc} (Iklan #${item.id})`;
        }
        seenDescriptions.add(cleanDesc);

        return {
          "@type": "ListItem",
          "position": index + 1,
          "name": `${item.kategori} - ${item.nama} (#${item.id})`,
          "url": `${pageUrl}#ad-${item.id}`,
          "description": cleanDesc
        };
      })
    };
  }, [ads, currentPage, selectedKategori, siteConfig]);

  // Clean up JSON-LD on unmount
  useEffect(() => {
    return () => {
      const el = document.getElementById('jsonld-iklanbaris-schema');
      if (el) el.remove();
    };
  }, []);

  // Stable single script tag injection: update textContent in-place to prevent multiple node extractions by Googlebot
  useEffect(() => {
    if (typeof document === 'undefined') return;
    if (ads.length === 0) return; // Wait until classified ads data has been fetched

    // Remove any stale homepage ItemList script
    const staleItemList = document.getElementById('jsonld-itemlist-schema');
    if (staleItemList) staleItemList.remove();

    let script = document.getElementById('jsonld-iklanbaris-schema') as HTMLScriptElement | null;
    if (!script) {
      script = document.createElement('script');
      script.id = 'jsonld-iklanbaris-schema';
      script.type = 'application/ld+json';
      document.head.appendChild(script);
    }
    script.textContent = JSON.stringify(jsonLdData, null, 2);
  }, [jsonLdData, ads.length]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitSuccess('');
    setSubmitError('');

    if (!nama.trim() || !kota.trim() || !pekerjaan.trim() || !tahunLahir || !phone.trim() || !kategori || !keteranganBarang.trim() || !harga.trim()) {
      setSubmitError('Seluruh kolom isian formulir iklan baris wajib diisi.');
      return;
    }

    if (siteConfig?.enable_comment_turnstile !== false && !turnstileLoadFailed && !turnstileToken) {
      setSubmitError('Harap selesaikan verifikasi keamanan Turnstile (anti-bot) terlebih dahulu.');
      return;
    }

    try {
      setSubmitting(true);
      const res = await fetch('/api/iklan-baris', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nama: nama.trim(),
          kota: kota.trim(),
          pekerjaan: pekerjaan.trim(),
          tahunLahir: Number(tahunLahir),
          phone: phone.trim(),
          kategori: kategori.trim(),
          keteranganBarang: keteranganBarang.trim(),
          harga: harga.trim(),
          expiresAt: expiresAt.trim() ? expiresAt.trim() : undefined,
          turnstileToken,
          website_url_hp: websiteUrlHp,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSubmitSuccess(data.message || 'Iklan baris Anda berhasil dikirim! Iklan akan diperiksa dan diedit oleh tim Editor sebelum ditayangkan.');
        // Reset Form
        setNama('');
        setKota('');
        setPekerjaan('');
        setTahunLahir('');
        setPhone('');
        setKategori('Pola Asuh');
        setKeteranganBarang('');
        setHarga('');
        setExpiresAt('');
        setShowForm(false);
        window.scrollTo({ top: 300, behavior: 'smooth' });
      } else {
        setSubmitError(data.error || 'Gagal mengirim iklan baris. Silakan coba lagi.');
      }
    } catch (err: any) {
      setSubmitError('Terjadi kesalahan koneksi server: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const calculateAge = (birthYear?: number) => {
    if (!birthYear) return '';
    const currentYear = new Date().getFullYear();
    const age = currentYear - birthYear;
    return age > 0 ? `${age} thn` : '';
  };

  const origin = typeof window !== 'undefined' ? window.location.origin : (siteConfig?.site_url || '');
  const seoTitle = selectedKategori !== 'Semua'
    ? `Iklan Baris ${selectedKategori} | ${siteName}`
    : `Iklan Baris Gratis | ${siteName}`;
  const seoDesc = `Pasang dan temukan iklan baris, pengumuman, dan warta produk/jasa di ${siteName}. Gratis, dimoderasi redaksi.`;
  const seoCanonical = currentPage > 1
    ? `${origin}/iklan-baris?page=${currentPage}${selectedKategori !== 'Semua' ? `&kategori=${encodeURIComponent(selectedKategori)}` : ''}`
    : (selectedKategori !== 'Semua' ? `${origin}/iklan-baris?kategori=${encodeURIComponent(selectedKategori)}` : `${origin}/iklan-baris`);

  return (
    <div className="min-h-screen bg-amber-50/40 dark:bg-slate-950 text-slate-900 dark:text-slate-100 py-10 font-sans">
      <SEOHelper
        title={seoTitle}
        description={seoDesc}
        canonicalUrl={seoCanonical}
        type="website"
        siteName={siteName}
        category="Iklan Baris"
        keywords={['iklan baris', 'jual beli parenting', 'les privat', 'babysitter', siteName]}
      />
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        
        {/* SIMPLIFIED HEADER */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6 border-b-2 border-slate-900 dark:border-slate-700 pb-4">
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white uppercase font-serif tracking-tight">
            IKLAN BARIS GRATIS
          </h1>

          <button
            onClick={() => {
              setShowForm(!showForm);
              setSubmitSuccess('');
              setSubmitError('');
            }}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-300 dark:bg-amber-400 dark:hover:bg-amber-300 dark:text-slate-900 font-bold text-xs uppercase tracking-wider shadow transition-transform transform hover:scale-105"
          >
            <Send className="w-4 h-4" />
            {showForm ? 'Tutup Form Iklan' : '+ Pasang Iklan Baris'}
          </button>
        </div>

        {/* NOTIFICATION BANNERS */}
        {submitSuccess && (
          <div className="mb-8 p-5 bg-emerald-50 dark:bg-emerald-950/80 border-2 border-emerald-600 rounded-2xl flex items-start gap-3 text-emerald-900 dark:text-emerald-200 shadow animate-fade-in">
            <CheckCircle2 className="w-6 h-6 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-black text-base uppercase mb-1">Berhasil Terkirim!</h4>
              <p className="text-sm font-medium leading-relaxed">{submitSuccess}</p>
            </div>
          </div>
        )}

        {/* FORM GUEST CLASSIFIED AD SUBMISSION */}
        {showForm && (
          <div className="bg-stone-50 dark:bg-slate-900 border-2 border-slate-900 dark:border-slate-700 rounded-2xl p-6 sm:p-8 shadow-xl mb-10">
            <div className="flex items-center justify-between border-b-2 border-slate-900 dark:border-slate-700 pb-3 mb-6">
              <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2 font-serif">
                <Tag className="w-5 h-5 text-amber-600 dark:text-amber-400" /> Formulir Kiriman Iklan Baris Pembaca
              </h3>
            </div>

            {submitError && (
              <div className="mb-6 p-4 bg-rose-50 dark:bg-rose-950/60 border border-rose-400 rounded-xl flex items-center gap-3 text-rose-800 dark:text-rose-200 text-sm font-semibold">
                <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-600" />
                <span>{submitError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-xs sm:text-sm">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* KATEGORI */}
                <div>
                  <label className="block font-extrabold uppercase tracking-wider text-slate-800 dark:text-slate-200 mb-1">
                    Kategori Iklan <span className="text-rose-600">*</span>
                  </label>
                  <select
                    value={kategori}
                    onChange={(e) => setKategori(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border-2 border-slate-400 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  >
                    {KATEGORI_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>

                {/* NAMA PENJUAL / KONTAK */}
                <div>
                  <label className="block font-extrabold uppercase tracking-wider text-slate-800 dark:text-slate-200 mb-1">
                    Nama Pemilik / Penjual <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={nama}
                    onChange={(e) => setNama(e.target.value)}
                    placeholder="Contoh: Dedi Supriadi"
                    className="w-full px-3 py-2.5 rounded-xl border-2 border-slate-400 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>

                {/* KOTA */}
                <div>
                  <label className="block font-extrabold uppercase tracking-wider text-slate-800 dark:text-slate-200 mb-1">
                    Kota Domisili <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={kota}
                    onChange={(e) => setKota(e.target.value)}
                    placeholder="Contoh: Jakarta Selatan"
                    className="w-full px-3 py-2.5 rounded-xl border-2 border-slate-400 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* PEKERJAAN */}
                <div>
                  <label className="block font-extrabold uppercase tracking-wider text-slate-800 dark:text-slate-200 mb-1">
                    Pekerjaan <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={pekerjaan}
                    onChange={(e) => setPekerjaan(e.target.value)}
                    placeholder="Contoh: Wiraswasta"
                    className="w-full px-3 py-2.5 rounded-xl border-2 border-slate-400 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>

                {/* TAHUN LAHIR */}
                <div>
                  <label className="block font-extrabold uppercase tracking-wider text-slate-800 dark:text-slate-200 mb-1">
                    Tahun Lahir <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min={1930}
                    max={2020}
                    value={tahunLahir}
                    onChange={(e) => setTahunLahir(e.target.value ? Number(e.target.value) : '')}
                    placeholder="Contoh: 1985"
                    className="w-full px-3 py-2.5 rounded-xl border-2 border-slate-400 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>

                {/* NOMOR HP / WHATSAPP UNTUK DITANYAKAN */}
                <div>
                  <label className="block font-extrabold uppercase tracking-wider text-slate-800 dark:text-slate-200 mb-1">
                    Nomor Kontak Ditayangkan <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Contoh: 0812-9876-5432"
                    className="w-full px-3 py-2.5 rounded-xl border-2 border-slate-400 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* HARGA */}
              <div>
                <label className="block font-extrabold uppercase tracking-wider text-slate-800 dark:text-slate-200 mb-1">
                  Harga Barang / Jasa <span className="text-rose-600">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={harga}
                  onChange={(e) => setHarga(e.target.value)}
                  placeholder="Contoh: Rp 145.000.000 (Nego) atau Rp 500.000 / bln"
                  className="w-full px-3 py-2.5 rounded-xl border-2 border-slate-400 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              {/* TANGGAL SELESAI TAYANG (OPSIONAL) */}
              <div>
                <label className="block font-extrabold uppercase tracking-wider text-slate-800 dark:text-slate-200 mb-1">
                  Tanggal Selesai Tayang <span className="text-slate-500 font-normal text-xs normal-case">(Opsional)</span>
                </label>
                <input
                  type="date"
                  min={new Date().toISOString().split('T')[0]}
                  value={expiresAt}
                  onChange={(e) => setExpiresAt(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border-2 border-slate-400 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                  * Tentukan tanggal kapan iklan harus diturunkan / berakhir masa tayangnya. Kosongkan jika ingin ditayangkan tanpa batas waktu sampai diturunkan manual oleh redaksi.
                </p>
              </div>

              {/* KETERANGAN BARANG */}
              <div>
                <label className="block font-extrabold uppercase tracking-wider text-slate-800 dark:text-slate-200 mb-1">
                  Keterangan Barang / Jasa Lengkap <span className="text-rose-600">*</span>
                </label>
                <textarea
                  required
                  rows={4}
                  maxLength={parseInt(siteConfig?.classified_max_chars || '250', 10)}
                  value={keteranganBarang}
                  onChange={(e) => setKeteranganBarang(e.target.value)}
                  placeholder="Contoh: HONDA BRIO E CVT 2021 Putih Mulus. KM 25rb Service Rutin Resmi. Pajak Panjang Bln 09-2027. Surat Lengkap Atas Nama Sendiri. Bebas Banjir/Tabrakan."
                  className="w-full px-3 py-2.5 rounded-xl border-2 border-slate-400 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white leading-relaxed focus:ring-2 focus:ring-amber-500 focus:outline-none font-mono text-xs"
                />
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                  * {siteConfig?.classified_notice || 'Iklan baris gratis : Tautan URL akan otomatis dikonversi menjadi teks biasa. Jika ingin menggunakan URL dan gambar iklan, hubungi redaksi/editor untuk tarif iklan baris berbayar.'}
                </p>
              </div>

              {/* Anti-Spam Honeypot (Trap for Automated Bots) */}
              <div className="hidden" aria-hidden="true">
                <input
                  type="text"
                  name="website_url_hp"
                  value={websiteUrlHp}
                  onChange={(e) => setWebsiteUrlHp(e.target.value)}
                  tabIndex={-1}
                  autoComplete="off"
                />
              </div>

              {/* Cloudflare Turnstile Anti-Bot Verification */}
              {siteConfig?.enable_comment_turnstile !== false && (
                <div className="pt-2">
                  <TurnstileWidget
                    siteKey={siteConfig?.turnstile_site_key}
                    onVerify={(token) => setTurnstileToken(token)}
                    onExpire={() => setTurnstileToken('')}
                    onError={(err) => {
                      console.warn('Turnstile load notice:', err);
                      setTurnstileLoadFailed(true);
                    }}
                  />
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 rounded-xl border-2 border-slate-400 text-slate-700 dark:text-slate-300 font-bold hover:bg-slate-200 dark:hover:bg-slate-800"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-slate-900 text-amber-300 dark:bg-amber-400 dark:text-slate-900 font-black uppercase tracking-wider shadow disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-amber-300 border-t-transparent rounded-full animate-spin" />
                      <span>Mengirim...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Kirimkan Iklan Baris</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* LAYOUT VIEW MODE SWITCHER & CATEGORY FILTER TABS */}
        <div className="flex flex-col gap-3 pb-3 mb-6 border-b-2 border-slate-300 dark:border-slate-800">
          {/* Category filter buttons in a compact scrollable/wrapped container */}
          <div className="max-h-36 overflow-y-auto p-2.5 bg-stone-100 dark:bg-slate-900 rounded-xl border border-slate-300 dark:border-slate-800 flex flex-wrap items-center gap-1.5 sm:gap-2">
            <button
              onClick={() => { setSelectedKategori('Semua'); setCurrentPage(1); }}
              className={`px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-md sm:rounded-lg font-bold sm:font-black text-[11px] sm:text-xs uppercase tracking-tight sm:tracking-wider transition-all whitespace-nowrap ${
                selectedKategori === 'Semua'
                  ? 'bg-slate-900 text-amber-300 dark:bg-amber-400 dark:text-slate-900 shadow'
                  : 'bg-stone-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-stone-300'
              }`}
            >
              Semua : {formatCount(displayTotalAll)}
            </button>
            {KATEGORI_OPTIONS.map((kat) => {
              const count = getCategoryCount(kat);
              return (
                <button
                  key={kat}
                  onClick={() => { setSelectedKategori(kat); setCurrentPage(1); }}
                  className={`px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-md sm:rounded-lg font-medium sm:font-bold text-[11px] sm:text-xs uppercase tracking-tight sm:tracking-wider transition-all whitespace-nowrap ${
                    selectedKategori === kat
                      ? 'bg-slate-900 text-amber-300 dark:bg-amber-400 dark:text-slate-900 shadow'
                      : 'bg-stone-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-stone-300'
                  }`}
                >
                  {kat} : {formatCount(count)}
                </button>
              );
            })}
          </div>

          {/* VIEW SWITCHER: NEWSPAPER PRINT (JADUL) VS CARDS (MODERN) on a new row below categories */}
          <div className="flex items-center justify-between pt-1">
            <div className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Pilih Format Tampilan:
            </div>
            <div className="flex items-center gap-1 bg-stone-200 dark:bg-slate-800 p-1 rounded-xl shrink-0">
              <button
                onClick={() => setViewMode('newspaper')}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-black uppercase transition-all ${
                  viewMode === 'newspaper'
                    ? 'bg-black text-white shadow'
                    : 'text-slate-700 dark:text-slate-300 hover:text-black'
                }`}
                title="Tampilan Format Koran Cetak (JADUL)"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>JADUL</span>
              </button>

              <button
                onClick={() => setViewMode('cards')}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-black uppercase transition-all ${
                  viewMode === 'cards'
                    ? 'bg-black text-white shadow'
                    : 'text-slate-700 dark:text-slate-300 hover:text-black'
                }`}
                title="Tampilan Kartu Digital (MODERN)"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>MODERN</span>
              </button>
            </div>
          </div>
        </div>

        {/* CLASSIFIED ADS CONTENT AREA */}
        {loading ? (
          <div className="py-16 text-center space-y-3">
            <div className="w-8 h-8 border-4 border-slate-900 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs font-bold text-slate-600">Memuat lembar iklan baris...</p>
          </div>
        ) : viewMode === 'newspaper' ? (
          /* TRADITIONAL PRINT NEWSPAPER CLASSIFIED ADS GRID */
          <NewspaperClassifiedGrid
            dynamicAds={ads}
            onSelectCategory={(kat) => {
              setSelectedKategori(kat);
              setCurrentPage(1);
            }}
            onOpenForm={() => setShowForm(true)}
            siteName={siteName}
            currentPage={currentPage}
            totalPages={totalPages}
            totalCount={totalCount}
            selectedKategori={selectedKategori}
            categoryCounts={categoryCounts}
            onPageChange={(newPage) => setCurrentPage(newPage)}
          />
        ) : ads.length === 0 ? (
          <div className="bg-stone-100 dark:bg-slate-900 border-2 border-dashed border-slate-400 dark:border-slate-700 rounded-2xl p-12 text-center">
            <Newspaper className="w-12 h-12 text-slate-400 mx-auto mb-3 opacity-60" />
            <h3 className="text-base font-black uppercase text-slate-700 dark:text-slate-300 mb-1">
              Belum Ada Iklan Baris di Kategori ini
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mb-4">
              Jadilah yang pertama memasang iklan baris cetak &amp; digital di {siteName}.
            </p>
            <button
              onClick={() => setShowForm(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 text-amber-300 font-bold text-xs uppercase"
            >
              Pasang Iklan Sekarang
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {ads.map((item) => {
              const age = calculateAge(item.tahunLahir);
              return (
                <div
                  key={item.id}
                  id={`ad-${item.id}`}
                  className="bg-stone-100 dark:bg-slate-900 border-2 border-slate-900 dark:border-slate-700 rounded-xl p-4 shadow-sm hover:border-amber-500 transition-colors flex flex-col justify-between"
                >
                  <div>
                    {/* CLASSIFIED HEADER: CATEGORY BADGE + PRICE */}
                    <div className="flex items-center justify-between border-b border-slate-300 dark:border-slate-800 pb-2 mb-2.5">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="inline-block px-2.5 py-0.5 rounded bg-slate-900 text-amber-300 dark:bg-amber-400 dark:text-slate-900 text-[10px] font-black uppercase tracking-wider">
                          [{item.kategori}]
                        </span>
                        {item.expiresAt && (
                          <span className="inline-block px-2 py-0.5 rounded bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300 text-[10px] font-bold border border-amber-300 dark:border-amber-800">
                            s/d {item.expiresAt.substring(0, 10)}
                          </span>
                        )}
                      </div>
                      <span className="text-xs font-black text-slate-900 dark:text-amber-400 font-mono">
                        {item.harga}
                      </span>
                    </div>

                    {/* CLASSIFIED TEXT CONTENT (NO IMAGES, MONOSPACE COMPACT TYPE) */}
                    <p className="text-xs sm:text-sm font-mono text-slate-900 dark:text-slate-200 leading-snug tracking-tight mb-4">
                      {item.keteranganBarang}
                    </p>
                  </div>

                  {/* CONTACT & SELLER DETAILS */}
                  <div className="pt-2.5 border-t border-dashed border-slate-300 dark:border-slate-800 flex flex-wrap items-center justify-between text-[11px] font-sans font-bold text-slate-700 dark:text-slate-300 gap-1.5">
                    <div className="flex items-center gap-1.5 text-rose-700 dark:text-amber-300 font-black">
                      <Phone className="w-3.5 h-3.5" />
                      <span>Hub: {item.phone}</span>
                    </div>
                    <div className="text-slate-500 font-normal">
                      ({item.nama} {age ? `• ${age}` : ''} • {item.kota})
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* PAGINATION CONTROLS */}
        {totalPages > 1 && (
          <div className="flex items-center justify-end gap-2 pt-6 border-t-2 border-slate-900 dark:border-slate-700 mt-8">
            <button
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              className="inline-flex items-center justify-center px-4 py-2 rounded-xl border-2 border-slate-900 dark:border-slate-700 text-xs font-black uppercase tracking-wider disabled:opacity-40 hover:bg-slate-200 dark:hover:bg-slate-800"
              aria-label="Halaman Sebelumnya"
            >
              &lt;
            </button>

            <button
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
              className="inline-flex items-center justify-center px-4 py-2 rounded-xl border-2 border-slate-900 dark:border-slate-700 text-xs font-black uppercase tracking-wider disabled:opacity-40 hover:bg-slate-200 dark:hover:bg-slate-800"
              aria-label="Halaman Selanjutnya"
            >
              &gt;
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
