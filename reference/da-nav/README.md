# Nav fragments — paste into DA

Six docs, all under `/fragments/nav/` in da.live. For each file here: open it in
a browser, select everything below the marker line, copy, paste into the doc of
that name, then **Preview** it (fragments render from their preview, not their
source).

| File | DA doc | Used by |
| --- | --- | --- |
| `header-h.html` | `/fragments/nav/header-h` | `index-h` |
| `megamenu-h.html` | `/fragments/nav/megamenu-h` | the Oakmark panel on `index-h` |
| `footer-h.html` | `/fragments/nav/footer-h` | `index-h` |
| `header-o.html` | `/fragments/nav/header-o` | `index-o` |
| `megamenu-o.html` | `/fragments/nav/megamenu-o` | the Harris panel on `index-o` |
| `footer-o.html` | `/fragments/nav/footer-o` | `index-o` |

## Page metadata

Each index page needs three rows in its Metadata block. **Note the `-source`
suffix** — see the first gotcha below.

`index-h`:

| key | value |
| --- | --- |
| template | harris |
| header-source | /fragments/nav/header-h |
| footer-source | /fragments/nav/footer-h |

`index-o`:

| key | value |
| --- | --- |
| template | oakmark |
| header-source | /fragments/nav/header-o |
| footer-source | /fragments/nav/footer-o |

`template` is what puts `harris-template` / `oakmark-template` on `<body>`, and
every brand rule in `header.css`, `footer.css` and `templates/*/` hangs off that
class. Without it both pages render in the unthemed Author Kit chrome.

## Gotchas these docs already work around

1. **`header` / `footer` metadata is already taken.** `ak.js` and
   `scripts/utils/footer.js` use those keys as the *block class name*, so a
   value like `/fragments/nav/header-h` makes the page try to load
   `/blocks//fragments/nav/header-h/....js` and the chrome dies. `header.js` and
   `footer.js` here read `header-source` / `footer-source` instead.

2. **A fully italic (or bold) paragraph containing a link gets eaten.**
   `decorateButton()` in `ak.js` turns `<p><em>… <a>link</a> …</em></p>` into a
   button and *replaces the whole `<em>` with just the link* — the rest of the
   sentence is destroyed. Both footers' prospectus disclaimers hit this. The fix
   used here is to put the emphasis *inside* the anchor
   (`<a><em>here</em></a>`) and close the outer `<em>` around it, which renders
   identically and decorates nothing. Watch for this when authoring any legal
   copy with inline links.

3. **A mega-menu fragment needs at least two sections.** `fragment.js` inlines a
   single-section fragment's children directly and drops the
   `.fragment-content` wrapper, which is exactly the hook `decorateMegaMenu()`
   looks for. Both `megamenu-*` docs are authored in three sections.

## Not authored on purpose

The **Close** button on the mega-menu panel and the **mobile hamburger** are
synthesized in `blocks/header/header.js`, so an edit to a nav doc can't drop
them and strand the panel open or leave mobile with no way into the nav.

## Assets

The logos currently point at the live `harrisassoc.com` / `oakmark.com` SVGs.
Upload the two lockups (white and black) to DA and swap the `src` values.
Social links render as the text "Twitter / X" and "LinkedIn"; the source sites
use Font Awesome glyphs, so swap in icons if you want that exact look.
