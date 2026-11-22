#!/usr/bin/env node
require('dotenv').config();

const express = require('express');
const path = require('path');
const fetch = require('node-fetch');

const app = express();
const PORT = process.env.PORT || 3000;
const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_BASE = 'https://api.themoviedb.org/3';

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

async function tmdbGet(endpoint, params = {}) {
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
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const sort = SORT_MAP[req.query.sort] || SORT_MAP.popularity;
    const genre = req.query.genre || '';
    const year = req.query.year || '';

    const params = {
      sort_by: sort,
      page,
      with_genres: genre,
      primary_release_year: year,
    };

    // Avoid obscure titles with a single 10/10 vote dominating "Top Rated".
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
    const query = (req.query.query || '').trim();
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);

    if (!query) {
      return res.json({ results: [], total_pages: 0, total_results: 0 });
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
    const id = parseInt(req.params.id, 10);
    if (!Number.isInteger(id) || id <= 0) {
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

app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

app.listen(PORT, '127.0.0.1', () => {
  console.log(`Moviesss server running on http://localhost:${PORT}`);
});
