# Media Shelf Agents Guide

## Project Scope

This project is a media logging site for:

- movies
- books
- TV series

The product goal is to keep the homepage simple, readable, and fast to use.

## Product Rules

- The homepage should stay clean and minimal.
- There must always be a clear "add record" entry on the homepage.
- Records should support three categories: `movie`, `book`, `tv`.
- Records should support status switching in the UI and in saved data.
- Douban links should be supported for automatic metadata filling.
- Existing save and persistence logic must be preserved unless the task explicitly asks for a migration.

## UX Priorities

- Favor a calm, editorial layout over dashboard clutter.
- Make the primary actions obvious: add, edit, delete, filter, search.
- Keep forms short on first view and progressively reveal extra fields.
- Use cards, chips, and grouped metadata instead of dense tables.
- Prefer white or warm light backgrounds, strong spacing, and rounded containers.

## Data Handling

- Do not remove current persistence behavior.
- If new fields are added, make them backward compatible with existing saved records.
- When introducing `tv`, extend current category handling instead of rewriting storage from scratch.
- If front-end labels differ from stored values, add mapping helpers instead of changing old records in place.

## Douban Import Expectations

- Douban import should fill title, cover, creator, year, rating, summary, and tags when possible.
- Keep import server-side when scraping or proxying is needed.
- If a field cannot be extracted reliably, leave it empty rather than fabricating data.
- Cover images from Douban should be proxied if direct browser loading is unstable.

## Implementation Style

- Prefer small, reversible changes.
- Keep HTML ids and JS selectors aligned.
- When redesigning UI, preserve existing API contracts unless the task explicitly includes backend changes.
- If a new flow replaces an old one, keep compatibility adapters during the transition.

