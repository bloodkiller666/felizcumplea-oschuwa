const CANDLES = [112, 131, 150, 169, 188];
export const PLATES = [
  { x: 66, label: "Para ti" },
  { x: 150, label: "Pankoki" },
  { x: 234, label: "Motoperro" },
];

/* El pastel del cumpleaños. El cuerpo se dibuja una vez y se reutiliza en tres bandas para poder cortarlo en rebanadas. */
export default function Cake() {
  return (
    <svg className="cake-svg" viewBox="0 0 300 300" aria-hidden="true">
      <defs>
        <g id="cake-body">
          <rect x="60" y="146" width="180" height="72" rx="10" fill="#f6b98f" />
          <rect x="60" y="146" width="180" height="14" fill="#fff1df" />
          <path d="M60 160 q9 14 18 0 q9 20 18 0 q9 12 18 0 q9 18 18 0 q9 14 18 0 q9 20 18 0 q9 12 18 0 q9 16 18 0 q9 12 18 0 q9 18 18 0" fill="#fff1df" />
          <rect x="95" y="98" width="110" height="52" rx="9" fill="#ff9fbf" />
          <rect x="95" y="98" width="110" height="12" fill="#fff1df" />
          <path d="M95 110 q9 12 18 0 q9 16 18 0 q9 10 18 0 q9 14 18 0 q9 12 18 0 q9 10 18 0" fill="#fff1df" />
          <circle cx="82" cy="190" r="5" fill="#e0589c" />
          <circle cx="120" cy="196" r="5" fill="#7c93ff" />
          <circle cx="150" cy="188" r="5" fill="#e0589c" />
          <circle cx="182" cy="196" r="5" fill="#7c93ff" />
          <circle cx="218" cy="190" r="5" fill="#e0589c" />
        </g>
        <clipPath id="cut-a"><rect x="40" y="60" width="80" height="170" /></clipPath>
        <clipPath id="cut-b"><rect x="120" y="60" width="60" height="170" /></clipPath>
        <clipPath id="cut-c"><rect x="180" y="60" width="80" height="170" /></clipPath>
      </defs>

      <ellipse className="cake-plate" cx="150" cy="222" rx="140" ry="16" fill="#fff1df" />
      <ellipse className="cake-plate" cx="150" cy="218" rx="128" ry="11" fill="#f2d9bd" />

      {(["a", "b", "c"] as const).map((k) => (
        <g className={`slice slice-${k}`} key={k} clipPath={`url(#cut-${k})`}>
          <use href="#cake-body" />
        </g>
      ))}

      <g className="candles">
        {CANDLES.map((x, i) => (
          <g className="candle" key={x}>
            <rect x={x - 3} y="72" width="6" height="28" rx="2" fill={i % 2 ? "#7c93ff" : "#ffb86b"} />
            <path d={`M${x - 3} 80 l6 4 M${x - 3} 88 l6 4`} stroke="#fff1df" strokeWidth="2" strokeLinecap="round" />
            <g className="flame" style={{ animationDelay: `${i * -0.3}s` }}>
              <ellipse cx={x} cy="62" rx="5.5" ry="9" fill="#ffb86b" />
              <ellipse cx={x} cy="64" rx="2.8" ry="5.5" fill="#fff6d8" />
            </g>
            <path className="smoke" d={`M${x} 66 q-7 -12 0 -24 q7 -12 0 -24`} fill="none" stroke="#fff1df" strokeWidth="3" strokeLinecap="round" opacity="0" />
          </g>
        ))}
      </g>

      <g className="knife" opacity="0">
        <rect x="147" y="20" width="6" height="200" rx="3" fill="#e9eef6" />
        <rect x="143" y="2" width="14" height="30" rx="5" fill="#7a3d5c" />
      </g>

      {PLATES.map((p) => (
        <g className="plate" key={p.x} opacity="0">
          <ellipse cx={p.x} cy="282" rx="36" ry="9" fill="#fff1df" />
          <ellipse cx={p.x} cy="280" rx="28" ry="6" fill="#f2d9bd" />
          <text x={p.x} y="300" textAnchor="middle" fontWeight="700" fill="#ffc9b3" fontFamily="var(--font-hand-stack)" style={{ fontSize: 15 }}>
            {p.label}
          </text>
        </g>
      ))}
    </svg>
  );
}
