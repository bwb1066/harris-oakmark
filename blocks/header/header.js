import { getConfig, getMetadata } from '../../scripts/ak.js';
import { loadFragment } from '../fragment/fragment.js';
import { setColorScheme } from '../section-metadata/section-metadata.js';

const { locale } = getConfig();

const HEADER_PATH = '/fragments/nav/header';
const HEADER_ACTIONS = [
  '/tools/widgets/scheme',
  '/tools/widgets/language',
  '/tools/widgets/toggle',
];

function closeAllMenus() {
  const openMenus = document.body.querySelectorAll('header .is-open');
  for (const openMenu of openMenus) {
    openMenu.classList.remove('is-open');
    const trigger = openMenu.querySelector('.sibling-trigger');
    if (trigger) trigger.setAttribute('aria-expanded', 'false');
  }
  document.body.classList.remove('sibling-menu-open');
}

function docClose(e) {
  if (e.target.closest('header')) return;
  closeAllMenus();
}

function toggleMenu(menu) {
  const isOpen = menu.classList.contains('is-open');
  closeAllMenus();
  if (isOpen) {
    document.removeEventListener('click', docClose);
    return;
  }

  // Setup the global close event
  document.addEventListener('click', docClose);
  menu.classList.add('is-open');
}

function decorateLanguage(btn) {
  const section = btn.closest('.section');
  btn.addEventListener('click', async () => {
    let menu = section.querySelector('.language.menu');
    if (!menu) {
      const content = document.createElement('div');
      content.classList.add('block-content');
      const fragment = await loadFragment(`${locale.prefix}${HEADER_PATH}/languages`);
      menu = document.createElement('div');
      menu.className = 'language menu';
      menu.append(fragment);
      content.append(menu);
      section.append(content);
    }
    toggleMenu(section);
  });
}

function decorateScheme(btn) {
  btn.addEventListener('click', async () => {
    const { body } = document;

    let currPref = localStorage.getItem('color-scheme');
    if (!currPref) {
      currPref = matchMedia('(prefers-color-scheme: dark)')
        .matches ? 'dark-scheme' : 'light-scheme';
    }

    const theme = currPref === 'dark-scheme'
      ? { add: 'light-scheme', remove: 'dark-scheme' }
      : { add: 'dark-scheme', remove: 'light-scheme' };

    body.classList.remove(theme.remove);
    body.classList.add(theme.add);
    localStorage.setItem('color-scheme', theme.add);
    // Re-calculatie section schemes
    const sections = document.querySelectorAll('.section');
    for (const section of sections) {
      setColorScheme(section);
    }
  });
}

function decorateNavToggle(btn) {
  btn.addEventListener('click', () => {
    const header = document.body.querySelector('header');
    if (header) header.classList.toggle('is-mobile-open');
  });
}

async function decorateAction(header, pattern) {
  const link = header.querySelector(`[href*="${pattern}"]`);
  if (!link) return;

  const icon = link.querySelector('.icon');
  const text = link.textContent;
  const btn = document.createElement('button');
  if (icon) btn.append(icon);
  if (text) {
    const textSpan = document.createElement('span');
    textSpan.className = 'text';
    textSpan.textContent = text;
    btn.append(textSpan);
  }
  const wrapper = document.createElement('div');
  wrapper.className = `action-wrapper ${icon.classList[1].replace('icon-', '')}`;
  wrapper.append(btn);
  link.parentElement.parentElement.replaceChild(wrapper, link.parentElement);

  if (pattern === '/tools/widgets/language') decorateLanguage(btn);
  if (pattern === '/tools/widgets/scheme') decorateScheme(btn);
  if (pattern === '/tools/widgets/toggle') decorateNavToggle(btn);
}

/**
 * A plain dropdown: the nav item's nested <ul> authored in the fragment.
 * Wrapping it in .menu is what hands it to the base show/hide rules — left
 * unwrapped it renders inline and the whole nav tree sits open on the page.
 */
function decorateMenu(li) {
  const list = li.querySelector(':scope > ul');
  if (!list) return null;
  const wrapper = document.createElement('div');
  wrapper.className = 'menu';
  wrapper.append(list);
  li.append(wrapper);
  return wrapper;
}

function decorateMegaMenu(li) {
  const menu = li.querySelector('.fragment-content');
  if (!menu) return null;
  const wrapper = document.createElement('div');
  wrapper.className = 'mega-menu';
  wrapper.append(menu);
  li.append(wrapper);
  return wrapper;
}

function decorateNavItem(li) {
  li.classList.add('main-nav-item');
  const link = li.querySelector(':scope > p > a');
  if (link) link.classList.add('main-nav-link');
  const menu = decorateMegaMenu(li) || decorateMenu(li);
  if (!(menu || link)) return;
  link.addEventListener('click', (e) => {
    e.preventDefault();
    toggleMenu(li);
  });
}

/**
 * Mobile hamburger. The base header already ships the full-screen
 * `.is-mobile-open` drawer but nothing that opens it, so below 900px the nav
 * is unreachable without this. Synthesized rather than authored so it can't be
 * dropped from the nav fragment.
 */
function decorateMenuToggle(section) {
  const content = section.querySelector('.default-content') || section;
  const btn = document.createElement('button');
  btn.className = 'nav-toggle';
  btn.type = 'button';
  btn.setAttribute('aria-label', 'Menu');
  btn.setAttribute('aria-expanded', 'false');
  for (let i = 0; i < 3; i += 1) btn.append(document.createElement('span'));
  btn.addEventListener('click', () => {
    const header = btn.closest('header');
    const isOpen = header.classList.toggle('is-mobile-open');
    btn.setAttribute('aria-expanded', String(isOpen));
    document.body.classList.toggle('nav-drawer-open', isOpen);
  });
  content.append(btn);
}

function decorateBrandSection(section) {
  section.classList.add('brand-section');
  const brandLink = section.querySelector('a');
  const [, text] = brandLink.childNodes;
  // Both brands use an image-only logo link, which has no text node to promote;
  // without this the base appends a literal "undefined" as the accessible name.
  if (!text) return;
  const span = document.createElement('span');
  span.className = 'brand-text';
  span.append(text);
  brandLink.append(span);
}

function decorateNavSection(section) {
  section.classList.add('main-nav-section');
  const navContent = section.querySelector('.default-content');
  const navList = section.querySelector('ul');
  if (!navList) return;
  navList.classList.add('main-nav-list');

  const nav = document.createElement('nav');
  nav.append(navList);
  navContent.append(nav);

  const mainNavItems = section.querySelectorAll('nav > ul > li');
  for (const navItem of mainNavItems) {
    decorateNavItem(navItem);
  }
}

/**
 * The sibling-site panel — Harris Associates on the Oakmark site and vice
 * versa. Unlike a main-nav mega menu it drops from the very top of the
 * viewport over the whole header, so it gets its own class to key that off.
 *
 * The panel fragment must have more than one section: fragment.js inlines a
 * single-section fragment's children directly and drops the .fragment-content
 * wrapper this looks for.
 */
function decorateSiblingMenu(li) {
  const menu = li.querySelector('.fragment-content');
  if (!menu) return null;

  const wrapper = document.createElement('div');
  wrapper.className = 'mega-menu sibling-menu';
  wrapper.append(menu);

  // Close is chrome, not content — synthesized here so it can't be dropped
  // from the fragment and strand the panel open.
  const close = document.createElement('button');
  close.className = 'sibling-close';
  close.type = 'button';
  close.textContent = 'Close';
  close.addEventListener('click', closeAllMenus);
  const panel = menu.querySelector(':scope > .section:nth-child(2)') || wrapper;
  panel.prepend(close);

  li.append(wrapper);
  return wrapper;
}

function decorateUtilityItem(li) {
  li.classList.add('utility-nav-item');
  const link = li.querySelector(':scope > p > a') || li.querySelector(':scope > a');
  const menu = decorateSiblingMenu(li);
  if (!(menu && link)) return;

  li.classList.add('has-sibling-menu');
  link.classList.add('sibling-trigger');
  link.setAttribute('aria-expanded', 'false');
  link.addEventListener('click', (e) => {
    e.preventDefault();
    toggleMenu(li);
    const isOpen = li.classList.contains('is-open');
    link.setAttribute('aria-expanded', String(isOpen));
    document.body.classList.toggle('sibling-menu-open', isOpen);
  });
}

async function decorateActionSection(section) {
  section.classList.add('actions-section');
  const list = section.querySelector('ul');
  if (!list) return;
  list.classList.add('utility-nav-list');
  for (const li of list.querySelectorAll(':scope > li')) {
    decorateUtilityItem(li);
  }
}

async function decorateHeader(fragment) {
  const sections = fragment.querySelectorAll(':scope > .section');
  if (sections[0]) {
    decorateBrandSection(sections[0]);
    decorateMenuToggle(sections[0]);
  }
  if (sections[1]) decorateNavSection(sections[1]);
  if (sections[2]) decorateActionSection(sections[2]);

  for (const pattern of HEADER_ACTIONS) {
    decorateAction(fragment, pattern);
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeAllMenus();
  });
}

/**
 * loads and decorates the header
 * @param {Element} el The header element
 */
export default async function init(el) {
  // NOT `header` metadata: ak.js already spends that key on the header block's
  // class name, so pointing it at a fragment path renames the block and the
  // page loads /blocks//fragments/nav/header-h/... instead. `header-source` is
  // what picks the per-brand nav on this site (index-h vs index-o).
  const headerMeta = getMetadata('header-source');
  const path = headerMeta || HEADER_PATH;
  try {
    const fragment = await loadFragment(`${locale.prefix}${path}`);
    fragment.classList.add('header-content');
    await decorateHeader(fragment);
    el.append(fragment);
  } catch (e) {
    throw Error(e);
  }
}
