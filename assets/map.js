/**
 * Map Module
 * Handles interactive map with Leaflet
 */

const MapManager = (() => {
  let map = null;
  const governorateCoords = {
    'دمشق': [33.5138, 36.2764],
    'ريف دمشق': [33.5, 36.5],
    'حلب': [34.7345, 37.1919],
    'حمص': [34.7302, 36.7237],
    'حماه': [34.73, 36.75],
    'اللاذقية': [34.7697, 35.7625],
    'طرطوس': [34.8877, 35.8969],
    'السويداء': [32.9155, 36.8399],
    'درعا': [32.6156, 36.1099],
    'القنيطرة': [33.4226, 36.0174],
    'ادلب': [35.1892, 36.6381],
    'الرقة': [35.9486, 39.0152],
    'دير الزور': [35.3395, 40.1435],
    'الحسكة': [35.7907, 40.7486]
  };

  const initMap = () => {
    if (!document.getElementById('govMap')) return;
    
    map = L.map('govMap').setView([34.8, 38.5], 6);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap',
      maxZoom: 19
    }).addTo(map);

    renderGovernorateMarkers();
  };

  const renderGovernorateMarkers = () => {
    const data = Storage.getData() || {};
    const lastUpdate = new Date();

    for (let gov in governorateCoords) {
      const [lat, lng] = governorateCoords[gov];
      const govData = data[gov] || [];
      const avg = govData.length > 0 
        ? govData.reduce((sum, item) => sum + item.value, 0) / govData.length 
        : 0;

      let color = '#ccc';
      if (avg >= 80) color = '#4F7A63'; // Green
      else if (avg >= 60) color = '#6E8FA3'; // Blue
      else if (avg >= 40) color = '#B08D57'; // Yellow
      else if (avg > 0) color = '#B5533C'; // Red

      const circle = L.circleMarker([lat, lng], {
        radius: 15,
        fillColor: color,
        color: '#fff',
        weight: 2,
        opacity: 1,
        fillOpacity: 0.8
      }).addTo(map);

      circle.bindPopup(`
        <div class="map-info-window">
          <h4>${gov}</h4>
          <div class="info-row">
            <span class="info-label">المؤشرات:</span>
            <span class="info-val">${govData.length}</span>
          </div>
          <div class="info-row">
            <span class="info-label">المتوسط:</span>
            <span class="info-val">${avg.toFixed(1)}%</span>
          </div>
          <div class="info-row">
            <span class="info-label">آخر تحديث:</span>
            <span class="info-val">${lastUpdate.toLocaleDateString('ar-SY')}</span>
          </div>
        </div>
      `);
    }
  };

  return {
    initMap,
    renderGovernorateMarkers
  };
})();