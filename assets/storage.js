/**
 * Storage Module
 * Handles LocalStorage operations for data persistence
 */

const Storage = (() => {
  const KEY_DATA = 'mosal_data';
  const KEY_STRATEGIC_TARGETS = 'mosal_strategic_targets';
  const KEY_LAST_UPDATE = 'mosal_last_update';

  const saveData = (data) => {
    try {
      localStorage.setItem(KEY_DATA, JSON.stringify(data));
      localStorage.setItem(KEY_LAST_UPDATE, new Date().toISOString());
      return { success: true };
    } catch (e) {
      return { success: false, error: e.message };
    }
  };

  const getData = () => {
    try {
      const data = localStorage.getItem(KEY_DATA);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      return null;
    }
  };

  const getLastUpdate = () => {
    return localStorage.getItem(KEY_LAST_UPDATE) || null;
  };

  const saveStrategicTargets = (targets) => {
    try {
      localStorage.setItem(KEY_STRATEGIC_TARGETS, JSON.stringify(targets));
      return { success: true };
    } catch (e) {
      return { success: false, error: e.message };
    }
  };

  const getStrategicTargets = () => {
    try {
      const targets = localStorage.getItem(KEY_STRATEGIC_TARGETS);
      return targets ? JSON.parse(targets) : {};
    } catch (e) {
      return {};
    }
  };

  const clearAll = () => {
    localStorage.removeItem(KEY_DATA);
    localStorage.removeItem(KEY_STRATEGIC_TARGETS);
    localStorage.removeItem(KEY_LAST_UPDATE);
  };

  const getStorageSize = () => {
    let size = 0;
    for (let key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        size += localStorage[key].length + key.length;
      }
    }
    return size;
  };

  return {
    saveData,
    getData,
    getLastUpdate,
    saveStrategicTargets,
    getStrategicTargets,
    clearAll,
    getStorageSize
  };
})();