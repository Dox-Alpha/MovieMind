export type AlgorithmId = "popularity" | "user" | "item" | "svd";

export type Movie = {
  movieId: number;
  title: string;
  year: number | null;
  genres: string[];
  avgRating: number;
  ratingCount: number;
  popularityScore: number;
  latentFactors: number[];
};

export type Rating = {
  userId: number;
  movieId: number;
  rating: number;
};

export type MatrixData = {
  users: number[];
  movies: Array<{ movieId: number; title: string }>;
  cells: Rating[];
};

export type SimilarityEntry = {
  movieId?: number;
  userId?: number;
  similarity: number;
};

export type ItemSimilarity = {
  sourceMovieId: number;
  similar: SimilarityEntry[];
};

export type UserSimilarity = {
  sourceUserId: number;
  similar: SimilarityEntry[];
};

export type Recommendation = {
  movieId: number;
  score: number;
  algorithm: AlgorithmId;
  reason: string;
};

export type CaseStudy = {
  userId: number;
  profile: string;
  ratedMovies: Array<{ movieId: number; rating: number }>;
  recommendations: Recommendation[];
  successCase: string;
  possibleError: string;
};

export type DemoData = {
  movies: Movie[];
  ratings: Rating[];
  matrix: MatrixData;
  itemSimilarity: ItemSimilarity[];
  userSimilarity: UserSimilarity[];
  caseStudies: CaseStudy[];
};

export type UserPreference = {
  movieId: number;
  rating: number;
};
