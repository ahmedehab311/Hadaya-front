---
name: Google Fonts CSS import
description: PostCSS rejects @import url() appearing after other CSS statements
---

**Rule:** Load Google Fonts via `<link>` tags in `index.html`, not via `@import url()` in CSS files.

**Why:** Vite processes CSS through PostCSS, which inlines Tailwind (~5000 lines) before any `@import url()` that appears later in source. PostCSS then sees the `@import` at line ~4974 and throws "must precede all other statements". Moving it to `<head>` as a `<link rel="stylesheet">` bypasses PostCSS entirely.

**How to apply:** In `artifacts/hadaya/index.html`, add:
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=...&display=swap" rel="stylesheet">
```
Do NOT add `@import url('https://fonts.googleapis.com/...')` to any `.css` file in this project.
