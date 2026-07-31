// Freeflow branding cleanup and safe override layer.
(function(){
  const root = typeof window !== 'undefined' ? window : self;
  const BRAND = {
    appName: 'Freeflow',
    shortName: 'Freeflow',
    contact: 'scoopwithpiper@gmail.com',
    whatsapp: 'mailto:scoopwithpiper@gmail.com',
    supportText: 'Email Admin - scoopwithpiper@gmail.com',
    domain: 'lovablekey.zigital.in'
  };
  const banned = [
    /Get\s*Your\s*Services/gi,
    /GYS/gi,
    /\+?880\s*1833\s*226462/gi,
    /8801833226462/gi,
    /facebook\.com\/getyourservicebd/gi
  ];
  function cleanText(text) {
    let next = String(text || '');
    banned.forEach((re) => { next = next.replace(re, BRAND.shortName); });
    next = next.replace(/Contact\s*Support/gi, 'Email Admin - scoopwithpiper@gmail.com');
    return next;
  }
  function cleanNode(node) {
    if (!node) return;
    try {
      if (node.nodeType === Node.TEXT_NODE) {
        const v = cleanText(node.nodeValue);
        if (v !== node.nodeValue) node.nodeValue = v;
        return;
      }
      if (node.nodeType !== Node.ELEMENT_NODE) return;
      ['title','aria-label','placeholder','alt','value'].forEach((attr) => {
        if (node.hasAttribute && node.hasAttribute(attr)) {
          const old = node.getAttribute(attr);
          const v = cleanText(old);
          if (v !== old) node.setAttribute(attr, v);
        }
      });
      node.childNodes && node.childNodes.forEach(cleanNode);
    } catch (e) {}
  }
  function applyBranding() {
    cleanNode(document.body || document.documentElement);
    document.documentElement && document.documentElement.style.setProperty('--lovablepro-brand', '#ff1493');
  }
  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', applyBranding);
    else applyBranding();
    try {
      const mo = new MutationObserver((items) => {
        for (const item of items) item.addedNodes && item.addedNodes.forEach(cleanNode);
      });
      mo.observe(document.documentElement, { childList: true, subtree: true });
    } catch (e) {}
  }
  root.LovableBranding = Object.assign({}, root.LovableBranding || {}, { BRAND, cleanText, applyBranding });
})();
