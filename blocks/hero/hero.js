const COHORT_ICON = `<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
  <circle cx="8.5" cy="8" r="3.1" />
  <circle cx="16.5" cy="9.2" r="2.4" />
  <path d="M2.6 18.4c0-3 2.6-4.9 5.9-4.9s5.9 1.9 5.9 4.9" />
  <path d="M15.4 13.8c2.9.1 5 1.9 5 4.6" />
</svg>`;

/** Pull plain text out of an authored cell. */
const cellText = (cell) => (cell ? cell.textContent.trim() : '');


export function readMeta(source) {
  if (!source) return [];
  if (typeof source === 'string') {
    return source.split(/[•|,]/).map((s) => s.trim()).filter(Boolean);
  }
  const items = [...source.querySelectorAll('li')];
  if (items.length) return items.map((li) => li.textContent.trim()).filter(Boolean);
  return readMeta(cellText(source));
}


export function renderHero({
  eyebrow = '', title = '', badge = '', meta = [], description = '', media = null,
  classPrefix = 'hero',
} = {}) {
  const fragment = document.createDocumentFragment();

  if (media) {
    const bg = document.createElement('div');
    bg.className = `${classPrefix}-bg`;
    bg.append(media);
    fragment.append(bg);
  }

  const layout = document.createElement('div');
  layout.className = `${classPrefix}-layout`;
  fragment.append(layout);

  const text = document.createElement('div');
  text.className = `${classPrefix}-text`;
  layout.append(text);

  if (eyebrow) {
    const p = document.createElement('p');
    p.className = `${classPrefix}-eyebrow`;
    p.textContent = eyebrow;
    text.append(p);
  }

  if (title || badge) {
    const headline = document.createElement('div');
    headline.className = `${classPrefix}-headline`;

    if (title) {
      const h1 = document.createElement('h1');
      h1.className = `${classPrefix}-title`;
      h1.textContent = title;
      headline.append(h1);
    }
    if (badge) {
      const span = document.createElement('span');
      span.className = `${classPrefix}-badge`;
      span.textContent = badge;
      headline.append(span);
    }
    text.append(headline);
  }

  if (meta.length) {
    const ul = document.createElement('ul');
    ul.className = `${classPrefix}-meta`;
    meta.forEach((item, i) => {
      const li = document.createElement('li');
      if (i === 0) li.innerHTML = COHORT_ICON;
      li.append(document.createTextNode(item));
      ul.append(li);
    });
    text.append(ul);
  }

  if (description) {
    const p = document.createElement('p');
    p.className = `${classPrefix}-description`;
    p.textContent = description;
    text.append(p);
  }

  return fragment;
}


function primeLcp(picture) {
  if (!picture) return;
  const img = picture.querySelector('img') || picture;
  img.setAttribute('loading', 'eager');
  img.setAttribute('fetchpriority', 'high');
}


function isAutoBlocked(block) {
  return block.children.length === 1
    && !!block.querySelector('h1')
    && !!block.querySelector('picture');
}

/** Read hero field data out of an authored `.hero` block, wherever it came from. */
function parseHeroBlock(block) {
  if (isAutoBlocked(block)) {
    return {
      title: block.querySelector('h1').textContent.trim(),
      media: block.querySelector('picture'),
    };
  }

  const rows = [...block.children].map((row) => row.firstElementChild);
  const [eyebrow, title, badge, meta, description, image] = rows;

  return {
    eyebrow: cellText(eyebrow),
    title: cellText(title),
    badge: cellText(badge),
    meta: readMeta(meta),
    description: cellText(description),
    media: image ? image.querySelector('picture, img') : null,
  };
}

function renderSkeleton() {
  const skeleton = document.createElement('div');
  skeleton.className = 'hero-skeleton';
  skeleton.append(
    document.createElement('span'),
    document.createElement('span'),
    document.createElement('span'),
    document.createElement('span'),
  );
  return skeleton;
}

function renderError() {
  const error = document.createElement('p');
  error.className = 'hero-error';
  error.textContent = 'This hero could not be loaded.';
  return error;
}

/** Resolves media referencing the fetched page's own path back to an absolute URL. */
function resolveMediaBase(scope, path) {
  const base = new URL(path, window.location);
  scope.querySelectorAll('img[src^="./media_"]').forEach((img) => {
    img.src = new URL(img.getAttribute('src'), base).href;
  });
  scope.querySelectorAll('source[srcset^="./media_"]').forEach((source) => {
    source.srcset = new URL(source.getAttribute('srcset'), base).href;
  });
}

/**
 * Fetches the hero content authored on another page, so it can be reused
 * without re-authoring it (e.g. surfacing the same hero across pages).
 * @param {string} path Site-root-relative path to the source page
 * @returns {Promise<object|null>} Parsed hero data, or null if none was found
 */
export async function loadDynamicHero(path) {
  if (!path || !path.startsWith('/') || path.startsWith('//')) return null;
  // the site root's .plain.html 404s; the index document itself resolves correctly
  const fetchPath = path === '/' ? '/index' : path;
  const resp = await fetch(`${fetchPath}.plain.html`);
  if (!resp.ok) return null;

  const doc = document.createElement('div');
  doc.innerHTML = await resp.text();

  const source = doc.querySelector('.hero');
  if (!source) return null;

  resolveMediaBase(source, path);
  return parseHeroBlock(source);
}

async function decorateDynamic(block) {
  const path = block.textContent.trim();

  block.classList.add('is-loading');
  block.textContent = '';
  block.append(renderSkeleton());

  let data;
  try {
    data = await loadDynamicHero(path);
    if (!data) throw new Error(`no hero content found at "${path}"`);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('hero (dynamic): failed to load', error);
    block.textContent = '';
    block.append(renderError());
    return;
  } finally {
    block.classList.remove('is-loading');
  }

  block.textContent = '';
  block.append(renderHero(data));
}

export default async function decorate(block) {
  if (block.classList.contains('dynamic')) {
    await decorateDynamic(block);
    return;
  }

  const data = parseHeroBlock(block);
  primeLcp(data.media);
  const hero = renderHero(data);
  block.textContent = '';
  block.append(hero);
}
