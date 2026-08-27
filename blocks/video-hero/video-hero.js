/**
 * video-hero — full-bleed looping video behind a floating content card.
 *
 * Based on the Tumi replica's video-hero, adapted to this site's authoring and
 * to one extra behaviour: the video plays a fixed number of loops and then
 * hands over to a still image, so a long visit doesn't sit under perpetual
 * motion.
 *
 * Authoring contract — two rows, one cell each:
 *
 *   | video-hero |                                          |
 *   | <link to the .mp4> ![still image](…)                   |
 *   | # Headline / ![logo](…) / **[Learn more](…)**          |
 *
 * The first row's link is the video; the picture beside it is the still shown
 * once the loops are done (and the poster before the video can paint). The
 * second row is the card: headline, optional logo lockup, optional CTA.
 */

const LOOPS = 4;

function buildVideo(src, poster) {
  const video = document.createElement('video');
  // Autoplay only survives if the video is muted and inline; `muted` has to be
  // set as a property as well as an attribute for Safari to honour it.
  video.autoplay = true;
  video.muted = true;
  video.setAttribute('muted', '');
  video.setAttribute('playsinline', '');
  video.setAttribute('preload', 'auto');
  video.setAttribute('aria-hidden', 'true');
  // Deliberately NOT the `loop` attribute: looping natively never fires
  // `ended`, so there would be nothing to count.
  if (poster) video.poster = poster;

  const source = document.createElement('source');
  source.src = src;
  if (src.includes('.m3u8')) source.type = 'application/x-mpegURL';
  else if (src.includes('.webm')) source.type = 'video/webm';
  else source.type = 'video/mp4';
  video.append(source);
  return video;
}

/** Play `LOOPS` times, then settle on the still. */
function wireLoops(block, video, still) {
  let played = 0;
  video.addEventListener('ended', () => {
    played += 1;
    if (played < LOOPS) {
      video.currentTime = 0;
      video.play().catch(() => { /* autoplay refused — the still takes over */ });
      return;
    }
    block.classList.add('is-settled');
  });

  // If the browser refuses to autoplay at all, don't leave a black rectangle.
  video.play().catch(() => block.classList.add('is-settled'));
  if (!still) return;
  still.setAttribute('aria-hidden', 'true');
}

function buildPauseButton(block, video) {
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'video-hero-pause';
  const setState = (paused) => {
    btn.setAttribute('aria-label', paused ? 'Play background video' : 'Pause background video');
    btn.innerHTML = paused
      ? '<span aria-hidden="true">&#9654;</span>'
      : '<span aria-hidden="true">&#9646;&#9646;</span>';
  };
  setState(false);
  btn.addEventListener('click', () => {
    if (video.paused) video.play(); else video.pause();
    setState(video.paused);
  });
  return btn;
}

function buildScrollCue(block) {
  const cue = document.createElement('button');
  cue.type = 'button';
  cue.className = 'video-hero-scroll';
  cue.innerHTML = '<span class="video-hero-chevron" aria-hidden="true"></span><span>scroll</span>';
  cue.addEventListener('click', () => {
    const next = block.closest('.section')?.nextElementSibling;
    (next || block).scrollIntoView({ block: 'start' });
  });
  return cue;
}

export default function init(block) {
  const [mediaRow, contentRow] = [...block.children];
  const videoLink = mediaRow?.querySelector('a[href]');
  if (!videoLink) return;

  // Resolved href, not the raw attribute: a DA-hosted asset is authored as
  // `./media_<hash>.mp4` relative to the page, while a repo-hosted one is
  // root-relative. Letting the browser resolve it means either form works.
  const src = videoLink.href;
  const stillPicture = mediaRow.querySelector('picture');
  const stillSrc = stillPicture?.querySelector('img')?.src || '';

  const media = document.createElement('div');
  media.className = 'video-hero-media';

  const video = buildVideo(src, stillSrc);
  media.append(video);

  let still = null;
  if (stillPicture) {
    still = document.createElement('div');
    still.className = 'video-hero-still';
    still.append(stillPicture);
    media.append(still);
  }

  // The card keeps its authored markup — headline, logo and CTA are already
  // the right elements, and ak.js has decorated the CTA into a .btn.
  const card = document.createElement('div');
  card.className = 'video-hero-card';
  const cardContent = contentRow?.firstElementChild || contentRow;
  if (cardContent) card.append(...cardContent.childNodes);

  block.replaceChildren(media, card, buildPauseButton(block, video), buildScrollCue(block));

  // This hero is above the fold, so nothing in it should be lazy — the authored
  // images arrive with loading="lazy", which delays the logo and the still and
  // works against LCP.
  for (const img of block.querySelectorAll('img')) {
    img.loading = 'eager';
    img.fetchPriority = 'high';
  }

  wireLoops(block, video, still);
}
