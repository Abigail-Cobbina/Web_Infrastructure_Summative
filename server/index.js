#!/usr/bin/env node
require('dotenv').config();

const express = require('express');
const helmet = require('helmet');
const path = require('path');
const os = require('os');
const fetch = require('node-fetch');

const app = express();

app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  referrerPolicy: {
    policy: 'strict-origin-when-cross-origin'
  },
  strictTransportSecurity: false
}));

const PORT = process.env.PORT || 3000;
const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_BASE = 'https://api.themoviedb.org/3';

// Simple in-memory cache for TMDb responses.
const cache = new Map();
const CACHE_TTL_MS = 5 * 60 * 1000;
const MAX_CACHE_ENTRIES = 500;

if (!TMDB_API_KEY) {
  console.error(
    'Missing TMDB_API_KEY. Create a .env file (see .env.example) ' +
    'with your TMDb API key before starting the server.'
  );
  process.exit(1);
}

app.use(express.static(path.join(__dirname, '..', 'public')));
app.use(express.json());

// Map our sort options to TMDb's discover sort_by values.
const SORT_MAP = {
  popularity: 'popularity.desc',
  rating: 'vote_average.desc',
  newest: 'primary_release_date.desc',
};

// Validate positive integer inputs from API requests.
function parsePositiveInteger(value, max = Number.MAX_SAFE_INTEGER) {
  if (typeof value !== 'string' || !/^[1-9]\d*$/.test(value)) {
    return null;
  }

  const number = Number(value);
  return Number.isSafeInteger(number) && number <= max ? number : null;
}

async function tmdbGet(endpoint, params = {}) {
  const cacheKey = JSON.stringify([
    endpoint,
    Object.entries(params).sort(([a], [b]) => a.localeCompare(b))
  ]);

  const cached = cache.get(cacheKey);

  if (cached && cached.expiresAt > Date.now()) {
    console.log(`TMDb cache HIT: ${endpoint}`);
    return cached.data;
  }

  if (cached) {
    cache.delete(cacheKey);
  }

  console.log(`TMDb cache MISS: ${endpoint}`);

  const url = new URL(`${TMDB_BASE}${endpoint}`);
  url.searchParams.set('api_key', TMDB_API_KEY);

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      url.searchParams.set(key, value);
    }
  });

  const response = await fetch(url.toString());
  const data = await response.json();

  if (!response.ok) {
    const error = new Error(data.status_message || 'TMDb request failed');
    error.status = response.status;
    throw error;
  }

  if (cache.size >= MAX_CACHE_ENTRIES) {
    const oldestKey = cache.keys().next().value;
    cache.delete(oldestKey);
  }

  cache.set(cacheKey, {
    data,
    expiresAt: Date.now() + CACHE_TTL_MS
  });

  return data;
}

// GET /api/genres - list of movie genres
app.get('/api/genres', async (req, res) => {
  try {
    const data = await tmdbGet('/genre/movie/list');
    res.json(data.genres || []);
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
});

// GET /api/movies - browse/discover movies with filters
app.get('/api/movies', async (req, res) => {
  try {
    const page = req.query.page === undefined
      ? 1 : parsePositiveInteger(req.query.page, 500);

    if (page === null) {
      return res.status(400).json({
        error: 'Page must be a number between 1 and 500'
      });
    }

    const sortInput = req.query.sort;

    if (sortInput !== undefined &&
        (typeof sortInput !== 'string' ||
         !Object.hasOwn(SORT_MAP, sortInput))) {
      return res.status(400).json({ error: 'Invalid sort option' });
    }

    const sort = SORT_MAP[sortInput || 'popularity'];

    // Empty genre means no genre filter was selected.
    const genre = req.query.genre === undefined || req.query.genre === ''
      ? '' : parsePositiveInteger(req.query.genre);

    if (genre === null) {
      return res.status(400).json({
        error: 'Genre must be a positive integer'
      });
    }

    // Empty year means no release-year filter was selected.
    const year = req.query.year === undefined || req.query.year === ''
      ? '' : parsePositiveInteger(
          req.query.year,
          new Date().getFullYear() + 10
        );

    if (year === null || (year !== '' && year < 1870)) {
      return res.status(400).json({ error: 'Invalid release year' });
    }

    const params = {
      sort_by: sort,
      page,
      with_genres: genre,
      primary_release_year: year,
    };

    if (sort === SORT_MAP.rating) {
      params['vote_count.gte'] = 50;
    }

    const data = await tmdbGet('/discover/movie', params);
    res.json(data);
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
});

// GET /api/search - search movies by title
app.get('/api/search', async (req, res) => {
  try {
    if (req.query.query !== undefined &&
        typeof req.query.query !== 'string') {
      return res.status(400).json({ error: 'Search query must be text' });
    }

    const query = (req.query.query || '').trim();

    if (query.length > 100) {
      return res.status(400).json({
        error: 'Search query cannot exceed 100 characters'
      });
    }

    const page = req.query.page === undefined
      ? 1 : parsePositiveInteger(req.query.page, 500);

    if (page === null) {
      return res.status(400).json({
        error: 'Page must be a number between 1 and 500'
      });
    }

    if (!query) {
      return res.json({
        results: [],
        total_pages: 0,
        total_results: 0
      });
    }

    const data = await tmdbGet('/search/movie', { query, page });
    res.json(data);
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
});

// GET /api/movie/:id - full details for a single movie
app.get('/api/movie/:id', async (req, res) => {
  try {
    const id = parsePositiveInteger(req.params.id);

    if (id === null) {
      return res.status(400).json({ error: 'Invalid movie id' });
    }

    const data = await tmdbGet(`/movie/${id}`, {
      append_to_response: 'videos,credits',
    });

    res.json(data);
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
});

// GET /api/health - identify the server handling the request
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    server: os.hostname()
  });
});

app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

app.listen(PORT, '127.0.0.1', () => {
  console.log(`Moviesss server running on http://localhost:${PORT}`);
});

