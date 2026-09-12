// Inhalte werden erst beim Scrollen sanft eingeblendet.
const revealElements = document.querySelectorAll('.reveal');

// Der laufende Projektstatus und die Admin-Kontakte werden zentral aktualisiert.
const projectStatus = document.querySelector('.application-status');
if (projectStatus) {
  projectStatus.classList.remove('application-status--open');
  projectStatus.classList.add('application-status--running');
  projectStatus.title = 'Anderath Projekt läuft';
  projectStatus.querySelector('small').textContent = 'PROJEKTSTATUS';
  projectStatus.querySelector('b').textContent = 'ANDERATH PROJEKT LÄUFT';
}

document.querySelectorAll('a[href*="discord.gg"]').forEach((link) => {
  if (link.closest('.buttons') || link.closest('.footer-links')) {
    link.textContent = 'Kontakt mit den Admins aufnehmen';
  }
});

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
