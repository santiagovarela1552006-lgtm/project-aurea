/* Router and event wiring for the Áurea Investor Cockpit prototype. */

var NAV_ITEMS = [
  { route: "search", label: "Search", icon: "&#128269;" },
  { route: "shortlist", label: "Shortlist", icon: "&#9733;" },
  { route: "valuation", label: "AI Valuation", icon: "&#128202;" },
  { route: "mortgage", label: "Mortgage Calculator", icon: "&#128176;" },
  { route: "alerts", label: "Alerts", icon: "&#128276;" },
  { route: "checklist", label: "Checklist", icon: "&#9989;" },
  { route: "auctions", label: "Real Auctions", icon: "&#128296;" }
];

function parseHash() {
  var hash = window.location.hash.replace(/^#\/?/, "");
  var parts = hash.split("?");
  var pathParts = parts[0].split("/").filter(Boolean);
  var query = {};
  if (parts[1]) {
    parts[1].split("&").forEach(function (kv) {
      var pair = kv.split("=");
      if (pair[0]) query[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1] || "");
    });
  }
  return {
    route: pathParts[0] || "search",
    id: pathParts[1] || null,
    query: query
  };
}

function renderSidebar(activeRoute) {
  var shortlistCount = getShortlist().length;
  var alertsCount = getAlerts().length;
  var progress = checklistProgress();

  var counts = { shortlist: shortlistCount, alerts: alertsCount, checklist: progress.pct + "%" };

  var items = NAV_ITEMS.map(function (item) {
    var count = counts[item.route];
    return (
      '<a href="#/' + item.route + '" data-nav class="nav-item ' + (item.route === activeRoute ? "active" : "") + '">' +
        '<span class="nav-icon">' + item.icon + "</span>" +
        '<span class="nav-label">' + item.label + "</span>" +
        (count ? '<span class="nav-count">' + count + "</span>" : "") +
      "</a>"
    );
  }).join("");

  return (
    '<a href="../index.html" class="cockpit-logo">ÁUREA</a>' +
    '<p class="cockpit-tag">Investor Cockpit</p>' +
    '<nav class="cockpit-nav">' + items + "</nav>" +
    '<a href="../index.html" class="back-to-site">&larr; Back to site</a>' +
    '<a href="#" data-action="logout" class="back-to-site">Log out</a>'
  );
}

function render() {
  var parsed = parseHash();
  var content = "";

  switch (parsed.route) {
    case "search": content = viewSearch(parsed); break;
    case "property": content = viewPropertyDetail(parsed); break;
    case "shortlist": content = viewShortlist(parsed); break;
    case "valuation": content = viewValuation(parsed); break;
    case "mortgage": content = viewMortgage(parsed); break;
    case "alerts": content = viewAlerts(parsed); break;
    case "checklist": content = viewChecklist(parsed); break;
    case "auctions": content = viewAuctions(parsed); break;
    default: content = viewSearch(parsed);
  }

  document.getElementById("sidebar").innerHTML = renderSidebar(parsed.route);
  document.getElementById("view").innerHTML = content;
  window.scrollTo(0, 0);
}

function buildHash(route, id, query) {
  var path = "#/" + route + (id ? "/" + id : "");
  var qs = Object.keys(query || {})
    .filter(function (k) { return query[k] !== "" && query[k] != null; })
    .map(function (k) { return encodeURIComponent(k) + "=" + encodeURIComponent(query[k]); })
    .join("&");
  return qs ? path + "?" + qs : path;
}

function formToObject(form) {
  var obj = {};
  Array.prototype.forEach.call(form.elements, function (el) {
    if (el.name) obj[el.name] = el.value;
  });
  return obj;
}

document.addEventListener("click", function (e) {
  var navEl = e.target.closest("[data-nav]");
  if (navEl) {
    // Let the default hash navigation happen; render() runs on hashchange.
    return;
  }

  var actionEl = e.target.closest("[data-action]");
  if (!actionEl) return;

  var action = actionEl.getAttribute("data-action");

  if (action === "logout") {
    e.preventDefault();
    logoutAuth();
    window.location.href = "index.html";
    return;
  }

  if (action === "toggle-shortlist") {
    e.preventDefault();
    toggleShortlist(actionEl.getAttribute("data-id"));
    render();
  }

  if (action === "remove-alert") {
    e.preventDefault();
    removeAlert(actionEl.getAttribute("data-id"));
    render();
  }

  if (action === "catastro-lookup") {
    e.preventDefault();
    var street = document.getElementById("catastro-street").value.trim();
    var number = document.getElementById("catastro-number").value.trim();
    var resultEl = document.getElementById("catastro-result");
    if (!street || !number) {
      resultEl.innerHTML = '<div class="catastro-error">Enter both a street name and number.</div>';
      return;
    }
    resultEl.innerHTML = '<p class="loading-note">Looking up &ldquo;' + street + " " + number + '&rdquo; in the Catastro&hellip;</p>';
    catastroLookup(street, number).then(function (result) {
      resultEl.innerHTML = catastroResultHTML(result);
    });
  }

  if (action === "use-catastro-unit") {
    e.preventDefault();
    var sizeInput = document.getElementById("val-size");
    var yearInput = document.getElementById("val-yearbuilt");
    if (sizeInput) sizeInput.value = actionEl.getAttribute("data-size");
    var year = actionEl.getAttribute("data-year");
    if (yearInput && year) yearInput.value = year;
  }

  if (action === "copy-ref") {
    e.preventDefault();
    var ref = actionEl.getAttribute("data-ref");
    var restoreLabel = actionEl.textContent;
    var onDone = function () {
      actionEl.textContent = "Copied";
      setTimeout(function () { actionEl.textContent = restoreLabel; }, 1500);
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(ref).then(onDone, onDone);
    } else {
      onDone();
    }
  }
});

document.addEventListener("change", function (e) {
  if (e.target.matches('[data-action="toggle-check"]')) {
    toggleChecklistItem(e.target.getAttribute("data-key"));
    render();
  }
});

document.addEventListener("submit", function (e) {
  var form = e.target;

  if (form.id === "search-filters") {
    e.preventDefault();
    window.location.hash = buildHash("search", null, formToObject(form));
  }

  if (form.id === "valuation-form") {
    e.preventDefault();
    var data = formToObject(form);
    data.submitted = "1";
    window.location.hash = buildHash("valuation", null, data);
  }

  if (form.id === "mortgage-form") {
    e.preventDefault();
    var parsed = parseHash();
    window.location.hash = buildHash("mortgage", parsed.id, formToObject(form));
  }

  if (form.id === "alert-form") {
    e.preventDefault();
    var payload = formToObject(form);
    addAlert(payload);
    form.reset();
    render();
  }
});

window.addEventListener("hashchange", render);
window.addEventListener("DOMContentLoaded", render);
