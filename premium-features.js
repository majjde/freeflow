// Premium page features for Lovable pages: floating launcher, project status, toasts.
(function(){
  if (typeof window === 'undefined' || typeof document === 'undefined') return;
  if (window.__lovableproPremiumFeaturesLoaded) return;
  window.__lovableproPremiumFeaturesLoaded = true;
  const t = (window.LovableLovableI18n && window.LovableLovableI18n.t) || ((k,f)=>f||k);
  function showToast(msg, ms) {
    let el = document.querySelector('.lovablepro-toast');
    if (!el) {
      el = document.createElement('div');
      el.className = 'lovablepro-toast';
      document.documentElement.appendChild(el);
    }
    el.textContent = msg;
    el.style.display = 'block';
    clearTimeout(el.__timer);
    el.__timer = setTimeout(() => { el.style.display = 'none'; }, ms || 2600);
  }
  function openPanel() {
    try {
      chrome.runtime.sendMessage({ action: 'openSidePanel' }, function(resp) {
        if (chrome.runtime.lastError || !resp || !resp.ok) {
          showToast('Click the extension icon to open the side panel.');
        }
      });
    } catch (e) { showToast('Click the extension icon to open the side panel.'); }
  }
  function addLauncher() {
    if (document.querySelector('.lovablepro-floating-launcher')) return;
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'lovablepro-floating-launcher';
    btn.innerHTML = '<span class="lovablepro-floating-dot"></span><span>Freeflow</span>';
    btn.addEventListener('click', openPanel);
    document.documentElement.appendChild(btn);
  }
  function captureUrlState() {
    try {
      const m = location.href.match(/\/projects\/([0-9a-fA-F-]{36})/);
      const updates = { ql_last_lovable_url: location.href, ql_last_seen_at: Date.now() };
      if (m) updates.lovable_projectId = m[1];
      chrome.storage.local.set(updates);
    } catch (e) {}
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', addLauncher); else addLauncher();
  captureUrlState();
  window.addEventListener('popstate', captureUrlState);
  setInterval(captureUrlState, 7000);
})();
