/**
 * Authentication Module
 * Handles user login, logout, role management, and Google OAuth
 */

const Auth = (() => {
  const KEY_USERS = 'mosal_users';
  const KEY_CURRENT_USER = 'mosal_current_user';
  const KEY_AUDIT_LOG = 'mosal_audit_log';
  const KEY_GOOGLE_CLIENT_ID = 'mosal_google_client_id';

  // Initialize users with default admin
  const initializeUsers = () => {
    if (!localStorage.getItem(KEY_USERS)) {
      const defaultUsers = [
        {
          id: 'admin-1',
          email: 'admin@mosal.gov.sy',
          name: 'المدير',
          password: hashPassword('admin123'), // ⚠️ Change in production
          role: 'admin',
          source: 'local',
          lastLogin: null,
          active: true
        }
      ];
      localStorage.setItem(KEY_USERS, JSON.stringify(defaultUsers));
    }
  };

  // Simple hash function (use bcrypt in production)
  const hashPassword = (pwd) => {
    let hash = 0;
    for (let i = 0; i < pwd.length; i++) {
      const char = pwd.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash).toString(16);
  };

  const login = (email, password) => {
    const users = JSON.parse(localStorage.getItem(KEY_USERS) || '[]');
    const user = users.find(u => (u.email === email || u.name === email) && u.active);

    if (!user) {
      logAudit('failed_login', email, 'المستخدم غير موجود');
      return { success: false, error: 'بيانات دخول غير صحيحة' };
    }

    if (user.password !== hashPassword(password)) {
      logAudit('failed_login', email, 'كلمة مرور خاطئة');
      return { success: false, error: 'بيانات دخول غير صحيحة' };
    }

    user.lastLogin = new Date().toISOString();
    localStorage.setItem(KEY_USERS, JSON.stringify(users));
    localStorage.setItem(KEY_CURRENT_USER, JSON.stringify(user));
    logAudit('login', user.name, 'تسجيل دخول ناجح');
    return { success: true, user };
  };

  const logout = () => {
    const user = getCurrentUser();
    if (user) {
      logAudit('logout', user.name, 'تسجيل خروج');
    }
    localStorage.removeItem(KEY_CURRENT_USER);
  };

  const getCurrentUser = () => {
    const user = localStorage.getItem(KEY_CURRENT_USER);
    return user ? JSON.parse(user) : null;
  };

  const isAuthenticated = () => {
    return getCurrentUser() !== null;
  };

  const isAdmin = () => {
    const user = getCurrentUser();
    return user && user.role === 'admin';
  };

  const canEdit = () => {
    const user = getCurrentUser();
    return user && (user.role === 'admin' || user.role === 'editor');
  };

  const createUser = (name, email, password, role) => {
    const users = JSON.parse(localStorage.getItem(KEY_USERS) || '[]');
    if (users.find(u => u.email === email)) {
      return { success: false, error: 'البريد مستخدم بالفعل' };
    }

    const newUser = {
      id: 'user-' + Date.now(),
      email,
      name,
      password: hashPassword(password),
      role,
      source: 'local',
      lastLogin: null,
      active: true
    };

    users.push(newUser);
    localStorage.setItem(KEY_USERS, JSON.stringify(users));
    logAudit('user_create', email, `تم إضافة مستخدم جديد بدور: ${role}`);
    return { success: true, user: newUser };
  };

  const deleteUser = (userId) => {
    const users = JSON.parse(localStorage.getItem(KEY_USERS) || '[]');
    const user = users.find(u => u.id === userId);
    if (!user) return { success: false, error: 'المستخدم غير موجود' };

    user.active = false;
    localStorage.setItem(KEY_USERS, JSON.stringify(users));
    logAudit('user_delete', user.email, 'تم حذف المستخدم');
    return { success: true };
  };

  const updateUser = (userId, updates) => {
    const users = JSON.parse(localStorage.getItem(KEY_USERS) || '[]');
    const user = users.find(u => u.id === userId);
    if (!user) return { success: false, error: 'المستخدم غير موجود' };

    Object.assign(user, updates);
    if (updates.password) {
      user.password = hashPassword(updates.password);
    }
    localStorage.setItem(KEY_USERS, JSON.stringify(users));
    logAudit('user_update', user.email, `تم تحديث: ${Object.keys(updates).join(', ')}`);
    return { success: true, user };
  };

  const getUsers = () => {
    const users = JSON.parse(localStorage.getItem(KEY_USERS) || '[]');
    return users.filter(u => u.active);
  };

  const logAudit = (action, user, details) => {
    const logs = JSON.parse(localStorage.getItem(KEY_AUDIT_LOG) || '[]');
    const log = {
      timestamp: new Date().toISOString(),
      action,
      user,
      details,
      device: `${navigator.userAgent.split('/').pop()}`,
      ip: 'local'
    };
    logs.push(log);
    
    // Keep only last 7 days
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const filtered = logs.filter(l => new Date(l.timestamp) > sevenDaysAgo);
    
    localStorage.setItem(KEY_AUDIT_LOG, JSON.stringify(filtered));
  };

  const getAuditLogs = () => {
    return JSON.parse(localStorage.getItem(KEY_AUDIT_LOG) || '[]');
  };

  const setGoogleClientId = (clientId) => {
    localStorage.setItem(KEY_GOOGLE_CLIENT_ID, clientId);
  };

  const getGoogleClientId = () => {
    return localStorage.getItem(KEY_GOOGLE_CLIENT_ID) || '';
  };

  // Initialize on load
  initializeUsers();

  return {
    login,
    logout,
    getCurrentUser,
    isAuthenticated,
    isAdmin,
    canEdit,
    createUser,
    deleteUser,
    updateUser,
    getUsers,
    logAudit,
    getAuditLogs,
    setGoogleClientId,
    getGoogleClientId
  };
})();