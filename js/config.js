/**
 * config.js — HonorVet Dashboard Portal
 * =============================================================================
 * THIS IS THE ONLY FILE YOU NORMALLY NEED TO EDIT.
 *
 * It contains three things:
 *   1. HVBI.auth        — security settings + SHA-256 password hashes
 *   2. HVBI.departments — the six cards on the landing page
 *   3. HVBI.dashboards  — the dashboards (and Power BI URLs) per department
 *
 * Everything the UI renders (card counts, "last updated" labels, search,
 * navigation, authentication) is derived from this file at runtime. See
 * README.md for step-by-step recipes.
 * =============================================================================
 */

window.HVBI = window.HVBI || {};

/* ===========================================================================
 * 1. AUTHENTICATION
 * ===========================================================================
 * Passwords are NEVER stored in this file — only their SHA-256 hashes.
 *
 * The hash is computed over:   saltPrefix + departmentKey + "|" + password
 * e.g. for Executive:          "HVBI|v1|executive|Exec@HVT2026"
 *
 * TO CHANGE A PASSWORD:
 *   Open tools/hash-generator.html in your browser, pick the department, type
 *   the new password, and paste the generated hash over the old `passwordHash`
 *   value below. Commit and push. (Details in README.md §2.)
 *
 * DEFAULT PASSWORDS SHIPPED WITH THIS BUILD — CHANGE THESE BEFORE ROLLOUT:
 *   Executive      Exec@HVT2026
 *   HR             HR@HVT2026
 *   Healthcare     Health@HVT2026
 *   IT             IT@HVT2026
 *   NON-IT         NonIT@HVT2026
 *   Pharmaceutical Pharma@HVT2026
 * =========================================================================== */
HVBI.auth = {
  // Salt namespace. Changing this invalidates every hash below, so if you
  // edit it you must regenerate all six hashes.
  saltPrefix: "HVBI|v1|",

  // sessionStorage key holding the signed session record.
  sessionKey: "hvbi.session",

  // Mixed into the session signature so a session cannot be hand-typed as
  // easily. Change it to force every open tab to re-authenticate.
  sessionSecret: "hvbi-portal-session-2026",

  // Maximum session lifetime in minutes (the session also dies when the
  // browser tab is closed, because it lives in sessionStorage).
  maxSessionMinutes: 480,

  // Brute-force throttle for the login popup.
  maxAttempts: 5,
  lockoutSeconds: 30,
};

/* ===========================================================================
 * 2. DEPARTMENTS  (the six landing-page cards)
 * ===========================================================================
 * key          Internal id. Must match the key used in HVBI.dashboards below.
 * name         Card title.
 * page         The protected page this department unlocks.
 * tagline      Short description shown on the card.
 * icon         Icon keyword (see ICONS in js/app.js for the full list).
 * from / to    Gradient colors for the card's icon tile and accents.
 * passwordHash SHA-256 hash — see the note in section 1.
 * =========================================================================== */
HVBI.departments = [
  {
    key: "executive",
    name: "Executive",
    page: "executive.html",
    tagline: "Company-wide performance, revenue and strategic KPIs for leadership.",
    icon: "trending",
    from: "#14B8A6",
    to: "#0EA5E9",
    passwordHash: "efb2f654af300286aaf4872498338a3ddd15962a5349484ca038b99bfdd3d6cb",
  },
  {
    key: "hr",
    name: "HR",
    page: "hr.html",
    tagline: "Workforce analytics across headcount, attrition, attendance and hiring.",
    icon: "users",
    from: "#8B5CF6",
    to: "#6366F1",
    passwordHash: "df6ed8a7b0dd25df96e1be134de0c4bf44d3de444aeb42260530f562b04c21af",
  },
  {
    // Healthcare is a HUB, not a portal: it asks for no password and instead
    // lists the delivery-manager sub-portals defined in HVBI.subPortals below.
    // Each of those has its own password. See README section 5b.
    key: "healthcare",
    name: "Healthcare",
    page: "healthcare.html",
    tagline: "Healthcare vertical requisitions, coverage and placement analytics.",
    icon: "heart",
    from: "#22D3EE",
    to: "#14B8A6",
    requiresAuth: false,   // no login screen — the sub-portals gate access
  },
  {
    key: "it",
    name: "IT",
    page: "it.html",
    tagline: "IT vertical pipeline health, recruiter output and delivery metrics.",
    icon: "server",
    from: "#0EA5E9",
    to: "#3B82F6",
    passwordHash: "caadeb95900b7db57343bd8f02d7c8ca23a9d456f2379fc59f22a1a8e39d3a88",
  },
  {
    key: "nonit",
    name: "NON-IT",
    page: "nonit.html",
    tagline: "Non-IT vertical requisitions, submissions and recruiter performance.",
    icon: "briefcase",
    from: "#FBBF24",
    to: "#F97316",
    passwordHash: "9497620423696424874397bf7bd8cba391577ee5b43a6356d5445f6ea57c25cd",
  },
  {
    key: "pharma",
    name: "Pharmaceutical",
    page: "pharma.html",
    tagline: "Pharmaceutical vertical hiring, coverage and client analytics.",
    icon: "flask",
    from: "#F43F5E",
    to: "#D946EF",
    passwordHash: "ac46e7f35be8ded4dd1e8609b9f3b84aaab2574c8da74a48da8237e2f6f958f5",
  },
];

/* ===========================================================================
 * 2b. SUB-PORTALS
 * ===========================================================================
 * A department listed here shows a second selection screen instead of its own
 * dashboards: the parent card opens with no password, and each sub-portal below
 * has its own password and its own dashboard page.
 *
 * Keyed by the PARENT department's key. Each sub-portal takes the same fields
 * as a department, plus:
 *
 * role     Shown under the name on the card (e.g. "Delivery Manager").
 * parent   The parent portal's key. Drives the breadcrumb, the back button,
 *          and where a failed auth check sends the visitor.
 *
 * Its `key` must also exist in HVBI.dashboards below — UNLESS it is itself a hub.
 *
 * NESTING: a sub-portal can be a hub too. Give it `hub: true` and
 * `requiresAuth: false`, add its own array here keyed by its key, and it will
 * show a further selection screen instead of dashboards. That is how
 * "Team Leaders" works: no password on the way in, one password per leader.
 *
 * DEFAULT PASSWORDS — CHANGE BEFORE ROLLOUT:
 *   Sunita Chauhan   Sunita@HVT2026
 *   Nitish Sharma    Nitish@HVT2026
 *   Team Leaders     (none — it is a hub; each leader below has their own)
 * =========================================================================== */
HVBI.subPortals = {
  healthcare: [
    {
      key: "healthcare-sunita",
      name: "Sunita Chauhan",
      role: "Delivery Manager",
      parent: "healthcare",
      page: "healthcare-sunita.html",
      tagline: "Healthcare delivery portfolio managed by Sunita Chauhan — requisitions, coverage and placements.",
      icon: "users",
      from: "#22D3EE",
      to: "#0EA5E9",
      passwordHash: "3b69ab2308e519ffdde685def39745c61fb2549ada1950d07aacc7431de3d5e5",
    },
    {
      // A HUB inside a hub: no password here, one password per team leader on
      // the next screen. Its leaders live in the array below.
      key: "healthcare-team-leaders",
      name: "Team Leaders",
      parent: "healthcare",
      page: "healthcare-team-leaders.html",
      tagline: "Healthcare team leader portals — pick a leader to open their dashboards.",
      icon: "layers",
      from: "#38BDF8",
      to: "#6366F1",
      hub: true,             // marks it a hub even before any leaders are added
      requiresAuth: false,   // no login screen — each leader below has one
    },
  ],

  /* ---------------------------------------------------------------------------
   * HEALTHCARE TEAM LEADERS
   * ---------------------------------------------------------------------------
   * One entry per team leader. Each is password-protected and gets the same six
   * healthcare dashboards. Currently empty — the Team Leaders screen shows an
   * "awaiting setup" state until entries are added here.
   *
   * TO ADD A LEADER (README section 5b has the full recipe):
   *   1. Generate a hash in tools/hash-generator.html for the key you choose.
   *   2. Add an entry below, e.g.:
   *        {
   *          key: "healthcare-tl-anita",
   *          name: "Anita Rao",
   *          role: "Team Leader",
   *          parent: "healthcare-team-leaders",
   *          page: "healthcare-tl-anita.html",
   *          tagline: "Healthcare pipeline led by Anita Rao.",
   *          icon: "users",
   *          from: "#38BDF8",
   *          to: "#0EA5E9",
   *          passwordHash: "…",
   *        },
   *   3. Add the same key to HVBI.dashboards below.
   *   4. Copy healthcare-sunita.html to the `page` filename and change three
   *      things: the <title>, HVAuth.guard("<key>"), and data-dept="<key>".
   * ------------------------------------------------------------------------ */
  "healthcare-team-leaders": [
    {
      key: "healthcare-tl-heather",
      name: "Heather Brown",
      role: "Team Leader",
      parent: "healthcare-team-leaders",
      page: "healthcare-tl-heather.html",
      tagline: "Healthcare requisitions, coverage and placements led by Heather Brown.",
      icon: "users",
      from: "#38BDF8",
      to: "#0EA5E9",
      passwordHash: "06e5458545d1268f7f9fc4eeacacc5434e4848d1a0a1211f2b9e0b537c01438c",
    },
    {
      key: "healthcare-tl-shubham",
      name: "Shubham Abrol",
      role: "Team Leader",
      parent: "healthcare-team-leaders",
      page: "healthcare-tl-shubham.html",
      tagline: "Healthcare requisitions, coverage and placements led by Shubham Abrol.",
      icon: "users",
      from: "#22D3EE",
      to: "#06B6D4",
      passwordHash: "1f28fff95f09115a753ddd0d414cc38e8056f26058e808b2ca90eee95ea2e089",
    },
    {
      key: "healthcare-tl-arthur",
      name: "Arthur Swift",
      role: "Team Leader",
      parent: "healthcare-team-leaders",
      page: "healthcare-tl-arthur.html",
      tagline: "Healthcare requisitions, coverage and placements led by Arthur Swift.",
      icon: "users",
      from: "#2DD4BF",
      to: "#14B8A6",
      passwordHash: "f4c05b0d824a74c9fac11eefaf97f5801bd7546efbeca47e39774aa353450930",
    },
    {
      key: "healthcare-tl-alex",
      name: "Alex Ross",
      role: "Team Leader",
      parent: "healthcare-team-leaders",
      page: "healthcare-tl-alex.html",
      tagline: "Healthcare requisitions, coverage and placements led by Alex Ross.",
      icon: "users",
      from: "#34D399",
      to: "#10B981",
      passwordHash: "1d75e8a816eab35f05e9203a14f810ce311a05742378cc1862024f3b77cf4eeb",
    },
    {
      key: "healthcare-tl-shailesh",
      name: "Shailesh Singh",
      role: "Team Leader",
      parent: "healthcare-team-leaders",
      page: "healthcare-tl-shailesh.html",
      tagline: "Healthcare requisitions, coverage and placements led by Shailesh Singh.",
      icon: "users",
      from: "#60A5FA",
      to: "#3B82F6",
      passwordHash: "12c0375ce0829967ce29e3c95f332e517ab29ff5de6a1a293215a4b4f985e11b",
    },
    {
      key: "healthcare-tl-shivansh",
      name: "Shivansh Sanmotra",
      role: "Team Leader",
      parent: "healthcare-team-leaders",
      page: "healthcare-tl-shivansh.html",
      tagline: "Healthcare requisitions, coverage and placements led by Shivansh Sanmotra.",
      icon: "users",
      from: "#818CF8",
      to: "#6366F1",
      passwordHash: "c2862a32a11ca9a51f2015a32e3db46f9e8fbd18d37f6e1e6a1d6b2c89afa3a4",
    },
    {
      key: "healthcare-tl-rajnish",
      name: "Rajnish Kumar",
      role: "Team Leader",
      parent: "healthcare-team-leaders",
      page: "healthcare-tl-rajnish.html",
      tagline: "Healthcare requisitions, coverage and placements led by Rajnish Kumar.",
      icon: "users",
      from: "#A78BFA",
      to: "#8B5CF6",
      passwordHash: "dd71d4929e86f167efd44758afe53e49b0f7fbb25df3273feb6f4f578f9d7f80",
    },
    {
      key: "healthcare-tl-harshita",
      name: "Harshita Kukreja",
      role: "Team Leader",
      parent: "healthcare-team-leaders",
      page: "healthcare-tl-harshita.html",
      tagline: "Healthcare requisitions, coverage and placements led by Harshita Kukreja.",
      icon: "users",
      from: "#F472B6",
      to: "#EC4899",
      passwordHash: "156eb7beccbbc2b65793e4517c33fa6261c4c5662bfd64ff2720608a44a29ea3",
    },
    {
      // Moved here from the delivery-manager level. His password is unchanged
      // (Nitish@HVT2026); the hash differs only because the portal key — which
      // is part of the salt — changed from "healthcare-nitish".
      key: "healthcare-tl-nitish",
      name: "Nitish Sharma",
      role: "Team Leader",
      parent: "healthcare-team-leaders",
      page: "healthcare-tl-nitish.html",
      tagline: "Healthcare requisitions, coverage and placements led by Nitish Sharma.",
      icon: "users",
      from: "#FB7185",
      to: "#E11D48",
      passwordHash: "865c44a56aa5aca5e7c0d1139e7dd1ee5bdf5c47696aaa62b6dbfc7fbb1c1b76",
    },
  ],
};

/* ===========================================================================
 * 3. DASHBOARDS
 * ===========================================================================
 * One array per department key. Each dashboard object:
 *
 * id          (required) Unique within its department. Used in the viewer URL.
 * name        (required) Card title.
 * description (required) One-line summary shown on the card.
 * icon        (required) Icon keyword — see ICONS in js/app.js.
 * url         (required) Power BI report URL. Leave "" until you have it; the
 *             card then renders in a clearly-marked "Not configured" state
 *             instead of opening a broken report.
 * refreshed   (optional) ISO date "YYYY-MM-DD" of the last data refresh.
 *             Shown on the card and used for the department's "Last updated".
 * embeddable  (optional) Set to false for reports you already know block
 *             iframes — the viewer then goes straight to the new-tab fallback.
 *
 * SECURITY: a "Publish to web" URL (app.powerbi.com/view?r=...) is PUBLIC to
 * anyone who has the link, with no Power BI sign-in and no Row-Level Security.
 * Use standard app.powerbi.com report links for confidential data. See
 * README.md §9.
 * =========================================================================== */
HVBI.dashboards = {
  executive: [
    {
      id: "overview",
      name: "Executive Overview",
      description: "Company-wide KPIs, revenue trend and strategic performance summary.",
      icon: "trending",
      url: "https://app.powerbi.com/view?r=eyJrIjoiNDFmNzI2MjQtZTA4MS00OWJjLWE5ZDQtZmYzZDhhNDdkYzk0IiwidCI6IjBmYmYxYzgyLWM3OWUtNDFkYi05YWQzLThkMTQ3MDk3MzcxYyIsImMiOjJ9",
      refreshed: "2026-08-03",
    },
    {
      id: "performance",
      name: "Performance Dashboard",
      description: "Goal completion, review cycles and performance rating distribution.",
      icon: "target",
      url: "https://app.powerbi.com/view?r=eyJrIjoiODRjMmVmZGEtZDc3Yi00MzgwLTg2MzItYjA5NDE2NTA1ODRlIiwidCI6IjBmYmYxYzgyLWM3OWUtNDFkYi05YWQzLThkMTQ3MDk3MzcxYyIsImMiOjJ9&pageName=861a97b53fb1d275be02",
      refreshed: "2026-08-03",
    },
    {
      id: "dailyActivity",
      name: "Daily Activity",
      description: "Day-over-day submissions, interviews and recruiter activity volume.",
      icon: "calendar",
      url: "https://app.powerbi.com/view?r=eyJrIjoiOTIzNDM5MDYtYjQxOC00N2UzLWJlNzYtZGQzOThkMjhlODE4IiwidCI6IjBmYmYxYzgyLWM3OWUtNDFkYi05YWQzLThkMTQ3MDk3MzcxYyIsImMiOjJ9&pageName=95451a584b4cc1ebdb57",
      refreshed: "2026-08-02",
    },
    {
      id: "revenue",
      name: "Revenue Dashboard",
      description: "Revenue by vertical, client and period against target.",
      icon: "dollar",
      url: "",
    },
    {
      id: "financial",
      name: "Financial Dashboard",
      description: "Margin, cost of delivery and financial health indicators.",
      icon: "chart",
      url: "",
    },
    {
      id: "kpi",
      name: "KPI Dashboard",
      description: "Scorecard of the organisation's tracked KPIs and thresholds.",
      icon: "gauge",
      url: "",
    },
    {
      id: "recruitmentSummary",
      name: "Recruitment Summary",
      description: "Consolidated hiring funnel across every business vertical.",
      icon: "clipboard",
      url: "",
    },
  ],

  hr: [
    {
      id: "attrition",
      name: "Attrition Dashboard",
      description: "Voluntary and involuntary attrition trend, reasons and hotspots.",
      icon: "trendingDown",
      url: "https://app.powerbi.com/view?r=eyJrIjoiMzIxNmM2NWUtNzMyYy00ODkyLTljNGEtYmNkMGY0OTMyY2RiIiwidCI6IjBmYmYxYzgyLWM3OWUtNDFkYi05YWQzLThkMTQ3MDk3MzcxYyIsImMiOjJ9",
      refreshed: "2026-08-03",
    },
    {
      id: "attendance",
      name: "Attendance Dashboard",
      description: "Attendance, leave utilisation and shift adherence by team.",
      icon: "calendar",
      url: "",
    },
    {
      id: "headcount",
      name: "Headcount Dashboard",
      description: "Active headcount by department, location and employment type.",
      icon: "users",
      url: "",
    },
    {
      id: "hiring",
      name: "Hiring Dashboard",
      description: "Open roles, offer conversion and time-to-fill across the org.",
      icon: "userPlus",
      url: "",
    },
    {
      id: "performance",
      name: "Performance Dashboard",
      description: "Appraisal cycle progress and rating distribution by function.",
      icon: "target",
      url: "",
    },
  ],

  /* Healthcare has no dashboards of its own — it is a hub. Each delivery
   * manager below gets their own copy of the six healthcare reports so their
   * Power BI URLs can point at differently-filtered reports. */
  "healthcare-sunita": [
    {
      id: "executiveSummary",
      name: "Executive Summary",
      description: "Top-level view of Sunita's healthcare delivery performance.",
      icon: "trending",
      url: "",
    },
    {
      id: "requisitionReport",
      name: "Requisition Report",
      description: "Open, on-hold and closed requisitions with ageing analysis.",
      icon: "clipboard",
      url: "",
    },
    {
      id: "coverageReport",
      name: "Coverage Report",
      description: "Requisition coverage ratio and submission depth per client.",
      icon: "shield",
      url: "",
    },
    {
      id: "clientReport",
      name: "Client Report",
      description: "Client-level volume, fill rate and revenue contribution.",
      icon: "building",
      url: "",
    },
    {
      id: "performanceReport",
      name: "Performance Report",
      description: "Recruiter and team productivity across Sunita's desk.",
      icon: "gauge",
      url: "",
    },
    {
      id: "activeCandidates",
      name: "Active Candidates",
      description: "Live candidate pipeline by stage, speciality and location.",
      icon: "users",
      url: "",
    },
  ],

  "healthcare-tl-nitish": [
    {
      id: "executiveSummary",
      name: "Executive Summary",
      description: "Top-level view of Nitish's healthcare delivery performance.",
      icon: "trending",
      url: "",
    },
    {
      id: "requisitionReport",
      name: "Requisition Report",
      description: "Open, on-hold and closed requisitions with ageing analysis.",
      icon: "clipboard",
      url: "",
    },
    {
      id: "coverageReport",
      name: "Coverage Report",
      description: "Requisition coverage ratio and submission depth per client.",
      icon: "shield",
      url: "",
    },
    {
      id: "clientReport",
      name: "Client Report",
      description: "Client-level volume, fill rate and revenue contribution.",
      icon: "building",
      url: "",
    },
    {
      id: "performanceReport",
      name: "Performance Report",
      description: "Recruiter and team productivity across Nitish's desk.",
      icon: "gauge",
      url: "",
    },
    {
      id: "activeCandidates",
      name: "Active Candidates",
      description: "Live candidate pipeline by stage, speciality and location.",
      icon: "users",
      url: "",
    },
  ],

  "healthcare-tl-heather": [
    {
      id: "executiveSummary",
      name: "Executive Summary",
      description: "Top-level view of Heather's healthcare delivery performance.",
      icon: "trending",
      url: "",
    },
    {
      id: "requisitionReport",
      name: "Requisition Report",
      description: "Open, on-hold and closed requisitions with ageing analysis.",
      icon: "clipboard",
      url: "",
    },
    {
      id: "coverageReport",
      name: "Coverage Report",
      description: "Requisition coverage ratio and submission depth per client.",
      icon: "shield",
      url: "",
    },
    {
      id: "clientReport",
      name: "Client Report",
      description: "Client-level volume, fill rate and revenue contribution.",
      icon: "building",
      url: "",
    },
    {
      id: "performanceReport",
      name: "Performance Report",
      description: "Recruiter and team productivity across Heather's desk.",
      icon: "gauge",
      url: "",
    },
    {
      id: "activeCandidates",
      name: "Active Candidates",
      description: "Live candidate pipeline by stage, speciality and location.",
      icon: "users",
      url: "",
    },
  ],
  "healthcare-tl-shubham": [
    {
      id: "executiveSummary",
      name: "Executive Summary",
      description: "Top-level view of Shubham's healthcare delivery performance.",
      icon: "trending",
      url: "",
    },
    {
      id: "requisitionReport",
      name: "Requisition Report",
      description: "Open, on-hold and closed requisitions with ageing analysis.",
      icon: "clipboard",
      url: "",
    },
    {
      id: "coverageReport",
      name: "Coverage Report",
      description: "Requisition coverage ratio and submission depth per client.",
      icon: "shield",
      url: "",
    },
    {
      id: "clientReport",
      name: "Client Report",
      description: "Client-level volume, fill rate and revenue contribution.",
      icon: "building",
      url: "",
    },
    {
      id: "performanceReport",
      name: "Performance Report",
      description: "Recruiter and team productivity across Shubham's desk.",
      icon: "gauge",
      url: "",
    },
    {
      id: "activeCandidates",
      name: "Active Candidates",
      description: "Live candidate pipeline by stage, speciality and location.",
      icon: "users",
      url: "",
    },
  ],
  "healthcare-tl-arthur": [
    {
      id: "executiveSummary",
      name: "Executive Summary",
      description: "Top-level view of Arthur's healthcare delivery performance.",
      icon: "trending",
      url: "",
    },
    {
      id: "requisitionReport",
      name: "Requisition Report",
      description: "Open, on-hold and closed requisitions with ageing analysis.",
      icon: "clipboard",
      url: "",
    },
    {
      id: "coverageReport",
      name: "Coverage Report",
      description: "Requisition coverage ratio and submission depth per client.",
      icon: "shield",
      url: "",
    },
    {
      id: "clientReport",
      name: "Client Report",
      description: "Client-level volume, fill rate and revenue contribution.",
      icon: "building",
      url: "",
    },
    {
      id: "performanceReport",
      name: "Performance Report",
      description: "Recruiter and team productivity across Arthur's desk.",
      icon: "gauge",
      url: "",
    },
    {
      id: "activeCandidates",
      name: "Active Candidates",
      description: "Live candidate pipeline by stage, speciality and location.",
      icon: "users",
      url: "",
    },
  ],
  "healthcare-tl-alex": [
    {
      id: "executiveSummary",
      name: "Executive Summary",
      description: "Top-level view of Alex's healthcare delivery performance.",
      icon: "trending",
      url: "",
    },
    {
      id: "requisitionReport",
      name: "Requisition Report",
      description: "Open, on-hold and closed requisitions with ageing analysis.",
      icon: "clipboard",
      url: "",
    },
    {
      id: "coverageReport",
      name: "Coverage Report",
      description: "Requisition coverage ratio and submission depth per client.",
      icon: "shield",
      url: "",
    },
    {
      id: "clientReport",
      name: "Client Report",
      description: "Client-level volume, fill rate and revenue contribution.",
      icon: "building",
      url: "",
    },
    {
      id: "performanceReport",
      name: "Performance Report",
      description: "Recruiter and team productivity across Alex's desk.",
      icon: "gauge",
      url: "",
    },
    {
      id: "activeCandidates",
      name: "Active Candidates",
      description: "Live candidate pipeline by stage, speciality and location.",
      icon: "users",
      url: "",
    },
  ],
  "healthcare-tl-shailesh": [
    {
      id: "executiveSummary",
      name: "Executive Summary",
      description: "Top-level view of Shailesh's healthcare delivery performance.",
      icon: "trending",
      url: "",
    },
    {
      id: "requisitionReport",
      name: "Requisition Report",
      description: "Open, on-hold and closed requisitions with ageing analysis.",
      icon: "clipboard",
      url: "",
    },
    {
      id: "coverageReport",
      name: "Coverage Report",
      description: "Requisition coverage ratio and submission depth per client.",
      icon: "shield",
      url: "",
    },
    {
      id: "clientReport",
      name: "Client Report",
      description: "Client-level volume, fill rate and revenue contribution.",
      icon: "building",
      url: "",
    },
    {
      id: "performanceReport",
      name: "Performance Report",
      description: "Recruiter and team productivity across Shailesh's desk.",
      icon: "gauge",
      url: "",
    },
    {
      id: "activeCandidates",
      name: "Active Candidates",
      description: "Live candidate pipeline by stage, speciality and location.",
      icon: "users",
      url: "",
    },
  ],
  "healthcare-tl-shivansh": [
    {
      id: "executiveSummary",
      name: "Executive Summary",
      description: "Top-level view of Shivansh's healthcare delivery performance.",
      icon: "trending",
      url: "",
    },
    {
      id: "requisitionReport",
      name: "Requisition Report",
      description: "Open, on-hold and closed requisitions with ageing analysis.",
      icon: "clipboard",
      url: "",
    },
    {
      id: "coverageReport",
      name: "Coverage Report",
      description: "Requisition coverage ratio and submission depth per client.",
      icon: "shield",
      url: "",
    },
    {
      id: "clientReport",
      name: "Client Report",
      description: "Client-level volume, fill rate and revenue contribution.",
      icon: "building",
      url: "",
    },
    {
      id: "performanceReport",
      name: "Performance Report",
      description: "Recruiter and team productivity across Shivansh's desk.",
      icon: "gauge",
      url: "",
    },
    {
      id: "activeCandidates",
      name: "Active Candidates",
      description: "Live candidate pipeline by stage, speciality and location.",
      icon: "users",
      url: "",
    },
  ],
  "healthcare-tl-rajnish": [
    {
      id: "executiveSummary",
      name: "Executive Summary",
      description: "Top-level view of Rajnish's healthcare delivery performance.",
      icon: "trending",
      url: "",
    },
    {
      id: "requisitionReport",
      name: "Requisition Report",
      description: "Open, on-hold and closed requisitions with ageing analysis.",
      icon: "clipboard",
      url: "",
    },
    {
      id: "coverageReport",
      name: "Coverage Report",
      description: "Requisition coverage ratio and submission depth per client.",
      icon: "shield",
      url: "",
    },
    {
      id: "clientReport",
      name: "Client Report",
      description: "Client-level volume, fill rate and revenue contribution.",
      icon: "building",
      url: "",
    },
    {
      id: "performanceReport",
      name: "Performance Report",
      description: "Recruiter and team productivity across Rajnish's desk.",
      icon: "gauge",
      url: "",
    },
    {
      id: "activeCandidates",
      name: "Active Candidates",
      description: "Live candidate pipeline by stage, speciality and location.",
      icon: "users",
      url: "",
    },
  ],
  "healthcare-tl-harshita": [
    {
      id: "executiveSummary",
      name: "Executive Summary",
      description: "Top-level view of Harshita's healthcare delivery performance.",
      icon: "trending",
      url: "",
    },
    {
      id: "requisitionReport",
      name: "Requisition Report",
      description: "Open, on-hold and closed requisitions with ageing analysis.",
      icon: "clipboard",
      url: "",
    },
    {
      id: "coverageReport",
      name: "Coverage Report",
      description: "Requisition coverage ratio and submission depth per client.",
      icon: "shield",
      url: "",
    },
    {
      id: "clientReport",
      name: "Client Report",
      description: "Client-level volume, fill rate and revenue contribution.",
      icon: "building",
      url: "",
    },
    {
      id: "performanceReport",
      name: "Performance Report",
      description: "Recruiter and team productivity across Harshita's desk.",
      icon: "gauge",
      url: "",
    },
    {
      id: "activeCandidates",
      name: "Active Candidates",
      description: "Live candidate pipeline by stage, speciality and location.",
      icon: "users",
      url: "",
    },
  ],

  it: [
    {
      id: "hiring",
      name: "IT Hiring",
      description: "IT requisition intake, offers released and joiners by month.",
      icon: "userPlus",
      url: "",
    },
    {
      id: "recruiters",
      name: "IT Recruiters",
      description: "Recruiter-level submissions, interviews and placement output.",
      icon: "users",
      url: "",
    },
    {
      id: "pipeline",
      name: "IT Pipeline",
      description: "Candidate pipeline health and stage-to-stage conversion.",
      icon: "database",
      url: "",
    },
    {
      id: "performance",
      name: "IT Performance",
      description: "Delivery SLAs, fill rate and turnaround time for the IT desk.",
      icon: "gauge",
      url: "",
    },
  ],

  nonit: [
    {
      id: "hiring",
      name: "NON-IT Hiring",
      description: "Non-IT requisition intake, offers and joiners by month.",
      icon: "userPlus",
      url: "",
    },
    {
      id: "pipeline",
      name: "NON-IT Pipeline",
      description: "Candidate pipeline health and stage-to-stage conversion.",
      icon: "database",
      url: "",
    },
    {
      id: "recruiters",
      name: "NON-IT Recruiters",
      description: "Recruiter-level submissions, interviews and placement output.",
      icon: "users",
      url: "",
    },
    {
      id: "performance",
      name: "NON-IT Performance",
      description: "Delivery SLAs, fill rate and turnaround time for the non-IT desk.",
      icon: "gauge",
      url: "",
    },
  ],

  pharma: [
    {
      id: "hiring",
      name: "Pharma Hiring",
      description: "Pharmaceutical requisition intake, offers and joiners by month.",
      icon: "userPlus",
      url: "",
    },
    {
      id: "coverage",
      name: "Pharma Coverage",
      description: "Requisition coverage ratio and submission depth per client.",
      icon: "shield",
      url: "",
    },
    {
      id: "performance",
      name: "Pharma Performance",
      description: "Recruiter and team productivity across the pharma desk.",
      icon: "gauge",
      url: "",
    },
    {
      id: "clients",
      name: "Pharma Clients",
      description: "Client-level volume, fill rate and revenue contribution.",
      icon: "building",
      url: "",
    },
  ],
};

/* ===========================================================================
 * Derived helpers — no need to edit below this line.
 * =========================================================================== */

/** Sub-portals of a department, or [] if it has none. */
HVBI.getSubPortals = function (key) {
  return (HVBI.subPortals && HVBI.subPortals[key]) || [];
};

/** Every sub-portal across every department, flattened. */
HVBI.allSubPortals = function () {
  var all = [];
  Object.keys(HVBI.subPortals || {}).forEach(function (parent) {
    all = all.concat(HVBI.subPortals[parent]);
  });
  return all;
};

/**
 * Look up a portal by key. Searches top-level departments first, then
 * sub-portals, so auth.js and the page controllers treat both identically.
 */
HVBI.getDepartment = function (key) {
  var match = HVBI.departments.find(function (d) {
    return d.key === key;
  });
  if (match) return match;
  return HVBI.allSubPortals().find(function (d) {
    return d.key === key;
  }) || null;
};

/**
 * True when a portal delegates access to sub-portals instead of holding
 * dashboards. `hub: true` marks it a hub even while its list is still empty,
 * so a not-yet-populated screen still opens without asking for a password.
 */
HVBI.isHub = function (key) {
  var portal = HVBI.getDepartment(key);
  if (portal && portal.hub) return true;
  return HVBI.getSubPortals(key).length > 0;
};

/**
 * Dashboards for a portal. A hub has none of its own, so it reports its
 * sub-portals' dashboards combined — recursively, so a hub inside a hub (e.g.
 * Healthcare → Team Leaders → each leader) still rolls up to an honest count on
 * the landing page without duplicating any configuration.
 */
HVBI.getDashboards = function (key) {
  if (HVBI.isHub(key)) {
    return HVBI.getSubPortals(key).reduce(function (list, sub) {
      return list.concat(HVBI.getDashboards(sub.key));
    }, []);
  }
  return HVBI.dashboards[key] || [];
};

/**
 * Portals from the top level down to (but excluding) `key`, e.g. for
 * "healthcare-tl-anita" → [Healthcare, Team Leaders]. Drives breadcrumbs and
 * back buttons at any nesting depth.
 */
HVBI.getAncestors = function (key) {
  var chain = [];
  var portal = HVBI.getDepartment(key);
  var guard = 0;
  while (portal && portal.parent && guard++ < 10) {
    portal = HVBI.getDepartment(portal.parent);
    if (portal) chain.unshift(portal);
  }
  return chain;
};

HVBI.getDashboard = function (key, id) {
  return HVBI.getDashboards(key).find(function (d) {
    return String(d.id) === String(id);
  }) || null;
};

/** Most recent `refreshed` date across a department, or null if none set. */
HVBI.getLastUpdated = function (key) {
  return HVBI.getDashboards(key).reduce(function (latest, d) {
    if (!d.refreshed) return latest;
    return !latest || d.refreshed > latest ? d.refreshed : latest;
  }, null);
};
