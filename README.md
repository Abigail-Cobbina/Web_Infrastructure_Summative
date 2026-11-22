# Moviesss

Moviesss is a movie discovery web app. Search by title, browse by genre
and year, sort by popularity/rating/release date, and open any movie
for its overview, cast, and official trailer — all powered by
[The Movie Database (TMDb)](https://www.themoviedb.org/) API.

## Features

- Browse movies with sort (Most Popular / Top Rated / Newest), genre
  filter, and year filter
- Search by title
- Movie detail view: backdrop, overview, genres, rating, runtime,
  top cast, and embedded official YouTube trailer
- Favorites, saved locally in the browser (no account needed)
- API key is never exposed to the browser — all TMDb calls go through
  a small backend proxy
- Graceful error handling for failed requests, empty results, and
  missing data (e.g. no poster available)

## Tech stack

- **Backend:** Node.js, Express (proxies requests to TMDb, keeps the
  API key server-side)
- **Frontend:** vanilla HTML, CSS, and JavaScript (no framework)

## Setup (local)

1. Clone the repo and install dependencies:
   ```bash
   git clone <your-repo-url>
   cd moviesss
   npm install
   ```

2. Get a free TMDb API key:
   - Create an account at [themoviedb.org](https://www.themoviedb.org/)
   - Go to Settings → API → request a Developer key
   - Copy your API key (v3 auth)

3. Create your `.env` file from the example:
   ```bash
   cp .env.example .env
   ```
   Then open `.env` and paste in your key:
   ```
   TMDB_API_KEY=your_real_key_here
   PORT=3000
   ```

4. Start the server:
   ```bash
   npm start
   ```

5. Open `http://localhost:3000` in your browser.

## Project structure

```
moviesss/
├── server/
│   └── index.js        # Express server + TMDb proxy routes
├── public/
│   ├── index.html
│   ├── css/style.css
│   └── js/app.js
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

## API credit

Movie data, images, and video metadata are provided by
[The Movie Database (TMDb)](https://www.themoviedb.org/). This
product uses the TMDb API but is not endorsed or certified by TMDb.
Trailers are embedded directly from YouTube using links TMDb provides
for each film's official video.

## Deployment

<!-- To be completed once deployed to Web01 / Web02 / Lb01. -->
Deployment instructions (how the app was deployed to the two web
servers, and how the load balancer was configured to split traffic
between them) will be documented here once set up.

## Challenges

<!-- Add any real challenges you ran into and how you solved them. -->
