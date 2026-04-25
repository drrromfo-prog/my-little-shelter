# Known Issues

Current factual constraints and issues:

1. Main frontend logic is still concentrated in one large file:
   - `public/script.js`

2. Main page and dashboard use different styling approaches:
   - main app uses custom CSS
   - `/stats` uses a Tailwind CDN-style page

3. Some visual fields are not persisted:
   - `accentColor`
   - `favorite`
   - `revisit`
   - `notesCount`
   These are currently presentation/showcase oriented.

4. Color extraction is best-effort:
   - Color Thief may not extract a color from every image
   - the UI should fall back gracefully to neutral/default accents

5. Import / export are still plain button actions:
   - they are visually demoted now
   - they are not yet moved into a dedicated overflow menu

6. The project still contains legacy files or setup pieces not driving the main UI directly:
   - example: `media_tracker_v2.html`
   - Tailwind build pipeline exists even though the main page uses custom CSS
