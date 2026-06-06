import { motion } from "framer-motion";

type Tone = "cyan" | "violet" | "amber" | "emerald";

type GraphNode = {
  id: string;
  label: string;
  detail: string;
  glyph: string;
  x: number;
  y: number;
  w: number;
  h: number;
  tone: Tone;
};

type Link = {
  id: string;
  d: string;
  delay: number;
  width?: number;
};

const nodes: GraphNode[] = [
  { id: "u1", label: "User 12", detail: "ratings", glyph: "U", x: 72, y: 92, w: 128, h: 54, tone: "cyan" },
  { id: "u2", label: "User 27", detail: "neighbor", glyph: "U", x: 72, y: 218, w: 128, h: 54, tone: "violet" },
  {
    id: "engine",
    label: "Vector Match",
    detail: "cosine model",
    glyph: "CF",
    x: 328,
    y: 132,
    w: 170,
    h: 78,
    tone: "emerald",
  },
  { id: "m1", label: "Toy Story", detail: "liked item", glyph: "M", x: 592, y: 80, w: 136, h: 54, tone: "amber" },
  { id: "m2", label: "The Matrix", detail: "candidate", glyph: "M", x: 592, y: 226, w: 136, h: 54, tone: "cyan" },
  { id: "r1", label: "Top-10", detail: "ranked", glyph: "#", x: 724, y: 151, w: 116, h: 54, tone: "violet" },
];

const links: Link[] = [
  { id: "u1-engine", d: "M 200 119 C 250 104 286 122 328 154", delay: 0 },
  { id: "u2-engine", d: "M 200 245 C 252 258 286 214 328 188", delay: 0.35 },
  { id: "engine-m1", d: "M 498 156 C 540 112 560 106 592 107", delay: 0.7, width: 3 },
  { id: "engine-m2", d: "M 498 188 C 540 226 560 252 592 253", delay: 1.05, width: 3 },
  { id: "m1-r1", d: "M 728 107 C 760 112 786 132 778 151", delay: 1.4 },
  { id: "m2-r1", d: "M 728 253 C 762 244 786 220 778 205", delay: 1.75 },
];

const candidates = [
  { x: 800, y: 86, score: "4.8", delay: 0 },
  { x: 835, y: 118, score: "4.6", delay: 0.32 },
  { x: 836, y: 238, score: "4.4", delay: 0.64 },
  { x: 800, y: 270, score: "4.2", delay: 0.96 },
];

const metricPills = [
  { label: "cosine", value: "0.91", x: 306, y: 246, w: 104 },
  { label: "blend", value: "CF+SVD", x: 420, y: 246, w: 108 },
];

const tone = {
  cyan: { stroke: "#32d9ff", fill: "rgba(50,217,255,0.12)", soft: "rgba(50,217,255,0.22)" },
  violet: { stroke: "#8b5cf6", fill: "rgba(139,92,246,0.13)", soft: "rgba(139,92,246,0.22)" },
  amber: { stroke: "#fbbf24", fill: "rgba(251,191,36,0.13)", soft: "rgba(251,191,36,0.2)" },
  emerald: { stroke: "#34d399", fill: "rgba(52,211,153,0.12)", soft: "rgba(52,211,153,0.2)" },
};

function NodeCard({ node, index }: { node: GraphNode; index: number }) {
  const color = tone[node.tone];

  return (
    <motion.g
      filter="url(#nodeGlow)"
      animate={{ y: [0, -2, 0], opacity: [0.92, 1, 0.92] }}
      transition={{ duration: 4, repeat: Infinity, delay: index * 0.22 }}
    >
      <rect
        x={node.x}
        y={node.y}
        width={node.w}
        height={node.h}
        rx="10"
        fill="rgba(7,10,18,0.92)"
        stroke={color.stroke}
        strokeOpacity="0.42"
      />
      <rect
        x={node.x + 12}
        y={node.y + 13}
        width="30"
        height="30"
        rx="7"
        fill={color.fill}
        stroke={color.stroke}
        strokeOpacity="0.62"
      />
      <text x={node.x + 27} y={node.y + 33} textAnchor="middle" fill={color.stroke} fontSize="10" fontWeight="850">
        {node.glyph}
      </text>
      <text x={node.x + 52} y={node.y + 26} fill="#f8fafc" fontSize="16" fontWeight="780">
        {node.label}
      </text>
      <text x={node.x + 52} y={node.y + 43} fill="#94a3b8" fontSize="10" fontWeight="650">
        {node.detail}
      </text>
    </motion.g>
  );
}

export function AnimatedGraph() {
  return (
    <div className="relative h-[360px] overflow-hidden rounded-lg border border-line bg-panel/80 shadow-glow">
      <div className="absolute inset-0 graph-grid opacity-70" />
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 860 340"
        preserveAspectRatio="xMidYMid meet"
        aria-label="Live graph showing user ratings, similarity scoring, movies, and ranked recommendations"
      >
        <defs>
          <radialGradient id="engineAura" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(50,217,255,0.38)" />
            <stop offset="56%" stopColor="rgba(139,92,246,0.16)" />
            <stop offset="100%" stopColor="rgba(50,217,255,0)" />
          </radialGradient>
          <linearGradient id="linkGradient" x1="0%" x2="100%">
            <stop offset="0%" stopColor="#32d9ff" stopOpacity="0.14" />
            <stop offset="48%" stopColor="#32d9ff" stopOpacity="0.95" />
            <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.62" />
          </linearGradient>
          <filter id="nodeGlow" x="-36%" y="-80%" width="172%" height="260%">
            <feGaussianBlur stdDeviation="10" result="blur" />
            <feColorMatrix
              in="blur"
              type="matrix"
              values="0 0 0 0 0.22 0 0 0 0 0.65 0 0 0 0 1 0 0 0 0.34 0"
              result="glow"
            />
            <feMerge>
              <feMergeNode in="glow" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="softGlow" x="-80%" y="-80%" width="260%" height="260%">
            <feGaussianBlur stdDeviation="8" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <motion.circle
          cx="413"
          cy="171"
          r="112"
          fill="url(#engineAura)"
          animate={{ opacity: [0.22, 0.42, 0.22], scale: [0.96, 1.04, 0.96] }}
          transition={{ duration: 5.2, repeat: Infinity }}
        />
        <motion.circle
          cx="770"
          cy="178"
          r="92"
          fill="url(#engineAura)"
          animate={{ opacity: [0.14, 0.3, 0.14], scale: [1, 1.07, 1] }}
          transition={{ duration: 5.6, repeat: Infinity, delay: 0.8 }}
        />

        <g opacity="0.42">
          <path d="M 328 171 H 498" stroke="rgba(52,211,153,0.16)" strokeDasharray="4 9" />
          <path d="M 413 96 V 246" stroke="rgba(52,211,153,0.12)" strokeDasharray="4 9" />
          <circle cx="413" cy="171" r="48" fill="none" stroke="rgba(52,211,153,0.13)" />
          <circle cx="413" cy="171" r="72" fill="none" stroke="rgba(50,217,255,0.1)" />
        </g>

        {links.map((link) => (
          <g key={link.id}>
            <path d={link.d} fill="none" stroke="rgba(50,217,255,0.16)" strokeWidth={link.width ?? 2} />
            <motion.path
              d={link.d}
              fill="none"
              stroke="url(#linkGradient)"
              strokeLinecap="round"
              strokeWidth={link.width ?? 2.5}
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: [0, 0.72, 1], opacity: [0, 0.95, 0] }}
              transition={{ duration: 3.1, repeat: Infinity, delay: link.delay }}
            />
          </g>
        ))}

        <motion.g
          filter="url(#softGlow)"
          animate={{ rotate: 360 }}
          transition={{ duration: 24, repeat: Infinity, ease: "linear" }}
          style={{ transformOrigin: "413px 171px" }}
        >
          <circle cx="413" cy="106" r="3" fill="#34d399" />
          <circle cx="467" cy="205" r="3" fill="#32d9ff" />
          <circle cx="359" cy="209" r="3" fill="#8b5cf6" />
        </motion.g>

        {candidates.map((candidate) => (
          <motion.g
            key={`${candidate.x}-${candidate.y}`}
            animate={{ opacity: [0.3, 0.98, 0.3], scale: [0.88, 1.08, 0.88] }}
            transition={{ duration: 2.6, repeat: Infinity, delay: candidate.delay }}
            style={{ transformOrigin: `${candidate.x}px ${candidate.y}px` }}
          >
            <circle cx={candidate.x} cy={candidate.y} r="14" fill="rgba(50,217,255,0.08)" stroke="rgba(50,217,255,0.34)" />
            <text x={candidate.x} y={candidate.y + 4} textAnchor="middle" fill="#bae6fd" fontSize="10" fontWeight="800">
              {candidate.score}
            </text>
          </motion.g>
        ))}

        {nodes.map((node, index) => (
          <NodeCard key={node.id} node={node} index={index} />
        ))}

        <g>
          {metricPills.map((metric) => (
            <g key={metric.label}>
              <rect
                x={metric.x}
                y={metric.y}
                width={metric.w}
                height="34"
                rx="8"
                fill="rgba(7,10,18,0.82)"
                stroke="rgba(50,217,255,0.2)"
              />
              <text x={metric.x + 12} y={metric.y + 21} fill="#94a3b8" fontSize="10" fontWeight="750">
                {metric.label}
              </text>
              <text x={metric.x + 56} y={metric.y + 21} fill="#e0f2fe" fontSize="11" fontWeight="850">
                {metric.value}
              </text>
            </g>
          ))}
        </g>

        <motion.rect
          x="306"
          y="108"
          width="214"
          height="126"
          rx="18"
          fill="none"
          stroke="rgba(52,211,153,0.24)"
          strokeDasharray="8 12"
          animate={{ strokeDashoffset: [0, -80] }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
        />
      </svg>
      <div className="absolute bottom-4 left-6 right-6 rounded-lg border border-cyan/20 bg-ink/90 p-3 text-xs text-slate-300 backdrop-blur">
        Live graph: ratings are encoded, matched against neighbors, then ranked into recommendation candidates.
      </div>
    </div>
  );
}
