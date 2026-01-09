import React from "react";

const CATEGORY_STYLES: Record<string, { colors: [string, string], icon: string }> = {
  Finance: { colors: ["#0f2027", "#2c5364"], icon: "💰" },
  "Content Creation": { colors: ["#ff416c", "#ff4b2b"], icon: "✍️" },
  Development: { colors: ["#00c6ff", "#0072ff"], icon: "💻" },
  "Data Analysis": { colors: ["#00d2ff", "#3a7bd5"], icon: "📊" },
  "Social Media": { colors: ["#f953c6", "#b91d73"], icon: "📱" },
  Marketing: { colors: ["#f7971e", "#ffd200"], icon: "📈" },
  Language: { colors: ["#2193b0", "#6dd5ed"], icon: "🌐" },
  Media: { colors: ["#8e2de2", "#4a00e0"], icon: "🎬" },
  Default: { colors: ["#1a1c1e", "#000000"], icon: "🤖" },
};

function hashCode(str: string) {
  return str.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
}

interface AgentThumbnailProps {
  name: string;
  category: string;
  className?: string;
}

export const AgentThumbnail: React.FC<AgentThumbnailProps> = ({
  name,
  category,
  className = "",
}) => {
  const normalizedCategory = category?.trim() || "Default";
  const categoryKey = Object.keys(CATEGORY_STYLES).find(
    key => key.toLowerCase() === normalizedCategory.toLowerCase()
  ) || "Default";

  const { colors, icon } = CATEGORY_STYLES[categoryKey];
  const [color1, color2] = colors;
  const rotation = hashCode(name) % 360;

  return (
    <div
      className={`relative flex items-center justify-center overflow-hidden ${className}`}
      style={{
        background: `linear-gradient(${rotation}deg, ${color1}, ${color2})`,
      }}
    >
      {/* Abstract Shapes */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-mint-glow/5 rounded-full translate-y-1/2 -translate-x-1/2 blur-xl" />

      {/* Icon Layer */}
      <div className="relative z-10 flex flex-col items-center gap-2">
        <span className="text-4xl filter drop-shadow-2xl">{icon}</span>
        <div className="px-3 py-1 bg-white/10 backdrop-blur-md rounded-full border border-white/10">
          <span className="text-[10px] font-bold uppercase tracking-widest text-white/50">{normalizedCategory}</span>
        </div>
      </div>

      {/* Overlay Glow */}
      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent pointer-events-none" />
    </div>
  );
};
