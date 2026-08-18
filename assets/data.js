/**
 * Data Module
 * Handles CSV parsing, data validation, and processing
 */

const DataManager = (() => {
  const parseCSV = (csvText) => {
    const lines = csvText.trim().split('\n');
    if (lines.length < 2) return { success: false, error: 'CSV فارغ' };

    const headers = lines[0].split(',').map(h => h.trim());
    const data = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim());
      const row = {};
      headers.forEach((header, index) => {
        row[header] = values[index] || '';
      });
      data.push(row);
    }

    return { success: true, headers, data };
  };

  const processIndicators = (data) => {
    const categories = {};
    const kpis = {};

    data.forEach(row => {
      const category = row.category || 'عام';
      const indicator = row.indicator || 'مؤشر بدون اسم';
      const value = parseFloat(row.value) || 0;
      const governorate = row.governorate || 'الكل';
      const month = row.month || 'الكل';

      if (!categories[category]) {
        categories[category] = [];
      }

      categories[category].push({
        indicator,
        value,
        governorate,
        month,
        target: parseFloat(row.target) || 0,
        percent: 0
      });

      // Build KPI summary
      const key = `${category}-${indicator}`;
      if (!kpis[key]) {
        kpis[key] = { total: 0, count: 0, target: parseFloat(row.target) || 0 };
      }
      kpis[key].total += value;
      kpis[key].count += 1;
    });

    // Calculate percentages
    for (let category in categories) {
      categories[category].forEach(item => {
        if (item.target > 0) {
          item.percent = Math.min((item.value / item.target) * 100, 100);
        }
      });
    }

    return { success: true, categories, kpis };
  };

  const loadFromCSVFile = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const csv = e.target.result;
        const parsed = parseCSV(csv);
        if (parsed.success) {
          const processed = processIndicators(parsed.data);
          if (processed.success) {
            Storage.saveData(processed.categories);
            resolve({ success: true, data: processed });
          } else {
            resolve({ success: false, error: 'خطأ في معالجة البيانات' });
          }
        } else {
          resolve({ success: false, error: parsed.error });
        }
      };
      reader.onerror = () => resolve({ success: false, error: 'خطأ في قراءة الملف' });
      reader.readAsText(file);
    });
  };

  const calculateStrategicStatus = (current, target) => {
    const percent = target > 0 ? (current / target) * 100 : 0;
    if (percent >= 90) return { status: 'on-track', icon: '✅' };
    if (percent >= 70) return { status: 'warning', icon: '⚠️' };
    return { status: 'off-track', icon: '🔴' };
  };

  return {
    parseCSV,
    processIndicators,
    loadFromCSVFile,
    calculateStrategicStatus
  };
})();