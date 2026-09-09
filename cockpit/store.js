/* localStorage persistence for the Áurea Investor Cockpit prototype. */

var STORE_KEYS = {
  shortlist: "aurea_shortlist",
  alerts: "aurea_alerts",
  checklist: "aurea_checklist"
};

function readJSON(key, fallback) {
  try {
    var raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (e) {
    return fallback;
  }
}

function writeJSON(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

/* ---- Shortlist ---- */
function getShortlist() {
  return readJSON(STORE_KEYS.shortlist, []);
}

function isShortlisted(id) {
  return getShortlist().indexOf(id) !== -1;
}

function toggleShortlist(id) {
  var list = getShortlist();
  var idx = list.indexOf(id);
  if (idx === -1) { list.push(id); } else { list.splice(idx, 1); }
  writeJSON(STORE_KEYS.shortlist, list);
  return list;
}

/* ---- Alerts ---- */
function getAlerts() {
  return readJSON(STORE_KEYS.alerts, []);
}

function addAlert(alert) {
  var list = getAlerts();
  alert.id = "a" + Date.now();
  list.push(alert);
  writeJSON(STORE_KEYS.alerts, list);
  return list;
}

function removeAlert(id) {
  var list = getAlerts().filter(function (a) { return a.id !== id; });
  writeJSON(STORE_KEYS.alerts, list);
  return list;
}

function matchesAlert(alert, p) {
  if (alert.neighborhood && alert.neighborhood !== "Any" && p.neighborhood !== alert.neighborhood) return false;
  if (alert.maxPrice && p.price > Number(alert.maxPrice)) return false;
  if (alert.minRooms && p.rooms < Number(alert.minRooms)) return false;
  return true;
}

/* ---- Checklist ---- */
var CHECKLIST_TEMPLATE = [
  {
    phase: "Before the offer",
    items: [
      "Define budget & get mortgage pre-approval",
      "Obtain NIE (foreigner tax ID), if applicable",
      "Open a Spanish bank account",
      "Engage an independent property lawyer"
    ]
  },
  {
    phase: "Offer & reservation",
    items: [
      "Submit offer",
      "Sign reservation contract (arras)",
      "Pay reservation deposit (typically ~10%)",
      "Commission property survey / technical inspection"
    ]
  },
  {
    phase: "Financing & legal checks",
    items: [
      "Finalize binding mortgage offer (oferta vinculante)",
      "Lawyer completes title & debt search (Nota Simple)",
      "Review community statutes & outstanding fees",
      "Confirm habitation certificate / licence"
    ]
  },
  {
    phase: "Notary & completion",
    items: [
      "Schedule notary appointment",
      "Sign Escritura Pública",
      "Pay transfer tax (ITP) or VAT + AJD for new build",
      "Register property at the Land Registry"
    ]
  },
  {
    phase: "Post-sale",
    items: [
      "Transfer utilities into buyer's name",
      "Arrange home insurance",
      "Register for local property tax (IBI)",
      "Update your address with your bank and tax authority"
    ]
  }
];

function getChecklistState() {
  return readJSON(STORE_KEYS.checklist, {});
}

function toggleChecklistItem(key) {
  var state = getChecklistState();
  state[key] = !state[key];
  writeJSON(STORE_KEYS.checklist, state);
  return state;
}

function checklistProgress() {
  var state = getChecklistState();
  var total = 0, done = 0;
  CHECKLIST_TEMPLATE.forEach(function (group, gi) {
    group.items.forEach(function (item, ii) {
      total++;
      if (state[gi + "_" + ii]) done++;
    });
  });
  return { done: done, total: total, pct: total ? Math.round((done / total) * 100) : 0 };
}
