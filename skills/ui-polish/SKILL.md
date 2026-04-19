---
name: ui-polish
description: Use when polishing the UI of the media shelf site, especially homepage layout, cards, add-record entry, filters, status chips, and light visual refinement for movie, book, and TV record flows.
---

# UI Polish

Use this skill when updating the look and feel of the media shelf product.

## Goals

- Keep the homepage simple and calm.
- Preserve a strong "新增记录" entry on the homepage.
- Support `movie`, `book`, and `tv` in visible category controls.
- Keep status switching easy to scan and tap.
- Avoid dark themes and flashy gradients unless the user explicitly requests them.

## Design Direction

- Use warm light backgrounds, white cards, subtle borders, and rounded corners.
- Prefer serif display headings with clean sans-serif body text.
- Keep controls compact and consistent.
- Use chips and badges for category, status, mood, and tags.
- Favor generous spacing over decorative elements.

## Homepage Rules

- The first screen should show:
  - page title
  - add-record entry
  - search or quick filtering
  - visible record list or card grid
- Do not bury the add action behind multiple clicks.
- If sidebar navigation exists, keep it short and readable.

## Cards

- Each media card should show:
  - cover
  - title
  - creator
  - status
  - rating when available
  - tags when available
- Cards should feel browseable first, editable second.
- Keep text truncation graceful.

## Compatibility

- Do not break current save logic while polishing UI.
- If the backend still stores only some categories, keep the UI ready for `tv` and add mapping notes in code.
- Reuse existing API data rather than inventing a second front-end-only source of truth.

