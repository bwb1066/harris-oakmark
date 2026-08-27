import { getMetadata } from '../../scripts/ak.js';

/**
 * Sparkle button that opens the Brand Concierge.
 *
 * Synthesized rather than authored, like the mega-menu Close button and the
 * mobile hamburger, so an edit to a nav fragment can't drop the only way into
 * the concierge. Safety-Kleen uses a prominent inline `ask-jack` block for this;
 * this site has no such block, so the nav icon is the entry point.
 *
 * Config comes from page metadata (concierge-url / concierge-key /
 * concierge-site), and the button is GATED on all three being present — so it
 * simply doesn't appear on a page that isn't wired for the concierge.
 */

const WIDGET_BASE = 'https://bwb1066.github.io/brand-concierge/widget/';
// Version query busts the browser/CDN module cache when the widget updates
// (GitHub Pages serves it with max-age=600 and no revalidation).
const WIDGET_URL = `${WIDGET_BASE}brand-concierge.js?v=commerce2`;

const SUPABASE_URL = getMetadata('concierge-url');
const SUPABASE_KEY = getMetadata('concierge-key');
const SITE_KEY = getMetadata('concierge-site');

const SPARKLE = `<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" focusable="false">
  <path fill="currentColor" d="M12 2.5l1.6 4.6 4.6 1.6-4.6 1.6L12 15l-1.6-4.7L5.8 8.7l4.6-1.6L12 2.5z"/>
  <path fill="currentColor" d="M18.5 14l.9 2.6 2.6.9-2.6.9-.9 2.6-.9-2.6-2.6-.9 2.6-.9.9-2.6z"/>
</svg>`;

let loading = null;

/**
 * Fetch and initialise the widget once. `showTrigger: false` keeps the widget's
 * own corner bubble suppressed — this button is the trigger.
 */
function loadWidget() {
  if (!loading) {
    loading = import(/* webpackIgnore: true */ WIDGET_URL).then((mod) => {
      mod.init({
        supabaseUrl: SUPABASE_URL,
        anonKey: SUPABASE_KEY,
        siteKey: SITE_KEY,
        showTrigger: false,
        widgetBase: WIDGET_BASE,
      });
      return mod;
    });
  }
  return loading;
}

/**
 * Append the trigger to the primary nav list.
 * @param {Element} list the `ul.main-nav-list`
 * @param {string} label accessible name, per brand
 */
export default function decorateConciergeTrigger(list, label = 'Ask our AI concierge') {
  if (!list || !(SUPABASE_URL && SUPABASE_KEY && SITE_KEY)) return null;

  const li = document.createElement('li');
  li.className = 'concierge-item';

  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'concierge-trigger';
  btn.setAttribute('aria-label', label);
  btn.innerHTML = SPARKLE;

  // Warm the module on hover so the first click opens without a stall.
  btn.addEventListener('pointerenter', loadWidget, { once: true });
  btn.addEventListener('click', async () => {
    const mod = await loadWidget();
    mod.default();
  });

  li.append(btn);
  list.append(li);
  return li;
}
