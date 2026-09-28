import React from "react";
import { useApp } from "../context/AppContext";

export function DashboardPage() {
  const {
    navigate,
    groups,
    setActiveGroupId,
    setIsCreateGroupOpen,
    currentUser,
  } = useApp();

  return (
    <section className="dashboard-view">
      <header className="top-header">
        <div>
          <h1>Good morning, {currentUser.name}</h1>
          <small>Here is what your groups are up to.</small>
        </div>
        <button
          className="btn"
          onClick={() => setIsCreateGroupOpen(true)}
          style={{ marginLeft: "auto", padding: "8px 16px" }}
        >
          + Create group
        </button>
      </header>

      <div className="scroll-area">
        <h3>Your groups</h3>
        <div className="grid-cards">
          {groups.map((group) => (
            <div
              key={group.id}
              className="card grp"
              onClick={() => {
                setActiveGroupId(group.id);
                navigate("group-workspace");
              }}
            >
              <span className="gi">{group.tag}</span>
              <h3>{group.name}</h3>
              <p>
                {group.memberCount} members ·{" "}
                {group.newAiAnswers
                  ? `${group.newAiAnswers} new AI answers`
                  : group.newMessages
                  ? `${group.newMessages} new messages`
                  : "no new activity"}
              </p>
            </div>
          ))}
        </div>

        <div
          className="card pai"
          onClick={() => navigate("personal-ai")}
        >
          <div style={{ flex: 1 }}>
            <h3>Your Personal AI</h3>
            <p>Private conversations only you can see.</p>
          </div>
          <span className="btn">Open</span>
        </div>

        <h3 style={{ marginTop: "28px", marginBottom: "8px" }}>Recent activity</h3>
        <div className="act">
          <div>
            <b>Saniya</b> asked in Project Team · Frontend
          </div>
          <div>
            <b>CollabAI</b> answered in Project Team · Backend
          </div>
          <div>
            <b>Rahul</b> joined Study Group
          </div>
        </div>
      </div>
    </section>
  );
}
