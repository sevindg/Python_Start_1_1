import React from 'react';

interface MascotProps {
  mood?: 'happy' | 'thinking' | 'celebrate' | 'oops' | 'wave';
  className?: string;
  size?: number;
}

export const Mascot: React.FC<MascotProps> = ({ mood = 'happy', className = '', size = 96 }) => {
  return (
    <div
      style={{ width: size, height: size }}
      className={`relative inline-flex items-center justify-center select-none ${className}`}
    >
      <svg
        viewBox="0 0 120 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-md transition-transform duration-300 hover:scale-105"
      >
        {/* Glow backdrop */}
        <circle cx="60" cy="60" r="54" className="fill-emerald-500/10" />

        {/* Snake body coils */}
        <path
          d="M 32 88 C 20 88 18 70 30 60 C 42 50 64 62 76 50 C 86 40 82 24 64 24 C 44 24 38 42 42 52"
          stroke="#10b981"
          strokeWidth="14"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Belly stripe pattern */}
        <path
          d="M 33 88 C 24 88 22 74 30 65 C 40 55 60 63 72 52"
          stroke="#34d399"
          strokeWidth="4"
          strokeLinecap="round"
        />

        {/* Head */}
        <circle cx="68" cy="30" r="18" fill="#10b981" />
        <ellipse cx="68" cy="35" rx="13" ry="10" fill="#34d399" />

        {/* Cheeks blush */}
        <circle cx="56" cy="36" r="3.5" fill="#f43f5e" opacity="0.6" />
        <circle cx="80" cy="36" r="3.5" fill="#f43f5e" opacity="0.6" />

        {/* Eyes based on mood */}
        {mood === 'oops' ? (
          <>
            {/* Dizzy/oops eyes */}
            <text x="56" y="32" fontSize="9" fontWeight="bold" fill="#0f172a" textAnchor="middle">×</text>
            <text x="76" y="32" fontSize="9" fontWeight="bold" fill="#0f172a" textAnchor="middle">×</text>
          </>
        ) : mood === 'thinking' ? (
          <>
            {/* Looking up thoughtfully */}
            <circle cx="58" cy="28" r="4.5" fill="#ffffff" />
            <circle cx="59" cy="26" r="2.5" fill="#0f172a" />
            <circle cx="76" cy="28" r="4.5" fill="#ffffff" />
            <circle cx="77" cy="26" r="2.5" fill="#0f172a" />
          </>
        ) : mood === 'celebrate' ? (
          <>
            {/* Joyful squint eyes */}
            <path d="M 54 30 Q 58 24 62 30" stroke="#0f172a" strokeWidth="2.5" strokeLinecap="round" fill="none" />
            <path d="M 72 30 Q 76 24 80 30" stroke="#0f172a" strokeWidth="2.5" strokeLinecap="round" fill="none" />
          </>
        ) : (
          <>
            {/* Friendly cute big eyes */}
            <circle cx="58" cy="29" r="4.5" fill="#ffffff" />
            <circle cx="59" cy="29" r="2.8" fill="#0f172a" />
            <circle cx="60.5" cy="28" r="1.2" fill="#ffffff" />

            <circle cx="76" cy="29" r="4.5" fill="#ffffff" />
            <circle cx="77" cy="29" r="2.8" fill="#0f172a" />
            <circle cx="78.5" cy="28" r="1.2" fill="#ffffff" />
          </>
        )}

        {/* Mouth */}
        {mood === 'celebrate' || mood === 'happy' ? (
          <path d="M 63 36 Q 68 42 73 36" stroke="#0f172a" strokeWidth="2" strokeLinecap="round" fill="none" />
        ) : mood === 'oops' ? (
          <path d="M 64 39 Q 68 35 72 39" stroke="#0f172a" strokeWidth="2" strokeLinecap="round" fill="none" />
        ) : (
          <path d="M 64 37 Q 68 40 72 37" stroke="#0f172a" strokeWidth="2" strokeLinecap="round" fill="none" />
        )}

        {/* Cute forked tongue */}
        {(mood === 'happy' || mood === 'celebrate') && (
          <path
            d="M 68 40 L 68 46 M 68 46 L 65 49 M 68 46 L 71 49"
            stroke="#ef4444"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        )}

        {/* Small programmer wizard hat or glasses */}
        {mood === 'celebrate' && (
          <g transform="translate(56, 6) rotate(10)">
            <polygon points="12,0 0,16 24,16" fill="#fbbf24" stroke="#f59e0b" strokeWidth="1.5" />
            <ellipse cx="12" cy="16" rx="14" ry="3" fill="#f59e0b" />
            <circle cx="12" cy="0" r="2.5" fill="#ffffff" />
          </g>
        )}
      </svg>
    </div>
  );
};
