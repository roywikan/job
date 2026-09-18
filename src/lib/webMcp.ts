/**
 * Web Model Context Protocol (WebMCP) Integration
 * Standard W3C / Chrome browser API for exposing web application capabilities to AI agents.
 * Specification: https://webmachinelearning.github.io/webmcp/
 */

export interface WebMcpTool {
  name: string;
  description: string;
  inputSchema: {
    type: 'object';
    properties?: Record<string, any>;
    required?: string[];
    [key: string]: any;
  };
  execute: (input: any, options?: any) => Promise<any> | any;
}

// Global AbortController signal for WebMCP tool lifecycle management
export const webMcpAbortController = new AbortController();

/**
 * Ensures navigator.modelContext API exists (polyfilled if running in environments without native WebMCP flag)
 */
function ensureModelContextAPI() {
  if (typeof window === 'undefined') return;

  const registry = new Map<string, WebMcpTool>();

  if (!(navigator as any).modelContext) {
    (navigator as any).modelContext = {
      registerTool: (tool: WebMcpTool, options?: { signal?: AbortSignal }) => {
        if (!tool || !tool.name) return;
        registry.set(tool.name, tool);
        
        const signal = options?.signal;
        if (signal) {
          signal.addEventListener('abort', () => {
            registry.delete(tool.name);
          });
        }
        return () => registry.delete(tool.name);
      },
      getTools: () => Array.from(registry.values()),
      unregisterTool: (name: string) => registry.delete(name),
    };
  }

  // Alias on document.modelContext and window.modelContext for backwards & forwards spec compatibility
  if (!(document as any).modelContext) {
    (document as any).modelContext = (navigator as any).modelContext;
  }
  if (!(window as any).modelContext) {
    (window as any).modelContext = (navigator as any).modelContext;
  }
}

/**
 * Register WebMCP tools on page load
 */
export function initWebMcpTools() {
  ensureModelContextAPI();

  const modelContext = (navigator as any).modelContext || (document as any).modelContext;
  if (!modelContext || typeof modelContext.registerTool !== 'function') {
    console.warn('WebMCP API (navigator.modelContext) is not available.');
    return;
  }

  const signal = webMcpAbortController.signal;

  // Tool 1: Search Classified Ads (Iklan Baris)
  modelContext.registerTool(
    {
      name: 'search_iklan_baris',
      description: 'Cari iklan baris berdasarkan kata kunci pencarian, nama barang/jasa, kota, atau kategori.',
      inputSchema: {
        type: 'object',
        properties: {
          query: {
            type: 'string',
            description: 'Kata kunci pencarian iklan (contoh: "stroller", "nanny", "daycare", "jakarta")',
          },
          kategori: {
            type: 'string',
            description: 'Nama kategori iklan baris (contoh: "Daycare", "Buku", "Mainan", "Stroller")',
          },
          kota: {
            type: 'string',
            description: 'Filter kota lokasi pengiklan',
          },
        },
      },
      execute: async (input: { query?: string; kategori?: string; kota?: string }) => {
        try {
          const params = new URLSearchParams();
          if (input?.query) params.append('q', input.query);
          if (input?.kategori) params.append('kategori', input.kategori);
          if (input?.kota) params.append('kota', input.kota);

          const response = await fetch(`/api/iklan-baris?${params.toString()}`);
          if (!response.ok) throw new Error(`HTTP ${response.status}`);
          const data = await response.json();
          return { success: true, count: data.length, data };
        } catch (err: any) {
          return { success: false, error: err.message || 'Gagal mencari iklan baris' };
        }
      },
    },
    { signal }
  );

  // Tool 2: List All 36 Categories
  modelContext.registerTool(
    {
      name: 'get_kategori_iklan',
      description: 'Dapatkan daftar seluruh 36 kategori iklan baris beserta jumlah iklannya.',
      inputSchema: {
        type: 'object',
        properties: {},
      },
      execute: async () => {
        try {
          const response = await fetch('/api/kategori');
          if (!response.ok) throw new Error(`HTTP ${response.status}`);
          const data = await response.json();
          return { success: true, categories: data };
        } catch (err: any) {
          return { success: false, error: err.message || 'Gagal mengambil daftar kategori' };
        }
      },
    },
    { signal }
  );

  // Tool 3: Get Reader Letters (Surat Pembaca)
  modelContext.registerTool(
    {
      name: 'get_surat_pembaca',
      description: 'Dapatkan daftar surat pembaca, pendapat, dan aspirasi warga.',
      inputSchema: {
        type: 'object',
        properties: {
          query: {
            type: 'string',
            description: 'Kata kunci pencarian pada judul atau isi surat pembaca',
          },
        },
      },
      execute: async (input: { query?: string }) => {
        try {
          const params = new URLSearchParams();
          if (input?.query) params.append('q', input.query);

          const response = await fetch(`/api/surat-pembaca?${params.toString()}`);
          if (!response.ok) throw new Error(`HTTP ${response.status}`);
          const data = await response.json();
          return { success: true, count: data.length, data };
        } catch (err: any) {
          return { success: false, error: err.message || 'Gagal mengambil surat pembaca' };
        }
      },
    },
    { signal }
  );

  // Tool 4: Navigate Site Pages
  modelContext.registerTool(
    {
      name: 'navigate_page',
      description: 'Navigasi antar halaman pada situs web.',
      inputSchema: {
        type: 'object',
        properties: {
          page: {
            type: 'string',
            enum: ['iklan-baris', 'surat-pembaca', 'pasang-iklan', 'tulis-surat', 'kebijakan-privasi'],
            description: 'Halaman tujuan navigasi',
          },
        },
        required: ['page'],
      },
      execute: async (input: { page: string }) => {
        if (typeof window !== 'undefined') {
          const event = new CustomEvent('webmcp-navigate', { detail: { page: input.page } });
          window.dispatchEvent(event);
          return { success: true, navigatedTo: input.page };
        }
        return { success: false, error: 'Window context unavailable' };
      },
    },
    { signal }
  );

  // Tool 5: Submit New Classified Ad (Pasang Iklan Baris)
  modelContext.registerTool(
    {
      name: 'submit_iklan_baris',
      description: 'Kirim atau pasang pengajuan iklan baris baru.',
      inputSchema: {
        type: 'object',
        properties: {
          nama: { type: 'string', description: 'Nama lengkap pengiklan' },
          kota: { type: 'string', description: 'Kota pengiklan' },
          pekerjaan: { type: 'string', description: 'Pekerjaan / profesi' },
          tahunLahir: { type: 'number', description: 'Tahun lahir pengiklan (contoh: 1990)' },
          phone: { type: 'string', description: 'Nomor WhatsApp / Kontak HP' },
          kategori: { type: 'string', description: 'Nama kategori iklan' },
          keteranganBarang: { type: 'string', description: 'Deskripsi lengkap barang / jasa' },
          harga: { type: 'string', description: 'Harga atau tarif (contoh: "Rp 150.000")' },
          expiresAt: { type: 'string', description: 'Tanggal iklan harus diturunkan / berakhir (opsional, format YYYY-MM-DD)' },
        },
        required: ['nama', 'kota', 'phone', 'kategori', 'keteranganBarang', 'harga'],
      },
      execute: async (input: any) => {
        try {
          const response = await fetch('/api/iklan-baris', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(input),
          });
          if (!response.ok) {
            const errData = await response.json().catch(() => ({}));
            throw new Error(errData.error || `HTTP ${response.status}`);
          }
          const result = await response.json();
          return { success: true, message: 'Iklan berhasil dikirim!', data: result };
        } catch (err: any) {
          return { success: false, error: err.message || 'Gagal memasang iklan baris' };
        }
      },
    },
    { signal }
  );

  // Tool 6: Submit Reader Letter (Tulis Surat Pembaca)
  modelContext.registerTool(
    {
      name: 'submit_surat_pembaca',
      description: 'Kirim surat pembaca atau aspirasi baru.',
      inputSchema: {
        type: 'object',
        properties: {
          nama: { type: 'string', description: 'Nama pengirim' },
          kota: { type: 'string', description: 'Kota pengirim' },
          pekerjaan: { type: 'string', description: 'Pekerjaan' },
          tahunLahir: { type: 'number', description: 'Tahun lahir pengirim' },
          phone: { type: 'string', description: 'Nomor WhatsApp / Kontak' },
          judul: { type: 'string', description: 'Judul surat pembaca' },
          isi: { type: 'string', description: 'Isi pesan atau aspirasi' },
        },
        required: ['nama', 'kota', 'phone', 'judul', 'isi'],
      },
      execute: async (input: any) => {
        try {
          const response = await fetch('/api/surat-pembaca', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(input),
          });
          if (!response.ok) {
            const errData = await response.json().catch(() => ({}));
            throw new Error(errData.error || `HTTP ${response.status}`);
          }
          const result = await response.json();
          return { success: true, message: 'Surat pembaca berhasil dikirim!', data: result };
        } catch (err: any) {
          return { success: false, error: err.message || 'Gagal mengirim surat pembaca' };
        }
      },
    },
    { signal }
  );

  console.log('[WebMCP] Registered 6 site tools successfully via navigator.modelContext.');
}

// Automatically initialize WebMCP tools when imported or on window load
if (typeof window !== 'undefined') {
  if (document.readyState === 'loading') {
    window.addEventListener('DOMContentLoaded', initWebMcpTools);
  } else {
    initWebMcpTools();
  }
}
