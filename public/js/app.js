(() => {
  const IMG_BASE = 'https://image.tmdb.org/t/p/w500';
  const BACKDROP_BASE = 'https://image.tmdb.org/t/p/w1280';
  const FAVORITES_KEY = 'moviesss:favorites';

  const state = {
    view: 'browse', // 'browse' | 'favorites'
    mode: 'discover', // 'discover' | 'search'
    sort: 'popularity',
    genre: '',
    year: '',
    query: '',
    page: 1,
    totalPages: 1,
  };

  const els = {
    grid: document.getElementById('movie-grid'),
    status: document.getElementById('status'),
    pagination: document.getElementById('pagination'),
    sectionTitle: document.getElementById('section-title'),
    sortTabs: document.getElementById('sort-tabs'),
    genrePills: document.getElementById('genre-pills'),
    yearSelect: document.getElementById('year-select'),
    filters: document.getElementById('filters'),
    searchForm: document.getElementById('search-form'),
    searchInput: document.getElementById('search-input'),
    topnavLinks: document.querySelectorAll('.topnav__link'),
    modalOverlay: document.getElementById('modal-overlay'),
    modalContent: document.getElementById('modal-content'),
    modalClose: document.getElementById('modal-close'),
  };

  function getFavorites() {
    try {
      return JSON.parse(localStorage.getItem(FAVORITES_KEY)) || [];
    } catch (err) {
      return [];
    }
  }

  function isFavorite(id) {
    return getFavorites().some((movie) => movie.id === id);
  }

  function toggleFavorite(movie) {
    const favorites = getFavorites();
    const index = favorites.findIndex((m) => m.id === movie.id);
    if (index === -1) {
      favorites.push(movie);
    } else {
      favorites.splice(index, 1);
    }
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
    return index === -1; // true if it was just added
  }

  function setStatus(message) {
    if (!message) {
      els.status.hidden = true;
      els.status.textContent = '';
      return;
    }
    els.status.hidden = false;
    els.status.textContent = message;
  }

  function formatYear(dateStr) {
    return dateStr ? dateStr.slice(0, 4) : '—';
  }

  function buildYearOptions() {
    const currentYear = new Date().getFullYear();
    const fragment = document.createDocumentFragment();
    for (let year = currentYear + 1; year >= 1950; year -= 1) {
      const option = document.createElement('option');
      option.value = String(year);
      option.textContent = String(year);
      fragment.appendChild(option);
    }
    els.yearSelect.appendChild(fragment);
  }

  async function loadGenres() {
    try {
      const response = await fetch('/api/genres');
      if (!response.ok) throw new Error('Failed to load genres');
      const genres = await response.json();

      const fragment = document.createDocumentFragment();
      genres.forEach((genre) => {
        const btn = document.createElement('button');
        btn.className = 'pill pill--genre';
        btn.dataset.genre = String(genre.id);
        btn.textContent = genre.name;
        fragment.appendChild(btn);
      });
      els.genrePills.appendChild(fragment);
    } catch (err) {
      console.error(err);
      // Non-fatal: browsing still works without genre filters.
    }
  }

  function renderCard(movie) {
    const card = document.createElement('div');
    card.className = 'card';
    card.dataset.id = String(movie.id);

    const posterSrc = movie.poster_path
      ? `${IMG_BASE}${movie.poster_path}`
      : null;

    const rating = typeof movie.vote_average === 'number'
      ? movie.vote_average.toFixed(1)
      : 'N/A';

    card.innerHTML = `
      <div class="card__poster-wrap">
        ${posterSrc
          ? `<img class="card__poster" src="${posterSrc}" alt="${escapeHtml(movie.title)} poster" loading="lazy" />`
          : `<div class="card__poster" style="display:flex;align-items:center;justify-content:center;color:var(--text-muted);font-size:12px;padding:12px;text-align:center;">No poster available</div>`}
        <span class="card__rating">
          <svg viewBox="0 0 24 24"><polygon points="12,2 15,9 22,9.5 17,14.5 18.5,22 12,18 5.5,22 7,14.5 2,9.5 9,9"></polygon></svg>
          ${rating}
        </span>
      </div>
      <div class="card__title">${escapeHtml(movie.title)}</div>
      <div class="card__year">${formatYear(movie.release_date)}</div>
    `;

    card.addEventListener('click', () => openMovieModal(movie.id));
    return card;
  }

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str || '';
    return div.innerHTML;
  }

  function renderGrid(movies) {
    els.grid.innerHTML = '';
    if (!movies.length) {
      setStatus('No movies found. Try a different search or filter.');
      return;
    }
    setStatus('');
    const fragment = document.createDocumentFragment();
    movies.forEach((movie) => fragment.appendChild(renderCard(movie)));
    els.grid.appendChild(fragment);
  }

  function renderPagination() {
    const { page, totalPages } = state;
    els.pagination.innerHTML = '';

    if (totalPages <= 1) {
      els.pagination.hidden = true;
      return;
    }
    els.pagination.hidden = false;

    const maxButtons = 7;
    const pages = [];
    const clampedTotal = Math.min(totalPages, 500); // TMDb caps at 500 pages

    if (clampedTotal <= maxButtons) {
      for (let i = 1; i <= clampedTotal; i += 1) pages.push(i);
    } else {
      pages.push(1);
      let start = Math.max(2, page - 1);
      let end = Math.min(clampedTotal - 1, page + 1);
      if (page <= 3) end = 4;
      if (page >= clampedTotal - 2) start = clampedTotal - 3;
      if (start > 2) pages.push('...');
      for (let i = start; i <= end; i += 1) pages.push(i);
      if (end < clampedTotal - 1) pages.push('...');
      pages.push(clampedTotal);
    }

    const prevBtn = document.createElement('button');
    prevBtn.textContent = '«';
    prevBtn.disabled = page <= 1;
    prevBtn.addEventListener('click', () => goToPage(page - 1));
    els.pagination.appendChild(prevBtn);

    pages.forEach((p) => {
      const btn = document.createElement('button');
      if (p === '...') {
        btn.textContent = '...';
        btn.disabled = true;
      } else {
        btn.textContent = String(p);
        if (p === page) btn.classList.add('active');
        btn.addEventListener('click', () => goToPage(p));
      }
      els.pagination.appendChild(btn);
    });

    const nextBtn = document.createElement('button');
    nextBtn.textContent = '»';
    nextBtn.disabled = page >= clampedTotal;
    nextBtn.addEventListener('click', () => goToPage(page + 1));
    els.pagination.appendChild(nextBtn);
  }

  function goToPage(page) {
    state.page = page;
    window.scrollTo({ top: 0, behavior: 'smooth' });
    fetchAndRender();
  }

  async function fetchAndRender() {
    if (state.view === 'favorites') {
      renderFavorites();
      return;
    }

    setStatus('Loading movies...');
    els.grid.innerHTML = '';
    els.pagination.hidden = true;

    try {
      let url;
      if (state.mode === 'search') {
        const params = new URLSearchParams({
          query: state.query,
          page: String(state.page),
        });
        url = `/api/search?${params.toString()}`;
        els.sectionTitle.textContent = `Search results for "${state.query}"`;
      } else {
        const params = new URLSearchParams({
          sort: state.sort,
          genre: state.genre,
          year: state.year,
          page: String(state.page),
        });
        url = `/api/movies?${params.toString()}`;
        els.sectionTitle.textContent = 'Browse All Movies';
      }

      const response = await fetch(url);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Something went wrong');
      }

      state.totalPages = data.total_pages || 1;
      renderGrid(data.results || []);
      renderPagination();
    } catch (err) {
      console.error(err);
      setStatus(
        'We could not load movies right now. Please check your connection and try again.'
      );
    }
  }

  function renderFavorites() {
    els.sectionTitle.textContent = 'Your Favorites';
    els.filters.hidden = true;
    els.pagination.hidden = true;
    const favorites = getFavorites();
    renderGrid(favorites);
  }

  async function openMovieModal(id) {
    els.modalOverlay.hidden = false;
    els.modalContent.innerHTML = '<p class="status">Loading details...</p>';

    try {
      const response = await fetch(`/api/movie/${id}`);
      const movie = await response.json();

      if (!response.ok) {
        throw new Error(movie.error || 'Could not load movie details');
      }

      const backdropSrc = movie.backdrop_path
        ? `${BACKDROP_BASE}${movie.backdrop_path}`
        : null;

      const trailer = (movie.videos?.results || []).find(
        (v) => v.site === 'YouTube' && v.type === 'Trailer'
      );

      const topCast = (movie.credits?.cast || [])
        .slice(0, 5)
        .map((c) => c.name)
        .join(', ');

      const favorite = isFavorite(movie.id);

      els.modalContent.innerHTML = `
        ${backdropSrc ? `<img class="modal__backdrop" src="${backdropSrc}" alt="" />` : ''}
        <div class="modal__body">
          <h2 class="modal__title" id="modal-title">${escapeHtml(movie.title)}</h2>
          <div class="modal__meta">
            <span class="modal__rating">★ ${movie.vote_average?.toFixed(1) ?? 'N/A'}</span>
            <span>${formatYear(movie.release_date)}</span>
            ${movie.runtime ? `<span>${movie.runtime} min</span>` : ''}
          </div>
          <div class="modal__genres">
            ${(movie.genres || []).map((g) => `<span>${escapeHtml(g.name)}</span>`).join('')}
          </div>
          <p class="modal__overview">${escapeHtml(movie.overview) || 'No overview available.'}</p>
          ${topCast ? `<p class="modal__cast"><strong>Cast:</strong> ${escapeHtml(topCast)}</p>` : ''}
          ${trailer ? `
            <div class="modal__trailer">
              <iframe
                src="https://www.youtube.com/embed/${trailer.key}"
                title="Official trailer"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowfullscreen
              ></iframe>
            </div>
          ` : ''}
          <button class="modal__favorite ${favorite ? 'is-favorite' : ''}" id="favorite-btn">
            ${favorite ? '★ In Favorites' : '☆ Add to Favorites'}
          </button>
        </div>
      `;

      document.getElementById('favorite-btn').addEventListener('click', (e) => {
        const added = toggleFavorite({
          id: movie.id,
          title: movie.title,
          poster_path: movie.poster_path,
          release_date: movie.release_date,
          vote_average: movie.vote_average,
        });
        e.target.classList.toggle('is-favorite', added);
        e.target.textContent = added ? '★ In Favorites' : '☆ Add to Favorites';
      });
    } catch (err) {
      console.error(err);
      els.modalContent.innerHTML = `<p class="status" style="padding:40px;">Could not load movie details. Please try again.</p>`;
    }
  }

  function closeModal() {
    els.modalOverlay.hidden = true;
    els.modalContent.innerHTML = '';
  }

  // --- Event wiring ---

  els.searchForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const query = els.searchInput.value.trim();
    if (!query) return;
    state.mode = 'search';
    state.query = query;
    state.page = 1;
    switchView('browse');
  });

  els.sortTabs.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-sort]');
    if (!btn) return;
    document.querySelectorAll('.pill--sort').forEach((b) => b.classList.remove('pill--active'));
    btn.classList.add('pill--active');
    state.sort = btn.dataset.sort;
    state.mode = 'discover';
    state.page = 1;
    fetchAndRender();
  });

  els.genrePills.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-genre]');
    if (!btn) return;
    document.querySelectorAll('.pill--genre').forEach((b) => b.classList.remove('pill--active'));
    btn.classList.add('pill--active');
    state.genre = btn.dataset.genre;
    state.mode = 'discover';
    state.page = 1;
    fetchAndRender();
  });

  els.yearSelect.addEventListener('change', () => {
    state.year = els.yearSelect.value;
    state.mode = 'discover';
    state.page = 1;
    fetchAndRender();
  });

  els.topnavLinks.forEach((link) => {
    link.addEventListener('click', () => switchView(link.dataset.view));
  });

  function switchView(view) {
    state.view = view;
    els.topnavLinks.forEach((l) => {
      l.classList.toggle('topnav__link--active', l.dataset.view === view);
    });
    els.filters.hidden = view === 'favorites';
    fetchAndRender();
  }

  els.modalClose.addEventListener('click', closeModal);
  els.modalOverlay.addEventListener('click', (e) => {
    if (e.target === els.modalOverlay) closeModal();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
  });

  // --- Init ---

  buildYearOptions();
  loadGenres();
  fetchAndRender();
})();
