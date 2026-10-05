import React from "react";
import { useApp } from "../../context/AppContext";

export function AppRail() {
  const { currentView, navigate, theme, toggleTheme, logout } = useApp();

  return (
    <nav className="rail" aria-label="Main navigation">
      <div
        className="logo"
        onClick={() => navigate("landing")}
        title="CollabAI Landing"
        style={{ cursor: "pointer" }}
      >
        C
      </div>

      <button
        className={currentView === "dashboard" ? "on" : ""}
        onClick={() => navigate("dashboard")}
        aria-label="Dashboard"
        title="Dashboard"
      >
        ⌂
      </button>

      <button
        className={currentView === "group-workspace" ? "on" : ""}
        onClick={() => navigate("group-workspace")}
        aria-label="Groups"
        title="Group Workspace"
      >
        👥
      </button>

      <button
        className={currentView === "personal-ai" ? "on" : ""}
        onClick={() => navigate("personal-ai")}
        aria-label="Personal AI"
        title="Personal AI"
      >
        ✦
      </button>

      <button
        className={currentView === "direct-chats" ? "on" : ""}
        onClick={() => navigate("direct-chats")}
        aria-label="Direct Messages"
        title="Direct Messages"
      >
        💬
      </button>

      <span className="sp"></span>

      <button
        onClick={toggleTheme}
        aria-label="Toggle Theme"
        title={`Switch to ${theme === "dark" ? "Light" : "Dark"} Mode`}
        style={{ fontSize: "16px" }}
      >
        {theme === "dark" ? "☀️" : "🌙"}
      </button>

      <button
        onClick={() => {
          void logout();
        }}
        aria-label="Log out"
        title="Log out to landing"
      >
        ⎋
      </button>
    </nav>
  );
}
