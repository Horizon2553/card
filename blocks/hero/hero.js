function moveField(cell, className) {
  if (!cell || !cell.textContent.trim()) return null;
  cell.className = className;
  return cell;
}

function extractTitle(container) {
  if (!container) return null;
  const heading = container.querySelector('h1, h2, h3, h4, h5, h6');
  if (heading && heading.textContent.trim()) {
    heading.className = 'hero-title';
    return heading;
  }
  if (!container.textContent.trim()) return null;
  const h1 = document.createElement('h1');
  h1.className = 'hero-title';
  const source = container.querySelector('p') || container;
  h1.append(...source.childNodes);
  return h1;
}

function readMeta(cell) {
  if (!cell) return null;
  const list = cell.querySelector('ul, ol');
  if (list && list.children.length) {
    list.className = 'hero-meta';
    return list;
  }
  const icon = cell.querySelector('.icon');
  const text = cell.textContent.trim();
  if (!text) return null;
  const items = text.split(/[•|,]/).map((s) => s.trim()).filter(Boolean);
  if (!items.length) return null;
  const ul = document.createElement('ul');
  ul.className = 'hero-meta';
  items.forEach((item, i) => {
    const li = document.createElement('li');
    if (i === 0 && icon) li.append(icon);
    li.append(document.createTextNode(item));
    ul.append(li);
  });
  return ul;
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
      title: extractTitle(block),
      media: block.querySelector('picture'),
    };
  }

  const [eyebrow, title, badge, meta, description, image] = [...block.children]
    .map((row) => row.firstElementChild);

  return {
    eyebrow: moveField(eyebrow, 'hero-eyebrow'),
    title: extractTitle(title),
    badge: moveField(badge, 'hero-badge'),
    meta: readMeta(meta),
    description: moveField(description, 'hero-description'),
    media: image ? image.querySelector('picture, img') : null,
  };
}

function renderHero({
  eyebrow = null, title = null, badge = null, meta = null, description = null, media = null,
} = {}) {
  const fragment = document.createDocumentFragment();

  if (media) {
    const bg = document.createElement('div');
    bg.className = 'hero-bg';
    bg.append(media);
    fragment.append(bg);
  }

  const layout = document.createElement('div');
  layout.className = 'hero-layout';
  fragment.append(layout);

  const text = document.createElement('div');
  text.className = 'hero-text';
  layout.append(text);

  if (eyebrow) text.append(eyebrow);

  if (title || badge) {
    const headline = document.createElement('div');
    headline.className = 'hero-headline';
    if (title) headline.append(title);
    if (badge) headline.append(badge);
    text.append(headline);
  }

  if (meta) text.append(meta);
  if (description) text.append(description);

  return fragment;
}

function primeLcp(picture) {
  if (!picture) return;
  const img = picture.querySelector('img') || picture;
  img.setAttribute('loading', 'eager');
  img.setAttribute('fetchpriority', 'high');
}

export default async function decorate(block) {
  const data = parseHeroBlock(block);
  primeLcp(data.media);
  const hero = renderHero(data);
  block.textContent = '';
  block.append(hero);
}
