/**
 * Shared Lovable session helpers (Firebase token + project tab URL).
 * Loaded in content scripts and side panel after extension-config.js.
 */

function scanFirebaseAccessToken() {
  try {
    for (var i = 0; i < localStorage.length; i++) {
      var k = localStorage.key(i) || "";
      if (k.indexOf("firebase") === -1) continue;
      var raw = localStorage.getItem(k);
      if (!raw) continue;
      try {
        var data = JSON.parse(raw);
        if (data && data.stsTokenManager && data.stsTokenManager.accessToken) {
          return String(data.stsTokenManager.accessToken).replace(/^Bearer\s+/i, "").trim();
        }
        if (data && data.accessToken) {
          return String(data.accessToken).replace(/^Bearer\s+/i, "").trim();
        }
      } catch (e) {}
    }
  } catch (e) {}
  return "";
}

function lovableProjectIdFromUrl(url) {
  if (!url) return "";
  var m = String(url).match(/\/projects\/([0-9a-fA-F-]{36})/i);
  return m ? m[1] : "";
}

function isValidLovableProjectId(projectId) {
  return /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(String(projectId || ""));
}

function pickLovableApiToken(firebaseToken, storedToken, cookieToken) {
  if (typeof pickBestToken === "function") {
    var api = pickBestToken([storedToken, cookieToken].filter(Boolean));
    if (api) return api;
  }
  var stored = String(storedToken || "").replace(/^Bearer\s+/i, "").trim();
  if (stored) return stored;
  var cookie = String(cookieToken || "").replace(/^Bearer\s+/i, "").trim();
  if (cookie) return cookie;
  return String(firebaseToken || "").replace(/^Bearer\s+/i, "").trim();
}

function getLovableSessionToken() {
  var fbToken = scanFirebaseAccessToken();
  return pickLovableApiToken(fbToken, "", "");
}

/**
 * Activation API request logic targeting [BASE_URL]/api/activate.
 * Sends POST with headers { "Content-Type": "application/json", "apikey": EXTENSION_API_KEY }
 * and body payload { "license_key": licenseKey, "token_lovable": tokenLovable }.
 */
async function activateLovableAuth(licenseKey, tokenLovable) {
  var baseUrl = typeof BASE_URL !== "undefined"
    ? BASE_URL
    : (typeof LICENSE_API_BASE !== "undefined" ? LICENSE_API_BASE : "https://ex-backend-server-production.up.railway.app");
  var url = baseUrl.replace(/\/$/, "") + "/api/activate";
  var apiKey = typeof EXTENSION_API_KEY !== "undefined" ? EXTENSION_API_KEY : "freeflow-be-key-2008";

  var token = tokenLovable;
  if (!token && typeof getLovableSessionToken === "function") {
    token = getLovableSessionToken();
  }

  var payload = {
    license_key: String(licenseKey || "").trim(),
    token_lovable: String(token || "").replace(/^Bearer\s+/i, "").trim()
  };

  try {
    var response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "apikey": apiKey
      },
      body: JSON.stringify(payload)
    });

    var data = {};
    try {
      data = await response.json();
    } catch (e) {
      data = {};
    }

    if (response.status === 200 && data && data.success === true) {
      return { success: true, valid: true, data: data };
    } else {
      var errorMsg = (data && data.error)
        ? data.error
        : ((data && data.message) ? data.message : ("Unauthorized (" + response.status + ")"));
      return { success: false, valid: false, error: errorMsg, message: errorMsg };
    }
  } catch (err) {
    var msg = err && err.message ? err.message : "Network error";
    return { success: false, valid: false, error: msg, message: msg };
  }
}
