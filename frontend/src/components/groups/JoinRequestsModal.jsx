import React, { useEffect, useState } from "react";
import * as groupsApi from "../../lib/groupsApi";

export function JoinRequestsModal({ groupId, onClose, onChanged }) {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    setError("");
    try {
      setRequests(await groupsApi.listJoinRequests(groupId));
    } catch (requestError) {
      setError(requestError.message || "Unable to load join requests");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [groupId]);

  async function review(requestId, decision) {
    setBusyId(requestId);
    setError("");
    try {
      const updated = await groupsApi.reviewJoinRequest(groupId, requestId, decision);
      setRequests((current) => current.map((request) => request.id === requestId ? { ...request, ...updated } : request));
      if (onChanged) await onChanged();
    } catch (requestError) {
      setError(requestError.message || "Unable to review request");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card join-requests-modal" role="dialog" aria-modal="true" onClick={(event) => event.stopPropagation()}>
        <button className="modal-close" aria-label="Close" onClick={onClose}>×</button>
        <h2>Join Requests</h2>
        {error && <p role="alert" style={{ color: "var(--pink)" }}>{error}</p>}
        <div className="join-request-list">
          {loading && <p>Loading requests...</p>}
          {!loading && !requests.length && <p>No join requests.</p>}
          {requests.map((request) => (
            <div className="join-request" key={request.id}>
              <div>
                <strong>{request.applicant?.full_name || request.applicant?.username || request.user_id}</strong>
                <small>{request.status} · {new Date(request.requested_at).toLocaleString()}</small>
              </div>
              {request.status === "pending" && (
                <div className="join-request-actions">
                  <button className="btn" disabled={busyId === request.id} onClick={() => review(request.id, "accepted")}>Accept</button>
                  <button className="btn ghost" disabled={busyId === request.id} onClick={() => review(request.id, "rejected")}>Reject</button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
