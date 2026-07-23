#!/usr/bin/env node
/**
 * Zero-dependency static dev server for the SCOF / ST-Firm site.
 *
 * The pages MUST be served over HTTP — opening them directly as file:// makes
 * the browser treat every document as a unique, opaque origin, which blocks the
 * story engine's sub-resource loads and makes audio seeking unreliable.
 *
 * Usage:
 *   node scripts/dev-server.cjs            # serves on http://localhost:8000
 *   node scripts/dev-server.cjs 5173       # custom port
 *   PORT=3000 node scripts/dev-server.cjs  # custom port via env
 *
 * Mirrors the MIME map and path-safety logic used by tests/site-check.cjs.
 */
const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const requestedPort = Number(process.argv[2] || process.env.PORT || 8000);

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".cjs": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".ico": "image/x-icon",
  ".mp3": "audio/mpeg",
  ".mp4": "video/mp4",
  ".webm": "video/webm",
  ".vtt": "text/vtt; charset=utf-8",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".txt": "text/plain; charset=utf-8",
  ".map": "application/json; charset=utf-8",
};

const server = http.createServer((request, response) => {
  let pathname;
  try {
    pathname = decodeURIComponent(new URL(request.url, "http://localhost").pathname);
  } catch {
    response.writeHead(400).end("Bad request");
    return;
  }
  let relative = pathname === "/" ? "index.html" : pathname.replace(/^\/+/, "");
  let absolute = path.resolve(root, relative);

  // Contain every request to the project directory.
  if (absolute !== root && !absolute.startsWith(root + path.sep)) {
    response.writeHead(403).end("Forbidden");
    return;
  }
  // Directory requests resolve to their index.html when present.
  if (fs.existsSync(absolute) && fs.statSync(absolute).isDirectory()) {
    absolute = path.join(absolute, "index.html");
  }
  if (!fs.existsSync(absolute) || fs.statSync(absolute).isDirectory()) {
    response.writeHead(404, { "Content-Type": "text/html; charset=utf-8" });
    response.end(`<h1>404</h1><p>Not found: ${pathname}</p>`);
    return;
  }

  const contentType = mimeTypes[path.extname(absolute).toLowerCase()] || "application/octet-stream";
  response.writeHead(200, { "Content-Type": contentType, "Cache-Control": "no-cache" });
  fs.createReadStream(absolute).pipe(response);
});

function listen(port, attemptsLeft) {
  server.once("error", (error) => {
    if (error.code === "EADDRINUSE" && attemptsLeft > 0) {
      console.warn(`Port ${port} is busy — trying ${port + 1}…`);
      listen(port + 1, attemptsLeft - 1);
    } else {
      console.error(`Could not start dev server: ${error.message}`);
      process.exit(1);
    }
  });
  server.listen(port, () => {
    const base = `http://localhost:${port}`;
    console.log("SCOF / ST-Firm dev server running.");
    console.log(`  ${base}/            → SCOF home`);
    console.log(`  ${base}/st-firm.html → ST-Firm + cinematic story`);
    console.log("Press Ctrl+C to stop.");
  });
}

listen(requestedPort, 10);
