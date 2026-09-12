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

// Zeigt ausschließlich laufende Anderath-Streams aus der hinterlegten Creator-Liste.
const statsSection = document.querySelector('.stats');
if (statsSection) {
  const liveSection = document.createElement('section');
  liveSection.className = 'section twitch-live';
  liveSection.id = 'live-streams';
  liveSection.innerHTML = `
    <div class="container">
      <div class="twitch-live-heading reveal">
        <div><p class="pixel">JETZT AUF TWITCH</p><h2>Anderath ist <span>live.</span></h2></div>
        <p>Hier findest du alle teilnehmenden Creator, die gerade mit <strong>Anderath|</strong> im Streamtitel live sind.</p>
      </div>
      <div class="twitch-stream-grid" aria-live="polite" aria-busy="true">
        <div class="twitch-live-state"><i></i><span>Live-Streams werden geladen …</span></div>
      </div>
    </div>`;
  statsSection.insertAdjacentElement('afterend', liveSection);

  const streamGrid = liveSection.querySelector('.twitch-stream-grid');
  const escapeHtml = (value) => String(value).replace(/[&<>'"]/g, (character) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
  })[character]);
  fetch('twitch-live.php', { headers: { Accept: 'application/json' } })
    .then((response) => {
      if (!response.ok) throw new Error('Live-Daten nicht verfügbar');
      return response.json();
    })
    .then(({ streams = [] }) => {
      streamGrid.setAttribute('aria-busy', 'false');
      if (!streams.length) {
        streamGrid.innerHTML = '<a class="twitch-live-state is-offline" href="https://twitch.tv/amdonlive" target="_blank" rel="noopener noreferrer"><i></i><span>Gerade ist niemand mit <b>Anderath|</b> live. Besuche solange <b>AmdonLive auf Twitch ↗</b></span></a>';
        return;
      }
      streamGrid.innerHTML = streams.map((stream) => `
        <a class="twitch-stream-card" href="${escapeHtml(stream.url)}" target="_blank" rel="noopener noreferrer">
          <span class="twitch-thumbnail"><img src="${escapeHtml(stream.thumbnail)}" alt="Vorschaubild von ${escapeHtml(stream.name)}" loading="lazy"><b>LIVE</b><em>${Number(stream.viewers).toLocaleString('de-DE')} Zuschauer</em></span>
          <span class="twitch-stream-copy"><strong>${escapeHtml(stream.name)}</strong><span>${escapeHtml(stream.title)}</span><small>${escapeHtml(stream.game || 'Anderath 4.0')} · Auf Twitch ansehen ↗</small></span>
        </a>`).join('');
    })
    .catch(() => {
      streamGrid.setAttribute('aria-busy', 'false');
      streamGrid.innerHTML = '<div class="twitch-live-state is-offline"><i></i><span>Die Live-Anzeige wird gerade eingerichtet.</span></div>';
    });
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
