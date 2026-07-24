# The AK Baseline: one controlled source for every replica site

How to keep a private Author Kit baseline with all the block-collection blocks
baked in, pull Adobe's upstream changes into it, and spawn new sites that can
**still receive those changes later** — using plain git, no fragile GitHub magic.

> **Baseline repo:** `bwb1066/bwb1066-ak-base` — private · template flag on ·
> default branch `main` · `upstream` → `aemsites/author-kit`

---

## The shape of it

Three tiers. Content flows **down** by merging; there is no GitHub feature that
auto-propagates across a repo family, so every hop is a deliberate `git merge`.
That's a feature, not a limitation — you review what lands.

```
aemsites/author-kit          [upstream]  Adobe's Author Kit — you only pull from it
        │
        │  git fetch upstream && git merge upstream/main
        ▼
bwb1066/bwb1066-ak-base       [baseline]  AK + all 16 aem-* collection blocks
        │
        │  ./spawn-site.sh <name>          (clone — shared history)
        ▼
<owner>/<site>                [replica]   a production site
        ▲                                 remotes: origin (itself) + base (baseline)
        │  git fetch base && git merge base/main   (run from the site)
        └───────────────────────────────────────────────────────────────
```

---

## Why mirror + clone, not fork + template

The obvious instinct — fork Author Kit, mark the fork as a template, click
_Use this template_ for each site — quietly breaks the one thing you care about:
pushing baseline updates _down_ into sites you already spawned.

> ⚠️ **The gotcha — "Use this template" starts a disconnected history.**
> A template-created repo is not a fork and shares no commits with its template,
> so a later `git merge base/main` hits _"refusing to merge unrelated histories."_
> Downstream updates degrade into `--allow-unrelated-histories` cherry-picks.
> **Cloning** the baseline instead keeps a shared ancestor, so updates stay clean merges.

Two more GitHub facts steer the design:

- A **fork of a public repo is public** and can't be flipped private in the UI —
  and you can only fork a given repo once per account. Awkward for private
  production sites.
- A **mirror** (bare clone → `git push --mirror` into a fresh repo) has none of
  those constraints: it can be private, it can be a template, and you wire
  `upstream` yourself to still pull AK changes.

You may still flip the baseline's template flag on for the nice one-click UX — but
reserve _Use this template_ for throwaway experiments. For real sites, use the
clone-based spawn (`spawn-site.sh`).

---

## Building the baseline (one time)

### 1. Mirror Author Kit into a fresh private repo

```bash
# create empty private repo, then mirror AK's content into it
gh repo create bwb1066/bwb1066-ak-base --private
git clone --bare https://github.com/aemsites/author-kit.git author-kit.git
cd author-kit.git
git push --mirror https://github.com/bwb1066/bwb1066-ak-base.git
```

### 2. Wire the upstream remote in a working clone

```bash
git clone --origin origin https://github.com/bwb1066/bwb1066-ak-base.git
cd bwb1066-ak-base
git remote add upstream https://github.com/aemsites/author-kit.git
```

### 3. Bake in the block-collection blocks

All 16 `adobe/aem-block-collection` blocks, ported under an `aem-` prefix and
adapted for Author Kit's `scripts/ak.js` runtime (compat shim, ak.js-adapted
fragment & modal, modal wired into `linkBlocks`). DA library material lands in
`reference/da-library/`.

### 4. Add the spawn script & push

`spawn-site.sh` lives at the repo root. Commit everything and push to `main`.
Baseline done.

---

## Spawning a replica site

From a working clone of the baseline:

```bash
# private by default; add --public for a public site
./spawn-site.sh acme-eds               # owner defaults to bwb1066
./spawn-site.sh acme-eds someorg --public
```

The script clones the baseline (so history is shared), removes the AK `upstream`
link, creates `owner/acme-eds` on GitHub, and wires two remotes: `origin` → the
site, `base` → the baseline. Then install the
[AEM Code Sync](https://da.live/bot) GitHub App on the new repo so it publishes to
`main--acme-eds--owner.aem.page` / `.aem.live`.

---

## Keeping everything in sync

| When you want to…                                | Run this, where                                                  |
| ------------------------------------------------ | ---------------------------------------------------------------- |
| Pull Adobe's AK updates into the baseline        | `git fetch upstream && git merge upstream/main` · in the baseline |
| Create a new replica site                        | `./spawn-site.sh <name>` · in the baseline                       |
| Pull baseline updates into an existing site      | `git fetch base && git merge base/main` · in the site            |

Merges from AK occasionally conflict in core `scripts/` or `styles/`, rarely in
the added `aem-*` blocks. It's a real merge you resolve, not an automatic sync —
that's the honest cost of one-source control.

---

## The manual DA step

Blocks need to appear in the DA editor's Blocks panel, and DA has no API — so this
part is by hand, per site:

- Create the sample docs from `reference/da-library/*.html` under
  `<site>/docs/library/blocks` in DA.
- Append the rows in `reference/da-library/blocks-sheet.csv` to the blocks sheet
  your site config's `library` tab points at.
- Reload the DA editor — the `aem-*` blocks show up in the Blocks panel.

---

## Toolchain notes

- **Node 22** and **Homebrew git** are required for the AK tooling — the system
  node is v12 and the system git is Xcode-license-gated.
- Baseline facts: `bwb1066/bwb1066-ak-base` — private, template flag on, default
  branch `main`, `upstream` → `aemsites/author-kit`.
