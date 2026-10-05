import React, { useState } from "react";
import { useApp } from "../../context/AppContext";

export function CreateGroupModal() {
  const { isCreateGroupOpen, setIsCreateGroupOpen, createGroup } = useApp();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!isCreateGroupOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSubmitting(true);
    setError("");
    createGroup(name.trim(), description.trim())
      .then(() => {
        setName("");
        setDescription("");
        setIsCreateGroupOpen(false);
      })
      .catch((requestError) => setError(requestError.message || "Unable to create group"))
      .finally(() => setSubmitting(false));
  };

  return (
    <div className="modal-overlay" onClick={() => setIsCreateGroupOpen(false)}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <h2>Create a new group</h2>
        <p style={{ color: "var(--mute)", margin: "6px 0 16px", fontSize: "13px" }}>
          Start a shared space with your team and collaborative AI.
        </p>
        {error && <p role="alert" style={{ color: "var(--pink)" }}>{error}</p>}
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

          <label htmlFor="modal-gdescription">Description (Optional)</label>
          <input
            id="modal-gdescription"
            className="fld"
            placeholder="What is this group for?"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <div style={{ display: "flex", gap: "10px", marginTop: "24px", justifyContent: "flex-end" }}>
            <button
              type="button"
              className="btn ghost"
              onClick={() => setIsCreateGroupOpen(false)}
              disabled={submitting}
            >
              Cancel
            </button>
            <button type="submit" className="btn" disabled={submitting}>
              {submitting ? "Creating..." : "Create Group"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
