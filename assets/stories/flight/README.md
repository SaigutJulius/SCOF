# ST-Firm journey aircraft assets

These original aircraft cutouts support the soundtrack-driven Mombasa-to-Berlin sequence in `st-firm.html`.

## Production assets

- `aircraft-takeoff.png` — unbranded twin-engine passenger aircraft, three-quarter front/underside view, landing gear retracting.
- `aircraft-landing.png` — unbranded twin-engine passenger aircraft, three-quarter rear view, landing gear deployed.

Both production files use an alpha channel. Motion blur, contrails, clouds, runway lights, touchdown smoke and route graphics are produced in CSS/JavaScript so they remain responsive and synchronized when the film is paused or scrubbed.

## Generation method

Generated with the built-in image-generation tool as polished 3D product renders on a uniform `#00ff00` chroma background. Transparency was produced locally with the installed image-generation chroma-key helper using a soft matte and despill.

### Take-off prompt

> Create one premium unbranded modern twin-engine passenger aircraft at the instant of take-off, seen in a dramatic three-quarter front and underside view, climbing diagonally from lower-left toward upper-right. Landing gear beginning to retract. Highly polished realistic 3D product render; metallic pearl-white and silver body with restrained blue, green and purple reflections. Place the complete aircraft on a perfectly uniform `#00ff00` chroma-key background with generous padding. No clouds, vapour, smoke, runway, floor, text, logo, watermark, shadow or reflection.

### Landing prompt

> Create one premium unbranded modern twin-engine passenger aircraft descending for landing, seen from a cinematic three-quarter rear and slightly elevated view, travelling diagonally from upper-right toward lower-left. Landing gear fully deployed and flaps extended. Highly polished realistic 3D product render; metallic pearl-white and silver body with restrained blue and purple reflections. Place the complete aircraft on a perfectly uniform `#00ff00` chroma-key background with generous padding. No clouds, vapour, smoke, runway, floor, text, logo, watermark, shadow or reflection.
