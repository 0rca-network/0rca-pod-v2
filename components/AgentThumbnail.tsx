import React from "react";

const CATEGORY_GRADIENTS: Record<string, [string, string]> = {
  Finance: ["#0f2027", "#2c5364"],
  "Content Creation": ["#ff416c", "#ff4b2b"],
  Development: ["#00c6ff", "#0072ff"],
  "Data Analysis": ["#00d2ff", "#3a7bd5"],
  "Social Media": ["#f953c6", "#b91d73"],
  Marketing: ["#f7971e", "#ffd200"],
  Language: ["#2193b0", "#6dd5ed"],
  Media: ["#8e2de2", "#4a00e0"],
  Default: ["#434343", "#000000"],
};

const CATEGORY_ICONS: Record<string, JSX.Element> = {
  Finance: <svg className="w-16 h-16" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>,
  "Content Creation": <svg className="w-16 h-16" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>,
  Development: <svg className="w-16 h-16" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>,
  "Data Analysis": <svg className="w-16 h-16" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>,
  "Social Media": <svg className="w-16 h-16" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>,
  Marketing: <svg className="w-16 h-16" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.21 15.89A10 10 0 1 1 8 2.83"></path><path d="M22 12A10 10 0 0 0 12 2v10z"></path></svg>,
  Language: <svg className="w-16 h-16" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>,
  Media: <svg className="w-16 h-16" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="23 7 16 12 23 17 23 7"></polygon><rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect></svg>,
  Default: <svg className="w-16 h-16" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>,
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
  const [color1, color2] =
    CATEGORY_GRADIENTS[category] || CATEGORY_GRADIENTS.Default;
  const rotation = hashCode(name) % 360;
  const icon = CATEGORY_ICONS[category] || CATEGORY_ICONS.Default;

  const style: React.CSSProperties = {
    background: `linear-gradient(${rotation}deg, ${color1}, ${color2})`,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "white",
  };

  return <div style={style} className={className}>{icon}</div>;
};
