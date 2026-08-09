// Inhalte werden erst beim Scrollen sanft eingeblendet.
const revealElements = document.querySelectorAll('.reveal');

// Kompakte Kurzversion direkt unter dem großen Anderath-Video verankern.
const fullVideoLink = document.querySelector('.hero-video-link');
if (fullVideoLink) {
  const shortVideoWrap = document.createElement('div');
  shortVideoWrap.className = 'short-video-wrap';
  shortVideoWrap.setAttribute('aria-label', 'Kurzversion des Anderath-Videos');
  shortVideoWrap.innerHTML = `
    <div class="short-video-pointer" aria-hidden="true"><span>Kurzversion</span><i></i></div>
    <video class="short-video" controls preload="metadata" playsinline aria-label="Anderath Kurzversion">
      <source src="assets/Anderath%20Short.mp4" type="video/mp4">
      Dein Browser unterstützt die Videowiedergabe nicht.
    </video>`;
  fullVideoLink.insertAdjacentElement('afterend', shortVideoWrap);
}

if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -45px' });

  revealElements.forEach((element) => revealObserver.observe(element));
} else {
  revealElements.forEach((element) => element.classList.add('is-visible'));
}

// Im FAQ bleibt immer nur eine Antwort geöffnet, damit es kompakt bleibt.
const faqItems = document.querySelectorAll('.accordion details');
faqItems.forEach((item) => {
  item.addEventListener('toggle', () => {
    if (!item.open) return;
    faqItems.forEach((otherItem) => {
      if (otherItem !== item) otherItem.removeAttribute('open');
    });
  });
});
