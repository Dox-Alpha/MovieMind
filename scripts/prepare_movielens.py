"""Prepare MovieLens small data for the MovieMind React demo.

Raw MovieLens CSV files are intentionally not committed. Download the
ml-latest-small dataset from GroupLens, unzip it into:

    data/raw/ml-latest-small/

Then run:

    python scripts/prepare_movielens.py

The script writes compact JSON files to public/data/generated/.
"""

from __future__ import annotations

import argparse
import json
import math
import re
from pathlib import Path

import numpy as np
import pandas as pd
from sklearn.decomposition import TruncatedSVD
from sklearn.metrics.pairwise import cosine_similarity


ROOT = Path(__file__).resolve().parents[1]
DEFAULT_RAW = ROOT / "data" / "raw" / "ml-latest-small"
DEFAULT_OUT = ROOT / "public" / "data" / "generated"


def parse_title(raw_title: str) -> tuple[str, int | None]:
    match = re.search(r"\((\d{4})\)\s*$", raw_title)
    if not match:
        title = raw_title
        year = None
    else:
        year = int(match.group(1))
        title = raw_title[: match.start()].strip()

    article_match = re.match(r"^(.*),\s+(The|A|An)$", title)
    if article_match:
        title = f"{article_match.group(2)} {article_match.group(1)}"

    return title, year


def weighted_popularity(avg_rating: float, count: int, global_mean: float, min_votes: int = 20) -> float:
    score = (count / (count + min_votes)) * avg_rating + (min_votes / (count + min_votes)) * global_mean
    confidence = min(1.0, math.log1p(count) / math.log1p(250))
    return round(score * (0.82 + 0.18 * confidence), 4)


def top_similar(similarity: np.ndarray, ids: list[int], source_index: int, limit: int = 5) -> list[dict]:
    row = similarity[source_index]
    order = np.argsort(row)[::-1]
    results = []
    for index in order:
      if index == source_index:
          continue
      results.append({"movieId": int(ids[index]), "similarity": round(float(row[index]), 4)})
      if len(results) == limit:
          break
    return results


def build_case_recommendations(
    user_id: int,
    sample_ratings: pd.DataFrame,
    item_sim: np.ndarray,
    movie_ids: list[int],
    movie_title: dict[int, str],
) -> dict:
    user_ratings = sample_ratings[sample_ratings["userId"] == user_id].sort_values("rating", ascending=False)
    rated = user_ratings.head(5)
    seen = set(int(row.movieId) for row in user_ratings.itertuples(index=False))
    movie_index = {movie_id: index for index, movie_id in enumerate(movie_ids)}
    scores: dict[int, dict] = {}

    for row in rated.itertuples(index=False):
        source_id = int(row.movieId)
        if source_id not in movie_index:
            continue
        source_index = movie_index[source_id]
        for similar in top_similar(item_sim, movie_ids, source_index, limit=20):
            target_id = int(similar["movieId"])
            if target_id in seen:
                continue
            score = float(row.rating) * float(similar["similarity"])
            previous = scores.get(target_id)
            if previous is None or score > previous["score"]:
                scores[target_id] = {
                    "score": score,
                    "sourceId": source_id,
                    "similarity": float(similar["similarity"]),
                }

    recommendations = []
    for movie_id, detail in sorted(scores.items(), key=lambda item: item[1]["score"], reverse=True)[:3]:
        source_title = movie_title.get(int(detail["sourceId"]), f"movie {detail['sourceId']}")
        target_title = movie_title.get(int(movie_id), f"movie {movie_id}")
        recommendations.append(
            {
                "movieId": int(movie_id),
                "score": round(float(detail["score"]), 3),
                "algorithm": "item",
                "reason": (
                    f"{target_title} is close to {source_title} in the item-item similarity matrix "
                    f"({detail['similarity']:.2f} cosine similarity)."
                ),
            }
        )

    rated_payload = [{"movieId": int(row.movieId), "rating": float(row.rating)} for row in rated.itertuples(index=False)]
    top_title = movie_title.get(int(rated.iloc[0]["movieId"]), "the user's strongest rating") if not rated.empty else "high ratings"
    success = (
        f"The top recommendation is likely successful when it extends the same taste cluster as {top_title}."
        if recommendations
        else "A strong recommendation should be close to the user's highest-rated cluster."
    )
    possible_error = (
        "The recommendation can still be wrong if the user wants a different mood, era, or genre today."
    )

    return {
        "userId": int(user_id),
        "profile": "Auto-generated MovieLens profile from high-confidence ratings.",
        "ratedMovies": rated_payload,
        "recommendations": recommendations,
        "successCase": success,
        "possibleError": possible_error,
    }


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--raw-dir", type=Path, default=DEFAULT_RAW)
    parser.add_argument("--out-dir", type=Path, default=DEFAULT_OUT)
    parser.add_argument("--top-movies", type=int, default=220)
    parser.add_argument("--top-users", type=int, default=80)
    args = parser.parse_args()

    ratings_path = args.raw_dir / "ratings.csv"
    movies_path = args.raw_dir / "movies.csv"
    if not ratings_path.exists() or not movies_path.exists():
        raise FileNotFoundError(
            f"Expected ratings.csv and movies.csv in {args.raw_dir}. "
            "Download ml-latest-small from https://grouplens.org/datasets/movielens/ first."
        )

    args.out_dir.mkdir(parents=True, exist_ok=True)

    ratings = pd.read_csv(ratings_path)
    movies = pd.read_csv(movies_path)

    movie_stats = (
        ratings.groupby("movieId")["rating"]
        .agg(avgRating="mean", ratingCount="count")
        .reset_index()
        .sort_values(["ratingCount", "avgRating"], ascending=False)
        .head(args.top_movies)
    )
    active_users = (
        ratings[ratings["movieId"].isin(movie_stats["movieId"])]
        .groupby("userId")["rating"]
        .count()
        .sort_values(ascending=False)
        .head(args.top_users)
        .index
    )

    sample_ratings = ratings[
        ratings["movieId"].isin(movie_stats["movieId"]) & ratings["userId"].isin(active_users)
    ].copy()
    matrix = sample_ratings.pivot_table(index="userId", columns="movieId", values="rating").fillna(0)
    movie_ids = [int(movie_id) for movie_id in matrix.columns]
    user_ids = [int(user_id) for user_id in matrix.index]

    item_sim = cosine_similarity(matrix.T)
    user_sim = cosine_similarity(matrix)

    components = min(4, max(2, min(matrix.shape) - 1))
    svd = TruncatedSVD(n_components=components, random_state=42)
    item_factors = svd.fit_transform(matrix.T)
    if components < 4:
        item_factors = np.pad(item_factors, ((0, 0), (0, 4 - components)))

    global_mean = float(ratings["rating"].mean())
    movie_payload = []
    movie_meta = movies.merge(movie_stats, on="movieId", how="inner")
    movie_meta = movie_meta.set_index("movieId").loc[movie_ids].reset_index()
    for index, row in movie_meta.iterrows():
        title, year = parse_title(row["title"])
        movie_payload.append(
            {
                "movieId": int(row["movieId"]),
                "title": title,
                "year": year,
                "genres": row["genres"].split("|") if isinstance(row["genres"], str) else [],
                "avgRating": round(float(row["avgRating"]), 3),
                "ratingCount": int(row["ratingCount"]),
                "popularityScore": weighted_popularity(float(row["avgRating"]), int(row["ratingCount"]), global_mean),
                "latentFactors": [round(float(value), 4) for value in item_factors[index][:4]],
            }
        )

    rating_payload = [
        {"userId": int(row.userId), "movieId": int(row.movieId), "rating": float(row.rating)}
        for row in sample_ratings.itertuples(index=False)
    ]

    matrix_movies = [{"movieId": item["movieId"], "title": item["title"][:24]} for item in movie_payload[:12]]
    matrix_user_ids = user_ids[:12]
    matrix_movie_ids = {movie["movieId"] for movie in matrix_movies}
    matrix_payload = {
        "users": matrix_user_ids,
        "movies": matrix_movies,
        "cells": [
            cell
            for cell in rating_payload
            if cell["userId"] in matrix_user_ids and cell["movieId"] in matrix_movie_ids
        ],
    }

    item_similarity_payload = [
        {"sourceMovieId": int(movie_id), "similar": top_similar(item_sim, movie_ids, index)}
        for index, movie_id in enumerate(movie_ids)
    ]

    user_similarity_payload = []
    for index, user_id in enumerate(user_ids[:12]):
        row = user_sim[index]
        order = np.argsort(row)[::-1]
        similar = []
        for neighbor_index in order:
            if neighbor_index == index:
                continue
            similar.append({"userId": int(user_ids[neighbor_index]), "similarity": round(float(row[neighbor_index]), 4)})
            if len(similar) == 5:
                break
        user_similarity_payload.append({"sourceUserId": int(user_id), "similar": similar})

    movie_title = {item["movieId"]: item["title"] for item in movie_payload}
    case_payload = [
        build_case_recommendations(int(user_id), sample_ratings, item_sim, movie_ids, movie_title)
        for user_id in user_ids[:2]
    ]

    outputs = {
        "movies.json": movie_payload,
        "ratings_sample.json": rating_payload,
        "user_item_matrix.json": matrix_payload,
        "item_similarity.json": item_similarity_payload,
        "user_similarity.json": user_similarity_payload,
        "recommendations_demo.json": case_payload,
    }

    for filename, payload in outputs.items():
        with (args.out_dir / filename).open("w", encoding="utf-8") as file:
            json.dump(payload, file, ensure_ascii=False, indent=2)

    print(f"Wrote {len(outputs)} JSON files to {args.out_dir}")


if __name__ == "__main__":
    main()
