const fs = require("node:fs");
const path = require("node:path");
const http = require("node:http");
const crypto = require("node:crypto");

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
  const expectedWhatsAppLinks = file === "index.html" ? 14 : 10;

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
  } else {
    check((html.match(/class="ssos-slide(?:\s|\")/g) || []).length === 5, `${file}: five SSOS carousel slides`);
    check((html.match(/role="tab"/g) || []).length === 5, `${file}: five accessible SSOS slide selectors`);
    check(/data-ssos-carousel/.test(html), `${file}: SSOS carousel controller is present`);
    check(/Operational · Configurable/.test(html), `${file}: SSOS operational status is declared`);
    check(/SSOS · OPERATIONAL PLATFORM/.test(html), `${file}: SSOS carousel is labeled as an operational platform`);
    check(/Your operations\. Your intelligence\. Your control\./.test(html), `${file}: SSOS theatre statement is present`);
    check(/SSOS turns fragmented documents, workflows and decisions/.test(html), `${file}: SSOS operational proposition is present`);
    check(/class="ssos-deployments"/.test(html) && /Humanitarian/.test(html) && /Personal/.test(html), `${file}: configurable deployment signals are present`);
    check(/215<\/strong><span>Collected platform tests/.test(html), `${file}: verified SSOS test evidence is present`);
    check(/Deployment model:/.test(html), `${file}: configurable deployment model is declared`);
    check(!/SSOS is the digital brain/.test(html), `${file}: generic SSOS digital-brain copy is absent`);
    check(!/SSOS is currently in development/.test(html), `${file}: outdated SSOS development disclaimer is absent`);
    check(/data-st-firm-story/.test(html), `${file}: cinematic ST-Firm story is present`);
    check(/Knowledge Without Borders/.test(html), `${file}: Akädemie story title is present`);
    check(/29 active online members/i.test(html), `${file}: active Akädemie membership is declared`);
    check((html.match(/data-story-scene=/g) || []).length === 8, `${file}: eight cinematic story scenes`);
    check((html.match(/data-story-seek=/g) || []).length === 6, `${file}: six story chapter controls`);
    check(/data-story-appreciate/.test(html) && /data-story-share/.test(html), `${file}: appreciate and share controls are present`);
    const storyStart = html.indexOf('<section class="section partnerships story-section"');
    const storyEnd = html.indexOf('<dialog class="story-share-dialog"', storyStart);
    const storyBlock = storyStart >= 0 && storyEnd > storyStart ? html.slice(storyStart, storyEnd) : "";
    const publicStoryText = storyBlock.replace(/\b(?:id|class|src|href|data-[\w-]+)="[^"]*"/g, "");
    check(/AKÄDEMIE/.test(storyBlock) && /Akädemie/.test(storyBlock), `${file}: official Akädemie spelling is visible in title and sentence case`);
    check(!/AKADEMIE|Akademie|AKADËMIE|Akadëmie/.test(publicStoryText), `${file}: outdated public Akädemie spellings are absent`);
    check(!/Germany|GERMANY/.test(storyBlock), `${file}: story uses Deutschland terminology exclusively`);
    check(/Moi International Airport/.test(storyBlock), `${file}: Mombasa departure story is present`);
    check(/Engineer Saigut Julius Kipkorir/.test(storyBlock) && /KingKunta/.test(storyBlock), `${file}: founder film credit is present`);
    check(/st-firm-watcher-gold-seal\.jpg/.test(storyBlock), `${file}: Watcher Gold Seal is included`);
    check((storyBlock.match(/st-firm-akademie-identity-720\.jpg/g) || []).length === 3 && /ecosystem-core/.test(storyBlock), `${file}: corrected full Akädemie identity and its reveal aura appear at 00:08 and Chapter 06`);
    check(/st-engineering-layer/.test(storyBlock) && /st-tech-laptop/.test(storyBlock) && /st-tech-ai/.test(storyBlock) && /st-tech-kenya/.test(storyBlock), `${file}: ST-Firm opening contains the engineering, AI and Kenya linkage layer`);
    check(/story-akademie-scene/.test(storyBlock) && /knowledge-ribbon/.test(storyBlock) && /data-akademie-particles/.test(storyBlock), `${file}: Akädemie reveal contains its knowledge ribbon and member handoff`);
    check(/data-story-at="9\.062">LEARN/.test(storyBlock) && /data-story-at="9\.593">BUILD/.test(storyBlock) && /data-story-at="10\.124">SHARE/.test(storyBlock) && /data-story-at="10\.655">EMPOWER/.test(storyBlock), `${file}: four Akädemie values follow the approved beat sequence`);
    check((storyBlock.match(/scof-identity-640\.jpg/g) || []).length === 2, `${file}: real SCOF identity appears in Chapter 06 and the finale`);
    check((storyBlock.match(/scof-powered-by-720\.jpg/g) || []).length === 2, `${file}: SCOF Powered By identity appears in Chapter 06 and the finale`);
    check(!/story-bean/.test(storyBlock), `${file}: fake CSS SCOF bean is absent`);
    check(/ecosystem-pedestal-light/.test(storyBlock) && /ecosystem-pedestal-mint/.test(storyBlock) && /ecosystem-pedestal-dark/.test(storyBlock) && /ecosystem-pedestal-gold/.test(storyBlock), `${file}: every ecosystem logo has a proportion-safe visibility treatment`);
    check((storyBlock.match(/story-opening-scene/g) || []).length === 2, `${file}: Chapter 01 uses dedicated ST-Firm and SSOS product-launch scenes`);
    check(!/class="story-beam"/.test(storyBlock), `${file}: opening beam no longer blocks the ST-Firm S`);
    check(/st-logo-aura/.test(storyBlock) && /ssos-logo-aura/.test(storyBlock), `${file}: both opening identities have shape-following glow layers`);
    check(/ssos-cinema-word/.test(storyBlock) && /SOVEREIGN INTELLIGENCE/.test(storyBlock) && /BUSINESS CONTINUITY/.test(storyBlock), `${file}: SSOS title and product promises are retained`);
    check(/sovereign-wave-energy/.test(storyBlock) && /data-story-at="7\.717"/.test(storyBlock), `${file}: sovereign signal choreography reaches the final music cue`);
    check((storyBlock.match(/class="ecosystem-route /g) || []).length === 5, `${file}: Chapter 06 uses a complete five-stage living value loop`);
    check((storyBlock.match(/data-ecosystem-status=/g) || []).length === 4, `${file}: Chapter 06 phase stories are visible inside the ecosystem stage`);
    check(!/class="ecosystem-orbit"/.test(storyBlock), `${file}: static organizational-chart orbit is removed`);
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

  const carouselCss = read("assets/ssos-carousel.css");
  const carouselJs = read("assets/ssos-carousel.js");
  const strippedCarouselCss = carouselCss.replace(/\/\*[\s\S]*?\*\//g, "").replace(/"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'/g, "");
  check((strippedCarouselCss.match(/{/g) || []).length === (strippedCarouselCss.match(/}/g) || []).length, "ssos-carousel.css: balanced declaration blocks");
  check((carouselCss.match(/@keyframes\s+ssos-/g) || []).length === 10, "ssos-carousel.css: five paired transition systems");
  check(/aspect-ratio:\s*3\s*\/\s*2/.test(carouselCss), "ssos-carousel.css: stable 3:2 display ratio");
  check(/touch-action:\s*pan-y/.test(carouselCss), "ssos-carousel.css: mobile swipe preserves vertical scrolling");
  check(/prefers-reduced-motion/.test(carouselCss), "ssos-carousel.css: reduced-motion treatment exists");
  check((carouselCss.match(/@keyframes\s+theatre-/g) || []).length === 6, "ssos-carousel.css: purposeful theatre motion systems exist");
  check(/max-width:\s*350px/.test(carouselCss) && /max-height:\s*520px/.test(carouselCss), "ssos-carousel.css: compact and landscape phone treatments exist");
  check(/width:\s*44px;\s*height:\s*44px/.test(carouselCss), "ssos-carousel.css: mobile controls use 44px touch targets");
  check(/safe-area-inset-left/.test(carouselCss) && /safe-area-inset-right/.test(carouselCss), "ssos-carousel.css: phone safe-area treatment exists");
  try {
    new Function(carouselJs);
    check(true, "ssos-carousel.js: script parses");
  } catch {
    check(false, "ssos-carousel.js: script parses");
  }
  check(/pointerdown/.test(carouselJs) && /pointerup/.test(carouselJs), "ssos-carousel.js: pointer swipe controls exist");
  check(/ArrowLeft/.test(carouselJs) && /ArrowRight/.test(carouselJs), "ssos-carousel.js: keyboard navigation exists");
  check(/data-ssos-theatre/.test(carouselJs) && /is-theatre-visible/.test(carouselJs), "ssos-carousel.js: viewport-triggered theatre reveal exists");
  check(/isNearViewport/.test(carouselJs), "ssos-carousel.js: off-screen autoplay protection exists");

  const storyCss = read("assets/stories/st-firm-story.css");
  const storyJs = read("assets/stories/st-firm-story.js");
  const strippedStoryCss = storyCss.replace(/\/\*[\s\S]*?\*\//g, "").replace(/"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'/g, "");
  check((strippedStoryCss.match(/{/g) || []).length === (strippedStoryCss.match(/}/g) || []).length, "st-firm-story.css: balanced declaration blocks");
  check(/aspect-ratio:\s*16\s*\/\s*9/.test(storyCss), "st-firm-story.css: stable 16:9 film ratio");
  check(/prefers-reduced-motion/.test(storyCss), "st-firm-story.css: reduced-motion treatment exists");
  check(/max-width:\s*390px/.test(storyCss), "st-firm-story.css: small-phone treatment exists");
  check(/max-width:\s*1439px/.test(storyCss) && /780px/.test(storyCss), "st-firm-story.css: compact laptop stage exists");
  try {
    new Function(storyJs);
    check(true, "st-firm-story.js: script parses");
  } catch {
    check(false, "st-firm-story.js: script parses");
  }
  check(!/class StoryBeat/.test(storyJs), "st-firm-story.js: temporary generated beat is removed");
  check(/class StorySoundtrack/.test(storyJs) && /st-firm-tunajenga-website\.mp3/.test(storyJs), "st-firm-story.js: mastered anthem is the production soundtrack");
  check(!/method:'HEAD'/.test(storyJs) && /new Audio\(\)/.test(storyJs) && /location\.protocol !== 'file:'/.test(storyJs), "st-firm-story.js: production audio supports direct Windows file playback");
  check(/st-firm-story\.js\?v=20260722-film2/.test(read("st-firm.html")) && /st-firm-story\.css\?v=20260722-film2/.test(read("st-firm.html")), "st-firm.html: story assets have a synchronized cache-busting release version");
  check(/localStorage/.test(storyJs) && /navigator\.clipboard/.test(storyJs), "st-firm-story.js: appreciation and link-copy behavior exists");
  check(/const duration = 70/.test(storyJs), "st-firm-story.js: 70-second story timing exists");
  check(/const tempo = 113/.test(storyJs) && /beatDuration = 60 \/ tempo/.test(storyJs), "st-firm-story.js: opening visuals use the mastered 113 BPM timing");
  check(/function renderOpeningRhythm/.test(storyJs) && /--story-glow-opacity/.test(storyJs) && /--story-signal-offset/.test(storyJs), "st-firm-story.js: logo glow and signal motion derive from soundtrack time");
  check(/elapsed < 12/.test(storyJs) && /activeScene === 2 \? 8/.test(storyJs), "st-firm-story.js: soundtrack-driven opening choreography continues through Akädemie at 12 seconds");
  check(/particleColors/.test(storyJs) && /data-akademie-particles/.test(read("st-firm.html")) && (storyJs.match(/index < 29/g) || []).length >= 2, "st-firm-story.js: Akädemie releases exactly 29 deterministic member particles");
  check(/sceneStarts = \[0, 4, 8, 12, 22, 33, 45, 58\]/.test(storyJs), "st-firm-story.js: eight scenes use the approved 70-second cue map");
  check(/00:00 \/ 01:10/.test(read("st-firm.html")) && /max="700"/.test(read("st-firm.html")), "st-firm.html: time display and seek range cover 01:10");
  check(!/threshold:\.35/.test(storyJs) && !/pausedByViewport/.test(storyJs), "st-firm-story.js: scrolling cannot interrupt the anthem");
  check(/soundtrack\.onended = finishStory/.test(storyJs) && /elapsed = Math\.min\(duration, soundtrackTime\)/.test(storyJs), "st-firm-story.js: film timing follows the anthem through completion");
  check(/Start film with sound/.test(read("st-firm.html")) && /Film \+ anthem · 01:10/.test(read("st-firm.html")), "st-firm.html: deliberate sound-first 70-second start is clear");
  check(/data-story-volume/.test(read("st-firm.html")) && /setVolume/.test(storyJs), "st-firm-story.js: adjustable stronger soundtrack exists");
  check(/function ecosystemPhaseForTime/.test(storyJs) && /value < 48/.test(storyJs) && /value < 52/.test(storyJs) && /value < 56/.test(storyJs) && /value >= 58/.test(storyJs), "st-firm-story.js: Chapter 06 phases follow the 45–58 second audio timeline");
  check(/data-ecosystem-phase/.test(read("st-firm.html")) && /data-ecosystem-phase=/.test(storyCss), "ST-Firm story: seek-safe ecosystem phases connect JavaScript and CSS");
  check(/is-ecosystem-active/.test(storyJs) && /story-screen\.is-ecosystem-active::after/.test(storyCss), "ST-Firm story: Chapter 06 receives its own luminous player treatment");
  check(/ecosystem-energy-flow/.test(storyCss) && /ecosystem-route-return/.test(storyCss), "st-firm-story.css: directional energy completes the value-return loop");
  check(/container-type:inline-size/.test(storyCss), "st-firm-story.css: ecosystem sizing follows the film container instead of the viewport");
  check(/aspect-ratio:724\/780/.test(storyCss) && /aspect-ratio:731\/725/.test(storyCss), "st-firm-story.css: ST-Firm and SSOS retain their supplied logo proportions");
  check(/story-player:not\(\.is-started\) \.story-watch/.test(storyCss), "st-firm-story.css: compact start control is separated from the opening identity");
  check(/Chapter 01 responsive composition/.test(storyCss) && /ssos-cinema-word/.test(storyCss), "st-firm-story.css: sovereign opening has responsive product-launch styling");
  check(/brandenburg-ravine-tech-1600\.jpg/.test(storyCss) && /st-engineering-layer/.test(storyCss), "st-firm-story.css: grounded Brandenburg digital-twin environment is active");
  check(/story-akademie-scene/.test(storyCss) && /akademie-word-alive/.test(storyCss) && /akademie-particle-release/.test(storyCss), "st-firm-story.css: Akädemie words remain alive and hand off the member network");
  check(/ecosystem-pedestal-light/.test(storyCss) && /ecosystem-pedestal-mint/.test(storyCss) && /ecosystem-pedestal-dark/.test(storyCss) && /ecosystem-pedestal-gold/.test(storyCss), "st-firm-story.css: transparent and opaque brands use dedicated contrast surfaces");
  check(/@media\(max-width:650px\)[\s\S]*ecosystem-core/.test(storyCss) && /@media\(max-width:390px\)[\s\S]*ecosystem-pedestal/.test(storyCss), "st-firm-story.css: ecosystem has phone and small-phone compositions");

  const ecosystemAssets = [
    "assets/stories/ecosystem/st-firm-akademie-identity-720.jpg",
    "assets/stories/ecosystem/scof-identity-640.jpg",
    "assets/stories/ecosystem/scof-powered-by-720.jpg",
  ];
  for (const asset of ecosystemAssets) {
    const bytes = fs.statSync(path.join(root, asset)).size;
    check(bytes > 50_000 && bytes < 200_000, `ecosystem asset: ${path.basename(asset)} is sharp and performance-sized`);
  }
  const openingBackdrop = "assets/stories/brandenburg-ravine-tech-1600.jpg";
  const openingBytes = fs.statSync(path.join(root, openingBackdrop)).size;
  check(openingBytes > 180_000 && openingBytes < 350_000, "story backdrop: Brandenburg digital twin is sharp and performance-sized");
}

function validateSongPackage() {
  const audioRoot = path.join(root, "assets", "stories", "audio");
  const textPackageFiles = [
    "README.md",
    "st-firm-tunajenga-lyrics.md",
    "st-firm-tunajenga-cues.json",
    "st-firm-tunajenga-en.vtt",
    "st-firm-tunajenga-sw.vtt",
    "st-firm-tunajenga-source.json",
    "st-firm-tunajenga-website-source.json",
    "st-firm-tunajenga-release-metadata.json",
    "st-firm-tunajenga-release-lyrics.txt",
    "artwork/tunajenga-cover-prompt.md",
  ];
  const packageFiles = [
    ...textPackageFiles,
    "st-firm-tunajenga-full.mp3",
    "st-firm-tunajenga-release.mp3",
    "st-firm-tunajenga-website.mp3",
    "artwork/tunajenga-cover-master.png",
    "artwork/tunajenga-cover-embedded.jpg",
    "artwork/tunajenga-cover-web.jpg",
  ];

  for (const file of packageFiles) {
    check(fs.existsSync(path.join(audioRoot, file)), `song package: ${file} exists`);
  }

  const cues = JSON.parse(read("assets/stories/audio/st-firm-tunajenga-cues.json"));
  const source = JSON.parse(read("assets/stories/audio/st-firm-tunajenga-source.json"));
  const websiteSource = JSON.parse(read("assets/stories/audio/st-firm-tunajenga-website-source.json"));
  const releaseMetadata = JSON.parse(read("assets/stories/audio/st-firm-tunajenga-release-metadata.json"));
  check(cues.duration_seconds === 70, "song package: website edit is exactly 70 seconds");
  check(cues.source_start_seconds === 42 && cues.source_end_seconds === 112, "song package: cue map uses the approved 00:42–01:52 source window");
  check(cues.tempo_bpm === 113, "song package: production tempo is 113 BPM");
  check(Math.abs(cues.beat_duration_seconds - (60 / 113)) < .000001, "song package: visual beat duration matches the mastered tempo");
  check(cues.cues?.[0]?.visual === "st_firm_brandenburg_ravine_digital_twin_launch" && cues.cues?.[1]?.visual === "ssos_sovereign_signal_business_continuity", "song package: opening cue map documents the Brandenburg digital-twin launch");
  check(cues.lead_vocal === "female_mezzo_alto", "song package: female lead-vocal direction is explicit");
  check(cues.cues?.[0]?.start === 0 && cues.cues?.at(-1)?.end === 70, "song package: cue map covers the complete film");
  check(cues.cues?.every((cue, index, list) => cue.start < cue.end && (!index || cue.start === list[index - 1].end)), "song package: cue timings are contiguous");
  check(cues.cues?.every((cue) => cue.source_start === cue.start + 42 && cue.source_end === cue.end + 42), "song package: every visual cue maps to the 42-second source offset");
  check(source.source === "Suno" && source.source_song_id === "0874228e-e6f6-4132-8bf0-fb9399deb9c4", "song package: Suno source identity is recorded");
  check(source.duration === "00:04:45" && source.bit_rate_kbps === 192, "song package: downloaded master metadata is recorded");
  const fullMaster = fs.readFileSync(path.join(audioRoot, "st-firm-tunajenga-full.mp3"));
  check(fullMaster.length === source.file_size_bytes && fullMaster.length > 1_000_000, "song package: full MP3 master is present and non-trivial");
  check(fullMaster.subarray(0, 3).toString("ascii") === "ID3" || (fullMaster[0] === 0xff && (fullMaster[1] & 0xe0) === 0xe0), "song package: full master has a valid MP3 signature");
  check(crypto.createHash("sha256").update(fullMaster).digest("hex").toUpperCase() === source.sha256, "song package: full master matches its recorded checksum");
  check(releaseMetadata.title === "Tunajenga — Ravine to the World" && releaseMetadata.artist === "#KingKunta😎🇩🇪", "song package: release title and artist identity are exact");
  check(releaseMetadata.publisher === "ST-Firm — Berlin, Deutschland", "song package: release publisher uses Deutschland terminology");

  const coverMaster = fs.readFileSync(path.join(audioRoot, "artwork/tunajenga-cover-master.png"));
  const coverEmbedded = fs.readFileSync(path.join(audioRoot, "artwork/tunajenga-cover-embedded.jpg"));
  const coverWeb = fs.readFileSync(path.join(audioRoot, "artwork/tunajenga-cover-web.jpg"));
  check(coverMaster.subarray(1, 4).toString("ascii") === "PNG" && coverMaster.readUInt32BE(16) === 3000 && coverMaster.readUInt32BE(20) === 3000, "song package: cover master is a 3000px square PNG");
  check(coverEmbedded[0] === 0xff && coverEmbedded[1] === 0xd8 && coverEmbedded.length > 100_000, "song package: optimized embedded JPEG artwork exists");
  check(coverWeb[0] === 0xff && coverWeb[1] === 0xd8 && coverWeb.length > 50_000 && coverWeb.length < 200_000, "song package: lightweight web-cover JPEG exists");

  function id3TagLength(buffer) {
    if (buffer.subarray(0, 3).toString("ascii") !== "ID3") return 0;
    const size = ((buffer[6] & 0x7f) << 21) | ((buffer[7] & 0x7f) << 14) | ((buffer[8] & 0x7f) << 7) | (buffer[9] & 0x7f);
    const footer = buffer[3] === 4 && (buffer[5] & 0x10) ? 10 : 0;
    return 10 + size + footer;
  }

  const releaseMaster = fs.readFileSync(path.join(audioRoot, "st-firm-tunajenga-release.mp3"));
  check(releaseMaster.subarray(0, 3).toString("ascii") === "ID3" && releaseMaster[3] === 3, "song package: release uses broadly compatible ID3v2.3");
  const releaseTagEnd = id3TagLength(releaseMaster);
  const releaseFrameIds = [];
  for (let offset = 10; offset + 10 <= releaseTagEnd;) {
    const id = releaseMaster.subarray(offset, offset + 4).toString("ascii");
    if (!/^[A-Z0-9]{4}$/.test(id)) break;
    const frameSize = releaseMaster.readUInt32BE(offset + 4);
    if (!frameSize) break;
    releaseFrameIds.push(id);
    offset += 10 + frameSize;
  }
  check(["TIT2", "TPE1", "TALB", "COMM", "USLT", "APIC"].every((id) => releaseFrameIds.includes(id)), "song package: release embeds identity, description, lyrics and cover artwork");
  check(fullMaster.subarray(id3TagLength(fullMaster)).equals(releaseMaster.subarray(releaseTagEnd)), "song package: release preserves the original Suno audio payload exactly");

  const websiteMaster = fs.readFileSync(path.join(audioRoot, "st-firm-tunajenga-website.mp3"));
  check(websiteSource.source_start_seconds === 42 && websiteSource.source_end_seconds === 112 && websiteSource.planned_duration_seconds === 70, "song package: website source record preserves the approved edit points");
  check(websiteSource.encoded_duration_seconds >= 69.95 && websiteSource.encoded_duration_seconds <= 70.05, "song package: encoded website duration is within one MP3 frame of 70 seconds");
  check(websiteMaster.length === websiteSource.file_size_bytes && websiteMaster.length < 2_500_000, "song package: website MP3 is present and performance-sized");
  check(crypto.createHash("sha256").update(websiteMaster).digest("hex").toUpperCase() === websiteSource.sha256, "song package: website MP3 matches its recorded checksum");
  check(websiteMaster.subarray(0, 3).toString("ascii") === "ID3" && websiteMaster[3] === 3, "song package: website MP3 uses compatible ID3v2.3 metadata");
  const websiteTagEnd = id3TagLength(websiteMaster);
  const websiteFrameIds = [];
  for (let offset = 10; offset + 10 <= websiteTagEnd;) {
    const id = websiteMaster.subarray(offset, offset + 4).toString("ascii");
    if (!/^[A-Z0-9]{4}$/.test(id)) break;
    const frameSize = websiteMaster.readUInt32BE(offset + 4);
    if (!frameSize) break;
    websiteFrameIds.push(id);
    offset += 10 + frameSize;
  }
  check(["TIT2", "TPE1", "TALB", "APIC"].every((id) => websiteFrameIds.includes(id)) && (websiteFrameIds.includes("COMM") || websiteFrameIds.includes("TXXX")), "song package: website MP3 embeds release identity, description and cover artwork");

  const websiteBuildScript = read("scripts/create-tunajenga-website-audio.ps1");
  const seekPosition = websiteBuildScript.indexOf("-ss '00:00:42.000'");
  const inputPosition = websiteBuildScript.indexOf("-i $sourcePath");
  check(seekPosition >= 0 && inputPosition > seekPosition, "song package: source seek occurs before input decoding to prevent a 28-second audio cutoff");
  check(/00:00:28\.000/.test(websiteBuildScript) && /00:01:00\.000/.test(websiteBuildScript) && /volumedetect/.test(websiteBuildScript), "song package: build verifies real audio after the former cutoff and near the ending");

  const englishCaptions = read("assets/stories/audio/st-firm-tunajenga-en.vtt");
  const swahiliCaptions = read("assets/stories/audio/st-firm-tunajenga-sw.vtt");
  check(englishCaptions.startsWith("WEBVTT") && /01:05\.000 --> 01:10\.000/.test(englishCaptions), "song package: English captions cover the 70-second closing credit");
  check(swahiliCaptions.startsWith("WEBVTT") && /01:05\.000 --> 01:10\.000/.test(swahiliCaptions), "song package: Kiswahili captions cover the 70-second closing credit");

  const productionCopy = textPackageFiles.map((file) => fs.readFileSync(path.join(audioRoot, file), "utf8")).join("\n");
  check(!/\bGermany\b|\bGerman\b/i.test(productionCopy), "song package: Deutschland terminology is used exclusively");
  check(/Taking Ravine to the World and bringing the World to Eldama Ravine/.test(productionCopy), "song package: Ravine mission line is preserved");
  check(/Engineer Saigut Julius Kipkorir/.test(productionCopy) && /KingKunta/.test(productionCopy), "song package: founder signature is preserved");
}

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".mp3": "audio/mpeg",
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
    ["/assets/ssos-carousel.css", "text/css"],
    ["/assets/ssos-carousel.js", "text/javascript"],
    ["/assets/stories/st-firm-story.css", "text/css"],
    ["/assets/stories/st-firm-story.js", "text/javascript"],
    ["/assets/stories/akademie-shield.png", "image/png"],
    ["/assets/stories/ecosystem/st-firm-akademie-identity-720.jpg", "image/jpeg"],
    ["/assets/stories/brandenburg-ravine-tech-1600.jpg", "image/jpeg"],
    ["/assets/stories/audio/st-firm-tunajenga-website.mp3", "audio/mpeg"],
    ["/assets/stories/audio/artwork/tunajenga-cover-web.jpg", "image/jpeg"],
    ["/assets/ssos-carousel/sovereign-ai.png", "image/png"],
    ["/assets/ssos-carousel/scof-intelligence.png", "image/png"],
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
  validateSongPackage();
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
