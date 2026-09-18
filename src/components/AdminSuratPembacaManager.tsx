import React, { useState, useEffect } from 'react';
import { Mail, CheckCircle2, XCircle, Trash2, Edit3, Save, RefreshCw, AlertCircle, Eye, ShieldCheck, MapPin, Briefcase, Phone, Globe } from 'lucide-react';
import { SuratPembaca } from '../types';
import { getAuthHeaders } from '../lib/auth';

export default function AdminSuratPembacaManager() {
  const [letters, setLetters] = useState<SuratPembaca[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'published' | 'rejected'>('all');
  const [editingItem, setEditingItem] = useState<SuratPembaca | null>(null);

  // Edit form state
  const [editJudul, setEditJudul] = useState('');
  const [editIsi, setEditIsi] = useState('');
  const [editNama, setEditNama] = useState('');
  const [editKota, setEditKota] = useState('');
  const [editPekerjaan, setEditPekerjaan] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editStatus, setEditStatus] = useState<'pending' | 'published' | 'rejected'>('published');
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  const fetchLetters = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/surat-pembaca?status=${filterStatus}&limit=100`, {
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        const data = await res.json();
        setLetters(data.items || []);
      }
    } catch (err) {
      console.error('Failed to fetch admin surat pembaca:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLetters();
  }, [filterStatus]);

  const handleOpenEdit = (item: SuratPembaca) => {
    setEditingItem(item);
    setEditJudul(item.judul);
    setEditIsi(item.isi);
    setEditNama(item.nama);
    setEditKota(item.kota);
    setEditPekerjaan(item.pekerjaan);
    setEditPhone(item.phone);
    setEditStatus(item.status);
    setMsg('');
  };

  const handleSaveEdit = async () => {
    if (!editingItem) return;
    try {
      setSaving(true);
      const res = await fetch(`/api/surat-pembaca/${editingItem.id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          judul: editJudul,
          isi: editIsi,
          nama: editNama,
          kota: editKota,
          pekerjaan: editPekerjaan,
          phone: editPhone,
          status: editStatus,
        }),
      });

      if (res.ok) {
        setMsg('Surat pembaca berhasil diperbarui!');
        setEditingItem(null);
        fetchLetters();
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

  const handleUpdateStatus = async (id: number, newStatus: 'published' | 'rejected') => {
    try {
      const res = await fetch(`/api/surat-pembaca/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        fetchLetters();
      }
    } catch (err: any) {
      alert('Error updating status: ' + err.message);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus surat pembaca ini secara permanen?')) return;
    try {
      const res = await fetch(`/api/surat-pembaca/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        fetchLetters();
      }
    } catch (err: any) {
      alert('Error deleting item: ' + err.message);
    }
  };

  const pendingCount = letters.filter(l => l.status === 'pending').length;

  return (
    <div className="space-y-6">
      {/* HEADER & STATUS STATS */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <Mail className="w-5 h-5 text-rose-500" /> Moderasi Surat Pembaca
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Periksa, edit tata bahasa, dan atur persetujuan kiriman Surat Pembaca dari masyarakat (level guest).
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchLetters}
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
                <Edit3 className="w-5 h-5 text-rose-500" /> Edit &amp; Moderasi Surat Pembaca #{editingItem.id}
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
                <label className="block font-bold mb-1">Nama Pengirim</label>
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
                <label className="block font-bold mb-1">Nomor HP / WA</label>
                <input
                  type="text"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold mb-1">Judul Surat</label>
              <input
                type="text"
                value={editJudul}
                onChange={(e) => setEditJudul(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold mb-1">Isi Surat Pembaca (Telah Dibersihkan dari URL)</label>
              <textarea
                rows={6}
                value={editIsi}
                onChange={(e) => setEditIsi(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs leading-relaxed"
              />
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
                className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-rose-600 text-white font-bold text-xs"
              >
                <Save className="w-4 h-4" /> Simpan Perubahan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STATUS TABS */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        {(['all', 'pending', 'published', 'rejected'] as const).map((st) => (
          <button
            key={st}
            onClick={() => setFilterStatus(st)}
            className={`px-4 py-2 rounded-xl font-bold text-xs capitalize transition-all ${
              filterStatus === st
                ? 'bg-rose-500 text-white shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            {st === 'all' ? 'Semua Status' : st === 'pending' ? '⏳ Pending' : st === 'published' ? '✅ Disetujui' : '❌ Ditolak'}
          </button>
        ))}
      </div>

      {/* ITEMS LIST */}
      {loading ? (
        <div className="py-12 text-center text-xs text-slate-500 font-bold">Memuat surat pembaca...</div>
      ) : letters.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 text-center text-xs text-slate-500">
          Tidak ada surat pembaca dalam kategori filter ini.
        </div>
      ) : (
        <div className="space-y-4">
          {letters.map((item) => (
            <div
              key={item.id}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm hover:border-rose-300 transition-colors"
            >
              <div className="flex items-start justify-between gap-4 mb-2">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                      item.status === 'published'
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        : item.status === 'pending'
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                          : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                    }`}>
                      {item.status}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      ID: #{item.id} • {new Date(item.createdAt).toLocaleString('id-ID')}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    {item.judul}
                  </h3>
                </div>

                <div className="flex items-center gap-1">
                  {item.status !== 'published' && (
                    <button
                      onClick={() => handleUpdateStatus(item.id, 'published')}
                      className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 dark:bg-emerald-950 dark:text-emerald-300 text-xs font-bold"
                      title="Setuju & Tayangkan"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                    </button>
                  )}
                  {item.status !== 'rejected' && (
                    <button
                      onClick={() => handleUpdateStatus(item.id, 'rejected')}
                      className="p-1.5 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 dark:bg-rose-950 dark:text-rose-300 text-xs font-bold"
                      title="Tolak Surat"
                    >
                      <XCircle className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={() => handleOpenEdit(item)}
                    className="p-1.5 rounded-lg bg-sky-50 text-sky-600 hover:bg-sky-100 dark:bg-sky-950 dark:text-sky-300 text-xs font-bold"
                    title="Edit Surat"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="p-1.5 rounded-lg bg-slate-100 text-slate-500 hover:bg-rose-100 hover:text-rose-600 dark:bg-slate-800 text-xs"
                    title="Hapus Permanent"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line mb-3 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl">
                {item.isi}
              </p>

              <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-100 dark:border-slate-800 gap-2">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    Pengirim: {item.nama} ({item.tahunLahir ? `${new Date().getFullYear() - item.tahunLahir} thn` : ''})
                  </span>
                  <span>📍 {item.kota}</span>
                  <span>💼 {item.pekerjaan}</span>
                  <span>📞 WA/HP: {item.phone}</span>
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
