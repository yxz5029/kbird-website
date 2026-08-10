(() => {
  const posters = Array.isArray(window.KBIRD_POSTERS) ? window.KBIRD_POSTERS : [];
  const tocList = document.getElementById('toc-list');
  const heroTrack = document.getElementById('hero-strip-track');

  const formatPosterName = (value) => {
    return String(value || '')
      .replace(/[-_]+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .split(' ')
      .map((word) => word ? word.charAt(0).toUpperCase() + word.slice(1) : '')
      .join(' ');
  };

  if (!tocList && !heroTrack) {
    return;
  }

  const createHeroCard = (poster, heroIndex) => {
    const card = document.createElement('a');
    card.className = 'hero-strip__slide';
    card.href = `./poster.html?id=${encodeURIComponent(poster.id)}`;
    card.setAttribute('aria-label', `Open ${formatPosterName(poster.commonName || poster.id)}`);

    const image = document.createElement('img');
    image.alt = `${poster.commonName} preview`;
    image.loading = heroIndex < 6 ? 'eager' : 'lazy';
    image.width = 600;
    image.height = 800;
    image.src = poster.coverImage || poster.image || `data:image/svg+xml;charset=UTF-8,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 800"><rect width="600" height="800" fill="#0b1a12"/><text x="50%" y="50%" fill="#dce7de" font-size="28" text-anchor="middle">Poster preview</text></svg>')}`;

    card.append(image);
    return card;
  };

  const createChip = (poster, index) => {                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            
    const link = document.createElement('a');
    link.className = 'toc-chip toc-chip--simple';
    link.href = `./poster.html?id=${encodeURIComponent(poster.id)}`;

    const label = document.createElement('span');
    const year = poster.year ? ` (${poster.year})` : '';
    label.className = 'toc-chip__label';
    // 关键修改：直接使用传入的 index（反序值）
    label.textContent = `${String(index).padStart(2, '0')}. ${formatPosterName(poster.commonName || poster.id)}${year}`;

    link.append(label);
    return link;
  };

  if (tocList) {
    tocList.innerHTML = '';
    posters.forEach((poster, index) => {
      // 关键修改：计算反序编号
      const reversedIndex = posters.length - index;
      tocList.append(createChip(poster, reversedIndex));
    });
  }

  if (heroTrack) {
    heroTrack.innerHTML = '';
    const visiblePosters = posters;
    visiblePosters.forEach((poster, index) => heroTrack.append(createHeroCard(poster, index)));
    visiblePosters.forEach((poster, index) => heroTrack.append(createHeroCard(poster, visiblePosters.length + index)));

    if (visiblePosters.length === 0) {
      const empty = document.createElement('div');
      empty.className = 'hero-strip__empty';
      empty.textContent = 'Add poster entries to data/posters.js to show the rolling stack.';
      heroTrack.append(empty);
    }

    window.addEventListener('DOMContentLoaded', () => {
      heroTrack.classList.add('hero-strip__track--animated');
    });
  }
})();