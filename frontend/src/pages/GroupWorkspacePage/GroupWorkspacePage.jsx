import React, { useEffect, useState } from "react";
import { useApp } from "../../context/AppContext";
import { GroupHeader } from "./GroupHeader";
import { Avatar } from "../../components/common/Avatar";
import { JoinRequestsModal } from "../../components/groups/JoinRequestsModal";

export function GroupWorkspacePage() {
  const { activeGroup, loadGroupDetails, leaveGroup, removeGroupMember, currentUser } = useApp();
  const [error, setError] = useState("");
  const [showRequests, setShowRequests] = useState(false);

  useEffect(() => {
    if (!activeGroup?.id || activeGroup.members?.length) return;
    loadGroupDetails(activeGroup.id).catch((requestError) => setError(requestError.message || "Unable to load group"));
  }, [activeGroup?.id]);

  if (!activeGroup) {
    return (
      <div style={{ padding: "40px", textAlign: "center" }}>
        <h2>No group selected</h2>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <GroupHeader group={activeGroup} />
      <div className="scroll-area" style={{ padding: "24px" }}>
        {error && <p role="alert" style={{ color: "var(--pink)" }}>{error}</p>}
        <p>{activeGroup.description || "No description"}</p>
        {currentUser.id === activeGroup.owner_id && (
          <button className="btn ghost" onClick={() => setShowRequests(true)}>Join Requests</button>
        )}
        <button className="btn ghost" onClick={() => leaveGroup(activeGroup.id)}>Leave group</button>
        <h3 style={{ marginTop: "28px" }}>Members · {activeGroup.members?.length || 0}</h3>
        {activeGroup.members?.map((member) => (
          <div key={member.id} className="item" style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <Avatar initials={(member.full_name || member.username || "?").slice(0, 2).toUpperCase()} color="#4338ca" />
            <span>{member.full_name || member.username || member.id} · {member.role}</span>
            {currentUser.id === activeGroup.owner_id && member.id !== currentUser.id && (
              <button className="ghost-link" onClick={() => removeGroupMember(activeGroup.id, member.id)}>Remove</button>
            )}
          </div>
        ))}
      </div>
      {showRequests && (
        <JoinRequestsModal
          groupId={activeGroup.id}
          onClose={() => setShowRequests(false)}
          onChanged={() => loadGroupDetails(activeGroup.id)}
        />
      )}
    </div>
  );
}
