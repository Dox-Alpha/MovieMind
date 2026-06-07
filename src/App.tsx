import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Github, Loader2, Play, Rocket } from "lucide-react";
import { AnimatedGraph } from "./components/AnimatedGraph";
import { Playground } from "./components/Playground";
import {
  AlgorithmSection,
  CaseStudySection,
  ConclusionSection,
  DataSection,
  MatrixSection,
  PipelineSection,
  RiskSection,
  ScrollRail,
  SimilaritySection,
} from "./components/Sections";
import { loadDemoData } from "./lib/data";
import type { DemoData } from "./types";

function Header() {
  return (
    <header className="fixed left-0 right-0 top-0 z-40 border-b border-white/10 bg-ink/72 backdrop-blur-xl">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <a href="#top" className="flex items-center gap-3">
          <span className="grid h-9 w-9 place-items-center rounded-lg border border-cyan/30 bg-cyan/10 text-cyan">
            <Rocket size={17} />
          </span>
          <span className="text-sm font-bold text-white">MovieMind</span>
        </a>
        <div className="hidden items-center gap-5 text-xs font-semibold text-slate-400 md:flex">
          <a className="hover:text-white" href="#playground">Playground</a>
          <a className="hover:text-white" href="#behavior">Pipeline</a>
          <a className="hover:text-white" href="#data">Data</a>
          <a className="hover:text-white" href="#similarity">Similarity</a>
          <a className="hover:text-white" href="#risks-detail">Risks</a>
        </div>
        <div className="flex items-center gap-2">
          <a
            className="hidden h-9 items-center gap-2 rounded-lg border border-white/10 px-3 text-xs font-semibold text-slate-300 transition hover:border-cyan/40 hover:text-cyan sm:flex"
            href="https://grouplens.org/datasets/movielens/"
            target="_blank"
            rel="noreferrer"
          >
            MovieLens
          </a>
          <a
            className="flex h-9 items-center gap-2 rounded-lg border border-white/10 px-3 text-xs font-semibold text-slate-300 transition hover:border-cyan/40 hover:text-cyan"
            href="https://github.com/Dox-Alpha/MovieMind"
            target="_blank"
            rel="noreferrer"
            aria-label="Open MovieMind GitHub repository"
          >
            <Github size={15} />
            <span className="hidden sm:inline">GitHub</span>
          </a>
        </div>
      </nav>
    </header>
  );
}

function Hero() {
  return (
    <section id="top" className="relative min-h-screen overflow-hidden px-4 pt-28 sm:px-6 lg:px-8">
      <div className="hero-grid absolute inset-0" />
      <div className="absolute inset-x-0 top-0 h-[540px] bg-[radial-gradient(circle_at_20%_20%,rgba(50,217,255,0.15),transparent_32%),radial-gradient(circle_at_80%_30%,rgba(139,92,246,0.15),transparent_34%)]" />
      <div className="relative mx-auto grid min-h-[calc(100vh-7rem)] max-w-7xl items-center gap-10 pb-20 lg:grid-cols-[0.96fr_1.04fr]">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65 }}
        >
          <h1 className="max-w-4xl text-5xl font-semibold leading-[1.02] tracking-tight text-white sm:text-6xl lg:text-7xl">
            MovieLens Mini Recommender System
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
            From user behavior to personalized movie recommendations. Rate movies, switch algorithms, inspect matrices, and follow the full recommendation pipeline.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-cyan px-5 text-sm font-bold text-ink transition hover:bg-white" href="#behavior">
              <Play size={17} fill="currentColor" />
              Start Exploring
            </a>
            <a className="inline-flex h-12 items-center justify-center rounded-lg border border-white/12 bg-white/[0.04] px-5 text-sm font-bold text-white transition hover:border-violet/50 hover:text-violet" href="#playground">
              Try Recommendation
            </a>
          </div>
          <div className="mt-10 grid max-w-2xl grid-cols-3 gap-3">
            {[
              ["4", "algorithms"],
              ["10", "ranked results"],
              ["6", "pipeline stages"],
            ].map(([value, label]) => (
              <div key={label} className="rounded-lg border border-white/10 bg-white/[0.04] p-4">
                <div className="text-2xl font-bold text-white">{value}</div>
                <div className="mt-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">{label}</div>
              </div>
            ))}
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.15 }}
        >
          <AnimatedGraph />
        </motion.div>
      </div>
    </section>
  );
}

function LoadingState() {
  return (
    <div className="grid min-h-screen place-items-center bg-ink text-slate-300">
      <div className="flex items-center gap-3 rounded-lg border border-line bg-panel p-5">
        <Loader2 className="animate-spin text-cyan" />
        Loading MovieMind demo data...
      </div>
    </div>
  );
}

function App() {
  const [data, setData] = useState<DemoData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDemoData().then(setData).catch((reason: Error) => setError(reason.message));
  }, []);

  if (error) {
    return (
      <div className="grid min-h-screen place-items-center bg-ink p-6 text-center text-red-100">
        <div className="rounded-lg border border-coral/30 bg-coral/10 p-6">{error}</div>
      </div>
    );
  }

  if (!data) return <LoadingState />;

  return (
    <main className="min-h-screen bg-ink text-slate-100">
      <Header />
      <ScrollRail />
      <Hero />
      <Playground data={data} />
      <PipelineSection />
      <DataSection data={data} />
      <MatrixSection data={data} />
      <SimilaritySection data={data} />
      <AlgorithmSection />
      <CaseStudySection data={data} />
      <RiskSection />
      <ConclusionSection />
    </main>
  );
}

export default App;
