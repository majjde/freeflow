// Freeflow v4.0 persistent premium side panel.
// Fixes: premium UI now reappears after closing/reopening side panel, removes reseller toggle, removes refresh/copy key buttons.
(function(){
  if (typeof document === 'undefined') return;
  if (window.__lovableproSidepanelUpgradeV3Loaded) return;
  window.__lovableproSidepanelUpgradeV3Loaded = true;

  const ADMIN_WHATSAPP = 'mailto:scoopwithpiper@gmail.com';
  const RESELLER_WHATSAPP = 'mailto:scoopwithpiper@gmail.com';

  function get(keys) {
    return new Promise((resolve) => {
      try { chrome.storage.local.get(keys, resolve); } catch (e) { resolve({}); }
    });
  }

  function set(values) {
    return new Promise((resolve) => {
      try { chrome.storage.local.set(values, resolve); } catch (e) { resolve(); }
    });
  }

  function safeText(v, fallback) {
    v = String(v || '').trim();
    return v || fallback || '—';
  }

  function shortKey(key, valid) {
    key = String(key || '').trim();
    if (!valid && key === '') return 'Enter license';
    return key.length > 12 ? key.slice(0, 4) + '••••' + key.slice(-4) : (key || '—');
  }

  function fmtDate(v, valid) {
    if (!v) return valid ? 'Lifetime' : 'Not activated';
    var raw = String(v);
    var normalized = raw.includes('T') ? raw : raw.replace(' ', 'T');
    if (!/[zZ]|[+\-]\d\d:?\d\d$/.test(normalized)) normalized += 'Z';
    const d = new Date(normalized);
    return isNaN(d.getTime()) ? raw : d.toLocaleString();
  }

  function isInsidePremium(node) {
    try {
      if (!node) return false;
      if (node.id === 'lovablepro-sp-upgrade') return true;
      return !!(node.closest && node.closest('#lovablepro-sp-upgrade'));
    } catch (e) { return false; }
  }

  function insertPremiumBox(body, box) {
    const banner = body.querySelector('#sp-update-banner');
    if (banner && banner.nextSibling) {
      body.insertBefore(box, banner.nextSibling);
    } else if (banner) {
      body.appendChild(box);
    } else {
      body.insertBefore(box, body.firstChild);
    }
  }

  async function renderPremiumPanel() {
    const body = document.getElementById('sp-body');
    if (!body) return;

    let box = document.getElementById('lovablepro-sp-upgrade');
    if (!box) {
      box = document.createElement('section');
      box.id = 'lovablepro-sp-upgrade';
      box.className = 'lovablepro-sp-upgrade';
      insertPremiumBox(body, box);
    }

    const res = await get([
      'ql_license_valid',
      'ql_license_key',
      'ql_session_id',
      'ql_expires_at',
      'ql_profile_device_id',
      'lovable_projectId',
      'ql_api_status'
    ]);

    // Old reseller mode is disabled in user extension v4.0.
    try { await set({ ql_reseller_mode: false }); } catch (e) {}
    try { document.documentElement.setAttribute('data-lovablepro-reseller-mode', '0'); } catch (e) {}

    const valid = !!res.ql_license_valid;
    const device = safeText(res.ql_profile_device_id, 'Chrome profile');

    box.innerHTML = `
      <div class="lovablepro-sp-top">
        <div>
          <div class="lovablepro-brand-mark">★ Freeflow v4.0</div>
          <div class="lovablepro-sp-title">Premium Control Center</div>
          <div class="lovablepro-sp-subtitle">${valid ? 'License active and device locked' : 'Activate license to unlock access'}</div>
        </div>
        <div class="lovablepro-sp-status ${valid ? 'ok' : 'warn'}">${valid ? '✓' : '!'}</div>
      </div>

      <div class="lovablepro-sp-grid">
        <div class="lovablepro-sp-card"><span>License</span><strong>${shortKey(res.ql_license_key, valid)}</strong></div>
        <div class="lovablepro-sp-card"><span>Expires</span><strong>${fmtDate(res.ql_expires_at, valid)}</strong></div>
        <div class="lovablepro-sp-card"><span>Device</span><strong>${device.slice(0, 18)}</strong></div>
        <div class="lovablepro-sp-card"><span>Project</span><strong>${safeText(res.lovable_projectId, 'Open Lovable')}</strong></div>
      </div>

      <div class="lovablepro-sp-actions">
        <button class="lovablepro-sp-btn" id="lovablepro-open-wa" type="button">Email Admin - scoopwithpiper@gmail.com</button>
        <button class="lovablepro-sp-btn secondary" id="lovablepro-become-reseller" type="button">Become a Reseller</button>
      </div>

      <div class="lovablepro-sp-contact">Email Admin - scoopwithpiper@gmail.com</div>
    `;

    const adminBtn = document.getElementById('lovablepro-open-wa');
    if (adminBtn) adminBtn.addEventListener('click', () => window.open(ADMIN_WHATSAPP, '_blank'));

    const resellerBtn = document.getElementById('lovablepro-become-reseller');
    if (resellerBtn) resellerBtn.addEventListener('click', () => window.open(RESELLER_WHATSAPP, '_blank'));
  }

  function updateFooter() {
    const footer = document.querySelector('.sp-footer');
    if (!footer) return;
    footer.querySelectorAll('.lovablepro-footer-upgrade').forEach((el) => el.remove());
    const el = document.createElement('div');
    el.className = 'lovablepro-footer-upgrade';
    el.textContent = 'Premium side panel upgraded · v4.0';
    el.style.cssText = 'font-size:10px;color:var(--ql-text-muted,#94a3b8);padding-left:8px;';
    footer.appendChild(el);
  }

  let timer = null;
  function scheduleRender() {
    clearTimeout(timer);
    timer = setTimeout(() => {
      renderPremiumPanel();
      updateFooter();
    }, 80);
  }

  function startObserver() {
    const body = document.getElementById('sp-body');
    if (!body || body.__lovableproPremiumObserver) return;
    body.__lovableproPremiumObserver = true;
    try {
      const mo = new MutationObserver((items) => {
        for (const item of items) {
          const nodes = Array.from(item.addedNodes || []).concat(Array.from(item.removedNodes || []));
          if (nodes.some(isInsidePremium)) continue;
          scheduleRender();
          break;
        }
      });
      mo.observe(body, { childList: true });
    } catch (e) {}
  }

  function boot() {
    scheduleRender();
    startObserver();
    setTimeout(scheduleRender, 500);
    setTimeout(scheduleRender, 1200);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

  try {
    chrome.storage.onChanged.addListener((changes, area) => {
      if (area === 'local') scheduleRender();
    });
  } catch (e) {}
})();
