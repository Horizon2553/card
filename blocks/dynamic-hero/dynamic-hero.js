const heroData = {
  eyebrow: 'My Learning',
  title: 'Cohort Configure and Manage Adobe Experience Platform',
  badge: 'In Progress',
  meta: ['Cohort', 'Professional', '4 Weeks'],
  description:
    'Join a four-week cohort experience focused on building practical skills in Adobe Journey Optimizer. Learn through live sessions, guided labs, and peer collaboration as you progress from core concepts to creating personalized, cross-channel customer journeys.',
  image: 'image1.png',
  icon: '/icons/teams.svg',
};

export default function decorate(block) {
  const image = document.createElement('img');
  image.src = heroData.image;
  image.alt = heroData.title;
  image.className = 'dynamic-hero-image';

  const icon = document.createElement('span');
  icon.className = 'hero-icon';
  icon.innerHTML = `
    <img src="${heroData.icon}" alt="">
  `;

  block.classList.add('dynamic-hero');

  block.innerHTML = `
    <div class="dynamic-hero-bg"></div>

    <div class="dynamic-hero-layout">
      <div class="dynamic-hero-text">

        <p class="dynamic-hero-eyebrow">
          ${heroData.eyebrow}
        </p>

        <div class="dynamic-hero-headline">
          <h2 class="dynamic-hero-title">
            ${heroData.title}
          </h2>

          <span class="dynamic-hero-badge">
            ${heroData.badge}
          </span>
        </div>

        <ul class="dynamic-hero-meta">
          <li>${heroData.meta[0]}</li>
          <li>${heroData.meta[1]}</li>
          <li>${heroData.meta[2]}</li>
        </ul>

        <p class="dynamic-hero-description">
          ${heroData.description}
        </p>

      </div>
    </div>
  `;

  block.querySelector('.dynamic-hero-bg').append(image);
  block.querySelector('.dynamic-hero-meta li').prepend(icon);
}