import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Plus, Search, SlidersHorizontal, Sparkles, Star, X } from "lucide-react";
import type { AlgorithmId, DemoData, Movie, Recommendation, UserPreference } from "../types";
import { generateRecommendations, getAlgorithmLabel } from "../lib/recommender";

const algorithms: AlgorithmId[] = ["popularity", "user", "item", "svd"];

function RatingControl({
  value,
  onChange,
}: {
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <div className="flex items-center gap-1" aria-label={`Rating ${value}`}>
      {[1, 2, 3, 4, 5].map((score) => (
        <button
          key={score}
          className={`grid h-8 w-8 place-items-center rounded-md border text-xs transition ${
            score <= value
              ? "border-amber/50 bg-amber/15 text-amber"
              : "border-white/10 bg-white/[0.03] text-slate-500 hover:text-slate-300"
          }`}
          onClick={() => onChange(score)}
          type="button"
        >
          <Star size={14} fill={score <= value ? "currentColor" : "none"} />
        </button>
      ))}
    </div>
  );
}

function RecommendationCard({
  recommendation,
  movie,
}: {
  recommendation: Recommendation;
  movie: Movie;
}) {
  return (
    <motion.article
      layout
      className="rounded-lg border border-white/10 bg-white/[0.04] p-4 transition hover:border-cyan/40 hover:bg-cyan/[0.06]"
    >
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <h4 className="text-sm font-semibold leading-tight text-white">{movie.title}</h4>
          <p className="mt-1 text-xs text-slate-400">{movie.genres.join(" / ")}</p>
        </div>
        <span className="rounded-md border border-amber/30 bg-amber/10 px-2 py-1 text-xs font-semibold text-amber">
          {recommendation.score.toFixed(2)}
        </span>
      </div>
      <div className="mb-3 inline-flex rounded-md border border-cyan/20 bg-cyan/10 px-2 py-1 text-[11px] font-semibold text-cyan">
        {getAlgorithmLabel(recommendation.algorithm)}
      </div>
      <p className="text-xs leading-relaxed text-slate-300">{recommendation.reason}</p>
    </motion.article>
  );
}

export function Playground({ data }: { data: DemoData }) {
  const [query, setQuery] = useState("");
  const [algorithm, setAlgorithm] = useState<AlgorithmId>("item");
  const [preferences, setPreferences] = useState<UserPreference[]>([
    { movieId: 260, rating: 5 },
    { movieId: 2571, rating: 5 },
    { movieId: 480, rating: 4 },
  ]);
  const [hasGenerated, setHasGenerated] = useState(true);

  const movieMap = useMemo(() => new Map(data.movies.map((movie) => [movie.movieId, movie])), [data.movies]);
  const selectedIds = new Set(preferences.map((pref) => pref.movieId));
  const searchResults = data.movies
    .filter((movie) => !selectedIds.has(movie.movieId))
    .filter((movie) => `${movie.title} ${movie.genres.join(" ")}`.toLowerCase().includes(query.toLowerCase()))
    .slice(0, 6);

  const recommendations = useMemo(
    () => generateRecommendations(data, preferences, algorithm),
    [algorithm, data, preferences],
  );

  const addMovie = (movieId: number) => {
    setPreferences((current) => [...current, { movieId, rating: 4 }].slice(0, 8));
    setQuery("");
  };

  const updateRating = (movieId: number, rating: number) => {
    setPreferences((current) => current.map((pref) => (pref.movieId === movieId ? { ...pref, rating } : pref)));
  };

  const removeMovie = (movieId: number) => {
    setPreferences((current) => current.filter((pref) => pref.movieId !== movieId));
  };

  return (
    <section id="playground" className="section-pad">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 grid gap-4 xl:grid-cols-[1fr_auto] xl:items-end">
          <div className="min-w-0">
            <p className="section-label">Recommendation Playground</p>
            <h2 className="section-title">
              Rate a few movies, then watch the system infer taste.
            </h2>
          </div>
          <div className="w-fit rounded-lg border border-cyan/20 bg-cyan/5 px-4 py-3 text-sm text-cyan xl:justify-self-end">
            {preferences.length < 2 ? "Low confidence: add at least 2 ratings." : `${preferences.length} preference signals active`}
          </div>
        </div>

        <div className="grid gap-5 xl:grid-cols-[420px_1fr]">
          <div className="rounded-lg border border-line bg-panel/80 p-5 shadow-glow">
            <div className="mb-5 flex items-center gap-2 text-sm font-semibold text-white">
              <Search size={17} className="text-cyan" />
              Search movies
            </div>
            <div className="relative mb-4">
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                className="h-12 w-full rounded-lg border border-white/10 bg-ink/80 px-4 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-cyan/50"
                placeholder="Try Matrix, Toy Story, Fargo..."
              />
            </div>
            <div className="mb-6 grid gap-2">
              {(query ? searchResults : data.movies.slice(0, 5).filter((movie) => !selectedIds.has(movie.movieId))).map((movie) => (
                <button
                  key={movie.movieId}
                  onClick={() => addMovie(movie.movieId)}
                  className="flex items-center justify-between rounded-lg border border-white/10 bg-white/[0.03] p-3 text-left transition hover:border-cyan/40 hover:bg-cyan/10"
                  type="button"
                >
                  <span>
                    <span className="block text-sm font-semibold text-slate-100">{movie.title}</span>
                    <span className="text-xs text-slate-500">{movie.genres.slice(0, 3).join(" / ")}</span>
                  </span>
                  <Plus size={16} className="text-cyan" />
                </button>
              ))}
            </div>

            <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-white">
              <SlidersHorizontal size={17} className="text-violet" />
              Algorithm
            </div>
            <div className="grid grid-cols-2 gap-2">
              {algorithms.map((item) => (
                <button
                  key={item}
                  onClick={() => setAlgorithm(item)}
                  className={`h-10 rounded-lg border text-xs font-semibold transition ${
                    algorithm === item
                      ? "border-cyan/50 bg-cyan/15 text-cyan"
                      : "border-white/10 bg-white/[0.03] text-slate-400 hover:text-white"
                  }`}
                  type="button"
                >
                  {getAlgorithmLabel(item)}
                </button>
              ))}
            </div>
            <button
              onClick={() => setHasGenerated(true)}
              className="mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-cyan px-4 text-sm font-bold text-ink transition hover:bg-white"
              type="button"
            >
              <Sparkles size={17} />
              Generate Recommendations
            </button>
          </div>

          <div className="grid gap-5">
            <div className="rounded-lg border border-line bg-panel/70 p-5">
              <h3 className="mb-4 text-sm font-semibold text-white">My liked movies</h3>
              <div className="grid gap-3 md:grid-cols-2">
                {preferences.map((pref) => {
                  const movie = movieMap.get(pref.movieId);
                  if (!movie) return null;
                  return (
                    <div key={pref.movieId} className="rounded-lg border border-white/10 bg-ink/70 p-4">
                      <div className="mb-3 flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-white">{movie.title}</p>
                          <p className="text-xs text-slate-500">{movie.genres.slice(0, 3).join(" / ")}</p>
                        </div>
                        <button
                          className="grid h-7 w-7 place-items-center rounded-md border border-white/10 text-slate-500 hover:text-coral"
                          onClick={() => removeMovie(pref.movieId)}
                          type="button"
                        >
                          <X size={14} />
                        </button>
                      </div>
                      <RatingControl value={pref.rating} onChange={(rating) => updateRating(pref.movieId, rating)} />
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="rounded-lg border border-line bg-panel/70 p-5">
              <div className="mb-4 flex items-center justify-between gap-4">
                <h3 className="text-sm font-semibold text-white">Top-10 Recommendations</h3>
                <span className="rounded-md border border-violet/30 bg-violet/10 px-2 py-1 text-xs font-semibold text-violet">
                  {getAlgorithmLabel(algorithm)}
                </span>
              </div>
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {(hasGenerated ? recommendations : []).map((recommendation) => {
                  const movie = movieMap.get(recommendation.movieId);
                  return movie ? (
                    <RecommendationCard
                      key={`${algorithm}-${recommendation.movieId}`}
                      recommendation={recommendation}
                      movie={movie}
                    />
                  ) : null;
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
