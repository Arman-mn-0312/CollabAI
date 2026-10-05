import React, { useEffect, useState } from "react";
import * as groupsApi from "../../lib/groupsApi";

export function JoinRequestModal({ inviteCode, onClose }) {
  const [group, setGroup] = useState(null);
  const [request, setRequest] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const preview = await groupsApi.previewInvite(inviteCode);
        const existing = await groupsApi.getMyJoinRequest(preview.id);
        if (!cancelled) {
          setGroup(preview);
          setRequest(existing);
        }
      } catch (requestError) {
        if (!cancelled) setError(requestError.message || "Unable to load invite");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [inviteCode]);

  async function submit() {
    setSubmitting(true);
    setError("");
    try {
      const created = await groupsApi.createJoinRequest(group.id, inviteCode);
      setRequest(created);
    } catch (requestError) {
      setError(requestError.message || "Unable to send join request");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" role="dialog" aria-modal="true" onClick={(event) => event.stopPropagation()}>
        <button className="modal-close" aria-label="Close" onClick={onClose}>×</button>
        {loading && <p>Loading invite...</p>}
        {error && <p role="alert" style={{ color: "var(--pink)" }}>{error}</p>}
        {group && (
          <>
            <h2>{group.name}</h2>
            <p style={{ color: "var(--mute)", margin: "8px 0 20px" }}>{group.description || "You have been invited to join this group."}</p>
            {request?.status === "pending" && <p role="status">Your request is pending approval.</p>}
            {request?.status === "accepted" && <p role="status">You are already a member of this group.</p>}
            {request?.status === "rejected" && <p role="status">Your request was rejected.</p>}
            {!request && (
              <button className="btn" onClick={submit} disabled={submitting}>
                {submitting ? "Sending..." : "Request to Join"}
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
