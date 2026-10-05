const assert = require("node:assert/strict");
const test = require("node:test");
const http = require("node:http");
const { createApp } = require("../src/app");

const alice = "11111111-1111-4111-8111-111111111111";
const bob = "22222222-2222-4222-8222-222222222222";
const outsider = "33333333-3333-4333-8333-333333333333";
const conversationId = "44444444-4444-4444-8444-444444444444";

function makeConversation(id = conversationId, participants = [alice, bob]) {
  return {
    id,
    created_at: "2026-09-30T10:00:00.000Z",
    updated_at: "2026-09-30T10:00:00.000Z",
    direct_conversation_participants: participants.map((user_id) => ({
      user_id,
      profiles: { id: user_id, full_name: user_id === alice ? "Alice" : "Bob", username: null, avatar_url: null },
    })),
    latestMessage: null,
  };
}

function createRepository() {
  const conversations = new Map();
  const messages = new Map();
  return {
    conversations,
    messages,
    async userExists(userId) { return [alice, bob].includes(userId); },
    async listConversations(userId) {
      return [...conversations.values()].filter((conversation) =>
        conversation.direct_conversation_participants.some((participant) => participant.user_id === userId)
      );
    },
    async createConversation(currentUserId, targetUserId) {
      const participantIds = [currentUserId, targetUserId].sort();
      const existing = [...conversations.values()].find((conversation) =>
        participantIds.every((id) => conversation.direct_conversation_participants.some((participant) => participant.user_id === id))
      );
      if (existing) return existing;
      const conversation = makeConversation();
      conversations.set(conversation.id, conversation);
      messages.set(conversation.id, []);
      return conversation;
    },
    async getConversation(id, userId) {
      const conversation = conversations.get(id);
      return conversation?.direct_conversation_participants.some((participant) => participant.user_id === userId)
        ? conversation
        : null;
    },
    async conversationExists(id) { return conversations.has(id); },
    async listMessages(id) { return messages.get(id) || []; },
    async createMessage(id, senderId, content) {
      const message = { id: `message-${messages.get(id).length + 1}`, conversation_id: id, sender_id: senderId, content, created_at: "2026-09-30T10:01:00.000Z", updated_at: "2026-09-30T10:01:00.000Z" };
      messages.get(id).push(message);
      return message;
    },
    async sendMessage(id, senderId, content) {
      const conversation = await this.getConversation(id, senderId);
      if (!conversation) {
        const error = new Error(this.conversations.has(id) ? "You are not a participant in this conversation" : "Conversation not found");
        error.status = this.conversations.has(id) ? 403 : 404;
        throw error;
      }
      return this.createMessage(id, senderId, content);
    },
  };
}

function request(server, method, path, token, body) {
  return new Promise((resolve, reject) => {
    const payload = body ? JSON.stringify(body) : "";
    const address = server.address();
    const req = http.request({ host: address.address, port: address.port, method, path, headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json", "Content-Length": Buffer.byteLength(payload) } }, (res) => {
      let responseBody = "";
      res.on("data", (chunk) => { responseBody += chunk; });
      res.on("end", () => resolve({ status: res.statusCode, body: JSON.parse(responseBody) }));
    });
    req.on("error", reject);
    req.end(payload);
  });
}

async function withServer(repository, callback) {
  const supabase = { auth: { async getUser(token) { return token === "invalid" ? { error: new Error("invalid") } : { data: { user: { id: token } } }; } } };
  const server = http.createServer(createApp({ supabase, repository, config: { maxMessageLength: 20 } }));
  await new Promise((resolve) => server.listen(0, resolve));
  try { await callback(server); } finally { await new Promise((resolve) => server.close(resolve)); }
}

test("creates and reuses a direct conversation", async () => {
  const repository = createRepository();
  await withServer(repository, async (server) => {
    const first = await request(server, "POST", "/api/direct-chats", alice, { userId: bob });
    const second = await request(server, "POST", "/api/direct-chats", alice, { userId: bob });
    assert.equal(first.status, 201);
    assert.equal(second.status, 201);
    assert.equal(first.body.data.id, second.body.data.id);
    assert.equal(repository.conversations.size, 1);
  });
});

test("rejects self, unknown target, unauthenticated, and invalid conversation requests", async () => {
  const repository = createRepository();
  await withServer(repository, async (server) => {
    assert.equal((await request(server, "POST", "/api/direct-chats", alice, { userId: alice })).status, 400);
    assert.equal((await request(server, "POST", "/api/direct-chats", alice, { userId: outsider })).status, 404);
    assert.equal((await request(server, "GET", "/api/direct-chats", "invalid")).status, 401);
    assert.equal((await request(server, "GET", "/api/direct-chats/not-a-uuid/messages", alice)).status, 400);
  });
});

test("lists messages, derives sender from auth, trims content, and rejects empty messages", async () => {
  const repository = createRepository();
  await withServer(repository, async (server) => {
    await request(server, "POST", "/api/direct-chats", alice, { userId: bob });
    const sent = await request(server, "POST", `/api/direct-chats/${conversationId}/messages`, alice, { content: "  Hello  ", senderId: bob });
    assert.equal(sent.status, 201);
    assert.equal(sent.body.data.senderId, alice);
    assert.equal(sent.body.data.content, "Hello");
    assert.equal((await request(server, "GET", `/api/direct-chats/${conversationId}/messages`, bob)).body.data[0].content, "Hello");
    assert.equal((await request(server, "POST", `/api/direct-chats/${conversationId}/messages`, alice, { content: "   " })).status, 400);
  });
});

test("prevents a non-participant from reading or sending messages", async () => {
  const repository = createRepository();
  await withServer(repository, async (server) => {
    await request(server, "POST", "/api/direct-chats", alice, { userId: bob });
    assert.equal((await request(server, "GET", "/api/direct-chats/55555555-5555-4555-8555-555555555555/messages", alice)).status, 404);
    assert.equal((await request(server, "GET", `/api/direct-chats/${conversationId}/messages`, outsider)).status, 403);
    assert.equal((await request(server, "POST", `/api/direct-chats/${conversationId}/messages`, outsider, { content: "No" })).status, 403);
  });
});
