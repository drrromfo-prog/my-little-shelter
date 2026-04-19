---
name: douban-import
description: Use when implementing or repairing Douban link autofill for the media shelf site, including server-side fetching, category inference for movie, book, and TV content, cover proxying, and preserving the existing save flow.
---

# Douban Import

Use this skill when a task touches Douban autofill.

## What Douban Import Should Fill

Attempt to extract:

- title
- cover
- creator
- year
- category
- rating
- summary
- tags

If a field is unreliable, return it empty instead of guessing.

## Category Rules

- `book.douban.com` normally maps to `book`
- `movie.douban.com` may represent either `movie` or `tv`
- When the source is from Douban movie pages and the site supports TV separately, infer `tv` only when the page clearly indicates a series; otherwise keep the safer existing category mapping

## Implementation Rules

- Prefer server-side fetching for Douban parsing.
- Keep scraping and verification logic out of the browser when possible.
- If Douban cover images fail in the browser, proxy them through the backend.
- Preserve the current save flow: autofill should only populate form fields, not bypass normal saving.

## UX Rules

- The homepage add form should expose a clear Douban input box.
- Autofill should give short feedback:
  - loading
  - success
  - actionable failure
- Do not overwrite user edits after a failed import.

## Safety and Stability

- Validate the incoming URL before fetching.
- Restrict image proxying to Douban-owned hosts.
- Log backend parsing failures with enough context to debug.
- Keep manual entry usable even when Douban import fails.

