import { getConfig, loadStyle } from './ak.js';

/**
 * Section-style enhancers.
 *
 * These homepage sections are authored as plain prose with a Section Metadata
 * `style` value, so there is no block JS to hang behaviour off. Rather than
 * asking authors to restructure content into block tables, each enhancer groups
 * the flat heading/paragraph sequence into the elements the layout needs.
 *
 * Everything is keyed off the section's style class, and the stylesheet is only
 * fetched when one of these sections is actually on the page — so this costs
 * nothing on pages that don't use them.
 */

/** Wrap each <h3> and the paragraph after it into one element. */
function groupHeadingPairs(items, className) {
  const groups = [];
  for (const el of items) {
    if (el.tagName === 'H3') {
      const group = document.createElement('div');
      group.className = className;
      el.replaceWith(group);
      group.append(el);
      groups.push(group);
    } else if (groups.length) {
      groups[groups.length - 1].append(el);
    }
  }
  return groups;
}

/** "Who we are" — intro, then three principles side by side, then a CTA. */
function principles(section) {
  const content = section.querySelector('.default-content');
  if (!content) return;
  const kids = [...content.children];

  const intro = document.createElement('div');
  intro.className = 'principles-intro';
  intro.append(kids[0], kids[1]);

  // Last paragraph is the CTA; everything between is the h3/p pairs.
  const cta = kids[kids.length - 1];
  cta.className = 'principles-cta';

  const grid = document.createElement('div');
  grid.className = 'principles-grid';
  groupHeadingPairs(kids.slice(2, -1), 'principle').forEach((g) => grid.append(g));

  content.replaceChildren(intro, grid, cta);
}

/** "Value seekers" — intro, a focus list on the left, dot field on the right. */
function valueFocus(section) {
  const content = section.querySelector('.default-content');
  if (!content) return;
  const kids = [...content.children];

  const intro = document.createElement('div');
  intro.className = 'value-focus-intro';
  intro.append(kids[0], kids[1]);

  // kids[2] is the "Our Focus" sub-heading that labels the list.
  const focus = document.createElement('div');
  focus.className = 'value-focus-list';
  focus.append(kids[2]);
  groupHeadingPairs(kids.slice(3, -1), 'value-focus-item').forEach((g) => focus.append(g));

  const cta = kids[kids.length - 1];
  cta.className = 'value-focus-cta';

  // Purely decorative dot field, drawn in CSS.
  const art = document.createElement('div');
  art.className = 'value-focus-art';
  art.setAttribute('aria-hidden', 'true');

  const cols = document.createElement('div');
  cols.className = 'value-focus-cols';
  cols.append(focus, art);

  content.replaceChildren(intro, cols, cta);
}

/** Turn a "Label" paragraph plus the list after it into a labelled select. */
function listToSelect(label, list) {
  const field = document.createElement('label');
  field.className = 'strategy-field';

  const text = document.createElement('span');
  text.className = 'strategy-field-label';
  text.textContent = label.textContent.trim();

  const select = document.createElement('select');
  const placeholder = document.createElement('option');
  placeholder.textContent = label.textContent.trim();
  placeholder.value = '';
  select.append(placeholder);

  for (const li of list.querySelectorAll('li')) {
    const option = document.createElement('option');
    option.textContent = li.textContent.trim();
    const link = li.querySelector('a');
    option.value = link ? link.href : li.textContent.trim();
    select.append(option);
  }

  // Only navigate when the option actually carries a destination.
  select.addEventListener('change', () => {
    if (select.value.startsWith('http')) window.location.assign(select.value);
  });

  field.append(text, select);
  return field;
}

/** "Explore your investment options" — two dropdowns separated by "or". */
function strategyFinder(section) {
  const content = section.querySelector('.default-content');
  if (!content) return;
  const kids = [...content.children];

  const intro = document.createElement('div');
  intro.className = 'strategy-intro';
  intro.append(kids[0], kids[1]);

  const fields = document.createElement('div');
  fields.className = 'strategy-fields';

  // The label is the paragraph immediately before each list.
  const lists = kids.filter((el) => el.tagName === 'UL'
    && el.previousElementSibling?.tagName === 'P');

  for (const list of lists) {
    if (fields.children.length) {
      const or = document.createElement('span');
      or.className = 'strategy-or';
      or.textContent = 'or';
      fields.append(or);
    }
    fields.append(listToSelect(list.previousElementSibling, list));
  }

  content.replaceChildren(intro, fields);
}

const ENHANCERS = {
  principles,
  'value-focus': valueFocus,
  'strategy-finder': strategyFinder,
};

export default async function enhanceSections(area = document) {
  const selector = Object.keys(ENHANCERS).map((c) => `.section.${c}`).join(',');
  const sections = [...area.querySelectorAll(selector)];
  if (!sections.length) return;

  const { codeBase } = getConfig();
  await loadStyle(`${codeBase}/styles/sections.css`);

  for (const section of sections) {
    const style = Object.keys(ENHANCERS).find((c) => section.classList.contains(c));
    if (style && !section.dataset.enhanced) {
      section.dataset.enhanced = style;
      ENHANCERS[style](section);
    }
  }
}
