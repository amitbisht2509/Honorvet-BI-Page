/**
 * app.js — HonorVet Dashboard Portal
 * =============================================================================
 * One modular script drives all three page types. Each page declares which
 * controller it needs on <body data-page="...">:
 *
 *   data-page="landing"     index.html            — department picker + login
 *   data-page="department"  <dept>.html           — that department's dashboards
 *   data-page="viewer"      viewer.html           — the embedded Power BI report
 *
 * Sections below:
 *   1. Icon library          6. Ripple + toasts
 *   2. Small DOM helpers     7. Landing controller
 *   3. Date formatting       8. Department controller
 *   4. Favorites store       9. Viewer controller
 *   5. Theming helpers      10. Bootstrap
 * =============================================================================
 */

(function () {
  "use strict";

  /* =========================================================================
   * 1. ICON LIBRARY
   * -------------------------------------------------------------------------
   * Inline stroked SVG paths (24×24). Add a new entry here and you can use
   * its keyword in config.js immediately. Unknown keywords fall back to
   * "grid" so a typo never breaks a card.
   * ====================================================================== */
  var ICONS = {
    trending: '<polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/>',
    trendingDown: '<polyline points="22 17 13.5 8.5 8.5 13.5 2 7"/><polyline points="16 17 22 17 22 11"/>',
    users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
    userPlus: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/>',
    heart: '<path d="M20.8 5.6a5.5 5.5 0 0 0-7.8 0L12 6.6l-1-1a5.5 5.5 0 0 0-7.8 7.8L12 22l8.8-8.6a5.5 5.5 0 0 0 0-7.8z"/>',
    server: '<rect x="2" y="3" width="20" height="7" rx="2"/><rect x="2" y="14" width="20" height="7" rx="2"/><line x1="6.5" y1="6.5" x2="6.5" y2="6.5"/><line x1="6.5" y1="17.5" x2="6.5" y2="17.5"/>',
    briefcase: '<rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/>',
    flask: '<path d="M9 3h6"/><path d="M10 3v6.5L4.6 19A2 2 0 0 0 6.3 22h11.4a2 2 0 0 0 1.7-3L14 9.5V3"/><path d="M7.5 16h9"/>',
    target: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.4"/>',
    dollar: '<line x1="12" y1="2" x2="12" y2="22"/><path d="M17 6.5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>',
    chart: '<line x1="3" y1="21" x2="21" y2="21"/><rect x="5" y="11" width="4" height="10"/><rect x="11" y="6" width="4" height="15"/><rect x="17" y="14" width="4" height="7"/>',
    gauge: '<path d="M4 18a9 9 0 1 1 16 0"/><path d="M12 14.5 16.5 9.5"/>',
    clipboard: '<rect x="8" y="2" width="8" height="4" rx="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><line x1="9" y1="12" x2="15" y2="12"/><line x1="9" y1="16" x2="13" y2="16"/>',
    shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>',
    shieldCheck: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 11.8 11.4 14.2 15.4 9.8"/>',
    building: '<path d="M4 21V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v16"/><path d="M16 9h2a2 2 0 0 1 2 2v10"/><line x1="8" y1="7" x2="12" y2="7"/><line x1="8" y1="11" x2="12" y2="11"/><line x1="8" y1="15" x2="12" y2="15"/><line x1="2" y1="21" x2="22" y2="21"/>',
    database: '<ellipse cx="12" cy="5.5" rx="8" ry="3"/><path d="M20 5.5v13c0 1.7-3.6 3-8 3s-8-1.3-8-3v-13"/><path d="M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3"/>',
    calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><line x1="8" y1="3" x2="8" y2="7"/><line x1="16" y1="3" x2="16" y2="7"/><line x1="3" y1="10" x2="21" y2="10"/>',
    clock: '<circle cx="12" cy="12" r="9"/><polyline points="12 7 12 12 16 14"/>',
    lock: '<rect x="4" y="10" width="16" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/>',
    key: '<circle cx="7.5" cy="15.5" r="4"/><path d="M10.5 12.5 20 3"/><path d="M16.5 6.5 19 9"/>',
    grid: '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
    layers: '<polygon points="12 2 22 8 12 14 2 8"/><polyline points="4.5 12.5 12 17 19.5 12.5"/><polyline points="4.5 16.5 12 21 19.5 16.5"/>',
    search: '<circle cx="11" cy="11" r="7"/><line x1="16.2" y1="16.2" x2="21" y2="21"/>',
    refresh: '<path d="M3 12a9 9 0 0 1 9-9 9.7 9.7 0 0 1 6.7 2.7L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.7 9.7 0 0 1-6.7-2.7L3 16"/><path d="M8 16H3v5"/>',
    logout: '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>',
    arrowRight: '<line x1="4" y1="12" x2="19" y2="12"/><polyline points="13 6 19 12 13 18"/>',
    arrowLeft: '<line x1="20" y1="12" x2="5" y2="12"/><polyline points="11 6 5 12 11 18"/>',
    chevronRight: '<polyline points="9 6 15 12 9 18"/>',
    x: '<line x1="6" y1="6" x2="18" y2="18"/><line x1="18" y1="6" x2="6" y2="18"/>',
    eye: '<path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="3"/>',
    eyeOff: '<path d="M10.7 5.1A10 10 0 0 1 12 5c6.4 0 10 7 10 7a17.4 17.4 0 0 1-2.4 3.4"/><path d="M6.6 6.6A17.2 17.2 0 0 0 2 12s3.6 7 10 7a9.9 9.9 0 0 0 5.4-1.6"/><path d="M14.1 14.1a3 3 0 0 1-4.2-4.2"/><line x1="3" y1="3" x2="21" y2="21"/>',
    alert: '<path d="M10.3 3.6 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.6a2 2 0 0 0-3.4 0z"/><line x1="12" y1="9" x2="12" y2="13.5"/><line x1="12" y1="17" x2="12" y2="17"/>',
    check: '<circle cx="12" cy="12" r="9"/><polyline points="8.4 12.4 11 15 16 9.6"/>',
    info: '<circle cx="12" cy="12" r="9"/><line x1="12" y1="11" x2="12" y2="16"/><line x1="12" y1="8" x2="12" y2="8"/>',
    star: '<polygon points="12 2.6 15 9 22 9.8 17 14.6 18.2 21.5 12 18.2 5.8 21.5 7 14.6 2 9.8 9 9"/>',
    external: '<path d="M15 3h6v6"/><path d="M10.5 13.5 21 3"/><path d="M20 13v6a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h6"/>',
    maximize: '<path d="M4 9V5.5A1.5 1.5 0 0 1 5.5 4H9"/><path d="M15 4h3.5A1.5 1.5 0 0 1 20 5.5V9"/><path d="M20 15v3.5a1.5 1.5 0 0 1-1.5 1.5H15"/><path d="M9 20H5.5A1.5 1.5 0 0 1 4 18.5V15"/>',
    home: '<path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.6V20a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V9.6"/>',
  };

  /** Returns an inline <svg> string for an icon keyword. */
  function icon(name, cls) {
    var body = ICONS[name] || ICONS.grid;
    return (
      '<svg class="icon' + (cls ? " " + cls : "") + '" viewBox="0 0 24 24" ' +
      'aria-hidden="true" focusable="false">' + body + "</svg>"
    );
  }

  /* =========================================================================
   * 2. DOM HELPERS
   * ====================================================================== */
  function $(sel, scope) {
    return (scope || document).querySelector(sel);
  }
  function $$(sel, scope) {
    return Array.prototype.slice.call((scope || document).querySelectorAll(sel));
  }

  /** Escape untrusted text before it goes into an innerHTML template. */
  function esc(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function on(node, type, handler, opts) {
    if (node) node.addEventListener(type, handler, opts);
  }

  function param(name) {
    return new URLSearchParams(window.location.search).get(name);
  }

  function debounce(fn, wait) {
    var timer;
    return function () {
      var args = arguments;
      var self = this;
      clearTimeout(timer);
      timer = setTimeout(function () {
        fn.apply(self, args);
      }, wait);
    };
  }

  /** "NON-IT" → "NI", "Healthcare" → "HE", "HR" → "HR". Always two letters. */
  function initials(text) {
    var words = String(text || "").split(/[^A-Za-z]+/).filter(Boolean);
    if (!words.length) return "HV";
    if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
    return (words[0][0] + words[1][0]).toUpperCase();
  }

  /* =========================================================================
   * 3. DATE FORMATTING
   * ====================================================================== */
  function startOfToday() {
    var d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }

  /** "2026-08-03" → "Today" / "Yesterday" / "4 days ago" / "Jul 12, 2026" */
  function formatRefresh(iso) {
    if (!iso) return null;
    var parts = String(iso).split("-");
    if (parts.length !== 3) return String(iso);
    var date = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
    if (isNaN(date.getTime())) return String(iso);

    var days = Math.round((startOfToday() - date) / 86400000);
    if (days <= 0) return "Today";
    if (days === 1) return "Yesterday";
    if (days < 7) return days + " days ago";
    return date.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }

  /* =========================================================================
   * 4. FAVORITES  (per department, in localStorage)
   * ====================================================================== */
  var Favorites = {
    key: function (dept) {
      return "hvbi.favorites." + dept;
    },
    read: function (dept) {
      try {
        var raw = localStorage.getItem(this.key(dept));
        var list = raw ? JSON.parse(raw) : [];
        return Array.isArray(list) ? list : [];
      } catch (e) {
        return [];
      }
    },
    has: function (dept, id) {
      return this.read(dept).indexOf(String(id)) !== -1;
    },
    toggle: function (dept, id) {
      var list = this.read(dept);
      var at = list.indexOf(String(id));
      if (at === -1) list.push(String(id));
      else list.splice(at, 1);
      try {
        localStorage.setItem(this.key(dept), JSON.stringify(list));
      } catch (e) {
        /* storage unavailable — favorites just won't persist */
      }
      return at === -1;
    },
  };

  /* =========================================================================
   * 5. THEMING
   * ====================================================================== */
  /** Publish a department's gradient as --from/--to on any element. */
  function applyAccent(node, dept) {
    if (!node || !dept) return;
    node.style.setProperty("--from", dept.from);
    node.style.setProperty("--to", dept.to);
  }

  /* =========================================================================
   * 6. RIPPLE + TOASTS
   * ====================================================================== */
  function initRipples() {
    document.addEventListener("pointerdown", function (event) {
      var target = event.target.closest("[data-ripple]");
      if (!target || target.disabled) return;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      var rect = target.getBoundingClientRect();
      var size = Math.max(rect.width, rect.height);
      var span = document.createElement("span");
      span.className = "ripple";
      span.style.width = span.style.height = size + "px";
      span.style.left = event.clientX - rect.left - size / 2 + "px";
      span.style.top = event.clientY - rect.top - size / 2 + "px";
      target.appendChild(span);
      setTimeout(function () {
        span.remove();
      }, 600);
    });
  }

  var Toast = {
    stack: null,
    mount: function () {
      if (this.stack) return this.stack;
      this.stack = $(".toast-stack");
      if (!this.stack) {
        this.stack = document.createElement("div");
        this.stack.className = "toast-stack";
        this.stack.setAttribute("role", "status");
        this.stack.setAttribute("aria-live", "polite");
        document.body.appendChild(this.stack);
      }
      return this.stack;
    },
    show: function (message, kind, ms) {
      var stack = this.mount();
      var glyph = kind === "error" ? "alert" : kind === "info" ? "info" : "check";
      var node = document.createElement("div");
      node.className = "toast toast-" + (kind || "success");
      node.innerHTML = icon(glyph) + "<span>" + esc(message) + "</span>";
      stack.appendChild(node);

      setTimeout(function () {
        node.classList.add("is-leaving");
        setTimeout(function () {
          node.remove();
        }, 240);
      }, ms || 3200);
    },
  };

  /* =========================================================================
   * 7. SELECTION CONTROLLER
   * -------------------------------------------------------------------------
   * Drives both selection screens, which are the same UI over a different
   * list of portals:
   *   index.html       — the six departments        (parent = null)
   *   healthcare.html  — that hub's sub-portals     (parent = healthcare)
   * ====================================================================== */
  var Landing = {
    // Failed attempts per portal, plus the current lockout deadline.
    attempts: {},
    lockedUntil: 0,
    activeDept: null,
    lastFocus: null,
    portals: [],
    parent: null,

    /**
     * @param {Array}  portals  Cards to render. Defaults to the departments.
     * @param {Object} parent   Parent department when this is a hub screen.
     */
    init: function (portals, parent) {
      this.portals = portals || HVBI.departments;
      this.parent = parent || null;
      this.grid = $("#deptGrid");

      // Pick a column count that keeps the screen to as few rows as possible:
      // two cards centre in a narrow two-column grid, 7-8 go four-up, 9 or more
      // go five-up, and everything else uses the standard three columns. This is
      // what keeps a selection screen to two rows and free of scrolling.
      if (this.grid) {
        var n = this.portals.length;
        this.grid.classList.toggle("grid-cards-2", n === 2);
        this.grid.classList.toggle("grid-cards-4", n >= 7 && n <= 8);
        this.grid.classList.toggle("grid-cards-5", n >= 9);
      }
      this.modal = $("#authModal");
      this.panel = $("#authPanel");
      this.form = $("#authForm");
      this.input = $("#authPassword");
      this.toggle = $("#authToggle");
      this.submit = $("#authSubmit");
      this.error = $("#authError");
      this.errorText = $("#authErrorText");

      this.renderCards();
      this.renderHeadMeta();
      this.bindModal();
      this.announceRedirect();
    },

    /* --- portal cards ---------------------------------------------------- */
    renderCards: function () {
      var self = this;
      var authed = window.HVAuth.currentDept();

      // A hub whose list is still empty (e.g. Team Leaders before any names are
      // configured) explains itself rather than rendering a blank grid.
      if (!this.portals.length) {
        this.grid.classList.remove("grid-cards", "grid-cards-2");
        this.grid.innerHTML =
          '<div class="portal-empty">' +
            '<span class="portal-empty-icon">' + icon("users", "icon-xl") + "</span>" +
            "<h2>No portals configured yet</h2>" +
            "<p>Add entries to <code>HVBI.subPortals[\"" +
              esc(this.parent ? this.parent.key : "") +
              "\"]</code> in <code>js/config.js</code> — each one appears here " +
              "automatically with its own password.</p>" +
          "</div>";
        return;
      }

      // Restore the grid in case a previous render showed the empty state.
      this.grid.classList.add("grid-cards");

      this.grid.innerHTML = this.portals
        .map(function (dept, index) {
          var list = HVBI.getDashboards(dept.key);
          var live = list.filter(function (d) {
            return !!d.url;
          }).length;
          var updated = formatRefresh(HVBI.getLastUpdated(dept.key)) || "Pending setup";
          var subs = HVBI.getSubPortals(dept.key);
          var isHub = HVBI.isHub(dept.key);
          var resume = authed === dept.key;

          // A hub needs no password of its own, so it advertises how many
          // sub-portals sit behind it instead of a lock state. The label is
          // wrapped so narrow layouts can collapse it to just the icon.
          var badgeText = isHub
            ? subs.length
              ? subs.length + " portals"
              : "No password"
            : resume ? "Unlocked" : "Secured";
          var badge =
            icon(isHub ? "layers" : resume ? "shieldCheck" : "lock") +
            '<span class="dept-lock-label">' + badgeText + "</span>";

          var label = isHub
            ? esc(dept.name) + " — " + subs.length + " sub-portals, no password"
            : esc(dept.name) + " portal — password protected";

          // Compact layout: the icon sits beside the title and the two stats
          // collapse into one meta line, so all six cards fit on one screen
          // without scrolling.
          return (
            '<article class="dept-card reveal" role="button" tabindex="0" ' +
            'data-dept="' + esc(dept.key) + '" aria-label="' + label + '" ' +
            'style="--i:' + index + ';--from:' + esc(dept.from) + ';--to:' + esc(dept.to) + '">' +
              '<div class="dept-top">' +
                '<span class="dept-tile">' + icon(dept.icon, "icon-lg") + "</span>" +
                '<span class="dept-titles">' +
                  '<h2 class="dept-name">' + esc(dept.name) + "</h2>" +
                  (dept.role ? '<span class="dept-role">' + esc(dept.role) + "</span>" : "") +
                "</span>" +
                '<span class="dept-lock" title="' + esc(badgeText) + '">' + badge + "</span>" +
              "</div>" +
              '<p class="dept-tagline">' + esc(dept.tagline) + "</p>" +
              '<p class="dept-meta">' +
                "<span><strong>" + list.length + "</strong> dashboards</span>" +
                (live < list.length ? '<span class="sep">&middot;</span><span>' + live + " live</span>" : "") +
                '<span class="sep">&middot;</span><span>' + esc(updated) + "</span>" +
              "</p>" +
              '<span class="btn btn-primary" data-ripple>' +
                '<span class="btn-label">' + (!isHub && resume ? "Resume Session" : "Open Portal") + "</span>" +
                icon("arrowRight") +
              "</span>" +
            "</article>"
          );
        })
        .join("");

      $$(".dept-card", this.grid).forEach(function (card) {
        on(card, "click", function () {
          self.requestAccess(card.getAttribute("data-dept"));
        });
        on(card, "keydown", function (event) {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            self.requestAccess(card.getAttribute("data-dept"));
          }
        });
      });
    },

    renderHeadMeta: function () {
      var node = $("#headMeta");
      if (!node) return;

      // Count only dashboards that actually have a Power BI URL configured —
      // the total would advertise reports nobody can open yet.
      var live = this.portals.reduce(function (sum, d) {
        return sum + HVBI.getDashboards(d.key).filter(function (dash) {
          return !!dash.url;
        }).length;
      }, 0);

      // On a hub screen the cards can be a mix of people and further groups, so
      // the label stays neutral rather than claiming they are all managers.
      var scope = this.parent
        ? this.portals.length + " portal" + (this.portals.length === 1 ? "" : "s")
        : this.portals.length + " departments";

      node.innerHTML =
        '<span class="chip">' + icon("layers") + scope + "</span>" +
        '<span class="chip">' + icon("grid") + live +
          " live dashboard" + (live === 1 ? "" : "s") + "</span>" +
        '<span class="chip">' + icon("shieldCheck") + "SHA-256 protected access</span>";
    },

    /**
     * Decide what a card click does:
     *   hub department      → open its sub-portal screen, no password
     *   already signed in   → straight through, no password
     *   otherwise           → login popup
     */
    requestAccess: function (key) {
      var dept = HVBI.getDepartment(key);
      if (!dept) return;
      var self = this;

      if (HVBI.isHub(key) || dept.requiresAuth === false) {
        window.location.href = dept.page;
        return;
      }

      window.HVAuth.verify(key).then(function (ok) {
        if (ok) {
          Toast.show("Session active — opening " + dept.name + " portal", "success", 1600);
          setTimeout(function () {
            window.location.href = dept.page;
          }, 260);
          return;
        }
        self.openModal(dept);
      });
    },

    /* --- login popup ----------------------------------------------------- */
    openModal: function (dept) {
      this.activeDept = dept;
      this.lastFocus = document.activeElement;

      applyAccent(this.panel, dept);

      // A sub-portal is titled by the person and badged with its department;
      // a department is titled "<Name> Portal" and badged with its own name.
      var parent = dept.parent ? HVBI.getDepartment(dept.parent) : null;
      $("#authDeptLabel").textContent = parent ? parent.name : dept.name;
      $("#authTitle").textContent = dept.role ? dept.name : dept.name + " Portal";
      $("#authSub").textContent = dept.role
        ? dept.role + " — enter password to continue"
        : "Enter password to continue";
      $("#authDeptIcon").innerHTML = icon(parent ? parent.icon : dept.icon, "icon-sm");

      this.hideError();
      this.input.value = "";
      this.setReveal(false);
      this.modal.classList.add("is-open");
      this.modal.setAttribute("aria-hidden", "false");
      document.body.style.overflow = "hidden";

      var self = this;
      setTimeout(function () {
        self.input.focus();
      }, 90);
    },

    closeModal: function () {
      this.modal.classList.remove("is-open");
      this.modal.setAttribute("aria-hidden", "true");
      document.body.style.overflow = "";
      this.input.value = "";
      this.hideError();
      this.activeDept = null;
      if (this.lastFocus && this.lastFocus.focus) this.lastFocus.focus();
    },

    isOpen: function () {
      return this.modal.classList.contains("is-open");
    },

    setReveal: function (reveal) {
      this.input.type = reveal ? "text" : "password";
      this.toggle.innerHTML =
        icon(reveal ? "eyeOff" : "eye", "icon-sm") + (reveal ? "Hide" : "Show");
      this.toggle.setAttribute("aria-pressed", reveal ? "true" : "false");
      this.toggle.setAttribute(
        "aria-label",
        reveal ? "Hide password" : "Show password"
      );
    },

    showError: function (message) {
      this.errorText.textContent = message;
      this.error.classList.add("is-visible");
      this.panel.classList.remove("is-shaking");
      // Force a reflow so the shake animation can replay on repeat failures.
      void this.panel.offsetWidth;
      this.panel.classList.add("is-shaking");
    },

    hideError: function () {
      this.error.classList.remove("is-visible");
      this.panel.classList.remove("is-shaking");
    },

    bindModal: function () {
      var self = this;

      on(this.toggle, "click", function () {
        self.setReveal(self.input.type === "password");
        self.input.focus();
      });

      on($("#authCancel"), "click", function () {
        self.closeModal();
      });

      // Click the dimmed backdrop (but not the panel) to dismiss.
      on(this.modal, "mousedown", function (event) {
        if (event.target === self.modal) self.closeModal();
      });

      on(document, "keydown", function (event) {
        if (!self.isOpen()) return;
        if (event.key === "Escape") {
          event.preventDefault();
          self.closeModal();
        }
        if (event.key === "Tab") self.trapFocus(event);
      });

      on(this.input, "input", function () {
        self.hideError();
      });

      on(this.form, "submit", function (event) {
        event.preventDefault();
        self.attemptLogin();
      });
    },

    /** Keep keyboard focus inside the popup while it is open. */
    trapFocus: function (event) {
      var focusables = $$(
        'button:not([disabled]), input:not([disabled]), a[href]',
        this.panel
      );
      if (!focusables.length) return;
      var first = focusables[0];
      var last = focusables[focusables.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    },

    attemptLogin: function () {
      var self = this;
      var dept = this.activeDept;
      if (!dept) return;

      var waitMs = this.lockedUntil - Date.now();
      if (waitMs > 0) {
        this.showError(
          "Too many attempts. Try again in " + Math.ceil(waitMs / 1000) + "s."
        );
        return;
      }

      var password = this.input.value;
      if (!password) {
        this.showError("Please enter your department password.");
        this.input.focus();
        return;
      }

      this.submit.classList.add("is-busy");
      this.submit.disabled = true;

      // A small floor on the verification time keeps the interaction feeling
      // deliberate and blunts rapid-fire guessing.
      var started = Date.now();
      window.HVAuth.login(dept.key, password)
        .then(function (ok) {
          var elapsed = Date.now() - started;
          return new Promise(function (resolve) {
            setTimeout(function () {
              resolve(ok);
            }, Math.max(0, 420 - elapsed));
          });
        })
        .then(function (ok) {
          self.submit.classList.remove("is-busy");
          self.submit.disabled = false;

          if (!ok) {
            self.registerFailure(dept.key);
            return;
          }

          self.attempts[dept.key] = 0;
          Toast.show("Access granted — opening " + dept.name + " portal", "success", 2000);
          self.panel.style.transition = "opacity 220ms ease, transform 220ms ease";
          self.panel.style.opacity = "0";
          self.panel.style.transform = "translateY(-6px) scale(0.985)";
          setTimeout(function () {
            window.location.href = dept.page;
          }, 380);
        })
        .catch(function () {
          self.submit.classList.remove("is-busy");
          self.submit.disabled = false;
          self.showError("Could not verify the password. Please try again.");
        });
    },

    registerFailure: function (key) {
      var cfg = HVBI.auth;
      this.attempts[key] = (this.attempts[key] || 0) + 1;
      var used = this.attempts[key];
      var left = cfg.maxAttempts - used;

      if (left <= 0) {
        this.lockedUntil = Date.now() + cfg.lockoutSeconds * 1000;
        this.attempts[key] = 0;
        this.showError(
          "Too many failed attempts. Locked for " + cfg.lockoutSeconds + " seconds."
        );
      } else {
        this.showError(
          "Incorrect password. " + left + " attempt" + (left === 1 ? "" : "s") + " remaining."
        );
      }

      this.input.select();
    },

    /** Explain why the user landed back here (guard redirect or logout). */
    announceRedirect: function () {
      if (param("logout")) {
        Toast.show("You have been signed out.", "info", 3200);
      } else if (param("denied")) {
        var dept = HVBI.getDepartment(param("dept") || "");
        Toast.show(
          dept
            ? "Sign in required to open the " + dept.name + " portal."
            : "Your session has expired. Please sign in again.",
          "error",
          4200
        );
      }
      if (window.history.replaceState && window.location.search) {
        window.history.replaceState({}, "", window.location.pathname);
      }
    },
  };

  /* =========================================================================
   * 8. DEPARTMENT CONTROLLER  (executive.html, hr.html, …)
   * ====================================================================== */
  var Department = {
    query: "",

    init: function (deptKey) {
      this.dept = HVBI.getDepartment(deptKey);
      if (!this.dept) return;

      this.grid = $("#dashGrid");
      this.skeleton = $("#dashSkeleton");
      this.empty = $("#dashEmpty");
      this.count = $("#dashCount");
      this.search = $("#dashSearch");

      applyAccent(document.body, this.dept);
      this.paintChrome();
      this.bind();
      this.loadWithSkeleton(560);
    },

    /** Fill in every static piece of chrome from config.js. */
    paintChrome: function () {
      var dept = this.dept;
      var parent = dept.parent ? HVBI.getDepartment(dept.parent) : null;
      var list = HVBI.getDashboards(dept.key);
      var live = list.filter(function (d) {
        return !!d.url;
      }).length;
      var updated = formatRefresh(HVBI.getLastUpdated(dept.key)) || "Pending setup";

      document.title = parent
        ? dept.name + " — " + parent.name + " Portal"
        : dept.name + " Portal — HonorVet Dashboard Portal";

      $("#deptIcon").innerHTML = icon(dept.icon);
      $("#deptTitle").textContent = dept.role ? dept.name : dept.name + " Portal";
      $("#pageTitle").textContent = dept.role ? dept.name : dept.name + " Analytics";
      $("#pageSub").textContent = dept.tagline;

      if (parent) {
        // Sub-portals sit one or more levels deeper. Walk the whole chain so a
        // team leader reads Portal › Healthcare › Team Leaders › <name>.
        var chain = HVBI.getAncestors(dept.key);
        $(".app-eyebrow").textContent = "HonorVet · " + chain[0].name + " Portal";
        $("#crumbs").innerHTML =
          '<a href="index.html">' + icon("home", "icon-sm") + "Dashboard Portal</a>" +
          chain
            .map(function (node) {
              return (
                icon("chevronRight", "icon-sm") +
                '<a href="' + esc(node.page) + '">' + esc(node.name) + "</a>"
              );
            })
            .join("") +
          icon("chevronRight", "icon-sm") +
          '<span class="current">' + esc(dept.name) + "</span>";
        $(".btn-back").href = parent.page;
        $(".btn-back").setAttribute("aria-label", "Back to " + parent.name + " portal");
        $(".btn-back").title = "Back to " + parent.name;
      } else {
        $("#crumbCurrent").textContent = dept.name;
      }

      $("#pageStats").innerHTML =
        '<div class="stat"><div class="stat-label">' + icon("grid") + "Dashboards</div>" +
          '<div class="stat-value">' + list.length + "</div></div>" +
        '<div class="stat"><div class="stat-label">' + icon("check") + "Live reports</div>" +
          '<div class="stat-value">' + live + "</div></div>" +
        '<div class="stat"><div class="stat-label">' + icon("clock") + "Last refresh</div>" +
          '<div class="stat-value is-text">' + esc(updated) + "</div></div>";

      var avatar = $("#profileBtn");
      avatar.textContent = initials(dept.name);
      avatar.setAttribute("aria-label", dept.name + " session menu");

      $("#popDept").textContent = dept.name + " Portal";
      this.refreshSessionLabel();
    },

    refreshSessionLabel: function () {
      var node = $("#popSession");
      if (!node) return;
      var mins = window.HVAuth.minutesRemaining();
      node.textContent =
        mins > 90
          ? Math.floor(mins / 60) + "h " + (mins % 60) + "m left"
          : mins + "m left";
    },

    /* --- data ------------------------------------------------------------ */
    visibleDashboards: function () {
      var dept = this.dept;
      var q = this.query.trim().toLowerCase();

      return HVBI.getDashboards(dept.key)
        .filter(function (d) {
          if (!q) return true;
          return (
            d.name.toLowerCase().indexOf(q) !== -1 ||
            String(d.description || "").toLowerCase().indexOf(q) !== -1
          );
        })
        .slice()
        .sort(function (a, b) {
          // Favorites first, then configured reports, then original order.
          var favA = Favorites.has(dept.key, a.id) ? 0 : 1;
          var favB = Favorites.has(dept.key, b.id) ? 0 : 1;
          if (favA !== favB) return favA - favB;
          var liveA = a.url ? 0 : 1;
          var liveB = b.url ? 0 : 1;
          return liveA - liveB;
        });
    },

    /* --- rendering ------------------------------------------------------- */
    loadWithSkeleton: function (ms) {
      var self = this;
      this.grid.hidden = true;
      this.empty.hidden = true;
      this.skeleton.hidden = false;
      this.skeleton.innerHTML = this.skeletonMarkup(6);

      setTimeout(function () {
        self.skeleton.hidden = true;
        self.skeleton.innerHTML = "";
        self.render();
      }, ms);
    },

    skeletonMarkup: function (n) {
      var card =
        '<div class="skel-card" aria-hidden="true">' +
          '<div class="skel skel-tile"></div>' +
          '<div class="skel skel-line" style="width:62%"></div>' +
          '<div class="skel skel-line" style="width:92%;margin-top:14px"></div>' +
          '<div class="skel skel-line" style="width:74%"></div>' +
          '<div class="skel skel-btn"></div>' +
        "</div>";
      return new Array(n + 1).join(card);
    },

    render: function () {
      var self = this;
      var dept = this.dept;
      var items = this.visibleDashboards();

      this.count.textContent = items.length;

      if (!items.length) {
        this.grid.hidden = true;
        this.grid.innerHTML = "";
        this.empty.hidden = false;
        this.empty.innerHTML =
          '<div class="empty-icon">' + icon("search", "icon-xl") + "</div>" +
          "<h3>No dashboards match “" + esc(this.query) + "”</h3>" +
          "<p>Try a different report name, or clear the search to see all " +
          HVBI.getDashboards(dept.key).length + " " + esc(dept.name) + " dashboards.</p>" +
          '<button class="btn btn-primary" id="emptyClear" data-ripple>' +
            icon("x", "icon-sm") + "Clear search</button>";

        on($("#emptyClear"), "click", function () {
          self.search.value = "";
          self.query = "";
          self.toggleClear();
          self.render();
          self.search.focus();
        });
        return;
      }

      this.empty.hidden = true;
      this.grid.hidden = false;
      this.grid.innerHTML = items
        .map(function (d, index) {
          var fav = Favorites.has(dept.key, d.id);
          var refreshed = formatRefresh(d.refreshed);
          var href =
            "viewer.html?dept=" + encodeURIComponent(dept.key) +
            "&id=" + encodeURIComponent(d.id);

          var action = d.url
            ? '<a class="btn btn-primary" href="' + href + '" data-ripple>' +
                '<span class="btn-label">Open Dashboard</span>' + icon("arrowRight") + "</a>"
            : '<span class="btn btn-disabled" aria-disabled="true">' +
                icon("lock", "icon-sm") + "Awaiting report URL</span>";

          var meta = d.url
            ? '<span class="dot dot-live"></span>Refreshed ' + esc(refreshed || "recently")
            : '<span class="dot dot-idle"></span>Not configured yet';

          return (
            '<article class="dash-card reveal' + (d.url ? "" : " is-pending") + '" ' +
            'style="--i:' + index + ';--from:' + esc(dept.from) + ';--to:' + esc(dept.to) + '" ' +
            'data-id="' + esc(d.id) + '" data-href="' + esc(d.url ? href : "") + '">' +
              '<div class="dash-top">' +
                '<span class="dash-tile">' + icon(d.icon, "icon-lg") + "</span>" +
                (d.url
                  ? '<button class="fav" type="button" aria-pressed="' + (fav ? "true" : "false") +
                      '" aria-label="' + (fav ? "Remove from" : "Add to") + ' favorites" ' +
                      'data-fav="' + esc(d.id) + '">' + icon("star", "icon-sm") + "</button>"
                  : '<span class="badge-pending">' + icon("alert", "icon-sm") + "Setup</span>") +
              "</div>" +
              '<h3 class="dash-name">' + esc(d.name) + "</h3>" +
              '<p class="dash-desc">' + esc(d.description) + "</p>" +
              '<div class="dash-meta">' + meta + "</div>" +
              action +
            "</article>"
          );
        })
        .join("");

      this.bindCards();
    },

    bindCards: function () {
      var self = this;
      var dept = this.dept;

      $$("[data-fav]", this.grid).forEach(function (btn) {
        on(btn, "click", function (event) {
          event.preventDefault();
          event.stopPropagation();
          var id = btn.getAttribute("data-fav");
          var added = Favorites.toggle(dept.key, id);
          btn.setAttribute("aria-pressed", added ? "true" : "false");
          btn.setAttribute("aria-label", (added ? "Remove from" : "Add to") + " favorites");
          Toast.show(
            added ? "Added to favorites" : "Removed from favorites",
            "info",
            1800
          );
        });
      });

      // The whole card is a click target; the inner <a> handles its own click.
      $$(".dash-card", this.grid).forEach(function (card) {
        var href = card.getAttribute("data-href");
        if (!href) return;
        on(card, "click", function (event) {
          if (event.target.closest("a, button")) return;
          window.location.href = href;
        });
      });
    },

    /* --- interactions ---------------------------------------------------- */
    toggleClear: function () {
      var clear = $("#searchClear");
      if (clear) clear.hidden = !this.search.value;
    },

    bind: function () {
      var self = this;

      var runSearch = debounce(function () {
        self.query = self.search.value;
        self.render();
      }, 130);

      on(this.search, "input", function () {
        self.toggleClear();
        runSearch();
      });

      on($("#searchClear"), "click", function () {
        self.search.value = "";
        self.query = "";
        self.toggleClear();
        self.render();
        self.search.focus();
      });

      on($("#refreshBtn"), "click", function () {
        var btn = this;
        btn.classList.add("is-spinning");
        setTimeout(function () {
          btn.classList.remove("is-spinning");
        }, 700);
        self.refreshSessionLabel();
        self.loadWithSkeleton(500);
        Toast.show("Dashboard list refreshed", "success", 1900);
      });

      // Profile popover
      var profile = $("#profileBtn");
      var pop = $("#profilePop");
      on(profile, "click", function (event) {
        event.stopPropagation();
        self.refreshSessionLabel();
        pop.classList.toggle("is-open");
        profile.setAttribute(
          "aria-expanded",
          pop.classList.contains("is-open") ? "true" : "false"
        );
      });
      on(document, "click", function (event) {
        if (!pop.contains(event.target) && event.target !== profile) {
          pop.classList.remove("is-open");
          profile.setAttribute("aria-expanded", "false");
        }
      });

      $$("[data-logout]").forEach(function (btn) {
        on(btn, "click", function () {
          Toast.show("Signing out…", "info", 1200);
          setTimeout(function () {
            window.HVAuth.logout();
          }, 260);
        });
      });

      // "/" focuses search, Escape clears it — familiar console shortcuts.
      on(document, "keydown", function (event) {
        if (event.key === "/" && document.activeElement !== self.search) {
          event.preventDefault();
          self.search.focus();
        }
        if (event.key === "Escape" && document.activeElement === self.search) {
          self.search.value = "";
          self.query = "";
          self.toggleClear();
          self.render();
        }
      });
    },
  };

  /* =========================================================================
   * 9. VIEWER CONTROLLER  (viewer.html)
   * ====================================================================== */
  var Viewer = {
    EMBED_TIMEOUT_MS: 12000,
    settled: false,

    init: function (deptKey) {
      this.dept = HVBI.getDepartment(deptKey);
      this.dash = this.dept ? HVBI.getDashboard(deptKey, param("id")) : null;

      this.stage = $("#viewerStage");
      this.frame = $("#viewerFrame");
      this.loading = $("#viewerLoading");
      this.fallback = $("#viewerFallback");

      if (!this.dept) {
        window.location.replace("index.html");
        return;
      }

      applyAccent(document.body, this.dept);
      $("#backBtn").href = this.dept.page;
      $("#deptIcon").innerHTML = icon(this.dept.icon);
      $("#deptChip").textContent = this.dept.name;

      if (!this.dash) {
        this.showFallback(
          "alert",
          "Dashboard not found",
          "This report is not listed under the " + this.dept.name +
            " department. It may have been renamed or removed from js/config.js.",
          null
        );
        return;
      }

      document.title = this.dash.name + " — " + this.dept.name + " Portal";
      $("#viewerTitle").textContent = this.dash.name;
      $("#viewerDesc").textContent = this.dash.description || "";

      this.bind();
      this.load();
    },

    bind: function () {
      var self = this;

      on($("#fullscreenBtn"), "click", function () {
        if (document.fullscreenElement) document.exitFullscreen();
        else if (self.stage.requestFullscreen) self.stage.requestFullscreen();
      });

      on($("#newTabBtn"), "click", function () {
        if (self.dash && self.dash.url) {
          window.open(self.dash.url, "_blank", "noopener,noreferrer");
        }
      });

      on($("#reloadBtn"), "click", function () {
        var btn = this;
        btn.classList.add("is-spinning");
        setTimeout(function () {
          btn.classList.remove("is-spinning");
        }, 700);
        self.load();
      });

      $$("[data-logout]").forEach(function (btn) {
        on(btn, "click", function () {
          window.HVAuth.logout();
        });
      });
    },

    load: function () {
      var self = this;
      var url = this.dash.url;

      this.fallback.hidden = true;
      this.loading.hidden = false;
      this.settled = false;

      if (!url) {
        this.showFallback(
          "key",
          "Report URL not configured",
          "Add this report's Power BI URL to the “" + this.dash.id + "” entry under " +
            this.dept.key + " in js/config.js, then reload this page.",
          null
        );
        return;
      }

      // Some reports refuse to be framed (X-Frame-Options / tenant embed
      // settings). We can't detect that directly across origins, so we treat a
      // silent timeout as "blocked" and offer the new-tab route instead.
      if (this.dash.embeddable === false) {
        this.showFallback(
          "external",
          "Opens in a new tab",
          "This report is configured to open outside the portal because Power BI blocks embedding it.",
          url
        );
        return;
      }

      var timer = setTimeout(function () {
        if (self.settled) return;
        self.settled = true;
        self.showFallback(
          "alert",
          "This report could not be embedded",
          "Power BI or your browser blocked the report from loading inside the portal. " +
            "Opening it in a new tab works the same way and keeps your Power BI sign-in intact.",
          url
        );
      }, this.EMBED_TIMEOUT_MS);

      function settle() {
        if (self.settled) return;
        self.settled = true;
        clearTimeout(timer);
        self.loading.hidden = true;
        self.fallback.hidden = true;
      }

      this.frame.onload = settle;
      this.frame.onerror = function () {
        if (self.settled) return;
        self.settled = true;
        clearTimeout(timer);
        self.showFallback(
          "alert",
          "This report could not be embedded",
          "The report failed to load inside the portal. Open it in a new tab instead.",
          url
        );
      };

      // Reassigning src re-triggers the load, which doubles as "refresh".
      this.frame.src = url;
    },

    showFallback: function (glyph, title, message, url) {
      this.loading.hidden = true;
      this.fallback.hidden = false;
      this.fallback.innerHTML =
        '<div class="icon-badge">' + icon(glyph, "icon-lg") + "</div>" +
        "<h2>" + esc(title) + "</h2>" +
        "<p>" + esc(message) + "</p>" +
        '<div class="overlay-actions">' +
          (url
            ? '<a class="btn btn-primary" href="' + esc(url) +
              '" target="_blank" rel="noopener noreferrer" data-ripple>' +
              icon("external", "icon-sm") + "Open in New Tab</a>"
            : "") +
          '<a class="btn btn-subtle" href="' + esc(this.dept.page) + '">' +
            icon("arrowLeft", "icon-sm") + "Back to " + esc(this.dept.name) +
          "</a>" +
        "</div>";
    },
  };

  /* =========================================================================
   * 10. BOOTSTRAP
   * ====================================================================== */
  function boot() {
    initRipples();

    var page = document.body.getAttribute("data-page");
    var dept = document.body.getAttribute("data-dept");

    if (page === "landing") {
      Landing.init();
    } else if (page === "subportal") {
      // A hub screen: same selection UI, listing one department's sub-portals.
      // Deliberately unguarded — each sub-portal enforces its own password.
      var parentKey = document.body.getAttribute("data-parent");
      var parent = HVBI.getDepartment(parentKey);
      if (parent) {
        applyAccent(document.body, parent);

        // Point "back" at whatever sits one level up, so a nested hub returns
        // to its parent hub rather than all the way to the landing page.
        var up = HVBI.getAncestors(parentKey).pop();
        var back = $(".portal-back");
        if (back) {
          back.href = up ? up.page : "index.html";
          back.innerHTML =
            icon("arrowLeft", "icon-sm") + (up ? "Back to " + esc(up.name) : "All departments");
        }

        Landing.init(HVBI.getSubPortals(parentKey), parent);
      }
    } else if (page === "department") {
      // guard() already ran in <head>; wait for it so we never paint a page
      // that is about to be redirected away.
      window.HVAuth.verify(dept).then(function (ok) {
        if (ok) Department.init(dept);
      });
    } else if (page === "viewer") {
      var key = param("dept");
      window.HVAuth.verify(key).then(function (ok) {
        if (ok) Viewer.init(key);
      });
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
