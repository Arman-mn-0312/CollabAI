import React from "react";
import { useApp } from "../../context/AppContext";
import { Avatar } from "../common/Avatar";

export function AppSidebar() {
  const {
    currentView,
    navigate,
    groups,
    activeGroupId,
    setActiveGroupId,
    activeGroup,
    setIsCreateGroupOpen,
    currentUser,
    directChats,
    setActiveDirectContact,
  } = useApp();

  return (
    <aside className="side" aria-label="Sidebar">
      <h2>CollabAI</h2>

      <button
        className="newg"
        onClick={() => setIsCreateGroupOpen(true)}
      >
        + Create group
      </button>

      <button
        className={`item ${currentView === "personal-ai" ? "on" : ""}`}
        onClick={() => navigate("personal-ai")}
      >
        ✦ Personal AI
      </button>

      <h3>Your groups</h3>
      {groups.map((g) => {
        const isSelected = currentView === "group-workspace" && g.id === activeGroupId;
        return (
          <button
            key={g.id}
            className={`item ${isSelected ? "on" : ""}`}
            onClick={() => {
              setActiveGroupId(g.id);
              navigate("group-workspace");
            }}
          >
            # {g.name}
            {isSelected && <span className="dot" title="Active now"></span>}
          </button>
        );
      })}

      {currentView === "group-workspace" && activeGroup?.members?.length > 0 && (
        <>
          <h3>Members · {activeGroup.members.length}</h3>
          {activeGroup.members.map((m) => (
            <div key={m.id || m.name} className="item">
              <Avatar initials={m.initials} color={m.color} />
              <span>
                {m.full_name || m.username || m.name || m.id} {m.role ? `· ${m.role}` : ""}
              </span>
            </div>
          ))}
        </>
      )}

      {currentView !== "group-workspace" && (
        <>
          <h3>Direct messages</h3>
          {Object.keys(directChats).map((person) => {
            const isSelected = currentView === "direct-chats";
            return (
              <button
                key={person}
                className="item"
                onClick={() => {
                  setActiveDirectContact(person);
                  navigate("direct-chats");
                }}
              >
                {person}
              </button>
            );
          })}
        </>
      )}

      <div className="me">
        <Avatar initials={currentUser.initials} color={currentUser.color} />
        <div className="me-info">
          <span className="me-name">{currentUser.name}</span>
          <span className="me-sub">Profile</span>
        </div>
      </div>
    </aside>
  );
}
