# harris-oakmark — setup

One EDS site carrying **both** brands: `index-h` replicates harrisassoc.com,
`index-o` replicates oakmark.com. They share the code and the block library and
differ only by page metadata (`template`, `header-source`, `footer-source`).

Repo: `bwb1066/harris-oakmark` (public) · Org/Site in DA: `bwb1066` /
`harris-oakmark` · hosts `main--harris-oakmark--bwb1066.aem.page` / `.aem.live`

---

## Manual steps (all need your da.live / GitHub login)

### 1. Install AEM Code Sync

<https://github.com/apps/aem-code-sync/installations/new> → grant access to
**bwb1066/harris-oakmark**.

### 2. Create the site config

In da.live, create the site so the hosts read the DA content bus:

```json
{
  "previewHost": "main--harris-oakmark--bwb1066.aem.page",
  "liveHost": "main--harris-oakmark--bwb1066.aem.live",
  "contentSourceUrl": "https://content.da.live/bwb1066/harris-oakmark/",
  "contentSourceType": "markup"
}
```

### 3. Register the block library

<https://da.live/config#/bwb1066/harris-oakmark/> → **Add sheet** named exactly
`library`, with `title` / `path` rows pointing at
`https://content.da.live/bwb1066/harris-oakmark/docs/library/…`. The block docs
themselves are in `reference/da-library/` (see its README).

### 4. Author the nav and the two index pages

Paste the six nav docs and set the page metadata — full instructions and the
metadata tables are in **`reference/da-nav/README.md`**. Then bulk-**Preview**
`fragments/nav/*`, `index-h` and `index-o`.

---

## What's already done in code

- **Repo** spawned from the AK baseline (`origin` + `base` remotes).
- **Nav extracted** from both live sites into `reference/harris/*.html` and
  `reference/oakmark/*.html` (utility / primary / mega-menu / footer).
- **Nav fragments** written as paste-ready docs in `reference/da-nav/`.
- **Theme**: brand tokens in `styles/styles.css`, per-brand layers appended to
  `blocks/header/header.css` and `blocks/footer/footer.css`, page themes in
  `templates/harris/` and `templates/oakmark/`. Self-hosted Open Sans (the font
  both source sites load from Google) in `styles/fonts/`.
- **Header behaviour** added in `blocks/header/header.js`: the sibling-site
  mega-menu that drops from the top of the viewport, a synthesized Close button,
  a synthesized mobile hamburger, and real dropdowns for the primary nav (the
  baseline's `decorateMenu` was a stub that left every submenu expanded inline).

## Colour decisions

- **One green, `#025e02`.** Both source sites ship two dark greens; `#025e02`
  carries 46 of the 62 uses across the two stylesheets and `#025202` the rest,
  so the lighter one wins and the other is retired. 8.07:1 on white — AA at any
  size.
- **Blue `#0b3459`**, **Oakmark nav text `#4a4a4a`**. These are read from the
  source stylesheets, so they sit 1–2 units off the eyedropped values in the
  brief (`#015E02` / `#015202` / `#0A3459`).

## Preview locally before code sync is live

```
cd harris-oakmark
npx @adobe/aem-cli up --no-open
```

Serves local `blocks/styles/scripts` from disk and proxies DA content from the
preview host.
