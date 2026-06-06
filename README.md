# MovieMind

MovieMind is an interactive React single-page demo for a MovieLens mini recommender system. It is designed as both a runnable recommendation playground and a scroll narrative for a course project on recommendation systems.

The app lets users search movies, rate favorites, switch recommendation algorithms, generate Top-10 results, and inspect why those results appear. The page then walks through the full pipeline: behavior data, rating matrix, similarity, recommendation generation, explanation, case studies, and risks.

## Features

- Interactive movie search and 1-5 rating controls
- Four recommendation modes:
  - Popularity Baseline
  - User-based Collaborative Filtering
  - Item-based Collaborative Filtering
  - Matrix Factorization / SVD-style latent vectors
- Top-10 recommendation cards with score, genres, algorithm badge, and reason
- Scroll-based recommender pipeline narrative
- MovieLens data source section with rating and genre charts
- User-item rating matrix heatmap
- User and item similarity analysis
- Case studies with successful and possibly wrong recommendations
- Limitations and risks section covering sparsity, cold start, filter bubbles, privacy, popularity bias, and diversity

## Project Structure

```text
MovieMind/
  public/data/demo/          # Committed compact demo JSON for instant playback
  public/data/generated/     # Output target for regenerated MovieLens JSON
  data/raw/                  # Local-only raw MovieLens CSV files, ignored by Git
  scripts/prepare_movielens.py
  src/
    components/              # Hero graph, playground, narrative sections
    lib/                     # Data loading and recommender algorithms
    App.tsx
    main.tsx
    styles.css
```

## Run the React App

Install dependencies:

```bash
npm install
```

Start the dev server:

```bash
npm run dev
```

Build for production:

```bash
npm run build
```

## GitHub Pages

This project can be hosted on GitHub Pages because it builds to static files. The online Pages version uses the committed compact demo JSON in `public/data/demo/`. Raw MovieLens CSV files and locally generated full-data JSON outputs are intentionally ignored and should not be pushed.

After pushing to GitHub, enable Pages in the repository settings:

```text
Settings -> Pages -> Build and deployment -> Source: GitHub Actions
```

The included workflow at `.github/workflows/deploy.yml` builds the Vite app and deploys the `dist/` folder whenever `main` is pushed.

## MovieLens Data

This repository includes a small demo JSON dataset so the app works immediately. It does not commit raw MovieLens CSV files. GroupLens notes that public redistribution of MovieLens datasets is generally not permitted, so raw data should be downloaded directly by each user.

Download MovieLens small from the official page:

[https://grouplens.org/datasets/movielens/](https://grouplens.org/datasets/movielens/)

Unzip it so the files are located at:

```text
data/raw/ml-latest-small/movies.csv
data/raw/ml-latest-small/ratings.csv
```

Install Python dependencies:

```bash
pip install pandas numpy scikit-learn
```

Generate frontend JSON:

```bash
python scripts/prepare_movielens.py
```

The script writes:

```text
public/data/generated/movies.json
public/data/generated/ratings_sample.json
public/data/generated/user_item_matrix.json
public/data/generated/item_similarity.json
public/data/generated/user_similarity.json
public/data/generated/recommendations_demo.json
```

The app first tries to load `public/data/generated/`. If generated files are not available, it automatically falls back to the committed `public/data/demo/` files. This keeps the project reproducible locally while still working immediately on GitHub or static hosting.

## Algorithm Notes

### Popularity Baseline

Ranks movies using average rating and rating count. It is stable and useful when the user has too few ratings, but it is not personalized and can amplify popularity bias.

### User-based Collaborative Filtering

Builds a pseudo-user vector from the current user's ratings, compares it with sampled users using cosine similarity, and recommends movies that similar users rated highly.

### Item-based Collaborative Filtering

Finds movies similar to the user's highly rated movies using item-item cosine similarity. This creates intuitive reasons like "because you liked The Matrix."

### Matrix Factorization / SVD

Uses latent movie vectors exported from preprocessing, then builds a user interest vector from the rated movies. This can discover hidden taste dimensions but is less directly explainable.

## Course Deliverable Mapping

- Recommendation scenario: Hero, Playground, and Pipeline sections
- Data source: Data Source section and README data instructions
- User-item rating matrix: Rating Matrix heatmap
- Similar users/items: Similarity Analysis section
- Recommendations for at least two users: Case Studies section
- Recommendation basis: Top-10 cards and case-study explanations
- Successful and wrong recommendations: Case Studies section
- Limitations and risks: Limitations & Risks section

## Open-source Notes

- Raw MovieLens data is ignored via `.gitignore`.
- Demo JSON is compact and intended for educational display.
- The project is suitable for GitHub Pages, Vercel, Netlify, or any static hosting service after `npm run build`.
