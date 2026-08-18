/**
 * UI Module
 * Handles DOM manipulation and user interface updates
 */

const UI = (() => {
  const showLoginOverlay = () => {
    const overlay = document.getElementById('passwordOverlay');
    if (overlay) overlay.classList.remove('hidden');
    document.body.classList.add('locked');
  };

  const hideLoginOverlay = () => {
    const overlay = document.getElementById('passwordOverlay');
    if (overlay) overlay.classList.add('hidden');
    document.body.classList.remove('locked');
  };

  const showMessage = (type, message, duration = 3000) => {
    const div = document.createElement('div');
    div.className = `admin-message show ${type}`;
    div.textContent = message;
    div.style.position = 'fixed';
    div.style.top = '20px';
    div.style.right = '20px';
    div.style.zIndex = '9999';
    document.body.appendChild(div);
    setTimeout(() => div.remove(), duration);
  };

  const setStatusBadge = (elementId, status) => {
    const el = document.getElementById(elementId);
    if (el) {
      el.className = `status-badge status-${status}`;
      const statusText = {
        'ok': '✅ جاهز',
        'loading': '⏳ جاري التحميل',
        'error': '❌ خطأ'
      };
      el.textContent = statusText[status] || status;
    }
  };

  const updateKPIGrid = (data) => {
    const grid = document.getElementById('kpiGrid');
    if (!grid || !data) return;

    grid.innerHTML = '';
    for (let category in data) {
      const total = data[category].reduce((sum, item) => sum + item.value, 0);
      const count = data[category].length;
      const kpi = document.createElement('div');
      kpi.className = 'kpi';
      kpi.innerHTML = `
        <div class="val">${total.toLocaleString()}</div>
        <div class="lbl">${category}</div>
        <div style="font-size:11px;color:rgba(255,255,255,0.7);">${count} مؤشر</div>
      `;
      grid.appendChild(kpi);
    }
  };

  const renderAdminTable = () => {
    const tbody = document.getElementById('usersTableBody');
    if (!tbody) return;

    const users = Auth.getUsers();
    tbody.innerHTML = users.map(user => `
      <tr>
        <td>${user.name}</td>
        <td>${user.email}</td>
        <td><span class="role-badge role-${user.role}">${user.role}</span></td>
        <td>${user.source}</td>
        <td>${user.lastLogin ? new Date(user.lastLogin).toLocaleString('ar-SY') : '—'}</td>
        <td>
          <button class="btn btn-sm" onclick="editUser('${user.id}')">تعديل</button>
          <button class="btn btn-sm btn-danger" onclick="deleteUserConfirm('${user.id}')">حذف</button>
        </td>
      </tr>
    `).join('');
  };

  const renderAuditLogs = () => {
    const tbody = document.getElementById('logsTableBody');
    if (!tbody) return;

    const logs = Auth.getAuditLogs();
    const search = document.getElementById('logSearch')?.value || '';
    const actionFilter = document.getElementById('logAction')?.value || '';

    let filtered = logs;
    if (search) filtered = filtered.filter(l => l.user.includes(search));
    if (actionFilter) filtered = filtered.filter(l => l.action === actionFilter);

    tbody.innerHTML = filtered.slice(-50).map(log => `
      <tr>
        <td>${new Date(log.timestamp).toLocaleString('ar-SY')}</td>
        <td>${log.user}</td>
        <td>${log.action}</td>
        <td class="device-cell">${log.device}</td>
      </tr>
    `).join('');
  };

  const updateLastUpdated = () => {
    const lastUpdate = Storage.getLastUpdate();
    const panel = document.getElementById('lastUpdatedPanel');
    if (panel && lastUpdate) {
      document.getElementById('lastUpdatedDisplay').textContent = 
        new Date(lastUpdate).toLocaleString('ar-SY');
      panel.style.display = 'block';
    }
  };

  const updateStorageMeter = () => {
    const meter = document.getElementById('auditStorageFill');
    const label = document.getElementById('auditStorageLabel');
    if (!meter || !label) return;

    const size = Storage.getStorageSize();
    const sizeInKB = (size / 1024).toFixed(2);
    const percent = Math.min((size / 5242880) * 100, 100); // 5MB limit

    meter.style.width = percent + '%';
    label.textContent = `${sizeInKB} KB / 5 MB`;

    if (percent > 80) meter.classList.add('danger');
    else if (percent > 50) meter.classList.add('warning');
  };

  return {
    showLoginOverlay,
    hideLoginOverlay,
    showMessage,
    setStatusBadge,
    updateKPIGrid,
    renderAdminTable,
    renderAuditLogs,
    updateLastUpdated,
    updateStorageMeter
  };
})();