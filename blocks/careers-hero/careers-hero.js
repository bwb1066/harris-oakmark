/**
 * careers-hero — contained photograph with a message centred over it.
 *
 * Authoring contract — two rows, one cell each:
 *
 *   | careers-hero (center) |                         |
 *   | ![background photo](…)                           |
 *   | ## Interested in joining us?                      |
 *   | Supporting sentence.                              |
 *   | **[Explore Careers](…)**                          |
 *
 * The `center` variant centres the copy; without it the copy sits left. Unlike
 * team-hero this one stays inside the page gutters rather than going full bleed.
 */

export default function init(block) {
  const [mediaRow, contentRow] = [...block.children];
  const picture = mediaRow?.querySelector('picture');

  const media = document.createElement('div');
  media.className = 'careers-hero-media';
  if (picture) media.append(picture);

  const cell = contentRow?.firstElementChild || contentRow;
  const content = document.createElement('div');
  content.className = 'careers-hero-content';
  if (cell) content.append(...cell.childNodes);

  const cta = content.querySelector('p:has(a)');
  if (cta) cta.classList.add('careers-hero-cta');

  block.replaceChildren(media, content);

  const img = media.querySelector('img');
  if (img) img.loading = 'eager';
}
