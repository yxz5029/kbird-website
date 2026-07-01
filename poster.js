(() => {
  const params = new URLSearchParams(window.location.search);
  const posterId = params.get('id');

  const preview = document.getElementById('poster-preview');
  const title = document.getElementById('poster-title');
  const lead = document.getElementById('poster-lead');
  const status = document.getElementById('poster-status');
  const credits = document.getElementById('poster-credits');
  const scientificInfo = document.getElementById('scientific-info');
  const story = document.getElementById('poster-story');
  const cameraSpecs = document.getElementById('camera-specs');

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
    document.title = `${record.commonName} | Kbird Portfolio`;
    title.textContent = record.commonName || 'Untitled poster';
    lead.textContent = record.summary || record.description || 'No summary provided.';
    status.textContent = record.status || 'Curated poster';
    credits.textContent = [record.photographer, record.location, record.year].filter(Boolean).join(' • ');

    scientificInfo.innerHTML = '';
    renderSpec(scientificInfo, 'Scientific name', record.scientificName);
    renderSpec(scientificInfo, 'Common order', record.order);
    renderSpec(scientificInfo, 'Family', record.family);
    renderSpec(scientificInfo, 'Habitat', record.habitat);
    renderSpec(scientificInfo, 'Range', record.range);
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

    cameraSpecs.innerHTML = '';
    const camera = record.camera || {};
    renderSpec(cameraSpecs, 'Body', camera.body);
    renderSpec(cameraSpecs, 'Lens', camera.lens);
    renderSpec(cameraSpecs, 'Aperture', camera.aperture);
    renderSpec(cameraSpecs, 'Shutter', camera.shutter);
    renderSpec(cameraSpecs, 'ISO', camera.iso);
    renderSpec(cameraSpecs, 'Location', camera.location || record.location);

    renderPreview(record);
  };

  const showMissing = (message) => {
    title.textContent = 'Poster not found';
    lead.textContent = message;
    status.textContent = 'Missing record';
    credits.textContent = '';
    scientificInfo.innerHTML = '';
    cameraSpecs.innerHTML = '';
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
      });
    } catch (error) {
      renderRecord(poster);
      if (lead) {
        lead.textContent = poster.summary || poster.description || 'Poster metadata loaded from the registry because the detailed JSON file was unavailable.';
      }
      if (story && story.childElementCount === 0) {
        const p = document.createElement('p');
        p.textContent = poster.story || poster.summary || 'Detailed story content is not available yet.';
        story.append(p);
      }
      if (cameraSpecs && cameraSpecs.childElementCount === 0) {
        renderSpec(cameraSpecs, 'Body', poster.camera?.body);
        renderSpec(cameraSpecs, 'Lens', poster.camera?.lens);
      }
      console.warn(error);
    }
  };

  init();
})();