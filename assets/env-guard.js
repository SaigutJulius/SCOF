/**
 * file:// guard.
 *
 * When a page is opened directly from disk (double-click → file://), the browser
 * treats it as a unique, opaque origin. That blocks sub-resource loads and makes
 * the story engine's audio seeking unreliable ("Unsafe attempt to load URL …
 * unique security origins", ERR_FILE_NOT_FOUND). Nothing on the page is broken —
 * it just needs to be served over HTTP.
 *
 * This script does nothing when served over http(s). Under file:// it injects a
 * small, dismissible, accessible banner explaining how to run the site properly.
 */
(() => {
  if (window.location.protocol !== "file:") return;

  const DISMISS_KEY = "stfirm-env-guard-dismissed";
  try {
    if (sessionStorage.getItem(DISMISS_KEY) === "1") return;
  } catch {
    /* sessionStorage may be unavailable under file:// — show the banner anyway. */
  }

  const build = () => {
    if (document.querySelector("[data-env-guard]")) return;

    const banner = document.createElement("div");
    banner.setAttribute("data-env-guard", "");
    banner.setAttribute("role", "alert");
    banner.style.cssText = [
      "position:fixed", "inset:0 0 auto 0", "z-index:2147483647",
      "display:flex", "gap:14px", "align-items:flex-start",
      "padding:14px 18px", "box-sizing:border-box",
      "font:500 14px/1.5 Inter,-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif",
      "color:#eafff2",
      "background:linear-gradient(120deg,#0b2d1f,#123a2a 55%,#1c1036)",
      "border-bottom:1px solid rgba(196,243,106,.5)",
      "box-shadow:0 12px 34px rgba(0,0,0,.45)",
    ].join(";");

    const message = document.createElement("div");
    message.style.cssText = "flex:1 1 auto;min-width:0";
    message.innerHTML =
      '<strong style="display:block;font-weight:800;color:#c4f36a">Open this site over a local server, not from a file</strong>' +
      "You opened it as <code>file://</code>, so the browser blocks parts of the page (images, audio, the story engine). " +
      "In a terminal in the project folder run <code>node scripts/dev-server.cjs</code> then visit " +
      '<code>http://localhost:8000/st-firm.html</code>.';
    message.querySelectorAll("code").forEach((code) => {
      code.style.cssText =
        "padding:1px 6px;border-radius:6px;background:rgba(0,0,0,.32);" +
        "font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:.92em;color:#eafff2";
    });

    const close = document.createElement("button");
    close.type = "button";
    close.setAttribute("aria-label", "Dismiss this message");
    close.textContent = "×";
    close.style.cssText = [
      "flex:0 0 auto", "width:32px", "height:32px", "min-width:32px",
      "border:1px solid rgba(255,255,255,.28)", "border-radius:8px",
      "background:rgba(255,255,255,.08)", "color:#eafff2",
      "font-size:18px", "line-height:1", "cursor:pointer",
    ].join(";");
    close.addEventListener("click", () => {
      banner.remove();
      try { sessionStorage.setItem(DISMISS_KEY, "1"); } catch { /* ignore */ }
    });

    banner.append(message, close);
    document.body.appendChild(banner);
  };

  if (document.body) build();
  else document.addEventListener("DOMContentLoaded", build, { once: true });
})();
