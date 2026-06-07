import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  style?: React.CSSProperties;
}

export const Logo = ({ size = 'md', className = '', style = {} }: LogoProps) => {
  // Proportional responsive sizes
  const sizes = {
    sm: { width: 80, height: 80 },
    md: { width: 140, height: 140 },
    lg: { width: 240, height: 240 },
  };

  const current = sizes[size] || sizes.md;

  return (
    <div
      className={`relative inline-flex items-center justify-center ${className}`}
      style={{
        width: current.width,
        height: current.height,
        ...style,
      }}
      id="brand-logo"
    >
      <svg
        viewBox="0 0 400 400"
        width="100%"
        height="100%"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="select-none"
      >
        {/* Outlined layer for the Spiral Lightbulb Icon */}
        <path
          d="M 200,110 C 180,110 170,95 170,85 C 170,70 182,55 200,55 C 222,55 240,72 240,92 C 240,116 215,135 192,135 C 162,135 138,110 138,80 C 138,42 168,15 205,15 C 250,15 285,48 285,92 C 285,145 245,185 200,185 C 190,195 192,205 215,205 C 228,205 230,215 205,215 C 185,215 180,225 210,225 C 225,225 220,235 200,235"
          stroke="#1d4452"
          strokeWidth="18"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Foreground colored layer for the Spiral Lightbulb Icon */}
        <path
          d="M 200,110 C 180,110 170,95 170,85 C 170,70 182,55 200,55 C 222,55 240,72 240,92 C 240,116 215,135 192,135 C 162,135 138,110 138,80 C 138,42 168,15 205,15 C 250,15 285,48 285,92 C 285,145 245,185 200,185 C 190,195 192,205 215,205 C 228,205 230,215 205,215 C 185,215 180,225 210,225 C 225,225 220,235 200,235"
          stroke="#eed159"
          strokeWidth="10"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* --- English Typography: "Share idea" --- */}
        {/* Stroke / Outline Layer for High Contrast */}
        <text
          x="200"
          y="312"
          textAnchor="middle"
          fontSize="56"
          fontWeight="bold"
          fontFamily="system-ui, -apple-system, sans-serif"
          stroke="#1d4452"
          strokeWidth="13"
          strokeLinecap="round"
          strokeLinejoin="round"
          paintOrder="stroke fill"
          className="tracking-wide"
        >
          Share idea
        </text>

        {/* Foreground Orange Fill Layer */}
        <text
          x="200"
          y="312"
          textAnchor="middle"
          fontSize="56"
          fontWeight="bold"
          fontFamily="system-ui, -apple-system, sans-serif"
          fill="#f38d4e"
          className="tracking-wide"
        >
          Share idea
        </text>

        {/* --- Arabic Typography: "مشاركة الفكرة" --- */}
        {/* Stroke / Outline Layer */}
        <text
          x="200"
          y="370"
          textAnchor="middle"
          fontSize="36"
          fontWeight="bold"
          fontFamily="Tajawal, Cairo, Arial, sans-serif"
          stroke="#1d4452"
          strokeWidth="10"
          strokeLinecap="round"
          strokeLinejoin="round"
          paintOrder="stroke fill"
        >
          مشاركة الفكرة
        </text>

        {/* Foreground Mint Green Fill Layer */}
        <text
          x="200"
          y="370"
          textAnchor="middle"
          fontSize="36"
          fontWeight="bold"
          fontFamily="Tajawal, Cairo, Arial, sans-serif"
          fill="#81b58a"
        >
          مشاركة الفكرة
        </text>
      </svg>
    </div>
  );
};

export default Logo;
