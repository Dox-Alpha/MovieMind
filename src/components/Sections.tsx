import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  BadgeCheck,
  BrainCircuit,
  Database,
  Eye,
  Fingerprint,
  GitBranch,
  Lock,
  Network,
  Radar,
  ShieldAlert,
  Snowflake,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { DemoData, Movie, Rating } from "../types";
import { getAlgorithmLabel } from "../lib/recommender";

const stageItems = [
  { name: "Behavior", icon: Fingerprint, target: "behavior" },
  { name: "Matrix", icon: Database, target: "matrix" },
  { name: "Similarity", icon: Network, target: "similarity" },
  { name: "Recommendation", icon: Sparkles, target: "recommendation" },
  { name: "Explanation", icon: Eye, target: "explanation" },
  { name: "Risks", icon: ShieldAlert, target: "risks-detail" },
];

const computeSteps = [
  { label: "Input", value: "rating = 5", detail: "A user marks a movie as strongly liked." },
  { label: "Compare", value: "cosine = 0.91", detail: "The system finds similar users or movies." },
  { label: "Rank", value: "score = 4.72", detail: "Candidates are sorted into a recommendation list." },
  { label: "Explain", value: "reason", detail: "The UI turns the score into a readable reason." },
];

const algorithmRows = [
  {
    algorithm: "Popularity",
    core: "Rank movies by weighted rating and rating count.",
    input: "Movie average rating, rating count",
    strength: "Stable, fast, good cold-start fallback",
    weakness: "Not personalized, amplifies blockbusters",
    scenario: "First visit or too few ratings",
  },
  {
    algorithm: "User-based CF",
    core: "Find users with similar rating vectors.",
    input: "User-item matrix",
    strength: "Easy to explain through similar users",
    weakness: "Sparse data reduces neighbor quality",
    scenario: "Enough overlapping ratings",
  },
  {
    algorithm: "Item-based CF",
    core: "Recommend movies similar to liked movies.",
    input: "Item-item cosine similarity",
    strength: "Stable and intuitive reasons",
    weakness: "Can over-focus on one taste cluster",
    scenario: "User has a few strong favorites",
  },
  {
    algorithm: "SVD",
    core: "Project users and movies into latent factors.",
    input: "Decomposed rating matrix",
    strength: "Discovers hidden taste dimensions",
    weakness: "Less transparent to non-technical users",
    scenario: "Larger datasets and mixed preferences",
  },
];

const risks = [
  { title: "Data sparsity", icon: Database, copy: "Most users rate only a tiny fraction of movies, so similarity can be fragile." },
  { title: "Cold start", icon: Snowflake, copy: "New users or new movies lack enough behavior data for confident personalization." },
  { title: "Filter bubble", icon: Radar, copy: "Repeatedly showing similar content can narrow exploration and discovery." },
  { title: "Privacy exposure", icon: Lock, copy: "Rating behavior can reveal sensitive taste, identity, or life patterns." },
  { title: "Interest fixation", icon: BrainCircuit, copy: "The system may keep reinforcing old interests instead of adapting to change." },
  { title: "Popularity bias", icon: TrendingUp, copy: "Popular items get more exposure, making long-tail movies harder to discover." },
  { title: "Low diversity", icon: GitBranch, copy: "A high score list can still feel repetitive if genres and moods are too similar." },
];

function SectionFrame({
  label,
  title,
  children,
  id,
}: {
  label: string;
  title: string;
  id: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="section-pad">
      <motion.div
        className="mx-auto max-w-7xl"
        initial={{ opacity: 0, y: 28 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.55 }}
      >
        <p className="section-label">{label}</p>
        <h2 className="section-title mb-8">{title}</h2>
        {children}
      </motion.div>
    </section>
  );
}

export function ScrollRail() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > window.innerHeight * 0.65);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <aside
      className={`fixed right-0 top-1/2 z-30 hidden -translate-y-1/2 transition duration-300 xl:block ${
        visible ? "opacity-100" : "pointer-events-none opacity-0"
      }`}
    >
      <div
        className="w-[212px] translate-x-[158px] rounded-l-lg border border-r-0 border-line bg-ink/82 p-2 shadow-glow backdrop-blur transition-transform duration-300 hover:translate-x-0 focus-within:translate-x-0"
      >
        {stageItems.map((item, index) => {
          const Icon = item.icon;
          return (
            <a key={item.name} href={`#${item.target}`} className="flex items-center gap-3 rounded-md py-2 transition hover:bg-cyan/5">
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-md border border-cyan/20 bg-cyan/5 text-cyan transition">
                <Icon size={14} />
              </span>
              <span className="whitespace-nowrap text-xs font-semibold text-slate-400 transition hover:text-white">
                {index + 1}. {item.name}
              </span>
            </a>
          );
        })}
      </div>
    </aside>
  );
}

export function PipelineSection() {
  return (
    <SectionFrame id="behavior" label="Pipeline Animation" title="A recommender system is a chain of transformations.">
      <div className="grid gap-5 lg:grid-cols-[1fr_360px]">
        <div className="rounded-lg border border-line bg-panel/75 p-5">
          <div className="mb-6 rounded-lg border border-cyan/20 bg-ink/70 p-4">
            <div className="pipeline-visual" aria-hidden="true">
              <span className="pipeline-beam" />
              <span className="pipeline-packet packet-one" />
              <span className="pipeline-packet packet-two" />
              {stageItems.map((stage, index) => {
                const Icon = stage.icon;
                return (
                  <motion.div
                    key={stage.name}
                    className="pipeline-node"
                    animate={{
                      boxShadow: [
                        "0 0 0 rgba(50,217,255,0)",
                        "0 0 24px rgba(50,217,255,0.42)",
                        "0 0 0 rgba(50,217,255,0)",
                      ],
                      borderColor: [
                        "rgba(50,217,255,0.24)",
                        "rgba(50,217,255,0.72)",
                        "rgba(50,217,255,0.24)",
                      ],
                    }}
                    transition={{ duration: 2.4, repeat: Infinity, delay: index * 0.38 }}
                  >
                    <Icon size={16} />
                  </motion.div>
                );
              })}
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2 text-center text-[11px] font-semibold text-slate-500 md:grid-cols-6">
              {stageItems.map((stage) => (
                <span key={stage.name}>{stage.name}</span>
              ))}
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {stageItems.map((stage, index) => {
              const Icon = stage.icon;
              return (
                <motion.div
                  key={stage.name}
                  className="relative min-h-[180px] rounded-lg border border-white/10 bg-white/[0.035] p-5"
                  initial={{ opacity: 0.3, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.12 }}
                >
                  <div className="mb-5 flex h-10 w-10 items-center justify-center rounded-lg border border-cyan/30 bg-cyan/10 text-cyan">
                    <Icon size={18} />
                  </div>
                  <p className="text-base font-semibold text-white">{stage.name}</p>
                  <p className="mt-2 text-xs leading-relaxed text-slate-400">
                    {[
                      "Ratings and clicks become preference signals.",
                      "Signals form a user-item rating matrix.",
                      "Cosine similarity finds related users or movies.",
                      "Candidates are ranked into a Top-10 list.",
                      "Each score gets a human-readable reason.",
                      "Bias, privacy, and cold start are inspected.",
                    ][index]}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
        <SystemLens />
      </div>
    </SectionFrame>
  );
}

function SystemLens() {
  return (
    <div className="sticky top-24 h-fit rounded-lg border border-cyan/20 bg-cyan/[0.04] p-5 shadow-glow">
      <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-cyan">
        <BrainCircuit size={17} />
        What is being computed
      </div>
      <div className="space-y-3">
        {computeSteps.map((item, index) => (
          <motion.div
            key={item.label}
            className="rounded-lg border border-white/10 bg-ink/70 p-3"
            animate={{ borderColor: ["rgba(255,255,255,0.1)", "rgba(50,217,255,0.45)", "rgba(255,255,255,0.1)"] }}
            transition={{ duration: 2.2, repeat: Infinity, delay: index * 0.38 }}
          >
            <div className="mb-1 flex items-center justify-between gap-3">
              <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500">{item.label}</span>
              <span className="text-xs font-semibold text-cyan">{item.value}</span>
            </div>
            <p className="text-xs leading-relaxed text-slate-300">{item.detail}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

export function DataSection({ data }: { data: DemoData }) {
  const ratingDistribution = useMemo(() => {
    const buckets = [1, 2, 3, 4, 5].map((rating) => ({ rating: `${rating}`, count: 0 }));
    data.ratings.forEach((item) => {
      const index = Math.min(4, Math.max(0, Math.round(item.rating) - 1));
      buckets[index].count += 1;
    });
    return buckets;
  }, [data.ratings]);

  const genreDistribution = useMemo(() => {
    const counts = new Map<string, number>();
    data.movies.forEach((movie) => movie.genres.forEach((genre) => counts.set(genre, (counts.get(genre) ?? 0) + 1)));
    return [...counts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([name, value]) => ({ name, value }));
  }, [data.movies]);

  return (
    <SectionFrame id="data" label="Data Source" title="MovieLens ratings become the behavior layer.">
      <div className="grid gap-5 lg:grid-cols-[360px_1fr]">
        <div className="rounded-lg border border-line bg-panel/75 p-5">
          <p className="mb-5 text-sm leading-relaxed text-slate-300">
            This demo uses a compact MovieLens-style sample for instant GitHub playback. The Python script can regenerate these JSON files from MovieLens small after the dataset is downloaded locally.
          </p>
          <div className="grid gap-3">
            {[
              ["Dataset", "MovieLens small"],
              ["Files", "ratings.csv / movies.csv"],
              ["Demo users", `${new Set(data.ratings.map((rating) => rating.userId)).size}`],
              ["Demo movies", `${data.movies.length}`],
              ["Demo ratings", `${data.ratings.length}`],
            ].map(([label, value]) => (
              <div key={label} className="flex items-center justify-between rounded-lg border border-white/10 bg-white/[0.03] px-4 py-3">
                <span className="text-xs text-slate-500">{label}</span>
                <span className="text-sm font-semibold text-white">{value}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="grid gap-5 md:grid-cols-2">
          <ChartPanel title="Rating distribution">
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={ratingDistribution}>
                <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
                <XAxis dataKey="rating" tick={{ fill: "#94a3b8", fontSize: 12 }} />
                <YAxis tick={{ fill: "#94a3b8", fontSize: 12 }} />
                <Tooltip contentStyle={{ background: "#0e1422", border: "1px solid rgba(255,255,255,0.12)" }} />
                <Bar dataKey="count" fill="#32d9ff" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartPanel>
          <ChartPanel title="Genre distribution">
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={genreDistribution} dataKey="value" nameKey="name" innerRadius={54} outerRadius={88} paddingAngle={3}>
                  {genreDistribution.map((_, index) => (
                    <Cell key={index} fill={["#32d9ff", "#8b5cf6", "#fbbf24", "#ff6b6b", "#22c55e", "#a78bfa"][index]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: "#0e1422", border: "1px solid rgba(255,255,255,0.12)" }} />
              </PieChart>
            </ResponsiveContainer>
          </ChartPanel>
        </div>
      </div>
    </SectionFrame>
  );
}

function ChartPanel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-line bg-panel/75 p-5">
      <h3 className="mb-4 text-sm font-semibold text-white">{title}</h3>
      {children}
    </div>
  );
}

function cellColor(value?: number) {
  if (!value) return "rgba(148,163,184,0.09)";
  const alpha = 0.18 + value / 5 * 0.62;
  return `rgba(50,217,255,${alpha})`;
}

export function MatrixSection({ data }: { data: DemoData }) {
  const lookup = new Map(data.matrix.cells.map((cell) => [`${cell.userId}-${cell.movieId}`, cell.rating]));
  const columnCount = data.matrix.movies.length;
  const matrixMinWidth = 128 + columnCount * 132;
  return (
    <SectionFrame id="matrix" label="Rating Matrix" title="The sparse matrix is where recommendations begin.">
      <div className="overflow-x-auto rounded-lg border border-line bg-panel/75 p-5">
        <div style={{ minWidth: matrixMinWidth }}>
          <div
            className="grid gap-2"
            style={{ gridTemplateColumns: `112px repeat(${columnCount}, minmax(120px, 1fr))` }}
          >
            <div />
            {data.matrix.movies.map((movie) => (
              <div key={movie.movieId} className="flex h-16 items-center rounded-md border border-white/10 bg-white/[0.03] p-2 text-[11px] font-semibold leading-tight text-slate-300">
                {movie.title}
              </div>
            ))}
            {data.matrix.users.map((userId) => (
              <div key={userId} className="contents">
                <div className="flex h-11 items-center rounded-md border border-white/10 bg-white/[0.03] px-3 text-xs font-semibold text-cyan">
                  User {userId}
                </div>
                {data.matrix.movies.map((movie) => {
                  const value = lookup.get(`${userId}-${movie.movieId}`);
                  return (
                    <div
                      key={`${userId}-${movie.movieId}`}
                      title={`userId: ${userId}, movie: ${movie.title}, rating: ${value ?? "--"}`}
                      className="grid h-11 place-items-center rounded-md border border-white/10 text-xs font-bold text-white"
                      style={{ background: cellColor(value) }}
                    >
                      {value ?? "--"}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </SectionFrame>
  );
}

export function SimilaritySection({ data }: { data: DemoData }) {
  const [selectedMovieId, setSelectedMovieId] = useState(data.itemSimilarity[0]?.sourceMovieId ?? data.movies[0].movieId);
  const movieMap = new Map(data.movies.map((movie) => [movie.movieId, movie]));
  const selected = data.itemSimilarity.find((item) => item.sourceMovieId === selectedMovieId);
  const userRows = data.userSimilarity.slice(0, 5);

  return (
    <SectionFrame id="similarity" label="Similarity Analysis" title="Similarity turns sparse ratings into useful neighbors.">
      <div className="grid gap-5 lg:grid-cols-2">
        <div className="rounded-lg border border-line bg-panel/75 p-5">
          <div className="mb-4 grid gap-3">
            <h3 className="text-sm font-semibold text-white">Movie similarity Top-5</h3>
            <select
              value={selectedMovieId}
              onChange={(event) => setSelectedMovieId(Number(event.target.value))}
              className="h-11 w-full min-w-0 rounded-lg border border-white/10 bg-ink px-3 text-sm font-semibold text-slate-200 outline-none transition focus:border-cyan/50"
            >
              {data.itemSimilarity.map((entry) => (
                <option key={entry.sourceMovieId} value={entry.sourceMovieId}>
                  {movieMap.get(entry.sourceMovieId)?.title ?? entry.sourceMovieId}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-3">
            {selected?.similar.map((entry, index) => {
              const movie = movieMap.get(entry.movieId ?? 0);
              return (
                <div key={entry.movieId} className="rounded-lg border border-white/10 bg-white/[0.035] p-3">
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <span className="text-sm font-semibold text-white">{index + 1}. {movie?.title}</span>
                    <span className="text-xs font-bold text-cyan">{entry.similarity.toFixed(2)}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-white/10">
                    <div className="h-full rounded-full bg-cyan" style={{ width: `${entry.similarity * 100}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <div className="rounded-lg border border-line bg-panel/75 p-5">
          <h3 className="mb-4 text-sm font-semibold text-white">User similarity matrix</h3>
          <div className="grid gap-3">
            {userRows.map((row) => (
              <div key={row.sourceUserId} className="rounded-lg border border-white/10 bg-white/[0.03] p-3">
                <div className="mb-3 text-xs font-semibold text-cyan">User {row.sourceUserId}</div>
                <div className="grid grid-cols-4 gap-2">
                  {row.similar.slice(0, 4).map((entry) => (
                    <div key={entry.userId} className="rounded-md border border-white/10 p-2 text-center" style={{ background: cellColor((entry.similarity ?? 0) * 5) }}>
                      <div className="text-[11px] text-slate-300">U{entry.userId}</div>
                      <div className="text-xs font-bold text-white">{entry.similarity.toFixed(2)}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </SectionFrame>
  );
}

export function AlgorithmSection() {
  return (
    <SectionFrame id="explanation" label="Algorithm Comparison" title="Different algorithms answer different recommendation questions.">
      <div className="overflow-x-auto rounded-lg border border-line bg-panel/75">
        <table className="min-w-[980px] w-full border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-white/10 text-xs uppercase text-slate-500">
              {["Algorithm", "Core Idea", "Input", "Strength", "Weakness", "Suitable Scenario"].map((head) => (
                <th key={head} className="px-4 py-4 font-semibold">{head}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {algorithmRows.map((row) => (
              <tr key={row.algorithm} className="border-b border-white/5 text-slate-300">
                <td className="px-4 py-4 font-semibold text-cyan">{row.algorithm}</td>
                <td className="px-4 py-4">{row.core}</td>
                <td className="px-4 py-4">{row.input}</td>
                <td className="px-4 py-4">{row.strength}</td>
                <td className="px-4 py-4">{row.weakness}</td>
                <td className="px-4 py-4">{row.scenario}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </SectionFrame>
  );
}

export function CaseStudySection({ data }: { data: DemoData }) {
  const movieMap = new Map(data.movies.map((movie) => [movie.movieId, movie]));
  return (
    <SectionFrame id="risks" label="Case Studies" title="A useful recommender must explain both wins and misses.">
      <div className="grid gap-5 lg:grid-cols-2">
        {data.caseStudies.map((study) => (
          <article key={study.userId} className="rounded-lg border border-line bg-panel/75 p-5">
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold text-white">User {study.userId}</h3>
                <p className="mt-1 text-sm text-slate-400">{study.profile}</p>
              </div>
              <BadgeCheck className="text-cyan" size={22} />
            </div>
            <div className="mb-5">
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Rated movies</p>
              <div className="flex flex-wrap gap-2">
                {study.ratedMovies.map((item) => (
                  <span key={item.movieId} className="rounded-md border border-white/10 bg-white/[0.04] px-2 py-1 text-xs text-slate-300">
                    {movieMap.get(item.movieId)?.title}: {item.rating}
                  </span>
                ))}
              </div>
            </div>
            <div className="space-y-3">
              {study.recommendations.map((item) => (
                <div key={item.movieId} className="rounded-lg border border-white/10 bg-white/[0.035] p-3">
                  <div className="mb-1 flex items-center justify-between gap-3">
                    <span className="text-sm font-semibold text-white">{movieMap.get(item.movieId)?.title}</span>
                    <span className="text-xs text-amber">{item.score.toFixed(2)}</span>
                  </div>
                  <p className="text-xs text-cyan">{getAlgorithmLabel(item.algorithm)}</p>
                  <p className="mt-2 text-xs leading-relaxed text-slate-400">{item.reason}</p>
                </div>
              ))}
            </div>
            <div className="mt-5 grid gap-3 md:grid-cols-2">
              <div className="rounded-lg border border-emerald-400/20 bg-emerald-400/10 p-3 text-xs leading-relaxed text-emerald-100">{study.successCase}</div>
              <div className="rounded-lg border border-coral/20 bg-coral/10 p-3 text-xs leading-relaxed text-red-100">{study.possibleError}</div>
            </div>
          </article>
        ))}
      </div>
    </SectionFrame>
  );
}

export function RiskSection() {
  return (
    <SectionFrame id="risks-detail" label="Limitations & Risks" title="Recommendation quality is also a product responsibility.">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {risks.map((risk) => {
          const Icon = risk.icon;
          return (
            <motion.article
              key={risk.title}
              className="rounded-lg border border-white/10 bg-panel/75 p-5"
              whileHover={{ y: -4, borderColor: "rgba(251,191,36,0.42)" }}
            >
              <div className="mb-5 flex h-10 w-10 items-center justify-center rounded-lg border border-amber/30 bg-amber/10 text-amber">
                <Icon size={18} />
              </div>
              <h3 className="text-sm font-semibold text-white">{risk.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-slate-400">{risk.copy}</p>
            </motion.article>
          );
        })}
      </div>
    </SectionFrame>
  );
}

export function ConclusionSection() {
  return (
    <section className="px-4 pb-20 pt-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl rounded-lg border border-cyan/20 bg-cyan/[0.05] p-8 text-center shadow-glow">
        <AlertTriangle className="mx-auto mb-4 text-amber" size={28} />
        <h2 className="mx-auto max-w-3xl text-3xl font-semibold tracking-tight text-white">
          MovieMind shows how behavior data becomes preference prediction, and why explanation matters as much as ranking.
        </h2>
        <p className="mx-auto mt-5 max-w-3xl text-sm leading-relaxed text-slate-300">
          Similar users often receive similar recommendations because their rating vectors point in nearby directions. Different algorithms expose different tradeoffs: popularity is robust, collaborative filtering is intuitive, and SVD captures hidden structure, but every recommender must be checked for privacy, bias, cold start, and diversity.
        </p>
      </div>
    </section>
  );
}
