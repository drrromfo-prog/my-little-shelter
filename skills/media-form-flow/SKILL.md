---
name: media-form-flow
description: Use when building or refining the add/edit form flow for the media shelf site, including category choice, status switching, optional notes, and preserving existing save behavior for movie, book, and TV records.
---

# Media Form Flow

Use this skill for add/edit modal work on the media logging site.

## Core Form Requirements

- Support three categories:
  - `movie`
  - `book`
  - `tv`
- Support status switching directly in the form.
- Keep title required.
- Keep advanced fields optional.
- Preserve existing save logic and API contracts unless the task explicitly includes backend schema work.

## Recommended Field Order

1. Douban link
2. Title
3. Cover URL
4. Creator
5. Year
6. Category
7. Status
8. Ratings
9. Tags
10. Summary
11. Personal note

## Progressive Disclosure

- Show the most common fields first.
- Reveal category-specific fields only when needed.
- Example:
  - books may show reading progress
  - movies and TV may show rewatch notes
- Keep the form easy to complete in under a minute.

## Status Guidance

- The UI may use friendly labels such as:
  - 想看 / 想读
  - 已看 / 已读
  - 搁置
- If stored values differ, map them in JS rather than rewriting old records silently.

## Save Behavior

- Never replace the current persistence layer with local-only storage unless explicitly asked.
- When editing records, preserve old optional arrays and metadata if the user did not clear them.
- Keep import/autofill and manual entry compatible with the same save function.

