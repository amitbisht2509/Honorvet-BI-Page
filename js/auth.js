/**
 * auth.js — HonorVet Dashboard Portal
 * =============================================================================
 * Reusable client-side authentication shared by every page.
 *
 * HOW IT WORKS
 *   1. The user types a password into the landing-page popup.
 *   2. We compute  SHA-256( saltPrefix + deptKey + "|" + password )  and
 *      compare it to the `passwordHash` stored in js/config.js. The plain
 *      password is never stored, transmitted, or written to disk.
 *   3. On a match we write a signed session record into sessionStorage:
 *          { dept, exp, sig }
 *      where sig = SHA-256(dept | passwordHash | sessionSecret | exp).
 *      Because it lives in sessionStorage the session dies when the browser
 *      tab is closed, and it also expires after auth.maxSessionMinutes.
 *   4. Every protected page calls HVAuth.guard("<deptKey>") as its first
 *      script. If the session is missing, expired, tampered with, or belongs
 *      to a different department, the page is redirected back to index.html.
 *
 * IMPORTANT LIMITATION (see README.md §8)
 *   GitHub Pages serves static files with no server-side code, so this is
 *   "gate at the door" protection: it hides the portal UI from casual access,
 *   but a determined user can read the hashes and the report URLs straight
 *   out of the JavaScript source. The real access control for confidential
 *   data must be Power BI's own sign-in (Microsoft Entra ID) plus Row-Level
 *   Security, or a real edge gate such as Cloudflare Access — README.md §9.
 * =============================================================================
 */

window.HVAuth = (function () {
  "use strict";

  /* -------------------------------------------------------------------------
   * SHA-256
   * -------------------------------------------------------------------------
   * We prefer the browser's native, hardware-accelerated Web Crypto API.
   * It is only available in a "secure context" (https:// or localhost), so a
   * self-contained fallback keeps the portal working when the files are
   * opened over plain http:// or straight from disk during testing.
   * ---------------------------------------------------------------------- */

  var K = [
    0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1,
    0x923f82a4, 0xab1c5ed5, 0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3,
    0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174, 0xe49b69c1, 0xefbe4786,
    0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
    0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147,
    0x06ca6351, 0x14292967, 0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13,
    0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85, 0xa2bfe8a1, 0xa81a664b,
    0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
    0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a,
    0x5b9cca4f, 0x682e6ff3, 0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208,
    0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2,
  ];

  function rotr(x, n) {
    return ((x >>> n) | (x << (32 - n))) >>> 0;
  }

  function toBytes(text) {
    if (typeof TextEncoder !== "undefined") return new TextEncoder().encode(text);
    // Very old browsers: manual UTF-8 encoding.
    var utf8 = unescape(encodeURIComponent(text));
    var out = new Uint8Array(utf8.length);
    for (var i = 0; i < utf8.length; i++) out[i] = utf8.charCodeAt(i);
    return out;
  }

  function toHex(words) {
    var hex = "";
    for (var i = 0; i < words.length; i++) {
      hex += ("00000000" + (words[i] >>> 0).toString(16)).slice(-8);
    }
    return hex;
  }

  /** Pure-JS SHA-256 over a Uint8Array. Returns lowercase hex. */
  function sha256Sync(bytes) {
    var H = [
      0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a,
      0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19,
    ];

    var len = bytes.length;
    var padded = Math.ceil((len + 9) / 64) * 64;
    var msg = new Uint8Array(padded);
    msg.set(bytes);
    msg[len] = 0x80;

    var view = new DataView(msg.buffer);
    var bits = len * 8;
    view.setUint32(padded - 8, Math.floor(bits / 0x100000000));
    view.setUint32(padded - 4, bits >>> 0);

    var w = new Uint32Array(64);
    for (var off = 0; off < padded; off += 64) {
      var t;
      for (t = 0; t < 16; t++) w[t] = view.getUint32(off + t * 4);
      for (t = 16; t < 64; t++) {
        var x = w[t - 15];
        var y = w[t - 2];
        var s0 = rotr(x, 7) ^ rotr(x, 18) ^ (x >>> 3);
        var s1 = rotr(y, 17) ^ rotr(y, 19) ^ (y >>> 10);
        w[t] = (w[t - 16] + s0 + w[t - 7] + s1) >>> 0;
      }

      var a = H[0], b = H[1], c = H[2], d = H[3];
      var e = H[4], f = H[5], g = H[6], h = H[7];

      for (t = 0; t < 64; t++) {
        var S1 = rotr(e, 6) ^ rotr(e, 11) ^ rotr(e, 25);
        var ch = (e & f) ^ (~e & g);
        var t1 = (h + S1 + ch + K[t] + w[t]) >>> 0;
        var S0 = rotr(a, 2) ^ rotr(a, 13) ^ rotr(a, 22);
        var maj = (a & b) ^ (a & c) ^ (b & c);
        var t2 = (S0 + maj) >>> 0;

        h = g; g = f; f = e;
        e = (d + t1) >>> 0;
        d = c; c = b; b = a;
        a = (t1 + t2) >>> 0;
      }

      H[0] = (H[0] + a) >>> 0; H[1] = (H[1] + b) >>> 0;
      H[2] = (H[2] + c) >>> 0; H[3] = (H[3] + d) >>> 0;
      H[4] = (H[4] + e) >>> 0; H[5] = (H[5] + f) >>> 0;
      H[6] = (H[6] + g) >>> 0; H[7] = (H[7] + h) >>> 0;
    }

    return toHex(H);
  }

  /** SHA-256 of a string → Promise<lowercase hex>. */
  function sha256(text) {
    var bytes = toBytes(text);
    if (window.crypto && window.crypto.subtle && window.crypto.subtle.digest) {
      try {
        return window.crypto.subtle.digest("SHA-256", bytes).then(
          function (buf) {
            var arr = new Uint8Array(buf);
            var hex = "";
            for (var i = 0; i < arr.length; i++) {
              hex += ("0" + arr[i].toString(16)).slice(-2);
            }
            return hex;
          },
          function () {
            return sha256Sync(bytes);
          }
        );
      } catch (e) {
        /* falls through to the sync implementation */
      }
    }
    return Promise.resolve(sha256Sync(bytes));
  }

  /* -------------------------------------------------------------------------
   * Session handling
   * ---------------------------------------------------------------------- */

  function cfg() {
    return (window.HVBI && window.HVBI.auth) || {};
  }

  function department(key) {
    return (window.HVBI && window.HVBI.getDepartment(key)) || null;
  }

  /** Constant-time-ish string compare, so we don't leak length/position. */
  function safeEqual(a, b) {
    if (typeof a !== "string" || typeof b !== "string") return false;
    if (a.length !== b.length) return false;
    var diff = 0;
    for (var i = 0; i < a.length; i++) {
      diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
    }
    return diff === 0;
  }

  function signature(dept, exp) {
    var d = department(dept);
    if (!d) return Promise.resolve("");
    return sha256([dept, d.passwordHash, cfg().sessionSecret, exp].join("|"));
  }

  function storage() {
    try {
      return window.sessionStorage;
    } catch (e) {
      return null; // Storage blocked (private mode / embedded contexts).
    }
  }

  function writeSession(dept) {
    var exp = Date.now() + (cfg().maxSessionMinutes || 480) * 60000;
    return signature(dept, exp).then(function (sig) {
      var store = storage();
      if (!store) return false;
      try {
        store.setItem(cfg().sessionKey, JSON.stringify({ dept: dept, exp: exp, sig: sig }));
        return true;
      } catch (e) {
        return false;
      }
    });
  }

  function readSession() {
    var store = storage();
    if (!store) return null;
    try {
      var raw = store.getItem(cfg().sessionKey);
      if (!raw) return null;
      var parsed = JSON.parse(raw);
      if (!parsed || !parsed.dept || !parsed.exp || !parsed.sig) return null;
      return parsed;
    } catch (e) {
      return null;
    }
  }

  function clearSession() {
    var store = storage();
    if (!store) return;
    try {
      store.removeItem(cfg().sessionKey);
    } catch (e) {
      /* nothing we can do */
    }
  }

  /**
   * Resolves to the authenticated department key, or null.
   * Verifies the signature, the expiry, and (optionally) that the session
   * belongs to `expectedDept`.
   */
  function verify(expectedDept) {
    var session = readSession();
    if (!session) return Promise.resolve(null);
    if (Date.now() > Number(session.exp)) {
      clearSession();
      return Promise.resolve(null);
    }
    if (expectedDept && session.dept !== expectedDept) return Promise.resolve(null);
    if (!department(session.dept)) return Promise.resolve(null);

    return signature(session.dept, session.exp).then(function (expected) {
      if (!safeEqual(expected, session.sig)) {
        clearSession();
        return null;
      }
      return session.dept;
    });
  }

  /* -------------------------------------------------------------------------
   * Public API
   * ---------------------------------------------------------------------- */

  /** Verify a password for a department. Resolves true on success. */
  function login(deptKey, password) {
    var d = department(deptKey);
    if (!d || !password) return Promise.resolve(false);

    return sha256(cfg().saltPrefix + deptKey + "|" + password).then(function (hash) {
      if (!safeEqual(hash, String(d.passwordHash || "").toLowerCase())) return false;
      return writeSession(deptKey).then(function () {
        return true;
      });
    });
  }

  /**
   * Protect a page. Call this as the FIRST script in <head> of every
   * department page:   HVAuth.guard("healthcare");
   *
   * The document is hidden until verification completes, so a protected page
   * never flashes its contents before redirecting.
   */
  function guard(deptKey) {
    var root = document.documentElement;
    root.classList.add("hv-locked");

    function deny() {
      // Sub-portals send the visitor back to their parent hub (e.g. a locked
      // healthcare-sunita.html returns to healthcare.html), so they land on the
      // screen that can actually let them in.
      var portal = department(deptKey);
      var parent = portal && portal.parent ? department(portal.parent) : null;
      var target = (parent && parent.page ? parent.page : "index.html") + "?denied=1";
      if (deptKey) target += "&dept=" + encodeURIComponent(deptKey);
      window.location.replace(target);
    }

    var done = verify(deptKey).then(function (dept) {
      if (!dept) {
        deny();
        return null;
      }
      root.classList.remove("hv-locked");
      root.setAttribute("data-dept", dept);
      return dept;
    });

    // Fail closed: if verification somehow throws, don't leave the page open.
    done.catch(deny);
    return done;
  }

  /** Currently authenticated department key (unverified quick read). */
  function currentDept() {
    var s = readSession();
    return s ? s.dept : null;
  }

  /** Minutes left in the session (0 if none). */
  function minutesRemaining() {
    var s = readSession();
    if (!s) return 0;
    return Math.max(0, Math.round((Number(s.exp) - Date.now()) / 60000));
  }

  /** Log out and return to the landing page. */
  function logout(redirect) {
    clearSession();
    if (redirect !== false) window.location.replace("index.html?logout=1");
  }

  return {
    sha256: sha256,
    login: login,
    guard: guard,
    verify: verify,
    logout: logout,
    currentDept: currentDept,
    minutesRemaining: minutesRemaining,
    clearSession: clearSession,
  };
})();
