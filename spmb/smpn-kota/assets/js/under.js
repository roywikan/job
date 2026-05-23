/**
 * affiliate.js — Pop-Under Affiliate Shopee untuk SPMB Kota Yogyakarta
 * 
 * Fitur:
 * - Muncul 1x per 7 hari (berdasarkan LocalStorage + timestamp)
 * - Delay 30 detik setelah tombol Analisis ditekan
 * - Teknik blur/focus agar tidak memotong alur user
 * - Konfigurasi terpusat di AFFILIATE_CONFIG
 * 
 * Cara pakai:
 * 1. Include file ini di index.html: <script src="assets/js/affiliate.js"></script>
 * 2. Panggil Affiliate.init() setelah DOM ready
 * 3. Ganti AFFILIATE_CONFIG.url dengan link affiliate Anda
 */

(function() {
  'use strict';
  
  // ================= KONFIGURASI (EDIT DI SINI) =================
  const AFFILIATE_CONFIG = {
    // 🔗 Ganti dengan link affiliate Shopee Anda
    url: "https://s.shopee.co.id/AA4ETmAQ4H",
    
    // ⏱️ Delay setelah tombol Analisis ditekan (dalam milidetik)
    delayMs: 30000, // 30 detik
    
    // 🗓️ Pop-under muncul lagi setelah X hari
    expiryDays: 7,
    
    // 🔑 Key untuk LocalStorage (jangan diubah jika tidak ingin reset tracking)
    storageKey: "spmb_popunder_shown",
    
    // 🎯 ID tombol yang memicu timer (sesuaikan dengan index.html Anda)
    triggerButtonId: "btnAnalyze"
  };
  
  // ================= STATE INTERNAL =================
  let popUnderTriggered = false;
  let timerId = null;
  
  // ================= FUNGSI UTAMA =================
  
  /**
   * Cek apakah pop-under boleh ditampilkan
   * @returns {boolean} true jika boleh ditampilkan
   */
  function canShowPopUnder() {
    if (popUnderTriggered) return false;
    
    const now = Date.now();
    const lastShown = localStorage.getItem(AFFILIATE_CONFIG.storageKey);
    
    // Jika belum pernah ditampilkan, boleh tampil
    if (!lastShown) return true;
    
    // Hitung hari sejak terakhir ditampilkan
    const daysSinceLastShow = (now - parseInt(lastShown, 10)) / (1000 * 60 * 60 * 24);
    
    // Boleh tampil jika sudah lewat expiryDays
    return daysSinceLastShow >= AFFILIATE_CONFIG.expiryDays;
  }
  
  /**
   * Tandai bahwa pop-under sudah ditampilkan (simpan timestamp)
   */
  function markAsShown() {
    localStorage.setItem(AFFILIATE_CONFIG.storageKey, Date.now().toString());
  }
  
  /**
   * Buka pop-under affiliate dengan teknik blur/focus
   */
  function openPopUnder() {
    if (!canShowPopUnder()) {
      console.log('[Affiliate] Pop-under skipped (within expiry period)');
      return;
    }
    
    popUnderTriggered = true;
    markAsShown();
    
    try {
      // Buka di tab baru dengan security flags
      const popup = window.open(
        AFFILIATE_CONFIG.url, 
        '_blank', 
        'noopener,noreferrer'
      );
      
      if (popup) {
        // Teknik blur/focus agar tidak mengganggu UX utama
        setTimeout(() => {
          try {
            popup.blur();
            window.focus();
          } catch (e) {
            // Fallback jika browser memblokir
            console.log('[Affiliate] Pop-under opened (user may need to allow popups)');
          }
        }, 200);
      }
    } catch (err) {
      console.error('[Affiliate] Error opening pop-under:', err);
    }
  }
  
  /**
   * Setup event listener untuk tombol trigger
   */
  function setupTrigger() {
    const btn = document.getElementById(AFFILIATE_CONFIG.triggerButtonId);
    if (!btn) {
      console.warn('[Affiliate] Trigger button not found:', AFFILIATE_CONFIG.triggerButtonId);
      return;
    }
    
    btn.addEventListener('click', function() {
      // Clear timer sebelumnya jika ada (mencegah double trigger)
      if (timerId) clearTimeout(timerId);
      
      // Set timer delay
      timerId = setTimeout(() => {
        openPopUnder();
      }, AFFILIATE_CONFIG.delayMs);
    });
  }
  
  // ================= PUBLIC API =================
  
  /**
   * Inisialisasi module affiliate
   * Panggil fungsi ini setelah DOM ready
   */
  function init() {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', setupTrigger);
    } else {
      setupTrigger();
    }
    console.log('[Affiliate] Module initialized');
  }
  
  /**
   * Reset tracking (untuk testing)
   * Hapus dari LocalStorage agar pop-under bisa tampil lagi
   */
  function resetTracking() {
    localStorage.removeItem(AFFILIATE_CONFIG.storageKey);
    popUnderTriggered = false;
    console.log('[Affiliate] Tracking reset');
  }
  
  /**
   * Cek status tracking (untuk debugging)
   * @returns {Object} info status
   */
  function getStatus() {
    const lastShown = localStorage.getItem(AFFILIATE_CONFIG.storageKey);
    return {
      triggered: popUnderTriggered,
      lastShown: lastShown ? new Date(parseInt(lastShown, 10)) : null,
      canShow: canShowPopUnder()
    };
  }
  
  // ================= EXPORT =================
  window.Affiliate = {
    init,
    resetTracking,
    getStatus,
    CONFIG: AFFILIATE_CONFIG // Expose config untuk debugging (opsional)
  };
  
})();
