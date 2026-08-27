import { getConfig, getMetadata } from '../ak.js';

/**
 * Per-brand favicon.
 *
 * This site carries two brands in one repo, and both use the shared
 * Harris | Oakmark stacked mark: pages whose path ends in `-h` (Harris) or
 * `-o` (Oakmark) take it. Keyed off the path rather than `template` metadata so
 * a new brand page gets the right icon with nothing to remember; an explicit
 * `favicon` metadata value still wins.
 *
 * The brand mark is a single 32px PNG, so it deliberately skips the base's
 * .ico + apple-touch + webmanifest trio — requesting files that don't exist
 * would put 404s in the console and cost a best-practices point.
 */
const BRAND_ICON = '/img/favicons/harris-oakmark-32.png';
const BRAND_SUFFIXES = ['-h', '-o'];

function brandIconFor(pathname) {
  return BRAND_SUFFIXES.some((s) => pathname.endsWith(s)) ? BRAND_ICON : null;
}

(async function loadFavicon() {
  const { codeBase } = getConfig();
  const iconLink = document.head.querySelector('link[href="data:,"]');

  const brand = getMetadata('favicon') ? null : brandIconFor(window.location.pathname);
  if (brand) {
    if (iconLink) {
      iconLink.href = `${codeBase}${brand}`;
      iconLink.type = 'image/png';
    }
    return;
  }

  const name = getMetadata('favicon') || 'favicon';
  const favBase = `${codeBase}/img/favicons/${name}`;

  // Load before setting the main icon to prevent icon re-evaluation
  const tags = `<link rel="apple-touch-icon" href="${favBase}-180.png">
                <link rel="manifest" href="${favBase}.webmanifest">`;
  document.head.insertAdjacentHTML('beforeend', tags);

  if (iconLink) iconLink.href = `${favBase}.ico`;
}());
