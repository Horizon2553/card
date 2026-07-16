function buildMetaIcon() {
  const img = document.createElement('img');
  img.src = `${window.hlx.codeBasePath}/icons/teams.svg`;
  img.alt = '';
  img.loading = 'lazy';
  img.width = 17;
  img.height = 17;
  return img;
}

function readMeta(meta) {
  if (!meta) return [];
  return meta.split(/[•|,]/).map((s) => s.trim()).filter(Boolean);
}

function readSheetUrl(block) {
  const link = block.querySelector('a[href]');
  const raw = link ? link.getAttribute('href') : block.textContent.trim();
  if (!raw) return null;
  const path = raw.replace(/\.json$/, '');
  return `${path}.json`;
}

function buildMedia(src, alt) {
  if (!src) return null;
  const picture = document.createElement('picture');
  const img = document.createElement('img');
  img.src = src;
  img.alt = alt || 'Hero Image';
  img.loading = 'lazy';
  picture.append(img);
  return picture;
}

function renderCard(row) {
  const card = document.createElement('div');
  card.className = 'dynamic-hero-card';

  const media = buildMedia(row.image, row.title);
  if (media) {
    const bg = document.createElement('div');
    bg.className = 'dynamic-hero-bg';
    bg.append(media);
    card.append(bg);
  }

  const layout = document.createElement('div');
  layout.className = 'dynamic-hero-layout';
  card.append(layout);

  const text = document.createElement('div');
  text.className = 'dynamic-hero-text';
  layout.append(text);

  if (row.eyebrow) {
    const p = document.createElement('p');
    p.className = 'dynamic-hero-eyebrow';
    p.textContent = row.eyebrow;
    text.append(p);
  }

  if (row.title || row.badge) {
    const headline = document.createElement('div');
    headline.className = 'dynamic-hero-headline';

    if (row.title) {
      const heading = document.createElement('h2');
      heading.className = 'dynamic-hero-title';
      heading.textContent = row.title;
      headline.append(heading);
    }
    if (row.badge) {
      const span = document.createElement('span');
      span.className = 'dynamic-hero-badge';
      span.textContent = row.badge;
      headline.append(span);
    }
    text.append(headline);
  }

  const meta = readMeta(row.meta);
  if (meta.length) {
    const ul = document.createElement('ul');
    ul.className = 'dynamic-hero-meta';
    meta.forEach((item, i) => {
      const li = document.createElement('li');
      if (i === 0) li.append(buildMetaIcon());
      li.append(document.createTextNode(item));
      ul.append(li);
    });
    text.append(ul);
  }

  if (row.description) {
    const p = document.createElement('p');
    p.className = 'dynamic-hero-description';
    p.textContent = row.description;
    text.append(p);
  }

  return card;
}

export default async function decorate(block) {
  const sheetUrl = readSheetUrl(block);
  block.textContent = '';
  if (!sheetUrl) return;

  const resp = await fetch(sheetUrl);
  if (!resp.ok) return;
  const { data } = await resp.json();
  if (!Array.isArray(data) || !data.length) return;

  data.forEach((row) => block.append(renderCard(row)));
}
