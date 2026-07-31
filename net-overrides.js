// Lightweight network/status helpers inspired by pro extensions; does not use external third-party backend.
(function(){
  const root = typeof window !== 'undefined' ? window : self;
  const status = { online: true, lastApiCheck: null, apiOk: null, lastError: '' };
  function updateOnline() {
    status.online = (typeof navigator === 'undefined') ? true : navigator.onLine !== false;
    try { document.documentElement.setAttribute('data-lovablepro-online', status.online ? '1' : '0'); } catch (e) {}
    return status.online;
  }
  async function checkApiHealth() {
    const base = (root.LICENSE_API_BASE || root.POWERKITS_API_BASE || 'https://lovablekey.zigital.in').replace(/\/$/, '');
    status.lastApiCheck = Date.now();
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 4500);
      const resp = await fetch(base + '/api/activate', { method: 'OPTIONS', signal: controller.signal }).catch(async () => fetch(base, { method: 'HEAD', signal: controller.signal }));
      clearTimeout(timer);
      status.apiOk = !!resp;
      status.lastError = '';
    } catch (e) {
      status.apiOk = false;
      status.lastError = e && e.message ? e.message : 'Network check failed';
    }
    try { chrome.storage.local.set({ ql_api_status: status }); } catch (e) {}
    return status;
  }
  if (typeof window !== 'undefined') {
    window.addEventListener('online', updateOnline);
    window.addEventListener('offline', updateOnline);
    updateOnline();
  }
  root.LovableNetwork = { status, updateOnline, checkApiHealth };
})();
