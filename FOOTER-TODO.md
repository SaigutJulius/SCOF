# SCOF × ST-Firm Premium Footer — Implementation Plan and TODO

## Purpose

Create one coordinated premium footer system for the SCOF and ST-Firm websites. The result should communicate the relationship between the farm, technology, founder, locations, and product ecosystem while providing clear contact, ownership, navigation, and legal information.

This document is the implementation specification and working checklist. It does not authorize changes to the supplied logos.

---

## 1. Confirmed brand architecture

### Master business

**ST-Firm**

- Founder and proprietor: Engineer Saigut Julius Kipkorir
- Legal structure represented by this repository: sole proprietorship
- Headquarters: Berlin, Germany
- Role: engineering, software, AI, systems architecture, infrastructure, and operational intelligence
- Display tagline: `IDEE MEETS TECH` or the wording already embedded in the supplied logo

### Flagship agricultural ecosystem

**SCOF**

- Farm and agricultural operations: Kitale, Kenya
- Role: coffee farming, processing, traceability, products, farmers, partnerships, and market relationships
- Positioning: Kenyan coffee ecosystem

### Intelligence platform

**SSOS**

- Role: AI and operational software
- Scope: farm intelligence, workflows, records, reporting, traceability, and decision support

### Geographic relationship

```text
SCOF farm operations                 ST-Firm headquarters
Kitale, Kenya        ←──────→        Berlin, Germany
Agriculture                          Engineering
```

Preferred unifying line:

> Rooted in Kitale. Engineered in Berlin. Connected to the world.

Supporting line:

> Kenya ↔ Germany · Agriculture · Technology · Partnerships

---

## 2. Non-negotiable requirements

- [x] Use the supplied ST-Firm logo exactly as provided.
- [ ] Use the supplied SSOS logo exactly as provided.
- [ ] Do not correct, rewrite, simplify, redraw, crop, recolor, vectorize, or remove any supplied logo element.
- [ ] Do not remove copyright wording embedded in a supplied logo.
- [ ] Apply visual effects only to the container around a logo.
- [ ] Keep SCOF, SSOS, and ST-Firm visually connected but clearly distinguish their roles.
- [x] Identify Kitale, Kenya as the location of SCOF farm operations.
- [x] Identify Berlin, Germany as the headquarters of ST-Firm.
- [x] Identify Engineer Saigut Julius Kipkorir as founder and sole proprietor trading as ST-Firm.
- [x] Use copyright ownership wording consistent with `LICENSE`.
- [ ] Do not create dead Legal Notice or Privacy links.
- [ ] Do not present illustrative or planned systems as deployed products.
- [ ] Preserve responsive performance and accessibility.

---

## 3. Current asset status

### Available

- [x] ST-Firm supplied logo: `assets/ST-Firm Logo Transparent.png`
- [x] ST-Firm proprietary license: `LICENSE`
- [x] SCOF homepage: `index.html`
- [x] ST-Firm website: `st-firm.html`
- [x] Current SCOF CSS bean identity
- [x] Coffee farm and processing photography

### Required before final implementation

- [ ] Copy the supplied SSOS logo into `assets/` without modifying it.
- [ ] Give the SSOS asset a stable descriptive filename.
- [ ] Confirm which exact SCOF image or mark is the official footer logo.
- [ ] Confirm the public email address.
- [ ] Confirm the public telephone number.
- [ ] Obtain the complete Berlin service address before creating an Impressum.

Recommended filenames:

```text
assets/ST-Firm Logo Transparent.png
assets/SSOS Logo Transparent.png
assets/SCOF Logo Transparent.png       # Only after an official SCOF logo is supplied
```

Filename normalization must not change image content.

---

## 4. Shared footer information architecture

Both pages should use this order:

1. Floating partnership CTA
2. Primary brand panel
3. Navigation panel
4. Ecosystem-logo panel
5. Contact and location panel
6. Proprietor and copyright strip
7. License and future legal links

### Desktop wireframe

```text
                     Floating partnership CTA
        ╭──────────────────────────────────────────╮
        │ Partnership message          Main action │
        ╰──────────────────────────────────────────╯

╭──────────────────── Premium glass footer ─────────────────────╮
│                                                               │
│  PRIMARY BRAND      EXPLORE         ECOSYSTEM       CONNECT    │
│  Logo               Navigation      SCOF            Founder    │
│  Description        Technology      SSOS            Email      │
│  Location           Partners        ST-Firm         Telephone  │
│                                                               │
├───────────────────────────────────────────────────────────────┤
│ Proprietor · Copyright · License · Legal · Privacy             │
╰───────────────────────────────────────────────────────────────╯
```

### Tablet wireframe

```text
╭──────────────────────────────────╮
│ Floating partnership CTA         │
├─────────────────┬────────────────┤
│ Primary brand   │ Ecosystem      │
├─────────────────┼────────────────┤
│ Navigation      │ Contact        │
├──────────────────────────────────┤
│ Legal and ownership              │
╰──────────────────────────────────╯
```

### Mobile wireframe

```text
╭────────────────────────╮
│ Partnership CTA        │
├────────────────────────┤
│ Primary logo           │
│ Brand statement        │
│ Location               │
├────────────────────────┤
│ Ecosystem logos        │
├────────────────────────┤
│ Navigation             │
├────────────────────────┤
│ Contact                │
├────────────────────────┤
│ Proprietor and legal   │
╰────────────────────────╯
```

---

## 5. SCOF footer content

### Primary identity

```text
SCOF
Kenyan coffee ecosystem
Farm operations · Kitale, Kenya
```

Brand statement:

> A digitally connected coffee ecosystem where agriculture, AI, software, renewable energy, partnerships, and community work together.

### Floating CTA

Heading:

> Let’s build the future of traceable Kenyan coffee.

Supporting text:

> Partner with SCOF across coffee, technology, processing, energy, research, and market access.

Actions:

- `Start a conversation` → email/contact
- `Explore ST-Firm` → `st-firm.html`

### Explore navigation

- Our Farms → `#farm`
- SSOS Technology → `#technology`
- Traceability → `#traceability`
- Partnerships → `#partnerships`
- Technology Roadmap → `#technology-scope`
- ST-Firm → `st-firm.html`

### Ecosystem panel

- SCOF · Coffee and agriculture
- SSOS · Intelligence platform
- ST-Firm · Engineering backbone

### Location panel

```text
Farm operations
Kitale, Kenya

Engineering headquarters
Berlin, Germany
```

---

## 6. ST-Firm footer content

### Primary identity

```text
ST-Firm
German-Kenyan engineering
Headquarters · Berlin, Germany
```

Brand statement:

> Engineering systems that connect real operations, software, AI, infrastructure, and responsible growth.

### Floating CTA

Heading:

> Engineering partnerships for operations that matter.

Supporting text:

> Build intelligent systems connecting real operations, AI, infrastructure, and long-term resilience.

Actions:

- `Build with ST-Firm` → email/contact
- `Explore SCOF` → `index.html`

### Explore navigation

- Systems → `#systems`
- Real-world Proof → `#proof`
- Operating Model → `#model`
- Founder Story → `#story`
- SCOF → `index.html`

### Ecosystem panel

- ST-Firm · Master engineering brand
- SSOS · AI and operational software
- SCOF · Real-world agricultural proving ground
- SAOS · Planned infrastructure layer

### Location panel

```text
ST-Firm headquarters
Berlin, Germany

SCOF farm operations
Kitale, Kenya
```

---

## 7. Founder, ownership, and legal content

### Public identity

```text
Engineer Saigut Julius Kipkorir
Founder and sole proprietor trading as ST-Firm
Berlin, Germany · Kitale, Kenya
```

### Copyright line

Use exactly:

> © 2026 Engineer Saigut Julius Kipkorir, sole proprietor trading as ST-Firm. All rights reserved.

The year may be updated automatically with JavaScript, but the ownership wording must not change.

### Legal links

- [ ] Link `Proprietary License` to `LICENSE` or an appropriate web-readable license page.
- [ ] Add `Legal Notice / Impressum` only after the required complete details are supplied.
- [ ] Add `Privacy` only after a privacy page is written and matches the site's actual data processing.
- [ ] Do not use `href="#"` for incomplete legal pages.
- [ ] Do not publish an incomplete address as a complete legal notice.

`Berlin, Germany` is approved as the public headquarters location. It is not a substitute for the complete service address required in a formal legal notice.

---

## 8. Visual design specification

### Foundation

- [ ] Use a deep forest-black base.
- [ ] Add a soft green radial light behind the main footer.
- [ ] Add a restrained blue light near the SSOS and ST-Firm logo panel.
- [ ] Add a warm gold or coffee-toned accent near the SCOF panel.
- [ ] Keep the page background transition smooth before the footer begins.

### Main glass surface

- [ ] Maximum width between 1,180 and 1,260 pixels.
- [ ] Use 28–38 pixel corner radii.
- [ ] Use a translucent dark background.
- [ ] Use a thin semi-transparent border.
- [ ] Add a brighter top-edge reflection.
- [ ] Use layered outer and inner shadows.
- [ ] Keep text contrast at or above WCAG requirements.

Suggested starting tokens:

```css
--footer-night: #04150f;
--footer-glass: rgba(255, 255, 255, 0.065);
--footer-border: rgba(255, 255, 255, 0.14);
--footer-text: rgba(255, 255, 255, 0.92);
--footer-muted: rgba(255, 255, 255, 0.68);
--footer-green: #b6d56a;
--footer-blue: #198bd1;
--footer-gold: #d9a74a;
--footer-radius: 34px;
--footer-blur: 28px;
```

Tokens may be adjusted after contrast testing.

### Floating CTA

- [ ] Position the CTA 50–70 pixels above the main footer surface.
- [ ] Keep CTA content inside the page's normal maximum width.
- [ ] Use a distinct but related glass layer.
- [ ] Make the primary action visually dominant.
- [ ] Avoid token-sale or investment-oriented wording.

### Logo presentation

- [ ] Place each original logo inside a glass pedestal.
- [ ] Preserve the full image and its aspect ratio.
- [ ] Use `object-fit: contain`.
- [ ] Never use CSS filters that alter logo colors.
- [ ] Apply glow to a pseudo-element behind the logo, not to its pixels.
- [ ] Use explicit image dimensions.
- [ ] Use accurate alternative text.
- [ ] Make linked logo cards keyboard accessible.

---

## 9. Motion specification

### Permitted effects

- [x] Pointer-responsive glow on the glass container.
- [ ] Maximum card lift of approximately 4 pixels.
- [ ] Maximum container tilt of approximately 1–2 degrees.
- [ ] Soft illuminated navigation underline.
- [ ] Subtle CTA magnetic movement on pointer devices.
- [ ] Slow light reflection across the surrounding glass surface.

### Prohibited effects

- [ ] Do not animate or rewrite pixels inside the supplied logos.
- [ ] Do not continuously spin logos.
- [ ] Do not use aggressive bouncing.
- [ ] Do not use autoplay video.
- [ ] Do not use heavy WebGL or 3D libraries.
- [ ] Do not make essential information dependent on animation.

### Reduced motion

- [ ] Disable pointer tracking.
- [ ] Disable tilt and magnetic movement.
- [ ] Remove hover translation.
- [ ] Keep static lighting and all content visible.

---

## 10. Technical implementation

### Shared files

Create:

```text
assets/footer-system.css
assets/footer-system.js
```

### HTML integration

- [x] Replace the existing footer markup in `index.html`.
- [x] Replace the existing footer markup in `st-firm.html`.
- [ ] Keep page-specific content in each HTML file.
- [x] Load one shared footer stylesheet from both pages.
- [x] Load one shared footer script from both pages.
- [x] Keep the footer usable when JavaScript is unavailable.

### CSS responsibilities

- Shared design tokens
- Glass surfaces
- Grid and responsive layouts
- Logo pedestals
- Focus and hover states
- Reduced-motion rules
- High-contrast fallback

### JavaScript responsibilities

- Pointer coordinates for container lighting
- Optional restrained tilt calculation
- Current copyright year
- Touch/pointer capability detection
- No analytics, tracking, or storage

---

## 11. Accessibility checklist

- [x] Use a semantic `<footer>` landmark.
- [ ] Give each navigation group an accessible name.
- [ ] Use headings for footer sections.
- [ ] Maintain logical keyboard order.
- [x] Add clear `:focus-visible` styles.
- [ ] Maintain minimum 44×44 pixel touch targets where appropriate.
- [ ] Verify normal text contrast of at least 4.5:1.
- [ ] Verify large-text contrast of at least 3:1.
- [ ] Mark decorative lighting `aria-hidden="true"` where represented in markup.
- [ ] Provide meaningful alternative text for each brand logo.
- [ ] Do not communicate location or product roles through color alone.
- [ ] Test with JavaScript disabled.
- [ ] Test with reduced motion enabled.

---

## 12. Performance checklist

- [ ] Keep effects CSS-based.
- [ ] Avoid additional photographic footer backgrounds.
- [ ] Add `width` and `height` to logo images.
- [ ] Add `loading="lazy"` where appropriate.
- [ ] Add `decoding="async"` to footer images.
- [ ] Avoid duplicated scripts between pages.
- [ ] Avoid permanent animation loops.
- [ ] Confirm the footer does not cause layout shift.
- [ ] Confirm no new network dependency is introduced.

---

## 13. Implementation phases

### Phase A — Asset readiness

- [ ] Store the supplied SSOS image in `assets/` unchanged.
- [ ] Confirm the official SCOF footer mark.
- [ ] Record image dimensions and transparency.
- [ ] Confirm final contact information.

### Phase B — Shared foundation

- [x] Create `assets/footer-system.css`.
- [x] Create `assets/footer-system.js`.
- [ ] Implement shared variables and base layout.
- [ ] Implement responsive breakpoints.
- [ ] Implement accessible focus states.

### Phase C — SCOF integration

- [x] Add floating SCOF partnership CTA.
- [x] Add SCOF identity and Kitale location.
- [x] Add ecosystem-logo panel.
- [x] Add SCOF navigation.
- [x] Add founder/contact information.
- [x] Add legal ownership strip.

### Phase D — ST-Firm integration

- [x] Add floating ST-Firm partnership CTA.
- [x] Add original ST-Firm logo and Berlin headquarters.
- [x] Add SCOF and SSOS ecosystem linkage.
- [x] Add ST-Firm navigation.
- [x] Add founder/contact information.
- [x] Add matching legal ownership strip.

### Phase E — Motion and polish

- [ ] Add container light tracking.
- [ ] Add restrained card lift.
- [ ] Add navigation underline motion.
- [x] Add reduced-motion fallbacks.
- [ ] Confirm supplied logos remain visually unchanged.

### Phase F — Quality assurance

- [ ] Test desktop at 1440 pixels.
- [ ] Test laptop at 1024 pixels.
- [ ] Test tablet at 768 pixels.
- [ ] Test mobile at 390 pixels.
- [ ] Test narrow mobile at 320 pixels.
- [ ] Test keyboard-only navigation.
- [ ] Test reduced-motion mode.
- [ ] Test without JavaScript.
- [x] Validate all links and assets.
- [x] Validate HTML and JavaScript syntax.
- [ ] Measure contrast.
- [ ] Confirm there is no horizontal overflow.

---

## 14. Acceptance criteria

The footer work is complete only when:

- [ ] ST-Firm and SSOS logos are pixel-for-pixel unchanged.
- [ ] The approved SCOF identity is used consistently.
- [ ] SCOF is clearly located in Kitale, Kenya.
- [ ] ST-Firm headquarters is clearly located in Berlin, Germany.
- [ ] Engineer Saigut Julius Kipkorir is clearly identified as founder and proprietor.
- [ ] Copyright matches the proprietary license.
- [ ] SCOF, SSOS, and ST-Firm roles are immediately understandable.
- [ ] Both websites clearly link to one another.
- [ ] The footer feels premium without reducing readability.
- [ ] The footer works on desktop, tablet, and mobile.
- [ ] Keyboard and reduced-motion behavior work correctly.
- [ ] Text contrast passes.
- [ ] No incomplete legal link is published.
- [ ] No illustrative technology is represented as deployed.
- [ ] No material performance regression is introduced.

---

## 15. Known blockers and decisions still required

### Blocking final logo integration

- [ ] SSOS logo must be available as a local file in `assets/`.
- [ ] Official SCOF footer-logo asset must be confirmed.

### Blocking a complete German legal notice

- [ ] Full street address
- [ ] Postal code
- [ ] Exact public business-contact details
- [ ] Any applicable registration or tax information, if legally required

These legal details should not be invented or inferred.

---

## 16. Out of scope for this footer task

- Editing or redesigning supplied logos
- Registering trademarks
- Creating investment or token-sale material
- Adding analytics or tracking
- Creating a production SSOS application
- Publishing the repository to GitHub
- Deploying the website
- Providing jurisdiction-specific legal approval

Those activities require separate authorization or workstreams.
