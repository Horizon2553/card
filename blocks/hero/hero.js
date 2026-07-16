function renderHero({
  eyebrow,
  title,
  badge,
  meta,
  description,
  picture,
}) {
  const fragment = document.createDocumentFragment();

  const bg = document.createElement('div');
  bg.className = 'hero-bg';
  bg.append(picture);
  fragment.append(bg);

  const layout = document.createElement('div');
  layout.className = 'hero-layout';

  const text = document.createElement('div');
  text.className = 'hero-text';

  text.append(eyebrow);

  const headline = document.createElement('div');
  headline.className = 'hero-headline';
  headline.append(title, badge);

  text.append(headline);
  text.append(meta, description);

  layout.append(text);
  fragment.append(layout);

  return fragment;
}

export default function decorate(block) {
  const [eyebrow, title, badge, meta, description, image] = block.children;

  eyebrow.classList.add('hero-eyebrow');
  title.classList.add('hero-title');
  badge.classList.add('hero-badge');
  meta.classList.add('hero-meta');
  description.classList.add('hero-description');

  block.replaceChildren(
    renderHero({
      eyebrow,
      title,
      badge,
      meta,
      description,
      picture: image.querySelector('picture'),
    }),
  );
}
