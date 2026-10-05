import { supabase } from "./supabaseClient";

const apiBaseUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";

async function request(path, options = {}) {
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  if (!data.session?.access_token) throw new Error("Authentication required");

  const response = await fetch(`${apiBaseUrl}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${data.session.access_token}`,
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });
  const payload = await response.json().catch(() => null);
  if (!response.ok || !payload?.success) {
    const requestError = new Error(payload?.error?.message || "Group request failed");
    requestError.code = payload?.error?.code || `HTTP_${response.status}`;
    requestError.status = response.status;
    throw requestError;
  }
  return payload.data;
}

export const listGroups = () => request("/api/groups");
export const createGroup = (name, description) => request("/api/groups", { method: "POST", body: JSON.stringify({ name, description }) });
export const previewInvite = (inviteCode) => request(`/api/groups/invite/${encodeURIComponent(inviteCode)}`);
export const getMyJoinRequest = (groupId) => request(`/api/groups/${groupId}/join-requests/me`);
export const createJoinRequest = (groupId, inviteCode) => request(`/api/groups/${groupId}/join-requests`, { method: "POST", body: JSON.stringify({ inviteCode }) });
export const listJoinRequests = (groupId) => request(`/api/groups/${groupId}/join-requests`);
export const reviewJoinRequest = (groupId, requestId, decision) => {
  const endpointAction = decision === "accepted" ? "accept" : decision === "rejected" ? "reject" : decision;
  return request(`/api/groups/${groupId}/join-requests/${requestId}/${endpointAction}`, { method: "POST" });
};
export const getGroup = (groupId) => request(`/api/groups/${groupId}`);
export const leaveGroup = (groupId) => request(`/api/groups/${groupId}/leave`, { method: "POST" });
export const removeMember = (groupId, userId) => request(`/api/groups/${groupId}/members/${userId}`, { method: "DELETE" });
