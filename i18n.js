// Freeflow i18n/messages layer - clean, editable, no third-party backend.
(function(){
  const root = typeof window !== 'undefined' ? window : self;
  const CONTACT_NUMBER = '';
  const messages = {
    en: {
      appName: 'Freeflow',
      activateTitle: 'Activate License',
      licensePlaceholder: 'Enter your license key',
      activateButton: 'Activate Access',
      valid: 'License active',
      invalid: 'License invalid or expired',
      expired: 'License expired',
      deviceLimit: 'Device limit reached. Email Admin - scoopwithpiper@gmail.com',
      contactAdmin: 'Email Admin - scoopwithpiper@gmail.com',
      openPanel: 'Open Side Panel',
      copyKey: 'Copy License Key',
      resellerMode: 'Reseller Mode',
      userMode: 'User Mode',
      premiumTools: 'Premium Tools',
      unlimitedCredits: 'Unlimited Credits',
      noBranding: 'No branding reseller setup',
      supportWhatsapp: 'Email Admin - scoopwithpiper@gmail.com',
      refreshStatus: 'Refresh Status',
      detectedProject: 'Detected Project',
      tokenReady: 'Lovable token ready',
      tokenMissing: 'Open/refresh Lovable project to capture token',
      oneDevice: '1 Chrome profile = 1 device'
    }
  };
  function t(key, fallback) {
    const lang = (root.LovableLovableI18n && root.LovableLovableI18n.lang) || 'en';
    return (messages[lang] && messages[lang][key]) || messages.en[key] || fallback || key;
  }
  root.LovableLovableI18n = { lang: 'en', messages, t, CONTACT_NUMBER };
})();
