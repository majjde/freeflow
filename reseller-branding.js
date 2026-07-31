// Reseller-safe branding mode. Keeps user extension branded by default; reseller mode can hide Lovable marks.
(function(){
  const root = typeof window !== 'undefined' ? window : self;
  const state = { enabled: false, resellerName: 'Your Brand', showNoBrandingNote: true };
  function storageGet(keys, cb) {
    try { chrome.storage.local.get(keys, cb); } catch (e) { cb({}); }
  }
  function storageSet(values, cb) {
    try { chrome.storage.local.set(values, cb || function(){}); } catch (e) { cb && cb(); }
  }
  function applyResellerText() {
    const brand = state.enabled ? state.resellerName : 'Freeflow';
    try { document.documentElement.setAttribute('data-lovablepro-reseller-mode', state.enabled ? '1' : '0'); } catch (e) {}
    document.querySelectorAll('[data-lovablepro-brand-text]').forEach((el) => { el.textContent = brand; });
    if (state.enabled) {
      document.querySelectorAll('.sp-brand-text,.ql-brand-text,.ql-title').forEach((el) => {
        if (/Lovable|Freeflow|Get Your Services/i.test(el.textContent || '')) el.textContent = brand;
      });
    }
  }
  function load(cb) {
    storageGet(['ql_reseller_mode','ql_reseller_brand_name'], (res) => {
      state.enabled = !!res.ql_reseller_mode;
      state.resellerName = String(res.ql_reseller_brand_name || 'Your Brand').trim() || 'Your Brand';
      applyResellerText();
      cb && cb(state);
    });
  }
  function toggle(value, name) {
    const enabled = !!value;
    const updates = { ql_reseller_mode: enabled };
    if (name) updates.ql_reseller_brand_name = String(name).trim();
    storageSet(updates, () => load());
  }
  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => load());
    else load();
    try { chrome.storage.onChanged.addListener((c,a) => { if (a === 'local' && (c.ql_reseller_mode || c.ql_reseller_brand_name)) load(); }); } catch (e) {}
  } else {
    load();
  }
  root.LovableResellerBranding = { state, load, toggle, applyResellerText };
})();
