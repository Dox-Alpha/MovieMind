# MovieMind Handover

This file is for the next agent or maintainer who needs to continue the project quickly.

## Current Status

- Project type: React + Vite + TypeScript single-page app.
- Styling: Tailwind CSS plus custom CSS in `src/styles.css`.
- Visual direction: dark technical dashboard, cyan/violet accents, amber score details, compact 8px-radius panels.
- Main route: one-page scroll narrative, served locally at `http://127.0.0.1:5173`.
- Local branch: `main`.
- Latest local commit before push: `baef3e1 Initial MovieMind recommender app`.

## What The App Does

MovieMind demonstrates a MovieLens-style recommendation pipeline:

- Hero control-room graph.
- Interactive recommendation playground.
- Pipeline explanation.
- MovieLens data source charts.
- User-item rating matrix heatmap.
- User and item similarity analysis.
- Algorithm comparison.
- Case studies.
- Limitations and risks.
- Conclusion.

The main interactive recommender supports:

- Movie search.
- Liked movie selection.
- 1-5 rating controls.
- Algorithm selector: Popularity, User-based CF, Item-based CF, SVD.
- Top-10 recommendations with reasons and scores.

## Important Data Policy

Do not commit raw MovieLens CSV files.

Ignored local-only paths:

- `data/raw/**`
- `public/data/generated/**`

Committed demo data:

- `public/data/demo/*.json`

This is intentional. The GitHub Pages version should run on demo JSON only. Full MovieLens-small preprocessing can be run locally by users after they download the dataset from GroupLens.

## Data Loading Behavior

Frontend data loader: `src/lib/data.ts`.

It first tries:

```text
public/data/generated/
```

Then falls back to:

```text
public/data/demo/
```

The loader uses `import.meta.env.BASE_URL` so GitHub Pages subpaths work correctly.

## Preprocessing

Script:

```text
scripts/prepare_movielens.py
```

Expected raw files:

```text
data/raw/ml-latest-small/movies.csv
data/raw/ml-latest-small/ratings.csv
```

Generated outputs:

```text
public/data/generated/movies.json
public/data/generated/ratings_sample.json
public/data/generated/user_item_matrix.json
public/data/generated/item_similarity.json
public/data/generated/user_similarity.json
public/data/generated/recommendations_demo.json
```

Python dependencies:

```bash
pip install pandas numpy scikit-learn
```

Run:

```bash
python scripts/prepare_movielens.py
```

## GitHub Pages

Workflow:

```text
.github/workflows/deploy.yml
```

It builds with:

```bash
npm ci
npm run build
```

and deploys `dist/` through GitHub Pages.

After pushing to GitHub, enable:

```text
Settings -> Pages -> Build and deployment -> Source: GitHub Actions
```

The Vite config detects GitHub Actions and sets the base path to `/<repo-name>/`.

## Key Files

- `src/App.tsx`: top-level page structure and section ordering.
- `src/components/AnimatedGraph.tsx`: hero live graph visual.
- `src/components/Playground.tsx`: interactive recommender UI.
- `src/components/Sections.tsx`: scroll narrative sections, charts, matrix, similarity, risks.
- `src/lib/recommender.ts`: recommendation scoring logic.
- `src/lib/data.ts`: generated/demo data loading and title normalization.
- `src/types.ts`: shared data interfaces.
- `src/styles.css`: global styling, grid backgrounds, pipeline animation, reduced-motion handling.
- `README.md`: public-facing project instructions.

## Recent Visual QA Notes

Recent polish focused on the hero graph:

- `Top-10` was previously clipped by the SVG viewBox; it has been moved inward and the graph viewBox widened.
- The graph was too crowded; it is now a wider three-stage layout.
- `cosine` and `blend` pills were repositioned to align visually under the `Vector Match` dashed frame.

If future changes touch `AnimatedGraph.tsx`, verify with an actual browser screenshot instead of only checking SVG element bounds.

## Verification Commands

Run before handoff or release:

```bash
npm run build
git status --short --ignored
```

Expected ignored local artifacts may include:

```text
node_modules/
dist/
data/raw/ml-latest-small/
public/data/generated/*.json
```

These should not be committed.

## Known Non-Issues

- Vite reports a chunk size warning because Recharts and Framer Motion are bundled. This does not break the app.
- GitHub Pages serves the demo dataset, not locally generated MovieLens-small outputs.
- Raw MovieLens files must remain local-only because public redistribution is restricted.

## Suggested Future Improvements

- Add code splitting for Recharts-heavy sections if bundle size becomes important.
- Add lightweight Playwright smoke tests for search, rating, algorithm switch, and recommendation generation.
- Add a small note in the UI showing whether generated or demo data is currently loaded.
- Consider reducing hero vertical whitespace if reviewers prefer a denser first viewport.
