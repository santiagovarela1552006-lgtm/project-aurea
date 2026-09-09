/* Market data for the Áurea Buyer Cockpit prototype.

   Neighborhood sale-price benchmarks below are REAL official figures
   (see DATA_SOURCES). Individual property listings in PROPERTIES are still
   fabricated demo inventory, not live listings — there is no public feed of
   current asking prices in Spain (see app disclaimer).

   Scope: purchase-focused for now — no rental yield/income modeling. */

const DATA_SOURCES = [
  {
    label: "District avg. sale price (€/m²), 2025",
    org: "Ayuntamiento de Madrid — Estadística Registral Inmobiliaria",
    url: "https://www.madrid.es/portales/munimadrid/es/Inicio/El-Ayuntamiento/Estadistica/Areas-de-informacion-estadistica/Edificacion-y-vivienda/Mercado-de-la-vivienda/Compra-venta-de-viviendas/"
  },
  {
    label: "Building year built & unit sizes",
    org: "Sede Electrónica del Catastro (live lookup)",
    url: "https://www.sedecatastro.gob.es/"
  },
  {
    label: "Official reference value (tax valuation, real notarized-price based)",
    org: "Sede Electrónica del Catastro — Valor de Referencia",
    url: "https://www1.sedecatastro.gob.es/Accesos/SECAccvr.aspx"
  },
  {
    label: "Real individual auction properties (judicial/notarial foreclosures)",
    org: "BOE — Portal de Subastas Electrónicas",
    url: "https://subastas.boe.es/"
  }
];

/* Total (new + resale) average declared sale price, €/m², by Madrid district.
   Source: Ayuntamiento de Madrid, Estadística Registral Inmobiliaria, 2025 (table 6,
   "Precio medio declarado de la vivienda (euros/m2) por Tipo, Distrito y Barrio"). */
const NEIGHBORHOOD_AVG_PRICE_M2 = {
  "Salamanca": 9406,
  "Chamberí": 8238,
  "Chamartín": 7427,
  "Retiro": 7469,
  "Centro": 7148,
  "Arganzuela": 6086,
  "Tetuán": 5447,
  "Carabanchel": 3346,
  "Usera": 3388,
  "Puente de Vallecas": 2929
};

/* Demo inventory only — fabricated for this prototype, not live listings. */
const PROPERTIES = [
  { id: "p1", title: "Elegant apartment steps from Serrano", neighborhood: "Salamanca", type: "Resale", price: 675000, size: 95, rooms: 3, baths: 2, yearBuilt: 1930, condition: "Renovated", floor: "4th, exterior, elevator" },
  { id: "p2", title: "Bright studio near Retiro", neighborhood: "Salamanca", type: "Resale", price: 349000, size: 48, rooms: 1, baths: 1, yearBuilt: 1975, condition: "Good", floor: "2nd, interior" },
  { id: "p3", title: "Classic gallery-front flat", neighborhood: "Chamberí", type: "Resale", price: 539000, size: 88, rooms: 3, baths: 2, yearBuilt: 1955, condition: "Good", floor: "5th, exterior" },
  { id: "p4", title: "Family apartment near Bernabéu", neighborhood: "Chamartín", type: "Resale", price: 615000, size: 105, rooms: 4, baths: 2, yearBuilt: 1998, condition: "Good", floor: "6th, exterior" },
  { id: "p5", title: "Reformed 2-bed near Retiro Park", neighborhood: "Retiro", type: "Resale", price: 429000, size: 78, rooms: 2, baths: 2, yearBuilt: 1965, condition: "Renovated", floor: "3rd, exterior" },
  { id: "p6", title: "Loft-style flat in Malasaña (Centro)", neighborhood: "Centro", type: "Resale", price: 359000, size: 60, rooms: 1, baths: 1, yearBuilt: 1920, condition: "Renovated", floor: "1st, interior" },
  { id: "p7", title: "Design flat in Chueca (Centro)", neighborhood: "Centro", type: "Resale", price: 390000, size: 65, rooms: 2, baths: 1, yearBuilt: 1945, condition: "Renovated", floor: "3rd, exterior" },
  { id: "p8", title: "Modern flat near Madrid Río", neighborhood: "Arganzuela", type: "New build", price: 379000, size: 82, rooms: 3, baths: 2, yearBuilt: 2019, condition: "Good", floor: "8th, exterior" },
  { id: "p9", title: "Value 2-bed with terrace", neighborhood: "Tetuán", type: "Resale", price: 287000, size: 70, rooms: 2, baths: 1, yearBuilt: 1988, condition: "Needs work", floor: "2nd, exterior" },
  { id: "p10", title: "Value opportunity near metro extension", neighborhood: "Usera", type: "Resale", price: 189000, size: 66, rooms: 2, baths: 1, yearBuilt: 1975, condition: "Needs work", floor: "4th, interior" },
  { id: "p11", title: "Renovated 3-bed, move-in ready", neighborhood: "Carabanchel", type: "Resale", price: 224000, size: 80, rooms: 3, baths: 1, yearBuilt: 1980, condition: "Renovated", floor: "1st, exterior" },
  { id: "p12", title: "New build near future development", neighborhood: "Puente de Vallecas", type: "New build", price: 195000, size: 75, rooms: 2, baths: 2, yearBuilt: 2022, condition: "Good", floor: "3rd, exterior" },
  { id: "p13", title: "Prime corner unit, Barrio de Salamanca", neighborhood: "Salamanca", type: "Resale", price: 936000, size: 130, rooms: 4, baths: 3, yearBuilt: 1925, condition: "Good", floor: "5th, exterior, elevator" },
  { id: "p14", title: "Compact 1-bed, high demand area", neighborhood: "Chamberí", type: "Resale", price: 279000, size: 45, rooms: 1, baths: 1, yearBuilt: 1968, condition: "Good", floor: "1st, interior" }
];

function fmtEUR(n) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(n);
}

function fmtPct(n, digits) {
  digits = digits === undefined ? 1 : digits;
  return n.toFixed(digits) + "%";
}

function getProperty(id) {
  return PROPERTIES.find(function (p) { return p.id === id; });
}

function neighborhoodAvgValue(p) {
  var avgM2 = NEIGHBORHOOD_AVG_PRICE_M2[p.neighborhood] || 4000;
  return avgM2 * p.size;
}

/* Valuation model: real 2025 official district average sale price (€/m²)
   times size, adjusted by illustrative condition/age multipliers.
   The base price is real; the adjustment factors are not. This does not
   account for the specific unit's finishes, views or renovation quality,
   and is not a substitute for a professional valuation. */
function conditionMultiplier(condition) {
  return { "Renovated": 1.08, "Good": 1.00, "Needs work": 0.88 }[condition] || 1.0;
}

function ageMultiplier(yearBuilt) {
  return yearBuilt >= 2015 ? 1.05 : (yearBuilt < 1960 ? 0.95 : 1.0);
}

function aiValuation(p) {
  var avgM2 = NEIGHBORHOOD_AVG_PRICE_M2[p.neighborhood];
  var base = neighborhoodAvgValue(p);
  var estimate = base * conditionMultiplier(p.condition) * ageMultiplier(p.yearBuilt);
  var low = estimate * 0.93;
  var high = estimate * 1.07;
  var deltaPct = ((p.price - estimate) / estimate) * 100;

  return { estimate: estimate, low: low, high: high, deltaPct: deltaPct, avgM2: avgM2 };
}

/* Standalone estimator for the Valuation tool, given manual inputs
   rather than a listed property. */
function aiValuationFromInputs(neighborhood, size, condition, yearBuilt) {
  var avgM2 = NEIGHBORHOOD_AVG_PRICE_M2[neighborhood] || 4000;
  var base = avgM2 * size;
  var estimate = base * conditionMultiplier(condition) * ageMultiplier(yearBuilt);
  return { estimate: estimate, low: estimate * 0.93, high: estimate * 1.07, avgM2: avgM2 };
}

/* ---- Live Catastro lookup (Sede Electrónica del Catastro, free public web service) ----
   CORS is open on this endpoint; confirmed working from both http(s) and file:// origins. */
var CATASTRO_ENDPOINT = "https://ovc.catastro.meh.es/ovcservweb/OVCSWLocalizacionRC/OVCCallejero.asmx/Consulta_DNPLOC";

function catastroLookup(streetName, streetNumber) {
  var params = new URLSearchParams({
    Provincia: "MADRID",
    Municipio: "MADRID",
    Sigla: "CL",
    Calle: streetName,
    Numero: streetNumber,
    Bloque: "",
    Escalera: "",
    Planta: "",
    Puerta: ""
  });

  return fetch(CATASTRO_ENDPOINT + "?" + params.toString())
    .then(function (res) { return res.text(); })
    .then(function (text) {
      var doc = new DOMParser().parseFromString(text, "text/xml");

      var errNodes = doc.getElementsByTagName("err");
      if (errNodes.length) {
        var desc = errNodes[0].getElementsByTagName("des")[0];
        return { error: desc ? desc.textContent : "Address not found in the Catastro." };
      }

      var addressLabel = doc.getElementsByTagName("ldt")[0];
      var yearBuilt = doc.getElementsByTagName("ant")[0];
      var buildingSize = doc.getElementsByTagName("sfc")[0];

      var rcNode = doc.getElementsByTagName("rc")[0];
      var cadastralRef = null;
      if (rcNode) {
        var pc1 = rcNode.getElementsByTagName("pc1")[0];
        var pc2 = rcNode.getElementsByTagName("pc2")[0];
        var car = rcNode.getElementsByTagName("car")[0];
        var cc1 = rcNode.getElementsByTagName("cc1")[0];
        var cc2 = rcNode.getElementsByTagName("cc2")[0];
        if (pc1 && pc2 && car && cc1 && cc2) {
          cadastralRef = pc1.textContent + pc2.textContent + car.textContent + cc1.textContent + cc2.textContent;
        }
      }

      var units = [];
      var consNodes = doc.getElementsByTagName("cons");
      for (var i = 0; i < consNodes.length; i++) {
        var node = consNodes[i];
        var use = node.getElementsByTagName("lcd")[0];
        var size = node.getElementsByTagName("stl")[0];
        var es = node.getElementsByTagName("es")[0];
        var pt = node.getElementsByTagName("pt")[0];
        var pu = node.getElementsByTagName("pu")[0];
        if (use && use.textContent === "VIVIENDA" && size) {
          units.push({
            staircase: es ? es.textContent : "",
            floor: pt ? pt.textContent : "",
            door: pu ? pu.textContent : "",
            size: Number(size.textContent)
          });
        }
      }

      return {
        addressLabel: addressLabel ? addressLabel.textContent : (streetName + " " + streetNumber),
        yearBuilt: yearBuilt ? Number(yearBuilt.textContent) : null,
        buildingSize: buildingSize ? Number(buildingSize.textContent) : null,
        cadastralRef: cadastralRef,
        units: units
      };
    })
    .catch(function () {
      return { error: "Could not reach the Catastro service. Check your connection and try again." };
    });
}

/* Official reference-value portal: NOT CORS-enabled (confirmed), so it cannot be
   fetched live from this page. We link out to it instead of pretending to embed it. */
var VALOR_REFERENCIA_URL = "https://www1.sedecatastro.gob.es/Accesos/SECAccvr.aspx";

/* BOE Portal de Subastas Electrónicas: the one source of real, individually-priced
   properties that's genuinely free and public (judicial/notarial foreclosure
   auctions). No official structured API exists for it, and its search appears to
   sit behind reCAPTCHA — so this app links out rather than fetching or scraping it. */
var BOE_SUBASTAS_URL = "https://subastas.boe.es/";
