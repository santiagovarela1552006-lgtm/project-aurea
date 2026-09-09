/* View templates for the Áurea Investor Cockpit prototype. Each function returns an HTML string. */

function badge(text, kind) {
  return '<span class="badge badge-' + (kind || "neutral") + '">' + text + "</span>";
}

function propertyCardHTML(p) {
  var shortlisted = isShortlisted(p.id);
  var pricePerM2 = Math.round(p.price / p.size);
  var initials = p.neighborhood.slice(0, 2).toUpperCase();
  return (
    '<div class="p-card" data-id="' + p.id + '">' +
      '<div class="p-thumb" data-thumb="' + p.neighborhood + '"><span>' + initials + "</span></div>" +
      '<div class="p-body">' +
        '<div class="p-top">' +
          '<h3><a href="#/property/' + p.id + '" data-nav>' + p.title + "</a></h3>" +
          '<button class="heart-btn ' + (shortlisted ? "active" : "") + '" data-action="toggle-shortlist" data-id="' + p.id + '" aria-label="Shortlist">' + (shortlisted ? "&#9733;" : "&#9734;") + "</button>" +
        "</div>" +
        '<p class="p-loc">' + p.neighborhood + " &middot; " + p.type + " &middot; " + p.floor + "</p>" +
        '<div class="p-stats">' +
          '<div><strong>' + fmtEUR(p.price) + "</strong><small>Price</small></div>" +
          "<div><strong>" + p.size + " m&sup2;</strong><small>Size</small></div>" +
          "<div><strong>" + p.rooms + " bed</strong><small>Rooms</small></div>" +
          '<div><strong class="gold">' + pricePerM2.toLocaleString() + " &euro;</strong><small>Per m&sup2;</small></div>" +
        "</div>" +
        '<div class="p-actions">' +
          '<a class="btn btn-small btn-ghost" href="#/property/' + p.id + '" data-nav>View details</a>' +
          '<a class="btn btn-small btn-primary" href="#/mortgage/' + p.id + '" data-nav>Mortgage calc</a>' +
        "</div>" +
      "</div>" +
    "</div>"
  );
}

function viewSearch(params) {
  var q = params.query || {};
  var neighborhood = q.neighborhood || "Any";
  var maxPrice = q.maxPrice || "";
  var minRooms = q.minRooms || "";

  var results = PROPERTIES.filter(function (p) {
    if (neighborhood !== "Any" && p.neighborhood !== neighborhood) return false;
    if (maxPrice && p.price > Number(maxPrice)) return false;
    if (minRooms && p.rooms < Number(minRooms)) return false;
    return true;
  });

  var neighborhoodOptions = ["Any"].concat(Object.keys(NEIGHBORHOOD_AVG_PRICE_M2)).map(function (n) {
    return '<option value="' + n + '"' + (n === neighborhood ? " selected" : "") + ">" + n + "</option>";
  }).join("");

  return (
    '<div class="view-head">' +
      "<h1>Search &amp; shortlist</h1>" +
      "<p>Browse the demo inventory and shortlist properties worth a closer look.</p>" +
    "</div>" +
    '<form id="search-filters" class="filter-bar">' +
      '<label>Neighborhood<select name="neighborhood">' + neighborhoodOptions + "</select></label>" +
      '<label>Max price<input type="number" name="maxPrice" placeholder="e.g. 500000" value="' + maxPrice + '"></label>' +
      '<label>Min rooms<input type="number" name="minRooms" placeholder="e.g. 2" value="' + minRooms + '"></label>' +
      '<button type="submit" class="btn btn-primary btn-small">Apply filters</button>' +
    "</form>" +
    '<p class="result-count">' + results.length + " properties match" + "</p>" +
    '<div class="p-grid">' + (results.length ? results.map(propertyCardHTML).join("") : '<p class="empty-state">No matches — try widening your filters.</p>') + "</div>"
  );
}

function viewPropertyDetail(params) {
  var p = getProperty(params.id);
  if (!p) return '<p class="empty-state">Property not found.</p>';

  var v = aiValuation(p);
  var deltaLabel = v.deltaPct > 2 ? "above" : (v.deltaPct < -2 ? "below" : "in line with");
  var deltaClass = v.deltaPct > 2 ? "over" : (v.deltaPct < -2 ? "under" : "fair");
  var shortlisted = isShortlisted(p.id);

  return (
    '<a href="#/search" data-nav class="back-link">&larr; Back to search</a>' +
    '<div class="view-head">' +
      "<h1>" + p.title + "</h1>" +
      "<p>" + p.neighborhood + " &middot; " + p.type + " &middot; " + p.floor + "</p>" +
    "</div>" +
    '<div class="detail-grid">' +
      '<div class="detail-main">' +
        '<div class="p-thumb large" data-thumb="' + p.neighborhood + '"><span>' + p.neighborhood.slice(0, 2).toUpperCase() + "</span></div>" +
        '<div class="stat-row">' +
          '<div class="stat-box"><strong>' + fmtEUR(p.price) + "</strong><small>Asking price</small></div>" +
          '<div class="stat-box"><strong>' + p.size + " m&sup2;</strong><small>" + Math.round(p.price / p.size).toLocaleString() + " &euro;/m&sup2;</small></div>" +
          '<div class="stat-box"><strong>' + p.rooms + " bed / " + p.baths + " bath</strong><small>Layout</small></div>" +
          '<div class="stat-box"><strong>' + p.yearBuilt + "</strong><small>Year built</small></div>" +
          '<div class="stat-box"><strong>' + p.condition + "</strong><small>Condition</small></div>" +
        "</div>" +
        '<div class="callout-box">' +
          "<h3>AI valuation <span class=\"tag-demo\">illustrative</span></h3>" +
          '<div class="val-range">' +
            '<span>' + fmtEUR(v.low) + "</span>" +
            '<div class="val-bar"><div class="val-bar-fill ' + deltaClass + '"></div><div class="val-marker" style="left:' + Math.max(4, Math.min(96, ((p.price - v.low) / (v.high - v.low)) * 100)) + '%"></div></div>' +
            "<span>" + fmtEUR(v.high) + "</span>" +
          "</div>" +
          "<p>Estimated value <strong>" + fmtEUR(v.estimate) + "</strong> based on the official " + p.neighborhood + " average sale price (" + Math.round(v.avgM2).toLocaleString() + " &euro;/m&sup2;, Ayuntamiento de Madrid 2025), adjusted for condition and building age. Asking price is <strong>" + fmtPct(Math.abs(v.deltaPct)) + "</strong> " + deltaLabel + " the estimate.</p>" +
          '<p class="confidence">Base price is real (see sources below) &middot; condition/age adjustment is an illustrative heuristic &middot; not a substitute for a professional valuation.</p>' +
        "</div>" +
        '<p class="disclaimer">Sources: ' + DATA_SOURCES.map(function (s) { return '<a href="' + s.url + '" target="_blank" rel="noopener">' + s.org + "</a>"; }).join(" &middot; ") + "</p>" +
      "</div>" +
      '<div class="detail-side">' +
        '<button class="btn ' + (shortlisted ? "btn-primary" : "btn-ghost") + ' btn-full" data-action="toggle-shortlist" data-id="' + p.id + '">' + (shortlisted ? "&#9733; Shortlisted" : "&#9734; Add to shortlist") + "</button>" +
        '<a class="btn btn-ghost btn-full" href="#/mortgage/' + p.id + '" data-nav>Run mortgage calculator</a>' +
        '<a class="btn btn-ghost btn-full" href="#/checklist" data-nav>Open transaction checklist</a>' +
      "</div>" +
    "</div>"
  );
}

function viewShortlist() {
  var ids = getShortlist();
  var items = ids.map(getProperty).filter(Boolean);

  if (!items.length) {
    return (
      '<div class="view-head"><h1>Shortlist</h1><p>Properties you star will show up here.</p></div>' +
      '<p class="empty-state">Your shortlist is empty. <a href="#/search" data-nav>Browse properties</a> to add some.</p>'
    );
  }

  var rows = items.map(function (p) {
    return (
      "<tr>" +
      '<td><a href="#/property/' + p.id + '" data-nav>' + p.title + "</a><br><small>" + p.neighborhood + "</small></td>" +
      "<td>" + fmtEUR(p.price) + "</td>" +
      "<td>" + Math.round(p.price / p.size).toLocaleString() + " &euro;/m&sup2;</td>" +
      '<td class="gold">' + p.size + " m&sup2;</td>" +
      '<td><button class="btn btn-small btn-ghost" data-action="toggle-shortlist" data-id="' + p.id + '">Remove</button></td>' +
      "</tr>"
    );
  }).join("");

  return (
    '<div class="view-head"><h1>Shortlist</h1><p>' + items.length + " saved propert" + (items.length === 1 ? "y" : "ies") + ".</p></div>" +
    '<table class="data-table"><thead><tr><th>Property</th><th>Price</th><th>Price/m&sup2;</th><th>Size</th><th></th></tr></thead><tbody>' + rows + "</tbody></table>"
  );
}

function viewValuation(params) {
  var q = params.query || {};
  var neighborhood = q.neighborhood || "Salamanca";
  var size = q.size || 80;
  var condition = q.condition || "Good";
  var yearBuilt = q.yearBuilt || 1990;
  var hasResult = !!q.submitted;

  var neighborhoodOptions = Object.keys(NEIGHBORHOOD_AVG_PRICE_M2).map(function (n) {
    return '<option value="' + n + '"' + (n === neighborhood ? " selected" : "") + ">" + n + "</option>";
  }).join("");

  var conditionOptions = ["Renovated", "Good", "Needs work"].map(function (c) {
    return '<option value="' + c + '"' + (c === condition ? " selected" : "") + ">" + c + "</option>";
  }).join("");

  var resultHTML = "";
  if (hasResult) {
    var v = aiValuationFromInputs(neighborhood, Number(size), condition, Number(yearBuilt));
    resultHTML =
      '<div class="callout-box">' +
        "<h3>Estimated value</h3>" +
        '<p class="big-figure">' + fmtEUR(v.estimate) + "</p>" +
        "<p>Range: " + fmtEUR(v.low) + " &ndash; " + fmtEUR(v.high) + " &middot; based on the official " + neighborhood + " average of " + Math.round(v.avgM2).toLocaleString() + " &euro;/m&sup2; (Ayuntamiento de Madrid, 2025), adjusted for condition and age.</p>" +
      "</div>";
  }

  return (
    '<div class="view-head"><h1>AI valuation tool <span class="tag-demo">real base price</span></h1>' +
      "<p>Estimates use the official 2025 district average sale price for Madrid, adjusted by an illustrative condition/age model. Not a certified valuation.</p></div>" +

    '<div class="callout-box">' +
      '<h3>Look up a real address <span class="tag-demo">live &middot; Catastro</span></h3>' +
      "<p>Pulls real building year and unit sizes from Spain's public cadastral registry (Sede Electrónica del Catastro). Madrid city only, in this prototype.</p>" +
      '<div class="filter-bar" style="margin-bottom:0;">' +
        '<label>Street name<input type="text" id="catastro-street" placeholder="e.g. Serrano"></label>' +
        '<label>Number<input type="text" id="catastro-number" placeholder="e.g. 1"></label>' +
        '<button type="button" class="btn btn-primary btn-small" data-action="catastro-lookup">Look up</button>' +
      "</div>" +
      '<div id="catastro-result"></div>' +
    "</div>" +

    '<form id="valuation-form" class="stack-form">' +
      '<label>Neighborhood<select name="neighborhood">' + neighborhoodOptions + "</select></label>" +
      '<label>Size (m&sup2;)<input type="number" name="size" id="val-size" value="' + size + '" min="20" max="400"></label>' +
      '<label>Condition<select name="condition">' + conditionOptions + "</select></label>" +
      '<label>Year built<input type="number" name="yearBuilt" id="val-yearbuilt" value="' + yearBuilt + '" min="1900" max="2026"></label>' +
      '<button type="submit" class="btn btn-primary">Get AI valuation</button>' +
    "</form>" +
    resultHTML +

    '<p class="disclaimer">Sources: ' + DATA_SOURCES.map(function (s) { return '<a href="' + s.url + '" target="_blank" rel="noopener">' + s.org + "</a> (" + s.label + ")"; }).join(" &middot; ") + "</p>"
  );
}

function catastroResultHTML(result) {
  if (result.error) {
    return '<div class="catastro-error">' + result.error + "</div>";
  }

  var unitRows = result.units.map(function (u) {
    var label = [u.staircase && ("Esc. " + u.staircase), u.floor && ("Floor " + u.floor), u.door && ("Door " + u.door)].filter(Boolean).join(" &middot; ") || "Unit";
    return (
      "<tr>" +
        "<td>" + label + "</td>" +
        "<td>" + u.size + " m&sup2;</td>" +
        '<td><button type="button" class="btn btn-small btn-ghost" data-action="use-catastro-unit" data-size="' + u.size + '" data-year="' + (result.yearBuilt || "") + '">Use this</button></td>' +
      "</tr>"
    );
  }).join("");

  return (
    '<div class="catastro-success">' +
      "<p><strong>" + result.addressLabel + "</strong></p>" +
      "<p>Building year: <strong>" + (result.yearBuilt || "n/a") + "</strong>" + (result.buildingSize ? " &middot; total building surface: <strong>" + result.buildingSize + " m&sup2;</strong>" : "") + "</p>" +
      (unitRows
        ? '<table class="data-table"><thead><tr><th>Residential unit</th><th>Size</th><th></th></tr></thead><tbody>' + unitRows + "</tbody></table>"
        : "<p>No individually registered residential units found at this address — try a specific floor/door, or use the building year above.</p>") +
      (result.cadastralRef
        ? '<div class="ref-row">' +
            "<span>Building cadastral reference: <code>" + result.cadastralRef + "</code></span>" +
            '<button type="button" class="btn btn-small btn-ghost" data-action="copy-ref" data-ref="' + result.cadastralRef + '">Copy</button>' +
            '<a class="btn btn-small btn-primary" href="' + VALOR_REFERENCIA_URL + "?RefC=" + result.cadastralRef + '" target="_blank" rel="noopener">Check official reference value &#8599;</a>' +
          "</div>" +
          '<p class="confidence">The reference value is a real tax-assessment figure computed by the Catastro from actual notarized sale prices in the area — not an asking price, and it updates annually. This portal isn’t fetchable from here (no CORS), so this opens the real government page in a new tab; paste the reference above if it doesn’t carry over automatically.</p>'
        : "") +
    "</div>"
  );
}

function viewAuctions() {
  return (
    '<div class="view-head"><h1>Real auction listings <span class="tag-demo">external &middot; not fetched by this app</span></h1>' +
      "<p>The one genuinely free, public source of real, individually-priced properties in Spain: judicial and notarial foreclosure auctions, run through a single government portal since 2015.</p></div>" +
    '<div class="callout-box">' +
      "<h3>Portal de Subastas Electrónicas (BOE)</h3>" +
      "<p>Every judicial and notarial property auction in Spain is listed here with a real address and a real starting price. It's public and free to browse.</p>" +
      "<p>There is no official structured API for this portal (BOE's open data API covers legislation and the daily bulletin, not auctions), and its search sits behind reCAPTCHA — so this app does not fetch, scrape, or automate it in any way. This is a plain link to the real site.</p>" +
      '<a class="btn btn-primary" href="' + BOE_SUBASTAS_URL + '" target="_blank" rel="noopener">Open subastas.boe.es &#8599;</a>' +
    "</div>" +
    '<p class="disclaimer">Coverage caveat: this is foreclosure/distressed stock, not general market inventory — useful for sourcing real comps or opportunistic deals, not a substitute for live market listings.</p>'
  );
}

function viewMortgage(params) {
  var propertyId = params.id;
  var p = propertyId ? getProperty(propertyId) : null;
  var q = params.query || {};

  var price = q.price || (p ? p.price : 400000);
  var downPct = q.downPct || 20;
  var ratePct = q.ratePct || 3.5;
  var termYears = q.termYears || 25;
  var community = q.community || 80;
  var ibiAnnual = q.ibiAnnual || 500;
  var insuranceAnnual = q.insuranceAnnual || 300;
  var acquisitionCostsPct = q.acquisitionCostsPct || 10;

  price = Number(price); downPct = Number(downPct); ratePct = Number(ratePct); termYears = Number(termYears);
  community = Number(community); ibiAnnual = Number(ibiAnnual); insuranceAnnual = Number(insuranceAnnual);
  acquisitionCostsPct = Number(acquisitionCostsPct);

  var downPayment = price * (downPct / 100);
  var loanAmount = price - downPayment;
  var monthlyRate = (ratePct / 100) / 12;
  var n = termYears * 12;
  var mortgagePayment = 0;
  if (loanAmount > 0) {
    mortgagePayment = monthlyRate === 0
      ? loanAmount / n
      : (loanAmount * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -n));
  }

  var totalMonthlyCost = mortgagePayment + community + (ibiAnnual / 12) + (insuranceAnnual / 12);

  var acquisitionCosts = price * (acquisitionCostsPct / 100);
  var cashNeeded = downPayment + acquisitionCosts;

  var totalPaidOverTerm = mortgagePayment * n;
  var totalInterest = loanAmount > 0 ? totalPaidOverTerm - loanAmount : 0;

  function field(label, name, value, step) {
    return '<label>' + label + '<input type="number" name="' + name + '" value="' + value + '" step="' + (step || 1) + '"></label>';
  }

  return (
    '<div class="view-head"><h1>Mortgage calculator</h1><p>' + (p ? ("Prefilled from " + p.title + " &middot; " + p.neighborhood) : "Model the cost of buying and financing a home.") + "</p></div>" +
    '<form id="mortgage-form" class="roi-grid">' +
      '<div class="roi-col">' +
        "<h3>Purchase &amp; financing</h3>" +
        field("Purchase price (&euro;)", "price", price, 1000) +
        field("Down payment (%)", "downPct", downPct, 1) +
        field("Mortgage rate (%)", "ratePct", ratePct, 0.1) +
        field("Term (years)", "termYears", termYears, 1) +
        field("Acquisition costs (%)", "acquisitionCostsPct", acquisitionCostsPct, 0.5) +
      "</div>" +
      '<div class="roi-col">' +
        "<h3>Ongoing ownership costs</h3>" +
        field("Community fee / mo (&euro;)", "community", community, 10) +
        field("Annual IBI tax (&euro;)", "ibiAnnual", ibiAnnual, 10) +
        field("Annual insurance (&euro;)", "insuranceAnnual", insuranceAnnual, 10) +
      "</div>" +
      '<div class="roi-col roi-actions"><button type="submit" class="btn btn-primary btn-full">Recalculate</button></div>' +
    "</form>" +
    '<div class="roi-results">' +
      resultBox("Monthly mortgage payment", fmtEUR(mortgagePayment)) +
      resultBox("Total monthly cost of ownership", fmtEUR(totalMonthlyCost)) +
      resultBox("Cash needed at purchase", fmtEUR(cashNeeded)) +
      resultBox("Total interest over the loan", fmtEUR(totalInterest)) +
    "</div>" +
    '<p class="disclaimer">Illustrative calculator for planning purposes only — not financial, tax or investment advice. Validate assumptions (taxes, fees, financing terms) with a qualified professional before acting.</p>'
  );
}

function resultBox(label, value) {
  return '<div class="result-box"><strong>' + value + "</strong><small>" + label + "</small></div>";
}

function viewAlerts() {
  var alerts = getAlerts();
  var neighborhoodOptions = ["Any"].concat(Object.keys(NEIGHBORHOOD_AVG_PRICE_M2)).map(function (n) {
    return '<option value="' + n + '">' + n + "</option>";
  }).join("");

  var alertRows = alerts.map(function (a) {
    var matches = PROPERTIES.filter(function (p) { return matchesAlert(a, p); });
    return (
      '<div class="alert-card">' +
        '<div>' +
          "<strong>" + (a.neighborhood === "Any" ? "Any neighborhood" : a.neighborhood) + "</strong>" +
          '<p>Max price: ' + (a.maxPrice ? fmtEUR(a.maxPrice) : "&ndash;") + " &middot; Min rooms: " + (a.minRooms || "&ndash;") + "</p>" +
          '<p class="gold">' + matches.length + " matching propert" + (matches.length === 1 ? "y" : "ies") + " right now</p>" +
        "</div>" +
        '<button class="btn btn-small btn-ghost" data-action="remove-alert" data-id="' + a.id + '">Delete</button>' +
      "</div>"
    );
  }).join("");

  return (
    '<div class="view-head"><h1>Saved search alerts</h1><p>Get notified when new listings match your criteria (simulated against the demo inventory).</p></div>' +
    '<form id="alert-form" class="filter-bar">' +
      '<label>Neighborhood<select name="neighborhood">' + neighborhoodOptions + "</select></label>" +
      '<label>Max price<input type="number" name="maxPrice" placeholder="e.g. 400000"></label>' +
      '<label>Min rooms<input type="number" name="minRooms" placeholder="e.g. 2"></label>' +
      '<button type="submit" class="btn btn-primary btn-small">Create alert</button>' +
    "</form>" +
    '<div class="alert-list">' + (alertRows || '<p class="empty-state">No alerts yet — create one above.</p>') + "</div>"
  );
}

function viewChecklist() {
  var state = getChecklistState();
  var progress = checklistProgress();

  var groups = CHECKLIST_TEMPLATE.map(function (group, gi) {
    var items = group.items.map(function (item, ii) {
      var key = gi + "_" + ii;
      var checked = !!state[key];
      return (
        '<li class="check-item ' + (checked ? "done" : "") + '">' +
          '<label><input type="checkbox" data-action="toggle-check" data-key="' + key + '" ' + (checked ? "checked" : "") + "> " + item + "</label>" +
        "</li>"
      );
    }).join("");
    return '<div class="check-group"><h3>' + group.phase + "</h3><ul>" + items + "</ul></div>";
  }).join("");

  return (
    '<div class="view-head"><h1>Transaction checklist</h1><p>A generic Spain residential purchase checklist. Progress saves locally in your browser.</p></div>' +
    '<div class="progress-wrap"><div class="progress-bar"><div class="progress-fill" style="width:' + progress.pct + '%"></div></div><span>' + progress.done + " / " + progress.total + " complete (" + progress.pct + "%)</span></div>" +
    '<div class="check-grid">' + groups + "</div>"
  );
}
