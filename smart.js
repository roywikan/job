/**
 * 🎯 SmartPopupOpener v1.1
 * Membuka link dengan teknik pop-under + fallback anti-blocker
 * Strategi: User Gesture + Deteksi Block + <a> Fallback + Intermediate Page
 * 
 * Cocok untuk: Shared Hosting, GitHub Pages, Static Site
 * 
 * Changelog v1.1:
 * - Added sessionStorage protection di _handleBlocked untuk cegah double-trigger
 * - Added early return pattern untuk efisiensi
 */

(function(global) {
  'use strict';

  const SmartPopupOpener = {
    // ⚙️ KONFIGURASI (sesuaikan sekali di awal)
    config: {
      intermediatePage: 'https://job.web.id/spmb.html',
      affiliateUrl: '',
      clickThreshold: 4,
      enablePopUnder: true,
      modalTitle: '🎁 Penawaran Spesial!',
      modalText: 'Browser memblokir tab baru. Klik tombol di bawah untuk membuka:',
      modalButtonText: 'Buka Penawaran →',
      modalCloseText: 'Tutup',
      onBeforeOpen: null,
      onAfterOpen: null,
      onBlocked: null
    },

    // 🔐 Internal state
    _state: {
      clickCount: 0,
      popupOpened: false,
      initialized: false
    },

    // 🚀 Inisialisasi
    init(customConfig = {}) {
      if (this._state.initialized) return;
      Object.assign(this.config, customConfig);
      this._createFallbackElements();
      this._state.initialized = true;
      console.log('✅ SmartPopupOpener ready');
      return this;
    },

    // 🔗 Fungsi utama: panggil dari event handler klik user
    open(targetUrl = null) {
      const url = targetUrl || this.config.affiliateUrl;
      if (!url) {
        console.warn('⚠️ URL tidak ditentukan');
        return false;
      }

      if (typeof this.config.onBeforeOpen === 'function') {
        this.config.onBeforeOpen(url);
      }

      const popup = window.open(
        this._buildIntermediateUrl(url), 
        '_blank', 
        'noopener,noreferrer'
      );

      if (this._isPopupBlocked(popup)) {
        this._handleBlocked(url);
        return false;
      }

      if (this.config.enablePopUnder) {
        setTimeout(() => {
          try { 
            if (popup && !popup.closed) popup.blur(); 
            window.focus(); 
          } catch(e) {}
        }, 100);
      }

      if (typeof this.config.onAfterOpen === 'function') {
        this.config.onAfterOpen(url);
      }

      this._state.popupOpened = true;
      return true;
    },

    // 🔄 Trigger berbasis threshold klik
    openWithThreshold(callback = null) {
      this._state.clickCount++;
      
      if (this._state.clickCount >= this.config.clickThreshold) {
        const result = this.open();
        if (typeof callback === 'function') callback(result);
        return result;
      }
      return false;
    },

    // 🧹 Reset counter
    resetCounter() {
      this._state.clickCount = 0;
      return this;
    },

    // ================= PRIVATE METHODS =================

    _buildIntermediateUrl(destUrl) {
      const base = this.config.intermediatePage.replace(/\/$/, '');
      const encoded = encodeURIComponent(destUrl);
      return `${base}?dest=${encoded}`;
    },

    _isPopupBlocked(popup) {
      return (
        !popup || 
        popup.closed || 
        typeof popup.closed === 'undefined' ||
        (popup.innerWidth === 0 && popup.innerHeight === 0)
      );
    },

    // ✅ FIX: Tambah sessionStorage protection di awal fungsi
    _handleBlocked(finalUrl) {
      // 🛡️ Cek apakah fallback sudah pernah dijalankan di sesi ini
      if (sessionStorage.getItem('spmb_popup_handled') === 'true') {
        console.log('ℹ️ Fallback sudah dijalankan, skip duplicate');
        return;
      }
      
      // ✅ Set flag SEGERA agar tidak ter-trigger lagi
      sessionStorage.setItem('spmb_popup_handled', 'true');
      
      // ================= FALLBACK LOGIC (ASLI) =================
      console.warn('⚠️ Popup diblokir, aktifkan fallback');
      
      // Strategi #3a: Fallback ke hidden <a> tag
      const fallbackLink = document.getElementById('spo-fallback-link');
      if (fallbackLink) {
        fallbackLink.href = this._buildIntermediateUrl(finalUrl);
        fallbackLink.click();
      }
      
      // Strategi #3b: Tampilkan modal visual
      this._showModal(this._buildIntermediateUrl(finalUrl));
      
      // Callback blocked (untuk auto-close, analytics, dll)
      if (typeof this.config.onBlocked === 'function') {
        this.config.onBlocked(finalUrl);
      }
    },

    _createFallbackElements() {
      // Hidden anchor untuk fallback
      if (!document.getElementById('spo-fallback-link')) {
        const anchor = document.createElement('a');
        anchor.id = 'spo-fallback-link';
        anchor.href = '#';
        anchor.target = '_blank';
        anchor.rel = 'noopener noreferrer';
        anchor.style.display = 'none';
        document.body.appendChild(anchor);
      }

      // Modal container
      if (!document.getElementById('spo-modal-container')) {
        const modal = document.createElement('div');
        modal.id = 'spo-modal-container';
        modal.style.cssText = 'display:none;';
        document.body.appendChild(modal);
      }
    },

    _showModal(url) {
      const container = document.getElementById('spo-modal-container');
      if (!container) return;

      const cfg = this.config;
      
      container.innerHTML = `
        <div style="
          position:fixed;inset:0;background:rgba(0,0,0,0.5);
          display:flex;align-items:center;justify-content:center;
          z-index:9999;padding:1rem;box-sizing:border-box;
        ">
          <div style="
            background:#fff;padding:1.5rem;border-radius:12px;
            max-width:420px;width:100%;text-align:center;
            box-shadow:0 10px 40px rgba(0,0,0,0.2);
          ">
            <h3 style="margin:0 0 1rem;color:#155724;font-size:1.2rem">${cfg.modalTitle}</h3>
            <p style="margin:0 0 1.5rem;color:#555;line-height:1.5">${cfg.modalText}</p>
            <a href="${url}" target="_blank" rel="noopener noreferrer"
               style="
                 display:inline-block;padding:12px 24px;
                 background:#28a745;color:#fff;text-decoration:none;
                 border-radius:8px;font-weight:bold;font-size:16px;
                 transition:background 0.2s;
               "
               onmouseover="this.style.background='#218838'"
               onmouseout="this.style.background='#28a745'">
              ${cfg.modalButtonText}
            </a>
            <br>
            <button onclick="document.getElementById('spo-modal-container').style.display='none'"
                    style="
                      margin-top:1rem;padding:8px 16px;
                      background:#e0e0e0;border:none;border-radius:6px;
                      cursor:pointer;font-size:14px;color:#333;
                    "
                    onmouseover="this.style.background='#ccc'"
                    onmouseout="this.style.background='#e0e0e0'">
              ${cfg.modalCloseText}
            </button>
          </div>
        </div>
      `;
      
      container.style.display = 'flex';
      
      // Close modal when clicking outside
      container.onclick = (e) => {
        if (e.target === container) {
          container.style.display = 'none';
        }
      };
    }
  };

  // Export ke global scope
  global.SmartPopupOpener = SmartPopupOpener;

})(typeof window !== 'undefined' ? window : this);
