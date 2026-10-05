import { supabase } from "./supabaseClient";

const apiBaseUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";

async function getAccessToken() {
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  if (!data.session?.access_token) {
    const sessionError = new Error("Authentication required");
    sessionError.code = "UNAUTHENTICATED";
    throw sessionError;
  }
  return data.session.access_token;
}

async function request(path, options = {}) {
  const token = await getAccessToken();
  const response = await fetch(`${apiBaseUrl}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });
  const payload = await response.json().catch(() => null);

  if (!response.ok || !payload?.success) {
    const error = new Error(payload?.error?.message || "Direct Chat request failed");
    error.code = payload?.error?.code || `HTTP_${response.status}`;
    error.status = response.status;
    throw error;
  }

  return payload.data;
}

export function listDirectConversations() {
  return request("/api/direct-chats");
}

export function createDirectConversation(userId) {
  return request("/api/direct-chats", {
    method: "POST",
    body: JSON.stringify({ userId }),
  });
}

export function listDirectMessages(conversationId) {
  return request(`/api/direct-chats/${conversationId}/messages`);
}

export function sendDirectMessage(conversationId, content) {
  const start = Date.now();
  console.log(`[DirectChat Frontend] Send request starting for conversation ${conversationId}`);
  return request(`/api/direct-chats/${conversationId}/messages`, {
    method: "POST",
    body: JSON.stringify({ content }),
  }).then((data) => {
    console.log(`[DirectChat Frontend] API response received in ${Date.now() - start} ms`);
    return data;
  });
}

export function subscribeToDirectMessages(conversationId, onMessage) {
  const channelName = `direct-messages:${conversationId}:${Date.now()}`;
  console.log(`[DirectChat Frontend] Subscribing to channel ${channelName}`);
  const channel = supabase
    .channel(channelName)
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "direct_messages",
        filter: `conversation_id=eq.${conversationId}`,
      },
      (payload) => {
        console.log(`[DirectChat Frontend] Realtime INSERT event received:`, payload.new?.id);
        onMessage(payload.new);
      }
    )
    .subscribe((status, err) => {
      console.log(`[DirectChat Frontend] Subscription status for ${conversationId}: ${status}`, err || "");
    });

  return () => {
    console.log(`[DirectChat Frontend] Removing channel ${channelName}`);
    void supabase.removeChannel(channel);
  };
}
