export default function HeartPointerGraphic({ className = "", direction = "left" }) {
  const flip = direction === "right";

  return (
    <div className={className} aria-hidden="true">
      <div className="rounded-3xl border border-gray-200 bg-white shadow-sm p-5">
        <div className="rounded-3xl bg-gradient-to-br from-gray-50 to-blue-50 border border-gray-200 overflow-hidden">
          <svg viewBox="0 0 420 520" className="w-full h-auto" role="img" aria-label="Pointer">
            <defs>
              <linearGradient id="hpg_bg" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="100%" stopColor="#eef2ff" />
              </linearGradient>
              <linearGradient id="hpg_pointer" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#111827" stopOpacity="0.18" />
                <stop offset="100%" stopColor="#111827" stopOpacity="0.08" />
              </linearGradient>
              <filter id="hpg_softShadow" x="-30%" y="-30%" width="160%" height="160%">
                <feDropShadow dx="0" dy="18" stdDeviation="18" floodColor="#111827" floodOpacity="0.12" />
              </filter>
            </defs>

            <rect x="0" y="0" width="420" height="520" fill="url(#hpg_bg)" />

            <g transform={flip ? "translate(420,0) scale(-1,1)" : undefined}>
              {/* soft guide line */}
              <path
                d="M310 168c-68 12-130 52-168 104-18 25-28 53-34 79"
                fill="none"
                stroke="#94a3b8"
                strokeOpacity="0.55"
                strokeWidth="6"
                strokeLinecap="round"
                strokeDasharray="2 18"
              />

              {/* pointer/hand shape (minimal, premium) */}
              <g filter="url(#hpg_softShadow)">
                <path
                  d="M270 148c-10 0-19 7-22 17l-9 31c-2 6-8 10-14 10h-50c-14 0-26 10-28 24l-6 45c-3 21 9 41 29 46l72 19c20 5 42 2 59-9l46-29c14-9 21-26 16-42l-17-55c-2-7-9-12-16-12h-18l7-23c4-14-6-30-22-30h-27Z"
                  fill="url(#hpg_pointer)"
                  stroke="#cbd5e1"
                  strokeWidth="2"
                />

                {/* fingertip highlight */}
                <path
                  d="M318 204c8 0 14 5 16 12l5 16c3 10-2 20-12 24l-40 16"
                  fill="none"
                  stroke="#94a3b8"
                  strokeOpacity="0.45"
                  strokeWidth="5"
                  strokeLinecap="round"
                />

                {/* heart marker near the tip */}
                <g transform="translate(300 160)">
                  <path
                    d="M16 6c2-4 7-6 11-4 4 2 5 7 2 11-2 3-7 7-13 12C10 20 5 16 3 13 0 9 1 4 5 2c4-2 9 0 11 4Z"
                    fill="#b91c1c"
                    opacity="0.95"
                  />
                </g>
              </g>
            </g>
          </svg>
        </div>
      </div>
    </div>
  );
}
