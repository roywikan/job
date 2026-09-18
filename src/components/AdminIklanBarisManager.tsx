import React, { useState, useEffect } from 'react';
import { Tag, CheckCircle2, XCircle, Trash2, Edit3, Save, RefreshCw, AlertCircle, Phone, Globe, DollarSign, Clock } from 'lucide-react';
import { IklanBarisItem } from '../types';
import { getAuthHeaders } from '../lib/auth';

const KATEGORI_OPTIONS = [
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
  'Nutrisi',
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
];

export default function AdminIklanBarisManager() {
  const [ads, setAds] = useState<IklanBarisItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'published' | 'rejected' | 'expired'>('all');
  const [editingItem, setEditingItem] = useState<IklanBarisItem | null>(null);

  // Edit form state
  const [editKategori, setEditKategori] = useState('Otomotif');
  const [editKeteranganBarang, setEditKeteranganBarang] = useState('');
  const [editHarga, setEditHarga] = useState('');
  const [editNama, setEditNama] = useState('');
  const [editKota, setEditKota] = useState('');
  const [editPekerjaan, setEditPekerjaan] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editStatus, setEditStatus] = useState<'pending' | 'published' | 'rejected' | 'expired'>('published');
  const [editExpiresAt, setEditExpiresAt] = useState('');
  const [editImageUrl, setEditImageUrl] = useState('');
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  const fetchAds = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/iklan-baris?status=${filterStatus}&limit=100`, {
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        const data = await res.json();
        setAds(data.items || []);
      }
    } catch (err) {
      console.error('Failed to fetch admin iklan baris:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAds();
  }, [filterStatus]);

  const handleOpenEdit = (item: IklanBarisItem) => {
    setEditingItem(item);
    setEditKategori(item.kategori);
    setEditKeteranganBarang(item.keteranganBarang);
    setEditHarga(item.harga);
    setEditNama(item.nama);
    setEditKota(item.kota);
    setEditPekerjaan(item.pekerjaan);
    setEditPhone(item.phone);
    setEditStatus(item.status);
    setEditExpiresAt(item.expiresAt ? (item.expiresAt.length >= 10 ? item.expiresAt.substring(0, 10) : item.expiresAt) : '');
    setEditImageUrl(item.imageUrl || '');
    setMsg('');
  };

  const handleSaveEdit = async () => {
    if (!editingItem) return;
    try {
      setSaving(true);
      const res = await fetch(`/api/iklan-baris/${editingItem.id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          kategori: editKategori,
          keteranganBarang: editKeteranganBarang,
          harga: editHarga,
          nama: editNama,
          kota: editKota,
          pekerjaan: editPekerjaan,
          phone: editPhone,
          status: editStatus,
          expiresAt: editExpiresAt ? editExpiresAt : null,
          imageUrl: editImageUrl ? editImageUrl.trim() : null,
          isAdminAd: 1,
        }),
      });

      if (res.ok) {
        setMsg('Iklan baris berhasil diperbarui!');
        setEditingItem(null);
        fetchAds();
      } else {
        const err = await res.json();
        alert('Gagal menyimpan: ' + (err.error || 'Terjadi kesalahan'));
      }
    } catch (err: any) {
      alert('Error: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateStatus = async (id: number, newStatus: 'published' | 'rejected' | 'expired' | 'pending') => {
    try {
      const res = await fetch(`/api/iklan-baris/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        fetchAds();
      }
    } catch (err: any) {
      alert('Error updating status: ' + err.message);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus iklan baris ini secara permanen?')) return;
    try {
      const res = await fetch(`/api/iklan-baris/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        fetchAds();
      }
    } catch (err: any) {
      alert('Error deleting item: ' + err.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <Tag className="w-5 h-5 text-amber-500" /> Moderasi Iklan Baris
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Periksa, ringkas teks iklan gaya Kompas cetak, dan atur persetujuan publikasi kiriman iklan dari pembaca (guest).
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchAds}
            className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            title="Refresh Data"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {msg && (
        <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-700 text-emerald-900 dark:text-emerald-200 text-xs font-bold">
          {msg}
        </div>
      )}

      {/* EDIT MODAL */}
      {editingItem && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl space-y-4 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-amber-500" /> Edit &amp; Moderasi Iklan Baris #{editingItem.id}
              </h3>
              <button
                onClick={() => setEditingItem(null)}
                className="text-slate-400 hover:text-slate-600 font-bold text-sm"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block font-bold mb-1">Kategori</label>
                <select
                  value={editKategori}
                  onChange={(e) => setEditKategori(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-bold"
                >
                  {KATEGORI_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold mb-1">Harga Barang/Jasa</label>
                <input
                  type="text"
                  value={editHarga}
                  onChange={(e) => setEditHarga(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-bold text-emerald-600"
                />
              </div>

              <div>
                <label className="block font-bold mb-1">Nama Pemilik</label>
                <input
                  type="text"
                  value={editNama}
                  onChange={(e) => setEditNama(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
              </div>

              <div>
                <label className="block font-bold mb-1">Kota</label>
                <input
                  type="text"
                  value={editKota}
                  onChange={(e) => setEditKota(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
              </div>

              <div>
                <label className="block font-bold mb-1">Pekerjaan</label>
                <input
                  type="text"
                  value={editPekerjaan}
                  onChange={(e) => setEditPekerjaan(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
              </div>

              <div>
                <label className="block font-bold mb-1">Nomor Kontak Dihubungi</label>
                <input
                  type="text"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-bold"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold mb-1">Keterangan Barang/Jasa (Teks Ringkas Koran Kompas, Tanpa Gambar)</label>
              <textarea
                rows={4}
                value={editKeteranganBarang}
                onChange={(e) => setEditKeteranganBarang(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono leading-snug"
              />
            </div>

            <div>
              <label className="block text-xs font-bold mb-1">URL Gambar Eksternal (Khusus Admin - Otomatis Grayscale &amp; Diperkecil)</label>
              <input
                type="url"
                placeholder="https://example.com/image.jpg"
                value={editImageUrl}
                onChange={(e) => setEditImageUrl(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-bold mb-1">Tanggal Selesai Tayang (Masa Berakhir Iklan - Opsional)</label>
              <input
                type="date"
                value={editExpiresAt}
                onChange={(e) => setEditExpiresAt(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium"
              />
              <p className="text-[10px] text-slate-500 mt-1">
                * Kosongkan jika iklan ditayangkan tanpa batas waktu sampai diturunkan manual oleh redaksi.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold mb-1">Status Publikasi</label>
              <select
                value={editStatus}
                onChange={(e) => setEditStatus(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold"
              >
                <option value="pending">⏳ Menunggu Peninjauan (Pending)</option>
                <option value="published">✅ Disetujui &amp; Ditayangkan (Published)</option>
                <option value="rejected">❌ Ditolak (Rejected)</option>
                <option value="expired">⌛ Selesai / Masa Tayang Habis (Expired)</option>
              </select>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3">
              <button
                type="button"
                onClick={() => setEditingItem(null)}
                className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-bold"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={saving}
                onClick={handleSaveEdit}
                className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs uppercase"
              >
                <Save className="w-4 h-4" /> Simpan Iklan Baris
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STATUS TABS */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2 overflow-x-auto">
        {(['all', 'pending', 'published', 'rejected', 'expired'] as const).map((st) => (
          <button
            key={st}
            onClick={() => setFilterStatus(st)}
            className={`px-4 py-2 rounded-xl font-bold text-xs capitalize whitespace-nowrap transition-all ${
              filterStatus === st
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            {st === 'all'
              ? 'Semua Status'
              : st === 'pending'
              ? '⏳ Pending'
              : st === 'published'
              ? '✅ Disetujui'
              : st === 'rejected'
              ? '❌ Ditolak'
              : '⌛ Expired'}
          </button>
        ))}
      </div>

      {/* ITEMS LIST */}
      {loading ? (
        <div className="py-12 text-center text-xs text-slate-500 font-bold">Memuat daftar iklan baris...</div>
      ) : ads.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 text-center text-xs text-slate-500">
          Tidak ada iklan baris dalam kategori filter ini.
        </div>
      ) : (
        <div className="space-y-4">
          {ads.map((item) => (
            <div
              key={item.id}
              className="bg-stone-50 dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-700 rounded-2xl p-5 shadow-sm hover:border-amber-500 transition-colors"
            >
              <div className="flex items-start justify-between gap-4 mb-2">
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="px-2 py-0.5 rounded bg-slate-900 text-amber-300 text-[10px] font-black uppercase tracking-wider">
                      [{item.kategori}]
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                      item.status === 'published'
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        : item.status === 'pending'
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                          : item.status === 'rejected'
                            ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                            : 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-300 dark:border-slate-700'
                    }`}>
                      {item.status === 'expired' ? '⌛ expired' : item.status}
                    </span>
                    {item.expiresAt && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                        📅 Berakhir: {item.expiresAt.substring(0, 10)}
                      </span>
                    )}
                    <span className="text-[11px] font-bold text-emerald-600 dark:text-amber-400 font-mono">
                      {item.harga}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  {item.status !== 'published' && (
                    <button
                      onClick={() => handleUpdateStatus(item.id, 'published')}
                      className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 dark:bg-emerald-950 dark:text-emerald-300 text-xs font-bold"
                      title="Setuju & Tayangkan (Publish)"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                    </button>
                  )}
                  {item.status !== 'expired' && (
                    <button
                      onClick={() => handleUpdateStatus(item.id, 'expired')}
                      className="p-1.5 rounded-lg bg-amber-50 text-amber-700 hover:bg-amber-100 dark:bg-amber-950 dark:text-amber-300 text-xs font-bold"
                      title="Tandai Selesai / Expired"
                    >
                      <Clock className="w-4 h-4" />
                    </button>
                  )}
                  {item.status !== 'rejected' && (
                    <button
                      onClick={() => handleUpdateStatus(item.id, 'rejected')}
                      className="p-1.5 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 dark:bg-rose-950 dark:text-rose-300 text-xs font-bold"
                      title="Tolak Iklan (Reject)"
                    >
                      <XCircle className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={() => handleOpenEdit(item)}
                    className="p-1.5 rounded-lg bg-sky-50 text-sky-600 hover:bg-sky-100 dark:bg-sky-950 dark:text-sky-300 text-xs font-bold"
                    title="Edit Iklan"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="p-1.5 rounded-lg bg-slate-200 text-slate-600 hover:bg-rose-100 hover:text-rose-600 dark:bg-slate-800 text-xs"
                    title="Hapus Permanent"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <p className="text-xs font-mono text-slate-900 dark:text-slate-200 leading-snug tracking-tight mb-3 bg-white dark:bg-slate-800/80 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                {item.keteranganBarang}
              </p>

              <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-600 dark:text-slate-400 pt-2 border-t border-slate-200 dark:border-slate-800 gap-2">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="font-bold text-slate-900 dark:text-slate-200">
                    Penjual: {item.nama} ({item.tahunLahir ? `${new Date().getFullYear() - item.tahunLahir} thn` : ''})
                  </span>
                  <span>📍 {item.kota}</span>
                  <span>💼 {item.pekerjaan}</span>
                  <span className="font-bold text-rose-600 dark:text-amber-300">📞 Hub: {item.phone}</span>
                </div>
                {item.ipAddress && (
                  <div className="font-mono text-[10px] text-slate-400 flex items-center gap-1">
                    <Globe className="w-3 h-3 text-slate-400" /> IP: {item.ipAddress} (Rahasia Public)
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
