import { renderHero, readMeta } from '../hero/hero.js';

function readSheetUrl(block) {
  const link = block.querySelector('a[href]');
  const raw = link ? link.getAttribute('href') : block.textContent.trim();
  if (!raw) return null;
  const path = raw.replace(/\.json$/, '');
  return `${path}.json`;
}

/**
 * Builds a plain `<picture>` for a sheet-authored image URL.
 * Unlike `createOptimizedPicture`, this keeps the URL's query string intact,
 * since sheet images are often external, signed CDN links (e.g. a
 * `cp_oauth_jwt` token) rather than AEM-hosted assets that support
 * width/format optimization params.
 */
function buildMedia(src, alt) {
  if (!src) return null;
  const picture = document.createElement('picture');
  const img = document.createElement('img');
  img.src = src;
  img.alt = alt || '';
  img.loading = 'lazy';
  picture.append(img);
  return picture;
}

export default async function decorate(block) {
  const sheetUrl = readSheetUrl(block);
  block.textContent = '';
  if (!sheetUrl) return;

  const resp = await fetch(sheetUrl);
  if (!resp.ok) return;
  const { data } = await resp.json();
  if (!Array.isArray(data) || !data.length) return;

  data.forEach((row) => {
    const card = document.createElement('div');
    card.className = 'dynamic-hero-card';
    card.append(renderHero({
      eyebrow: row.eyebrow,
      title: row.title,
      badge: row.badge,
      meta: readMeta(row.meta),
      description: row.description,
      media: buildMedia(row.image, row.title),
      classPrefix: 'dynamic-hero',
    }));
    block.append(card);
  });
}
