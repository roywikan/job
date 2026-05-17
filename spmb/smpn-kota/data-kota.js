/**
 * data-kota.js — Data geografis SMPN Kota Yogyakarta
 * Sumber: Koordinat perkiraan + dokumen juknis Kepka POS No. 100.3/776 Tahun 2026
 * ✅ FINAL: Semua sekolah termasuk favorit, tanpa duplikasi kode
 */

// ===== KOORDINAT 16 SMPN KOTA YOGYAKARTA =====
window.SMPN_KOTA_COORDS = {
  "SMPN1":  [-7.7956, 110.3695], 
  "SMPN2":  [-7.7889, 110.3753], 
  "SMPN3":  [-7.8012, 110.3589], 
  "SMPN4":  [-7.7823, 110.3812], 
  "SMPN5":  [-7.7734, 110.3645], 
  "SMPN6":  [-7.8123, 110.3701], 
  "SMPN7":  [-7.7945, 110.3512], 
  "SMPN8":  [-7.7867, 110.3923], 
  "SMPN9":  [-7.8034, 110.3834], 
  "SMPN10": [-7.8156, 110.3978], 
  "SMPN11": [-7.7678, 110.3567], 
  "SMPN12": [-7.7912, 110.3445], 
  "SMPN13": [-7.8089, 110.3623], 
  "SMPN14": [-7.7756, 110.3889], 
  "SMPN15": [-7.8201, 110.3534], 
  "SMPN16": [-7.7834, 110.3712]  
};

// ===== HELPER: HITUNG JARAK HAVERSINE (METER) =====
window.hitungJarak = function(lat1, lng1, lat2, lng2) {
  const R = 6371e3; // Radius bumi (meter)
  const toRad = deg => deg * Math.PI / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a = Math.sin(dLat/2)**2 + 
            Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * 
            Math.sin(dLng/2)**2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

// ===== HELPER: FILTER SEKOLAH DALAM RADIUS X METER =====
window.getSchoolsInRadius = function(userLat, userLng, maxMeter = 1000) {
  const results = [];
  for (const [code, [sLat, sLng]] of Object.entries(window.SMPN_KOTA_COORDS)) {
    const dist = window.hitungJarak?.(userLat, userLng, sLat, sLng);
    if (dist !== undefined && dist <= maxMeter) {
      results.push({ 
        code, 
        name: window.APP_CONFIG?.schools?.find(s=>s.code===code)?.name || code, 
        distance: dist 
      });
    }
  }
  return results.sort((a,b) => a.distance - b.distance);
};

// ===== HELPER: FORMAT JARAK KE STRING =====
window.formatJarak = function(meter) {
  return meter < 1000 ? `${Math.round(meter)} m` : `${(meter/1000).toFixed(2)} km`;
};

// ===== MAPPING KEMANTREN → KELURAHAN =====
window.DATA_WILAYAH_KOTA = {
  "Danurejan": ["Tegalpanggung", "Suryatmajan", "Bausasran"],
  "Gedongtengen": ["Pringgokusuman", "Sosromenduran"],
  "Gondokusuman": ["Baciro", "Demangan", "Kotabaru", "Klitren", "Terban"],
  "Gondomanan": ["Prawirodirjan", "Ngupasan"],
  "Jetis": ["Bumijo", "Gowongan", "Cokrodiningratan"],
  "Kotagede": ["Rejowinangun", "Prenggan", "Purbayan"],
  "Kraton": ["Kadipaten", "Patehan", "Panembahan"],
  "Mantrijeron": ["Mantrijeron", "Suryodiningratan", "Gedongkiwo"],
  "Mergangsan": ["Wirogunan", "Keparakan", "Brontokusuman"],
  "Ngampilan": ["Ngampilan", "Notoprajan"],
  "Pakualaman": ["Gunungketur", "Purwokinanti"],
  "Tegalrejo": ["Kricak", "Karangwaru", "Tegalrejo", "Bener"],
  "Umbulharjo": ["Semaki", "Warungboto", "Pandeyan", "Sorosutan", "Giwangan", "Muja-Muju", "Tahunan"],
  "Wirobrajan": ["Wirobrajan", "Patangpuluhan", "Pakuncen"]
};

// ===== MAPPING KELURAHAN → SMPN TERDEKAT (SEMUA SEKOLAH, TERMASUK FAVORIT) =====
window.KELURAHAN_SMPN_HINT = {
  "Tegalpanggung": ["SMPN1", "SMPN2", "SMPN11", "SMPN16"],
  "Suryatmajan": ["SMPN1", "SMPN2", "SMPN14", "SMPN16"],
  "Bausasran": ["SMPN1", "SMPN2", "SMPN11", "SMPN14"],
  "Pringgokusuman": ["SMPN3", "SMPN7", "SMPN12", "SMPN1"],
  "Sosromenduran": ["SMPN3", "SMPN7", "SMPN12", "SMPN1"],
  "Baciro": ["SMPN2", "SMPN14", "SMPN16", "SMPN1"],
  "Demangan": ["SMPN1", "SMPN2", "SMPN14", "SMPN16"],
  "Kotabaru": ["SMPN1", "SMPN2", "SMPN14", "SMPN16"],
  "Klitren": ["SMPN1", "SMPN2", "SMPN14", "SMPN16"],
  "Terban": ["SMPN1", "SMPN2", "SMPN7", "SMPN16"],
  "Prawirodirjan": ["SMPN3", "SMPN7", "SMPN12", "SMPN1"],
  "Ngupasan": ["SMPN3", "SMPN6", "SMPN13", "SMPN1"],
  "Bumijo": ["SMPN7", "SMPN11", "SMPN12", "SMPN3"],
  "Gowongan": ["SMPN7", "SMPN11", "SMPN12", "SMPN3"],
  "Cokrodiningratan": ["SMPN3", "SMPN7", "SMPN12", "SMPN1"],
  "Rejowinangun": ["SMPN4", "SMPN9", "SMPN10", "SMPN5"],
  "Prenggan": ["SMPN4", "SMPN5", "SMPN9", "SMPN10"],
  "Purbayan": ["SMPN4", "SMPN5", "SMPN9", "SMPN10"],
  "Kadipaten": ["SMPN3", "SMPN6", "SMPN13", "SMPN1"],
  "Patehan": ["SMPN3", "SMPN6", "SMPN15", "SMPN1"],
  "Panembahan": ["SMPN6", "SMPN13", "SMPN15", "SMPN3"],
  "Mantrijeron": ["SMPN6", "SMPN13", "SMPN15", "SMPN3"],
  "Suryodiningratan": ["SMPN6", "SMPN13", "SMPN15", "SMPN3"],
  "Gedongkiwo": ["SMPN6", "SMPN13", "SMPN15", "SMPN3"],
  "Wirogunan": ["SMPN6", "SMPN9", "SMPN13", "SMPN4"],
  "Keparakan": ["SMPN6", "SMPN9", "SMPN13", "SMPN4"],
  "Brontokusuman": ["SMPN6", "SMPN9", "SMPN13", "SMPN4"],
  "Ngampilan": ["SMPN7", "SMPN11", "SMPN12", "SMPN3"],
  "Notoprajan": ["SMPN7", "SMPN11", "SMPN12", "SMPN3"],
  "Gunungketur": ["SMPN2", "SMPN4", "SMPN9", "SMPN1"],
  "Purwokinanti": ["SMPN2", "SMPN4", "SMPN9", "SMPN1"],
  "Kricak": ["SMPN7", "SMPN11", "SMPN12", "SMPN3"],
  "Karangwaru": ["SMPN7", "SMPN11", "SMPN14", "SMPN3"],
  "Tegalrejo": ["SMPN7", "SMPN11", "SMPN12", "SMPN3"],
  "Bener": ["SMPN7", "SMPN11", "SMPN14", "SMPN3"],
  "Semaki": ["SMPN4", "SMPN5", "SMPN9", "SMPN10"],
  "Warungboto": ["SMPN4", "SMPN5", "SMPN9", "SMPN10"],
  "Pandeyan": ["SMPN4", "SMPN5", "SMPN9", "SMPN10"],
  "Sorosutan": ["SMPN5", "SMPN8", "SMPN10", "SMPN4"],
  "Giwangan": ["SMPN4", "SMPN5", "SMPN10", "SMPN9"],
  "Muja-Muju": ["SMPN4", "SMPN5", "SMPN9", "SMPN10"],
  "Tahunan": ["SMPN4", "SMPN5", "SMPN9", "SMPN10"],
  "Wirobrajan": ["SMPN3", "SMPN6", "SMPN7", "SMPN1"],
  "Patangpuluhan": ["SMPN3", "SMPN7", "SMPN12", "SMPN1"],
  "Pakuncen": ["SMPN3", "SMPN6", "SMPN7", "SMPN1"]
};

// ===== HELPER: TAMPILKAN REKOMENDASI BERDASARKAN KELURAHAN =====
// ✅ Menampilkan SEMUA sekolah termasuk favorit (SMPN1, SMPN5, SMPN8) dengan badge ⭐
window.showKelurahanRecommendation = function(kelurahanName) {
  const hintEl = document.getElementById('kelurahan-hint');
  const schools = window.KELURAHAN_SMPN_HINT?.[kelurahanName] || [];
  
  if (schools.length === 0 || !hintEl) { 
    hintEl.style.display = 'none'; 
    return; 
  }
  
  const pg = window.APP_CONFIG?.passingGrade2025?.domisiliDaerah || {};
  const FAVORITES = ["SMPN1", "SMPN5", "SMPN8"];
  
  let html = `<strong>💡 Estimasi Berdasarkan Kelurahan ${kelurahanName}:</strong><br>`;
  html += `Sekolah terdekat (termasuk favorit):<br><br>`;
  
  schools.forEach((code, idx) => {
    const schoolData = window.APP_CONFIG?.schools?.find(s => s.code === code);
    const name = schoolData?.name || code;
    const pgVal = pg[code] ? pg[code].toFixed(2) : 'N/A';
    
    const favBadge = FAVORITES.includes(code) 
      ? ' <span style="background:#fbbf24;color:#78350f;padding:2px 6px;border-radius:4px;font-size:11px;font-weight:bold;">⭐</span>' 
      : '';
    
    html += `<span style="background:#f0f4ff; padding:4px 8px; border-radius:6px; display:inline-block; margin:4px 0;">
      ${idx+1}. <b>${name}</b>${favBadge} (PG Domisili '25: ${pgVal})
    </span><br>`;
  });
  
  // ✅ DISCLAIMER DITAMBAHKAN DI SINI (Sebagai penutup html string)
  html += `<br><small style="color:#d97706; margin-top:10px; display:block; border-top:1px solid #fed7aa; padding-top:8px;">
    ⚠️ Ini hanya panduan awal. Seleksi resmi Jalur Radius tetap menggunakan koordinat RW.
  </small>`;
  
  hintEl.innerHTML = html; 
  hintEl.style.display = 'block';
};

// ===== LOGGING =====
console.log('✅ Data Kota loaded:', Object.keys(window.SMPN_KOTA_COORDS).length, 'sekolah');
