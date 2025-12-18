import { useMemo, useState } from "react";

export default function SideGuideCharacter({ className = "", imageUrl }) {
  const [imageFailed, setImageFailed] = useState(false);

  const resolvedImageUrl = useMemo(() => {
    if (!imageUrl || imageFailed) return null;
    return imageUrl;
  }, [imageUrl, imageFailed]);

  if (resolvedImageUrl) {
    return (
      <div className={className} aria-hidden="true">
        <div className="rounded-3xl border border-gray-200 bg-white shadow-sm p-5">
          <div className="rounded-3xl bg-gradient-to-br from-gray-50 to-blue-50 border border-gray-200 overflow-hidden">
            <div className="w-full aspect-[4/5]">
              <img
                src={resolvedImageUrl}
                alt=""
                loading="lazy"
                decoding="async"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
                onError={() => setImageFailed(true)}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={className} aria-hidden="true">
      <svg viewBox="0 0 420 520" className="w-full h-auto" role="img" aria-label="Guide character">
        <defs>
          <linearGradient id="sgc_bg" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#f8fafc" />
            <stop offset="100%" stopColor="#eef2ff" />
          </linearGradient>
          <linearGradient id="sgc_shirt" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="100%" stopColor="#e5e7eb" />
          </linearGradient>
          <linearGradient id="sgc_pants" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#111827" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#111827" stopOpacity="0.7" />
          </linearGradient>
          <linearGradient id="sgc_skin" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f5d0c5" />
            <stop offset="100%" stopColor="#e9b8aa" />
          </linearGradient>
          <filter id="sgc_softShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="18" stdDeviation="18" floodColor="#111827" floodOpacity="0.12" />
          </filter>
        </defs>

        {/* Soft backdrop blob */}
        <path
          d="M300 65c60 35 95 95 88 155-7 62-58 88-54 150 4 63-36 109-98 117-66 9-135-16-166-73-30-56 3-114 10-174 7-61-33-115-4-157 34-49 109-54 166-39 25 6 40 10 58 21Z"
          fill="url(#sgc_bg)"
          opacity="0.9"
        />

        {/* Character group */}
        <g filter="url(#sgc_softShadow)">
          {/* Head */}
          <ellipse cx="248" cy="150" rx="44" ry="52" fill="url(#sgc_skin)" />
          {/* Hair */}
          <path
            d="M206 156c-8-33 5-69 36-83 39-18 82 10 86 52 2 22-7 37-14 46-11-22-33-33-55-30-20 3-36 14-53 30Z"
            fill="#111827"
            opacity="0.9"
          />
          {/* Face */}
          <path d="M232 168c10 10 26 10 36 0" stroke="#111827" strokeOpacity="0.55" strokeWidth="4" strokeLinecap="round" fill="none" />
          <circle cx="232" cy="148" r="4" fill="#111827" fillOpacity="0.7" />
          <circle cx="270" cy="148" r="4" fill="#111827" fillOpacity="0.7" />

          {/* Neck */}
          <path d="M232 196c10 12 30 12 40 0v28c-13 14-30 14-40 0v-28Z" fill="url(#sgc_skin)" />

          {/* Torso (soft jacket) */}
          <path
            d="M172 250c6-26 34-44 62-44h44c28 0 56 18 62 44l18 78c6 26-10 52-36 58l-32 8c-20 5-41 5-62 0l-32-8c-26-6-42-32-36-58l18-78Z"
            fill="url(#sgc_shirt)"
            stroke="#e5e7eb"
            strokeWidth="2"
          />

          {/* Right arm (pointing toward heart, angled left) */}
          <path
            d="M304 262c26 8 42 26 50 44 5 12-2 26-16 30-12 3-24-2-30-12-9-16-22-26-41-32-12-4-18-17-13-29 5-11 17-17 30-13Z"
            fill="url(#sgc_shirt)"
            stroke="#e5e7eb"
            strokeWidth="2"
          />
          {/* Hand (point) */}
          <path
            d="M346 330c11 4 17 16 13 27-3 10-14 15-24 12l-30-10c-10-3-15-14-12-24 4-11 16-17 27-13l26 8Z"
            fill="url(#sgc_skin)"
          />

          {/* Left arm (go-ahead gesture) */}
          <path
            d="M170 274c-28 12-44 34-48 56-2 14 8 26 22 27 12 2 23-5 26-17 4-18 16-34 35-45 11-6 15-20 8-31-7-10-20-14-31-10Z"
            fill="url(#sgc_shirt)"
            stroke="#e5e7eb"
            strokeWidth="2"
          />
          {/* Hand (open) */}
          <path
            d="M120 352c-10 7-12 21-5 31 7 10 21 13 31 6l22-16c9-7 12-20 5-30-7-10-21-13-31-6l-22 15Z"
            fill="url(#sgc_skin)"
          />

          {/* Pants */}
          <path
            d="M206 392c-14 36-18 72-18 96 0 18 14 32 32 32h64c18 0 32-14 32-32 0-24-4-60-18-96-30 10-62 10-92 0Z"
            fill="url(#sgc_pants)"
          />

          {/* Shoes */}
          <path d="M188 496c6 10 16 16 30 16h38c14 0 24-6 30-16" stroke="#111827" strokeOpacity="0.25" strokeWidth="10" strokeLinecap="round" fill="none" />
        </g>
      </svg>
    </div>
  );
}
