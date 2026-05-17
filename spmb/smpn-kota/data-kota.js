/**
 * data-kota.js — Data geografis SMPN Kota Yogyakarta
 * Sumber: Koordinat perkiraan + dokumen juknis
 */

// Koordinat 16 SMPN Kota Yogyakarta (format: [lat, lng])
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

// Helper: Hitung jarak Haversine (meter) antara 2 titik [lat, lng]
window.hitungJarak = function(lat1, lng1, lat2, lng2) {
  const R = 6371e3;
  const toRad = deg => deg * Math.PI / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a = Math.sin(dLat/2)**2 + 
            Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * 
            Math.sin(dLng/2)**2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

// Helper: Filter sekolah dalam radius X meter dari titik RW
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

// Helper: Format jarak ke string human-readable
window.formatJarak = function(meter) {
  return meter < 1000 ? `${Math.round(meter)} m` : `${(meter/1000).toFixed(2)} km`;
};

console.log('✅ Data Kota loaded:', Object.keys(window.SMPN_KOTA_COORDS).length, 'sekolah');


////////////////////////

/**
 * Mapping Kelurahan → SMPN Terdekat (Geografis)
 * Secara otomatis menyaring 3 Sekolah Favorit (SMPN1, SMPN5, SMPN8) 
 * untuk memberikan alternatif realistis sesuai permintaan.
 */
window.KELURAHAN_SMPN_HINT = {
  "Tegalpanggung": ["SMPN2", "SMPN11", "SMPN16"],
  "Suryatmajan": ["SMPN2", "SMPN14", "SMPN16"],
  "Bausasran": ["SMPN11", "SMPN2", "SMPN14"],
  "Pringgokusuman": ["SMPN3", "SMPN7", "SMPN12"],
  "Sosromenduran": ["SMPN7", "SMPN3", "SMPN12"],
  "Baciro": ["SMPN2", "SMPN14", "SMPN16"],
  "Demangan": ["SMPN16", "SMPN2", "SMPN14"],
  "Kotabaru": ["SMPN16", "SMPN2", "SMPN14"],
  "Klitren": ["SMPN14", "SMPN2", "SMPN16"],
  "Terban": ["SMPN16", "SMPN2", "SMPN7"],
  "Prawirodirjan": ["SMPN3", "SMPN7", "SMPN12"],
  "Ngupasan": ["SMPN3", "SMPN6", "SMPN13"],
  "Bumijo": ["SMPN7", "SMPN11", "SMPN12"],
  "Gowongan": ["SMPN7", "SMPN12", "SMPN11"],
  "Cokrodiningratan": ["SMPN7", "SMPN3", "SMPN12"],
  "Rejowinangun": ["SMPN4", "SMPN9", "SMPN10"],
  "Prenggan": ["SMPN4", "SMPN10", "SMPN9"],
  "Purbayan": ["SMPN4", "SMPN9", "SMPN10"],
  "Kadipaten": ["SMPN3", "SMPN6", "SMPN13"],
  "Patehan": ["SMPN3", "SMPN6", "SMPN15"],
  "Panembahan": ["SMPN13", "SMPN6", "SMPN15"],
  "Mantrijeron": ["SMPN6", "SMPN15", "SMPN13"],
  "Suryodiningratan": ["SMPN6", "SMPN15", "SMPN13"],
  "Gedongkiwo": ["SMPN15", "SMPN6", "SMPN13"],
  "Wirogunan": ["SMPN6", "SMPN9", "SMPN13"],
  "Keparakan": ["SMPN6", "SMPN13", "SMPN9"],
  "Brontokusuman": ["SMPN6", "SMPN9", "SMPN13"],
  "Ngampilan": ["SMPN7", "SMPN12", "SMPN11"],
  "Notoprajan": ["SMPN12", "SMPN7", "SMPN11"],
  "Gunungketur": ["SMPN4", "SMPN2", "SMPN9"],
  "Purwokinanti": ["SMPN4", "SMPN9", "SMPN2"],
  "Kricak": ["SMPN11", "SMPN7", "SMPN12"],
  "Karangwaru": ["SMPN11", "SMPN14", "SMPN7"],
  "Tegalrejo": ["SMPN11", "SMPN7", "SMPN12"],
  "Bener": ["SMPN11", "SMPN14", "SMPN7"],
  "Semaki": ["SMPN9", "SMPN4", "SMPN10"],
  "Warungboto": ["SMPN4", "SMPN9", "SMPN10"],
  "Pandeyan": ["SMPN9", "SMPN10", "SMPN4"],
  "Sorosutan": ["SMPN10", "SMPN4", "SMPN8"],
  "Giwangan": ["SMPN10", "SMPN4", "SMPN9"],
  "Muja-Muju": ["SMPN10", "SMPN9", "SMPN4"],
  "Tahunan": ["SMPN4", "SMPN10", "SMPN9"],
  "Wirobrajan": ["SMPN3", "SMPN7", "SMPN6"],
  "Patangpuluhan": ["SMPN3", "SMPN12", "SMPN7"],
  "Pakuncen": ["SMPN3", "SMPN7", "SMPN6"]
};

// Struktur Data Kemantren → Kelurahan
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

// Helper: Tampilkan rekomendasi berbasis Kelurahan
window.showKelurahanRecommendation = function(kelurahanName) {
  const hintEl = document.getElementById('kelurahan-hint');
  const schools = window.KELURAHAN_SMPN_HINT?.[kelurahanName] || [];
  
  if (schools.length === 0 || !hintEl) {
    hintEl.style.display = 'none';
    return;
  }

  // Ambil nama & passing grade 2025
  const pg = window.APP_CONFIG?.passingGrade2025?.domisiliDaerah || {};
  let html = `<strong>💡 Estimasi Berdasarkan Kelurahan ${kelurahanName}:</strong><br>`;
  html += `Berikut sekolah terdekat (selain favorit 1, 5, 8) yang direkomendasikan:<br><br>`;
  
  schools.forEach((code, idx) => {
    const schoolData = window.APP_CONFIG?.schools?.find(s => s.code === code);
    const name = schoolData?.name || code;
    const pgVal = pg[code] ? pg[code].toFixed(2) : 'N/A';
    html += `<span style="background:#f0f4ff; padding:4px 8px; border-radius:6px; display:inline-block; margin:4px 0;">
      ${idx+1}. <b>${name}</b> (PG Domisili '25: ${pgVal})
    </span><br>`;
  });

  html += `<br><small style="color:#d97706;">⚠️ Ini hanya panduan awal. Seleksi resmi Jalur Radius tetap menggunakan koordinat RW.</small>`;
  
  hintEl.innerHTML = html;
  hintEl.style.display = 'block';
};
