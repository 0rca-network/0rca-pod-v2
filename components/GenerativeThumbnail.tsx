import React from 'react';

interface GenerativeThumbnailProps {
  agentName?: string;
  className?: string;
}

export const GenerativeThumbnail: React.FC<GenerativeThumbnailProps> = ({ agentName = 'default', className = '' }) => {
  const colorPalettes = [
    ['#4ECDC4', '#44A08D', '#096A5A', '#E8F8F5'], // Teal family
    ['#667eea', '#764ba2', '#4B0082', '#E6E6FA'], // Purple family  
    ['#f093fb', '#f5576c', '#C70039', '#FFE5E5'], // Pink family
    ['#4facfe', '#00f2fe', '#0077BE', '#E0F6FF'], // Blue family
    ['#43e97b', '#38f9d7', '#228B22', '#E8F5E8'], // Green family
    ['#fa709a', '#fee140', '#FF6347', '#FFF8DC'], // Warm family
    ['#a8edea', '#fed6e3', '#87CEEB', '#F0F8FF'], // Pastel family
    ['#ff9a9e', '#fecfef', '#FF69B4', '#FFF0F5']  // Rose family
  ];

  const seededRandom = (seed: string, index: number) => {
    const hash = seed.split('').reduce((acc, char) => acc + char.charCodeAt(0), index * 1000);
    return (hash % 1000) / 1000;
  };

  const randomId = agentName.replace(/\s/g, '-').toLowerCase();
  const paletteIndex = Math.floor(seededRandom(agentName, 0) * colorPalettes.length);
  const palette = colorPalettes[paletteIndex];
  const [color1, color2, color3, diffusion] = palette;

  const blobs = Array.from({ length: 6 }, (_, i) => ({
    cx: seededRandom(agentName, i * 4) * 120 - 10,
    cy: seededRandom(agentName, i * 4 + 1) * 120 - 10,
    r: 30 + seededRandom(agentName, i * 4 + 2) * 50,
    opacity: 0.3 + seededRandom(agentName, i * 4 + 3) * 0.4,
    color: [color1, color2, color3][Math.floor(seededRandom(agentName, i * 4 + 4) * 3)],
  }));

  return (
    <svg className={className} viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice">
      <defs>
        <radialGradient id={`watercolor-${randomId}`} cx="50%" cy="50%" r="70%">
          <stop offset="0%" style={{ stopColor: diffusion, stopOpacity: 0.9 }} />
          <stop offset="40%" style={{ stopColor: color1, stopOpacity: 0.6 }} />
          <stop offset="80%" style={{ stopColor: color2, stopOpacity: 0.8 }} />
          <stop offset="100%" style={{ stopColor: color3, stopOpacity: 0.9 }} />
        </radialGradient>
        <filter id={`blur-${randomId}`}>
          <feGaussianBlur stdDeviation="3" />
        </filter>
      </defs>
      
      <rect width="100" height="100" fill={`url(#watercolor-${randomId})`} />
      
      {blobs.map((blob, i) => (
        <circle
          key={`${randomId}-${i}`}
          cx={blob.cx}
          cy={blob.cy}
          r={blob.r}
          fill={blob.color}
          opacity={blob.opacity}
          filter={`url(#blur-${randomId})`}
        />
      ))}
    </svg>
  );
};
