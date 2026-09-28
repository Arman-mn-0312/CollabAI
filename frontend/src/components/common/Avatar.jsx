import React from "react";

export function Avatar({ initials, color, isOnline, isAI, size = "md", className = "" }) {
  const sizeClass = size === "lg" ? "lg" : "";
  const onlineClass = isOnline ? "on" : "";
  const aiClass = isAI ? "aiav" : "";

  return (
    <span
      className={`av ${sizeClass} ${onlineClass} ${aiClass} ${className}`}
      style={!isAI && color ? { background: color } : {}}
    >
      {isAI ? "✦" : initials}
    </span>
  );
}
