import type {
  CaseStudy,
  DemoData,
  ItemSimilarity,
  MatrixData,
  Movie,
  Rating,
  UserSimilarity,
} from "../types";

async function getJson<T>(path: string): Promise<T> {
  const response = await fetch(path);
  if (!response.ok) {
    throw new Error(`Failed to load ${path}`);
  }
  return response.json() as Promise<T>;
}

const publicBasePath = import.meta.env.BASE_URL.replace(/\/$/, "");

function publicDataPath(path: string) {
  return `${publicBasePath}${path.startsWith("/") ? path : `/${path}`}`;
}

async function loadDataFrom(basePath: string): Promise<DemoData> {
  const [movies, ratings, matrix, itemSimilarity, userSimilarity, caseStudies] =
    await Promise.all([
      getJson<Movie[]>(`${basePath}/movies.json`),
      getJson<Rating[]>(`${basePath}/ratings_sample.json`),
      getJson<MatrixData>(`${basePath}/user_item_matrix.json`),
      getJson<ItemSimilarity[]>(`${basePath}/item_similarity.json`),
      getJson<UserSimilarity[]>(`${basePath}/user_similarity.json`),
      getJson<CaseStudy[]>(`${basePath}/recommendations_demo.json`),
    ]);

  const normalizeTitle = (title: string) => title.replace(/^(.+), (The|A|An)$/u, "$2 $1");
  const normalizedMovies = movies.map((movie) => ({ ...movie, title: normalizeTitle(movie.title) }));
  const normalizedMatrix = {
    ...matrix,
    movies: matrix.movies.map((movie) => ({ ...movie, title: normalizeTitle(movie.title) })),
  };

  return {
    movies: normalizedMovies,
    ratings,
    matrix: normalizedMatrix,
    itemSimilarity,
    userSimilarity,
    caseStudies,
  };
}

export async function loadDemoData(): Promise<DemoData> {
  try {
    const generated = await loadDataFrom(publicDataPath("/data/generated"));
    if (generated.movies.length > 0 && generated.ratings.length > 0) {
      return generated;
    }
  } catch {
    // Generated data is optional for GitHub demos; fall back to committed demo JSON.
  }

  return loadDataFrom(publicDataPath("/data/demo"));
}
