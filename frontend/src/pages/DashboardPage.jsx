import React, { useState } from "react";
import { useApp } from "../context/AppContext";

export function DashboardPage() {
  const {
    navigate,
    groups,
    setActiveGroupId,
    setIsCreateGroupOpen,
    currentUser,
    groupsLoading,
    groupsError,
    setJoinInviteCode,
  } = useApp();
  const [inviteCode, setInviteCode] = useState("");
  const [joinError, setJoinError] = useState("");
  const [joining, setJoining] = useState(false);

  const handleJoin = async (event) => {
    event.preventDefault();
    setJoining(true);
    setJoinError("");
    try {
      setJoinInviteCode(inviteCode.trim());
      setInviteCode("");
    } catch (error) {
      setJoinError(error.message || "Unable to join group");
    } finally {
      setJoining(false);
    }
  };

  return (
    <section className="dashboard-view">
      <header className="top-header">
        <div>
          <h1>Good morning, {currentUser.name}</h1>
          <small>Here is what your groups are up to.</small>
        </div>
        <form onSubmit={handleJoin} style={{ display: "flex", gap: "8px", marginLeft: "auto" }}>
          <input className="fld" aria-label="Invite code" placeholder="Invite code" value={inviteCode} onChange={(event) => setInviteCode(event.target.value)} />
          <button className="btn ghost" type="submit" disabled={joining}>{joining ? "Joining..." : "Join"}</button>
        </form>
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
        {groupsError && <p role="alert" style={{ color: "var(--pink)" }}>{groupsError}</p>}
        {joinError && <p role="alert" style={{ color: "var(--pink)" }}>{joinError}</p>}
        {groupsLoading ? <p>Loading groups...</p> : <div className="grid-cards">
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
                {group.memberCount || 0} members · {group.description || "No description"}
              </p>
            </div>
          ))}
          {!groups.length && <p>No groups yet. Create a group or join one with an invite code.</p>}
        </div>}

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
