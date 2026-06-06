import type {
  AlgorithmId,
  DemoData,
  ItemSimilarity,
  Movie,
  Rating,
  Recommendation,
  UserPreference,
} from "../types";

const algorithmLabel: Record<AlgorithmId, string> = {
  popularity: "Popularity",
  user: "User-based CF",
  item: "Item-based CF",
  svd: "SVD",
};

export function getAlgorithmLabel(id: AlgorithmId) {
  return algorithmLabel[id];
}

function byMovie(movies: Movie[]) {
  return new Map(movies.map((movie) => [movie.movieId, movie]));
}

function cosine(a: number[], b: number[]) {
  let dot = 0;
  let normA = 0;
  let normB = 0;

  for (let index = 0; index < Math.max(a.length, b.length); index += 1) {
    const av = a[index] ?? 0;
    const bv = b[index] ?? 0;
    dot += av * bv;
    normA += av * av;
    normB += bv * bv;
  }

  if (!normA || !normB) return 0;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

function ratingVector(ratings: Rating[], movieIds: number[]) {
  const values = new Map(ratings.map((rating) => [rating.movieId, rating.rating - 3]));
  return movieIds.map((movieId) => values.get(movieId) ?? 0);
}

function preferenceVector(preferences: UserPreference[], movieIds: number[]) {
  const values = new Map(preferences.map((pref) => [pref.movieId, pref.rating - 3]));
  return movieIds.map((movieId) => values.get(movieId) ?? 0);
}

function reasonSource(preferences: UserPreference[], movieMap: Map<number, Movie>) {
  const favorite = [...preferences].sort((a, b) => b.rating - a.rating)[0];
  return favorite ? movieMap.get(favorite.movieId)?.title ?? "your strongest rating" : "your ratings";
}

function popularity(data: DemoData, preferences: UserPreference[]) {
  const excluded = new Set(preferences.map((pref) => pref.movieId));
  return data.movies
    .filter((movie) => !excluded.has(movie.movieId))
    .map<Recommendation>((movie) => ({
      movieId: movie.movieId,
      algorithm: "popularity",
      score: movie.popularityScore,
      reason: `${movie.title} is highly rated and has broad support in the sample, so it is a strong baseline recommendation.`,
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 10);
}

function itemSimilarity(data: DemoData, preferences: UserPreference[]) {
  const movieMap = byMovie(data.movies);
  const excluded = new Set(preferences.map((pref) => pref.movieId));
  const similarityRows = new Map<number, ItemSimilarity>(
    data.itemSimilarity.map((entry) => [entry.sourceMovieId, entry]),
  );
  const scores = new Map<number, { score: number; sourceId: number; similarity: number }>();

  for (const pref of preferences.filter((item) => item.rating >= 3.5)) {
    const row = similarityRows.get(pref.movieId);
    if (!row) continue;

    for (const similar of row.similar) {
      if (!similar.movieId || excluded.has(similar.movieId)) continue;
      const weighted = (pref.rating / 5) * similar.similarity;
      const previous = scores.get(similar.movieId);
      if (!previous || previous.score < weighted) {
        scores.set(similar.movieId, {
          score: weighted,
          sourceId: pref.movieId,
          similarity: similar.similarity,
        });
      }
    }
  }

  if (!scores.size) return popularity(data, preferences);

  return [...scores.entries()]
    .map<Recommendation>(([movieId, detail]) => {
      const movie = movieMap.get(movieId)!;
      const source = movieMap.get(detail.sourceId)!;
      return {
        movieId,
        algorithm: "item",
        score: detail.score,
        reason: `Because you liked ${source.title}, this movie is recommended from a similar rating pattern (${detail.similarity.toFixed(2)} cosine similarity).`,
      };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 10);
}

function userBased(data: DemoData, preferences: UserPreference[]) {
  const movieIds = data.movies.map((movie) => movie.movieId);
  const currentVector = preferenceVector(preferences, movieIds);
  const movieMap = byMovie(data.movies);
  const excluded = new Set(preferences.map((pref) => pref.movieId));
  const users = [...new Set(data.ratings.map((rating) => rating.userId))];
  const neighborWeights = users
    .map((userId) => {
      const ratings = data.ratings.filter((rating) => rating.userId === userId);
      return { userId, similarity: cosine(currentVector, ratingVector(ratings, movieIds)) };
    })
    .filter((neighbor) => neighbor.similarity > 0.05)
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, 4);

  if (!neighborWeights.length) return popularity(data, preferences);

  const scores = new Map<number, { weighted: number; weight: number; userId: number }>();
  for (const neighbor of neighborWeights) {
    for (const rating of data.ratings.filter((item) => item.userId === neighbor.userId)) {
      if (excluded.has(rating.movieId) || rating.rating < 3.5) continue;
      const previous = scores.get(rating.movieId) ?? { weighted: 0, weight: 0, userId: neighbor.userId };
      scores.set(rating.movieId, {
        weighted: previous.weighted + rating.rating * neighbor.similarity,
        weight: previous.weight + neighbor.similarity,
        userId: previous.weighted > rating.rating * neighbor.similarity ? previous.userId : neighbor.userId,
      });
    }
  }

  const favorite = reasonSource(preferences, movieMap);
  return [...scores.entries()]
    .map<Recommendation>(([movieId, value]) => ({
      movieId,
      algorithm: "user",
      score: value.weighted / Math.max(value.weight, 0.01),
      reason: `Users with a taste vector close to yours also rated this highly. The closest signal starts from your interest in ${favorite}.`,
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 10);
}

function svd(data: DemoData, preferences: UserPreference[]) {
  const movieMap = byMovie(data.movies);
  const excluded = new Set(preferences.map((pref) => pref.movieId));
  const weightedVector = [0, 0, 0, 0];
  let totalWeight = 0;

  for (const pref of preferences) {
    const movie = movieMap.get(pref.movieId);
    if (!movie) continue;
    const weight = Math.max(pref.rating - 2.5, 0.2);
    movie.latentFactors.forEach((value, index) => {
      weightedVector[index] += value * weight;
    });
    totalWeight += weight;
  }

  if (!totalWeight) return popularity(data, preferences);

  const userVector = weightedVector.map((value) => value / totalWeight);
  const source = reasonSource(preferences, movieMap);

  return data.movies
    .filter((movie) => !excluded.has(movie.movieId))
    .map<Recommendation>((movie) => ({
      movieId: movie.movieId,
      algorithm: "svd",
      score: cosine(userVector, movie.latentFactors) * 4 + movie.avgRating / 10,
      reason: `The latent interest vector inferred from ${source} points toward movies with a similar hidden factor profile.`,
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 10);
}

export function generateRecommendations(
  data: DemoData,
  preferences: UserPreference[],
  algorithm: AlgorithmId,
): Recommendation[] {
  const safePreferences = preferences.length ? preferences : [];

  if (algorithm === "popularity") return popularity(data, safePreferences);
  if (safePreferences.length < 2) {
    return popularity(data, safePreferences).map((item) => ({
      ...item,
      algorithm,
      reason: `Low confidence: add more ratings for a personalized ${getAlgorithmLabel(algorithm)} result. This item is blended from the popularity fallback.`,
    }));
  }
  if (algorithm === "user") return userBased(data, safePreferences);
  if (algorithm === "item") return itemSimilarity(data, safePreferences);
  return svd(data, safePreferences);
}
