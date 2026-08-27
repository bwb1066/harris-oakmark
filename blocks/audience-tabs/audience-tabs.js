/**
 * audience-tabs — "who are you?" selector from the Harris homepage.
 *
 * A list of audiences on the left; picking one swaps the image and caption on
 * the right. The active audience gets an outlined box, a bold title with a
 * marker, and a Learn More affordance.
 *
 * Authoring contract — one row per audience, two cells each:
 *
 *   | audience-tabs |                                         |
 *   | ## INDIVIDUALS          | ![image](…)                    |
 *   | ### Individuals + Fam.. | Since 1976, we've been working… |
 *   | **Learn More**          |                                 |
 *
 * Every link in a row points at the same destination, so the whole tab and the
 * whole caption are made clickable rather than just the "Learn More" text.
 *
 * The authored markup arrives as `<strong><a>` inside headings, which ak.js's
 * decorateButton turns into `.btn` pills. This rebuilds the DOM from the text
 * and hrefs, so those classes are discarded rather than fought with CSS.
 */

function textOf(el) {
  return el ? el.textContent.replace(/\s+/g, ' ').trim() : '';
}

function hrefOf(row) {
  const link = row.querySelector('a[href]');
  return link ? link.getAttribute('href') : null;
}

/** Pull one authored row apart into the pieces the layout needs. */
function readRow(row) {
  const [labels, media] = row.children;
  if (!labels) return null;
  return {
    href: hrefOf(row),
    eyebrow: textOf(labels.querySelector('h2, h3, h4, h5, h6')),
    title: textOf(labels.querySelectorAll('h2, h3, h4, h5, h6')[1]),
    more: textOf(labels.querySelector('p')) || 'Learn More',
    picture: media?.querySelector('picture') || null,
    caption: textOf(media?.querySelector('p:not(:has(picture)) a, p:not(:has(picture))')),
  };
}

function buildTab(item, idx) {
  const li = document.createElement('li');
  li.className = 'audience-tab';

  const link = document.createElement(item.href ? 'a' : 'button');
  link.className = 'audience-tab-link';
  if (item.href) link.href = item.href;
  else link.type = 'button';
  link.dataset.index = String(idx);

  const eyebrow = document.createElement('span');
  eyebrow.className = 'audience-tab-eyebrow';
  eyebrow.textContent = item.eyebrow;

  const title = document.createElement('span');
  title.className = 'audience-tab-title';
  title.textContent = item.title;

  const more = document.createElement('span');
  more.className = 'audience-tab-more';
  more.textContent = item.more;

  link.append(eyebrow, title, more);
  li.append(link);
  return li;
}

function buildPanel(item, idx) {
  const panel = document.createElement('figure');
  panel.className = 'audience-panel';
  panel.dataset.index = String(idx);

  if (item.picture) {
    const frame = document.createElement('div');
    frame.className = 'audience-panel-media';
    frame.append(item.picture);
    panel.append(frame);
  }

  if (item.caption) {
    const cap = document.createElement(item.href ? 'a' : 'figcaption');
    cap.className = 'audience-panel-caption';
    if (item.href) cap.href = item.href;
    const text = document.createElement('span');
    text.textContent = item.caption;
    cap.append(text);
    panel.append(cap);
  }

  return panel;
}

export default function init(el) {
  const items = [...el.children].map(readRow).filter((i) => i && (i.title || i.eyebrow));
  if (!items.length) return;

  const inner = document.createElement('div');
  inner.className = 'audience-tabs-inner';

  const list = document.createElement('ul');
  list.className = 'audience-tabs-list';

  const media = document.createElement('div');
  media.className = 'audience-tabs-media';

  const tabs = items.map(buildTab);
  const panels = items.map(buildPanel);
  list.append(...tabs);
  media.append(...panels);
  inner.append(list, media);

  let active = -1;
  const select = (idx) => {
    if (idx === active || idx < 0 || idx >= tabs.length) return;
    active = idx;
    tabs.forEach((t, i) => t.classList.toggle('is-active', i === idx));
    panels.forEach((p, i) => p.classList.toggle('is-active', i === idx));
  };

  tabs.forEach((tab, idx) => {
    const link = tab.firstElementChild;
    // Pointer and keyboard both preview; the click itself still navigates.
    link.addEventListener('mouseenter', () => select(idx));
    link.addEventListener('focus', () => select(idx));
    // Touch has no hover, so a first tap should reveal the panel rather than
    // navigate straight past it.
    link.addEventListener('click', (e) => {
      if (active !== idx && window.matchMedia('(hover: none)').matches) {
        e.preventDefault();
        select(idx);
      }
    });
  });

  select(0);
  el.replaceChildren(inner);
}
