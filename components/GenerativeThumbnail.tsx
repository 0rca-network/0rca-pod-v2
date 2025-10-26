import React from 'react';

interface GenerativeThumbnailProps {
  agentName: string;
  className?: string;
}

export const GenerativeThumbnail: React.FC<GenerativeThumbnailProps> = ({ agentName, className = '' }) => {
  const seed = agentName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const random = (index: number) => {
    const x = Math.sin(seed + index) * 10000;
    return x - Math.floor(x);
  };

  const shapes = Array.from({ length: 8 }, (_, i) => ({
    cx: random(i * 2) * 100,
    cy: random(i * 2 + 1) * 100,
    rx: 20 + random(i * 3) * 40,
    ry: 20 + random(i * 3 + 1) * 40,
    opacity: 0.1 + random(i * 4) * 0.3,
    color: random(i) > 0.5 ? '#63f2d2' : '#BEF264',
  }));

  const lines = Array.from({ length: 4 }, (_, i) => ({
    x1: random(i * 5) * 100,
    y1: random(i * 5 + 1) * 100,
    x2: random(i * 5 + 2) * 100,
    y2: random(i * 5 + 3) * 100,
  }));

  return (
    <svg className={className} viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id={`grad-${seed}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: '#0D0D0D', stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: '#1C2A3A', stopOpacity: 1 }} />
        </linearGradient>
        <filter id={`glow-${seed}`}>
          <feGaussianBlur stdDeviation="2" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <rect width="100" height="100" fill={`url(#grad-${seed})`} />
      {shapes.map((shape, i) => (
        <ellipse
          key={i}
          cx={shape.cx}
          cy={shape.cy}
          rx={shape.rx}
          ry={shape.ry}
          fill={shape.color}
          opacity={shape.opacity}
        />
      ))}
      {lines.map((line, i) => (
        <line
          key={i}
          x1={line.x1}
          y1={line.y1}
          x2={line.x2}
          y2={line.y2}
          stroke="#63f2d2"
          strokeWidth="0.5"
          opacity="0.6"
          filter={`url(#glow-${seed})`}
        />
      ))}
    </svg>
  );
};
