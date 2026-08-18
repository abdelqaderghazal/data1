/**
 * Main Application Module
 * Orchestrates all modules and handles app lifecycle
 */

const App = (() => {
  const init = () => {
    console.log('🚀 تطبيق المؤشرات التشغيلية - البدء');
    
    setupEventListeners();
    handleConnectionStatus();
    checkAuthentication();
    UI.updateLastUpdated();
    UI.updateStorageMeter();
  };

  const setupEventListeners = () => {
    // Login button
    const btnLogin = document.querySelector('.btn-login');
    if (btnLogin) {
      btnLogin.addEventListener('click', handleLogin);
    }

    // Filter buttons
    const filterReset = document.getElementById('filterReset');
    if (filterReset) {
      filterReset.addEventListener('click', resetFilters);
    }

    // Admin tab buttons
    document.querySelectorAll('.admin-tab').forEach(btn => {
      btn.addEventListener('click', (e) => {
        openAdminTab(e.target.dataset.tab);
      });
    });

    // Category toggles
    document.querySelectorAll('.cat-head').forEach(head => {
      head.addEventListener('click', toggleCategory);
    });

    // Handle connection status
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
  };

  const checkAuthentication = () => {
    if (!Auth.isAuthenticated()) {
      UI.showLoginOverlay();
    } else {
      UI.hideLoginOverlay();
      loadData();
      if (Auth.isAdmin()) {
        showAdminTools();
      }
    }
  };

  const handleLogin = async () => {
    const email = document.getElementById('loginEmail')?.value || '';
    const password = document.getElementById('passwordInput')?.value || '';

    if (!email || !password) {
      showLoginError('يرجى ملء جميع الحقول');
      return;
    }

    const result = Auth.login(email, password);
    if (result.success) {
      UI.hideLoginOverlay();
      location.reload();
    } else {
      showLoginError(result.error);
    }
  };

  const showLoginError = (message) => {
    const errorEl = document.getElementById('passwordError');
    if (errorEl) {
      errorEl.textContent = '❌ ' + message;
      errorEl.classList.add('show');
      setTimeout(() => errorEl.classList.remove('show'), 3000);
    }
  };

  const loadData = () => {
    const data = Storage.getData();
    if (data) {
      UI.updateKPIGrid(data);
      MapManager.initMap();
    } else {
      UI.setStatusBadge('dataStatus', 'error');
    }
  };

  const handleConnectionStatus = () => {
    if (navigator.onLine) {
      handleOnline();
    } else {
      handleOffline();
    }
  };

  const handleOnline = () => {
    const bar = document.getElementById('onlineBar');
    if (bar) bar.classList.add('show');
    setTimeout(() => {
      if (bar) bar.classList.remove('show');
    }, 3000);
  };

  const handleOffline = () => {
    const bar = document.getElementById('offlineBar');
    if (bar) bar.classList.add('show');
  };

  const showAdminTools = () => {
    const adminTools = document.getElementById('stratAdminTools');
    if (adminTools) adminTools.style.display = 'flex';
  };

  const toggleCategory = (e) => {
    const section = e.currentTarget.closest('section');
    if (section) {
      section.classList.toggle('open');
    }
  };

  const resetFilters = () => {
    const govSelect = document.getElementById('govSelect');
    const monthSelect = document.getElementById('monthSelect');
    if (govSelect) govSelect.value = 'all';
    if (monthSelect) monthSelect.value = 'all';
    updateActiveFilters();
  };

  const updateActiveFilters = () => {
    const gov = document.getElementById('govSelect')?.value || 'all';
    const month = document.getElementById('monthSelect')?.value || 'all';
    const govText = gov === 'all' ? 'كل المحافظات' : gov;
    const monthText = month === 'all' ? 'كل الأشهر' : month;

    const filtersEl = document.getElementById('activeFilters');
    if (filtersEl) {
      filtersEl.innerHTML = `
        <span class="active-filters-label">الحالة الحالية:</span>
        <span class="filter-tag">${govText}</span>
        <span class="filter-tag">${monthText}</span>
      `;
    }
  };

  const openAdminTab = (tabName) => {
    document.querySelectorAll('.admin-section').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.admin-tab').forEach(b => b.classList.remove('active'));

    const section = document.getElementById(`adminTab-${tabName}`);
    const tab = document.querySelector(`[data-tab="${tabName}"]`);

    if (section) section.classList.add('active');
    if (tab) tab.classList.add('active');

    if (tabName === 'users') UI.renderAdminTable();
    if (tabName === 'logs') UI.renderAuditLogs();
  };

  // Global functions
  window.loginWithPassword = handleLogin;
  window.logout = () => {
    Auth.logout();
    location.reload();
  };
  window.toggleCat = toggleCategory;
  window.openAdminTab = openAdminTab;
  window.applyFilters = updateActiveFilters;
  window.showUploadModal = () => UI.showMessage('info', 'رفع ملف CSV - قريباً');
  window.loadFromSheet = () => UI.showMessage('info', 'تحميل من Google Sheets - قريباً');
  window.enterIndicatorsFromAdmin = () => {
    Auth.logout();
    location.reload();
  };
  window.toggleStrategicCompass = (el) => {
    document.getElementById('strategicCompass')?.classList.toggle('open');
  };

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  return { init };
})();