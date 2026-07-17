(() => {
  const params = new URLSearchParams(window.location.search);
  const posterId = params.get('id');

  const preview = document.getElementById('poster-preview');
  const title = document.getElementById('poster-title');
  const lead = document.getElementById('poster-lead');
  const credits = document.getElementById('poster-credits');
  const scientificInfo = document.getElementById('scientific-info');
  const story = document.getElementById('poster-story');

  const formatPosterName = (value) => {
    return String(value || '')
      .replace(/[-_]+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .split(' ')
      .map((word) => word ? word.charAt(0).toUpperCase() + word.slice(1) : '')
      .join(' ');
  };

  const renderSpec = (container, label, value) => {
    const item = document.createElement('div');
    item.className = 'spec-item';

    const specLabel = document.createElement('span');
    specLabel.className = 'spec-label';
    specLabel.textContent = label;

    const specValue = document.createElement('span');
    specValue.className = 'spec-value';
    specValue.textContent = value || 'Not provided';

    item.append(specLabel, specValue);
    container.append(item);
  };

  const renderPreview = (record) => {
    if (!preview) {
      return;
    }

    preview.innerHTML = '';

    const source = record.posterFile || record.file || record.asset;
    if (!source) {
      const empty = document.createElement('div');
      empty.className = 'empty-state';
      empty.textContent = 'No poster file was defined for this bird.';
      preview.append(empty);
      return;
    }

    const resolvedSource = source.startsWith('http') || source.startsWith('/') ? source : source;
    const extension = resolvedSource.split('.').pop().toLowerCase();

    if (extension === 'pdf') {
      const iframe = document.createElement('iframe');
      iframe.src = `${resolvedSource}#toolbar=0&navpanes=0&view=FitH`;
      iframe.title = `${record.commonName} poster preview`;
      iframe.loading = 'lazy';
      preview.append(iframe);
      return;
    }

    const image = document.createElement('img');
    image.src = resolvedSource;
    image.alt = `${record.commonName} poster preview`;
    image.loading = 'lazy';
    preview.append(image);
  };

  const renderRecord = (record) => {
    const displayName = record.commonName || formatPosterName(record.id) || 'Untitled poster';
    document.title = `${displayName} | Kbird Portfolio`;
    title.textContent = displayName;
    lead.textContent = record.description || 'No description provided.';
    credits.textContent = [record.photographer, record.location, record.year].filter(Boolean).join(' • ');

    scientificInfo.innerHTML = '';
    renderSpec(scientificInfo, 'Scientific name', record.scientificName);
    renderSpec(scientificInfo, 'Family', record.family);
    renderSpec(scientificInfo, 'Habitat', record.habitat);
    renderSpec(scientificInfo, 'Conservation', record.conservationStatus || record.conservation);

    story.innerHTML = '';
    const storyParagraphs = Array.isArray(record.story)
      ? record.story
      : typeof record.story === 'string'
        ? record.story.split(/\n\n+/)
        : [record.description || ''];

    storyParagraphs.filter(Boolean).forEach((paragraph) => {
      const p = document.createElement('p');
      p.textContent = paragraph;
      story.append(p);
    });

    renderPreview(record);
  };

  const showMissing = (message) => {
    title.textContent = 'Poster not found';
    lead.textContent = message;
    credits.textContent = '';
    scientificInfo.innerHTML = '';
    story.innerHTML = '';
    if (preview) {
      preview.innerHTML = `<div class="empty-state">${message}</div>`;
    }
  };

  const init = async () => {
    if (!posterId) {
      showMissing('No poster id was provided in the URL. Open a card from the home page to load a bird record.');
      return;
    }

    const posters = Array.isArray(window.KBIRD_POSTERS) ? window.KBIRD_POSTERS : [];
    const poster = posters.find((entry) => entry.id === posterId);

    if (!poster) {
      showMissing(`The registry does not contain an entry for ${posterId}. Add it to data/posters.js and try again.`);
      return;
    }

    try {
      const response = await fetch(`data/birds/${posterId}.json`);
      if (!response.ok) {
        throw new Error(`Could not load data/birds/${posterId}.json`);
      }

      const birdData = await response.json();
      renderRecord({
        ...poster,
        ...birdData,
        year:poster.year || birdData.year || 'Not provided',
      });
    } catch (error) {
      renderRecord(poster);
      if (story && story.childElementCount === 0) {
        const p = document.createElement('p');
        p.textContent = poster.story || 'Detailed story content is not available yet.';
        story.append(p);
      }
      console.warn(error);
    }
  };

  init();
})();