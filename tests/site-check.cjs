const fs = require("node:fs");
const path = require("node:path");
const http = require("node:http");

const root = path.resolve(__dirname, "..");
const pages = ["index.html", "st-firm.html"];
const failures = [];
let passes = 0;

function check(condition, message) {
  if (condition) {
    passes += 1;
    console.log(`PASS  ${message}`);
  } else {
    failures.push(message);
    console.error(`FAIL  ${message}`);
  }
}

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

function localTargetExists(target, currentFile) {
  const [rawPath, fragment] = target.split("#", 2);
  const targetFile = rawPath || currentFile;
  const absolute = path.resolve(root, targetFile);
  if (!absolute.startsWith(root) || !fs.existsSync(absolute)) return false;
  if (!fragment) return true;
  const targetHtml = fs.readFileSync(absolute, "utf8");
  return new RegExp(`\\sid=["']${fragment.replace(/[.*+?^${}()|[\\]\\]/g, "\\$&")}["']`).test(targetHtml);
}

function validatePage(file) {
  const html = read(file);
  const brand = file === "index.html" ? "SCOF" : "ST-Firm";
  const expectedWhatsAppLinks = file === "index.html" ? 14 : 5;

  check(/<!doctype html>/i.test(html), `${file}: HTML5 doctype`);
  check(/<html\s+lang="en"/i.test(html), `${file}: language declared`);
  check(/<meta\s+charset="utf-8"/i.test(html), `${file}: UTF-8 charset declared`);
  check(/<meta\s+name="viewport"/i.test(html), `${file}: responsive viewport declared`);
  check(!/(?:mailto:|tel:)/i.test(html), `${file}: WhatsApp-only public contact policy`);

  const ids = [...html.matchAll(/\sid="([^"]+)"/g)].map((match) => match[1]);
  const duplicateIds = ids.filter((id, index) => ids.indexOf(id) !== index);
  check(duplicateIds.length === 0, `${file}: no duplicate IDs`);

  const images = [...html.matchAll(/<img\b([^>]*)>/gi)];
  const missingAlt = images.filter((match) => !/\balt="[^"]*"/i.test(match[1]));
  check(missingAlt.length === 0, `${file}: every image has alt text`);
  for (const match of images) {
    const src = match[1].match(/\bsrc="([^"]+)"/i)?.[1];
    if (src && !/^https?:/i.test(src)) {
      check(fs.existsSync(path.resolve(root, src)), `${file}: image exists (${src})`);
    }
  }

  const localLinks = [...html.matchAll(/<a\b[^>]*href="([^"]+)"[^>]*>/gi)]
    .map((match) => match[1])
    .filter((href) => !/^(?:https?:|javascript:)/i.test(href));
  for (const href of localLinks) {
    check(localTargetExists(href, file), `${file}: local link resolves (${href})`);
  }

  const inlineScripts = [...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/gi)]
    .map((match) => match[1])
    .filter((script) => script.trim());
  for (const [index, script] of inlineScripts.entries()) {
    try {
      new Function(script);
      check(true, `${file}: inline script ${index + 1} parses`);
    } catch {
      check(false, `${file}: inline script ${index + 1} parses`);
    }
  }

  const whatsappAnchors = [...html.matchAll(/<a\b[^>]*href="(https:\/\/wa\.me\/([0-9]+)\?text=([^"]+))"[^>]*>/gi)];
  check(whatsappAnchors.length === expectedWhatsAppLinks, `${file}: expected WhatsApp link count (${expectedWhatsAppLinks})`);
  for (const [index, match] of whatsappAnchors.entries()) {
    const anchor = match[0];
    let message = "";
    try { message = new URL(match[1]).searchParams.get("text") || ""; } catch {}
    check(match[2] === "4915210207415", `${file}: WhatsApp link ${index + 1} uses approved number`);
    check(message.startsWith(`Hello ${brand} team`), `${file}: WhatsApp link ${index + 1} has contextual ${brand} message`);
    check(/target="_blank"/i.test(anchor), `${file}: WhatsApp link ${index + 1} opens separately`);
    check(/rel="noopener noreferrer"/i.test(anchor), `${file}: WhatsApp link ${index + 1} is isolated securely`);
  }

  check((html.match(/class="whatsapp-float"/g) || []).length === 1, `${file}: exactly one floating WhatsApp control`);
  if (file === "index.html") {
    check((html.match(/class="partner-action"/g) || []).length === 8, `${file}: eight contextual partnership actions`);
  }
}

function validateSharedAssets() {
  const css = read("assets/footer-system.css");
  const js = read("assets/footer-system.js");
  const strippedCss = css.replace(/\/\*[\s\S]*?\*\//g, "").replace(/"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'/g, "");
  const opens = (strippedCss.match(/{/g) || []).length;
  const closes = (strippedCss.match(/}/g) || []).length;
  check(opens === closes, "footer-system.css: balanced declaration blocks");
  check(/\.whatsapp-float\s*{/.test(css), "footer-system.css: floating WhatsApp style exists");
  check(/@media\s*\(max-width:\s*650px\)[\s\S]*\.whatsapp-float/.test(css), "footer-system.css: mobile WhatsApp treatment exists");
  try {
    new Function(js);
    check(true, "footer-system.js: script parses");
  } catch {
    check(false, "footer-system.js: script parses");
  }
}

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
};

async function validateHttpSmoke() {
  const server = http.createServer((request, response) => {
    const pathname = decodeURIComponent(new URL(request.url, "http://localhost").pathname);
    const relative = pathname === "/" ? "index.html" : pathname.replace(/^\/+/, "");
    const absolute = path.resolve(root, relative);
    if (!absolute.startsWith(root) || !fs.existsSync(absolute) || fs.statSync(absolute).isDirectory()) {
      response.writeHead(404).end("Not found");
      return;
    }
    response.writeHead(200, { "Content-Type": mimeTypes[path.extname(absolute).toLowerCase()] || "application/octet-stream" });
    fs.createReadStream(absolute).pipe(response);
  });

  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const { port } = server.address();
  const targets = [
    ["/", "text/html"],
    ["/index.html", "text/html"],
    ["/st-firm.html", "text/html"],
    ["/assets/footer-system.css", "text/css"],
    ["/assets/footer-system.js", "text/javascript"],
    ["/assets/scof-coin-powered-by.png", "image/png"],
  ];

  try {
    for (const [target, expectedType] of targets) {
      const response = await fetch(`http://127.0.0.1:${port}${target}`);
      const body = await response.arrayBuffer();
      check(response.status === 200, `HTTP smoke: ${target} returns 200`);
      check((response.headers.get("content-type") || "").startsWith(expectedType), `HTTP smoke: ${target} has ${expectedType}`);
      check(body.byteLength > 0, `HTTP smoke: ${target} has content`);
    }
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
}

async function main() {
  pages.forEach(validatePage);
  validateSharedAssets();
  await validateHttpSmoke();
  console.log(`\nSUMMARY: ${passes} passed, ${failures.length} failed`);
  if (failures.length) {
    failures.forEach((failure) => console.error(` - ${failure}`));
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
