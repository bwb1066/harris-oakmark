#!/usr/bin/env bash
#
# spawn-site.sh — create a new EDS replica site from this AK baseline.
#
# Unlike GitHub's "Use this template" button (which starts a fresh, disconnected
# history), this clones the baseline so the new repo SHARES history with
# bwb1066-ak-base. That shared history is what lets baseline improvements flow
# down later with a plain `git merge base/main` instead of an
# --allow-unrelated-histories cherry-pick slog.
#
# Result: the new site has two remotes —
#   origin : github.com/<owner>/<site>   (the site's own repo)
#   base   : github.com/bwb1066/bwb1066-ak-base   (this baseline, read-only-ish)
#
# Usage:
#   ./spawn-site.sh <site-name> [owner] [--public]
#       site-name : new repo name, e.g. acme-eds
#       owner     : GitHub owner (default: bwb1066)
#       --public  : create the site repo public (default: private)
#
# Requires: gh (authenticated), git.

set -euo pipefail

BASE_OWNER="bwb1066"
BASE_REPO="bwb1066-ak-base"
BASE_URL="https://github.com/${BASE_OWNER}/${BASE_REPO}.git"

SITE="${1:-}"
OWNER="${2:-bwb1066}"
VIS="--private"
for arg in "$@"; do [ "$arg" = "--public" ] && VIS="--public"; done

if [ -z "$SITE" ] || [ "$SITE" = "--public" ]; then
  echo "usage: ./spawn-site.sh <site-name> [owner] [--public]" >&2
  exit 2
fi

# Fail early if the target repo already exists.
if gh repo view "${OWNER}/${SITE}" >/dev/null 2>&1; then
  echo "ERROR: ${OWNER}/${SITE} already exists — pick another name." >&2
  exit 3
fi

echo ">> cloning baseline into ./${SITE}"
git clone --origin base "$BASE_URL" "$SITE"
cd "$SITE"

# Drop the baseline's own upstream link; a site tracks the baseline, not AK.
git remote remove upstream 2>/dev/null || true

echo ">> creating ${VIS#--} repo ${OWNER}/${SITE}"
gh repo create "${OWNER}/${SITE}" "$VIS" \
  --description "EDS site spawned from ${BASE_OWNER}/${BASE_REPO}" >/dev/null

git remote add origin "https://github.com/${OWNER}/${SITE}.git"
git push -u origin main >/dev/null 2>&1

echo ""
echo "DONE. ${OWNER}/${SITE} is live."
echo "  remotes:  origin -> the site   |   base -> ${BASE_OWNER}/${BASE_REPO}"
echo "  pull baseline updates later with:  git fetch base && git merge base/main"
echo ""
echo "Next: install the AEM Code Sync GitHub App on ${OWNER}/${SITE} so it"
echo "publishes to main--${SITE}--${OWNER}.aem.page / .aem.live."
