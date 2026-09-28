import React, { useState } from "react";
import { useApp } from "../../context/AppContext";

export function CreateGroupModal() {
  const { isCreateGroupOpen, setIsCreateGroupOpen, createGroup } = useApp();
  const [name, setName] = useState("");
  const [code, setCode] = useState("");

  if (!isCreateGroupOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    createGroup(name.trim(), code.trim());
    setName("");
    setCode("");
    setIsCreateGroupOpen(false);
  };

  return (
    <div className="modal-overlay" onClick={() => setIsCreateGroupOpen(false)}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <h2>Create a new group</h2>
        <p style={{ color: "var(--mute)", margin: "6px 0 16px", fontSize: "13px" }}>
          Start a shared space with your team and collaborative AI.
        </p>
        <form onSubmit={handleSubmit}>
          <label htmlFor="modal-gname">Group Name</label>
          <input
            id="modal-gname"
            className="fld"
            placeholder="e.g. Frontend Engineers"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
            required
          />

          <label htmlFor="modal-gcode">Invite Code (Optional)</label>
          <input
            id="modal-gcode"
            className="fld"
            placeholder="e.g. CLB-5544"
            value={code}
            onChange={(e) => setCode(e.target.value)}
          />

          <div style={{ display: "flex", gap: "10px", marginTop: "24px", justifyContent: "flex-end" }}>
            <button
              type="button"
              className="btn ghost"
              onClick={() => setIsCreateGroupOpen(false)}
            >
              Cancel
            </button>
            <button type="submit" className="btn">
              Create Group
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
