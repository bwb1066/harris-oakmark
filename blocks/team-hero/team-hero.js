/**
 * team-hero — full-bleed photograph with a floating pull-quote card.
 *
 * Authoring contract — two rows, one cell each:
 *
 *   | team-hero |                                    |
 *   | ![background photo](…)                          |
 *   | *__Lead sentence.__ rest of the quote…*         |
 *   | —Name, Title                                    |
 *   | **[Meet Our Team](…)**                          |
 *
 * The card, the attribution and the CTA all come from the second row exactly as
 * authored; this only wraps them so they can be positioned over the image.
 */

export default function init(block) {
  const [mediaRow, contentRow] = [...block.children];
  const picture = mediaRow?.querySelector('picture');

  const media = document.createElement('div');
  media.className = 'team-hero-media';
  if (picture) media.append(picture);

  const cell = contentRow?.firstElementChild || contentRow;
  const paragraphs = cell ? [...cell.children] : [];

  const card = document.createElement('blockquote');
  card.className = 'team-hero-card';

  // The CTA is pulled out of the card so it can sit below it, over the image.
  let cta = null;
  for (const p of paragraphs) {
    const link = p.querySelector('a');
    if (link && !cta) {
      cta = document.createElement('p');
      cta.className = 'team-hero-cta';
      cta.append(link);
    } else {
      card.append(p);
    }
  }

  // Last non-CTA paragraph is the attribution ("—Name, Title").
  const attribution = card.lastElementChild;
  if (attribution && card.children.length > 1) attribution.className = 'team-hero-attribution';

  const inner = document.createElement('div');
  inner.className = 'team-hero-inner';
  inner.append(card);
  if (cta) inner.append(cta);

  block.replaceChildren(media, inner);

  // Above-the-fold-ish and the block's whole point, so don't lazy-load it.
  const img = media.querySelector('img');
  if (img) img.loading = 'eager';
}
