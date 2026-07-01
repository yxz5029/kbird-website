(() => {
  const posters = Array.isArray(window.KBIRD_POSTERS) ? window.KBIRD_POSTERS : [];
  const tocList = document.getElementById('toc-list');
  const heroTrack = document.getElementById('hero-strip-track');

  if (!tocList && !heroTrack) {
    return;
  }

  const createHeroCard = (poster) => {
    const card = document.createElement('a');
    card.className = 'hero-strip__slide';
    card.href = `poster.html?id=${encodeURIComponent(poster.id)}`;
    card.setAttribute('aria-label', `Open ${poster.commonName}`);

    const image = document.createElement('img');
    image.alt = `${poster.commonName} preview`;
    image.loading = 'lazy';
    image.src = poster.coverImage || poster.image || `data:image/svg+xml;charset=UTF-8,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 800"><rect width="600" height="800" fill="#0b1a12"/><text x="50%" y="50%" fill="#dce7de" font-size="28" text-anchor="middle">Poster preview</text></svg>')}`;

    card.append(image);
    return card;
  };

  const createChip = (poster, index) => {
    const link = document.createElement('a');
    link.className = 'toc-chip toc-chip--simple';
    link.href = `poster.html?id=${encodeURIComponent(poster.id)}`;

    const label = document.createElement('span');
    label.className = 'toc-chip__label';
    label.textContent = `${String(index + 1).padStart(2, '0')}. ${poster.commonName}`;

    link.append(label);
    return link;
  };

  if (tocList) {
    tocList.innerHTML = '';
    posters.forEach((poster, index) => tocList.append(createChip(poster, index)));
  }

  if (heroTrack) {
    heroTrack.innerHTML = '';
    const visiblePosters = posters.slice(0, 6);
    visiblePosters.forEach((poster) => heroTrack.append(createHeroCard(poster)));
    visiblePosters.forEach((poster) => heroTrack.append(createHeroCard(poster)));

    if (visiblePosters.length === 0) {
      const empty = document.createElement('div');
      empty.className = 'hero-strip__empty';
      empty.textContent = 'Add poster entries to data/posters.js to show the rolling stack.';
      heroTrack.append(empty);
    }
  }
})();