/* Client-side access gate for the Áurea Investor Cockpit prototype.

   IMPORTANT: this is NOT real security. It's a soft gate to keep casual
   visitors out of a work-in-progress prototype — the password check runs
   entirely in the browser, so anyone who reads this file's source (or the
   page's network requests) can find the hash and work around the gate.
   Do not put anything genuinely sensitive behind this. For real access
   control, use your host's actual auth (e.g. Netlify password protection
   or Identity) in front of the whole /cockpit path. */

var AUTH_SESSION_KEY = "aurea_cockpit_auth";
var AUTH_PASSWORD_HASH = "513118330d1681200bd74966fc06caf870a97f7f0c421b7c8b3f45cf286a5c07";

function sha256Hex(text) {
  var data = new TextEncoder().encode(text);
  return crypto.subtle.digest("SHA-256", data).then(function (buf) {
    return Array.from(new Uint8Array(buf)).map(function (b) {
      return b.toString(16).padStart(2, "0");
    }).join("");
  });
}

function isAuthed() {
  return sessionStorage.getItem(AUTH_SESSION_KEY) === "1";
}

function grantAuth() {
  sessionStorage.setItem(AUTH_SESSION_KEY, "1");
}

function logoutAuth() {
  sessionStorage.removeItem(AUTH_SESSION_KEY);
}

/* Call at the very top of a protected page. Redirects immediately if not
   authed, so protected content never renders first. */
function requireAuth() {
  if (!isAuthed()) {
    window.location.replace("index.html");
  }
}
