import React from "react";
import { useApp } from "../../context/AppContext";

export function BottomNav() {
  const { currentView, navigate, logout } = useApp();

  return (
    <nav className="bnav" aria-label="Mobile Navigation">
      <button
        className={currentView === "dashboard" ? "on" : ""}
        onClick={() => navigate("dashboard")}
      >
        Home
      </button>
      <button
        className={currentView === "group-workspace" ? "on" : ""}
        onClick={() => navigate("group-workspace")}
      >
        Groups
      </button>
      <button
        className={currentView === "personal-ai" ? "on" : ""}
        onClick={() => navigate("personal-ai")}
      >
        Personal AI
      </button>
      <button
        className={currentView === "direct-chats" ? "on" : ""}
        onClick={() => navigate("direct-chats")}
      >
        Chat
      </button>
      <button onClick={() => void logout()}>Log out</button>
    </nav>
  );
}
