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