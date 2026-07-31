// ============================================
// Freeflow - Device ID
// 1 Chrome profile = 1 device.
// Uses chrome.storage.local, not hardware fingerprinting.
// ============================================

let _cachedFingerprint = null;

function qlGenerateProfileDeviceId() {
  try {
    if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
      return "profile_" + crypto.randomUUID();
    }
  } catch (e) {}

  var randomPart = Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2);
  return "profile_" + Date.now().toString(36) + "_" + randomPart;
}

async function generateHardwareFingerprint() {
  return getHardwareFingerprint();
}

async function getHardwareFingerprint() {
  if (_cachedFingerprint) {
    return _cachedFingerprint;
  }

  return new Promise(function(resolve) {
    try {
      chrome.storage.local.get(["ql_profile_device_id"], function(res) {
        var deviceId = res && res.ql_profile_device_id ? String(res.ql_profile_device_id) : "";

        if (!deviceId) {
          deviceId = qlGenerateProfileDeviceId();
          chrome.storage.local.set({
            ql_profile_device_id: deviceId,
            ql_hw_fingerprint: deviceId
          }, function() {});
        } else {
          chrome.storage.local.set({ ql_hw_fingerprint: deviceId }, function() {});
        }

        _cachedFingerprint = deviceId;
        resolve(deviceId);
      });
    } catch (e) {
      var fallback = qlGenerateProfileDeviceId();
      _cachedFingerprint = fallback;
      resolve(fallback);
    }
  });
}
