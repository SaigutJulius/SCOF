# SCOF and ST-Firm Website Test Report

**Test date:** 21 July 2026  
**Environment:** Windows / PowerShell / Node.js v22.19.0  
**Command:** `node tests\site-check.cjs`

## Final Result

**PASS — 198 checks passed, 0 failed.**

All checks pass after the ST-Firm page redesign and WhatsApp link count update.

## Coverage

### Page structure and accessibility

- HTML5 doctype, English language, UTF-8 and responsive viewport declarations.
- No duplicate element IDs.
- Every image has alternative text and resolves to an existing file.
- Same-page fragments, cross-page fragments, HTML links and the proprietary license resolve locally.
- Inline page scripts and the shared footer script parse without syntax errors.
- Shared footer CSS has balanced declaration blocks.
- Desktop and mobile floating WhatsApp styles are present.

### WhatsApp contact system

- SCOF: 14 WhatsApp entry points, including eight partnership-specific actions.
- ST-Firm: 9 WhatsApp entry points.
- Exactly one floating WhatsApp control is present on each page.
- All contact links use the approved number `4915210207415`.
- Every link includes a non-empty, page-appropriate prefilled message.
- Every WhatsApp link opens in a separate tab with `rel="noopener noreferrer"`.
- No public `mailto:` or `tel:` links remain in either website.

### Local HTTP smoke tests

The test suite starts an isolated local HTTP server, verifies each response, then closes the server automatically.

| Resource | Expected result | Result |
|---|---:|---:|
| `/` | HTTP 200 / HTML | Pass |
| `/index.html` | HTTP 200 / HTML | Pass |
| `/st-firm.html` | HTTP 200 / HTML | Pass |
| `/assets/footer-system.css` | HTTP 200 / CSS | Pass |
| `/assets/footer-system.js` | HTTP 200 / JavaScript | Pass |
| `/assets/scof-coin-powered-by.png` | HTTP 200 / PNG | Pass |

Every smoke-tested response also contained a non-empty body.

## Issues Found and Corrected

1. A concurrent premium-footer redesign replaced the first floating-button style insertion. The WhatsApp styling was reapplied to the final shared footer stylesheet.
2. The redesigned SCOF and ST-Firm footers reintroduced direct telephone links. Both were converted back to contextual WhatsApp links.
3. The automated assertions were aligned with the final footer structures and rerun from the beginning.

## Limitations and Manual Acceptance Check

- The safe browsing proxy refused to open the `wa.me` destination, so an external end-to-end WhatsApp launch was not performed and no test message was sent.
- The automated suite validates the URL format, approved number, decoded message, security attributes and local rendering prerequisites.
- Before production release, open one SCOF and one ST-Firm WhatsApp button on an actual phone with WhatsApp installed and confirm the correct chat and prefilled message appear. Do not send the test message unless intended.
- Screenshot-based browser QA was unavailable in this environment. Desktop and mobile styling is covered structurally, but a final visual check on representative devices remains recommended.

## Repeatability

Run the complete quality gate after any HTML, footer, asset or contact change:

```powershell
node tests\site-check.cjs
```

The command exits with status `0` only when every check passes.
