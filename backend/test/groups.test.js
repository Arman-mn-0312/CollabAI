const assert = require("node:assert/strict");
const test = require("node:test");
const { GroupsService } = require("../src/modules/groups/service");

const owner = "11111111-1111-4111-8111-111111111111";
const member = "22222222-2222-4222-8222-222222222222";
const otherMember = "33333333-3333-4333-8333-333333333333";
const groupId = "44444444-4444-4444-8444-444444444444";
const joiner = "55555555-5555-4555-8555-555555555555";
const requestId = "66666666-6666-4666-8666-666666666666";

function createRepository() {
  const memberships = new Map([
    [`${groupId}:${owner}`, { group_id: groupId, user_id: owner, role: "owner" }],
    [`${groupId}:${member}`, { group_id: groupId, user_id: member, role: "member" }],
    [`${groupId}:${otherMember}`, { group_id: groupId, user_id: otherMember, role: "member" }],
  ]);
  const groups = new Map([[groupId, { id: groupId, owner_id: owner, name: "Original", description: "" }]]);
  return {
    memberships,
    groups,
    async getMembership(id, userId) { return memberships.get(`${id}:${userId}`) || null; },
    async getGroupOwner(id) { return groups.get(id)?.owner_id || null; },
    async groupExists(id) { return groups.has(id); },
    async updateGroup(id, updates) { Object.assign(groups.get(id), updates); return groups.get(id); },
    async deleteGroup(id) { groups.delete(id); },
    async removeMember(id, userId) { memberships.delete(`${id}:${userId}`); },
    async findByInviteCode(code) { return code === "COLLAB-VALID" ? { id: groupId } : null; },
    requests: new Map(),
    async getJoinRequest(id, userId) { return this.requests.get(`${id}:${userId}`) || null; },
    async createJoinRequest(id, userId) {
      const result = { id: requestId, group_id: id, user_id: userId, status: "pending" };
      this.requests.set(`${id}:${userId}`, result);
      return result;
    },
    async listJoinRequests() { return []; },
    async reviewJoinRequest(requestId, ownerId, decision) {
      const existing = this.requests.get(`${groupId}:${joiner}`);
      if (existing?.status !== "pending") {
        const error = new Error("already reviewed");
        error.code = "55000";
        throw error;
      }
      const result = { id: requestId, group_id: groupId, user_id: joiner, status: decision };
      this.requests.set(`${groupId}:${joiner}`, result);
      if (decision === "accepted") memberships.set(`${groupId}:${joiner}`, { group_id: groupId, user_id: joiner, role: "member" });
      return result;
    },
  };
}

function createService() {
  const repository = createRepository();
  return { repository, service: new GroupsService(repository) };
}

test("owner identity, not membership role, controls owner operations", async () => {
  const { repository, service } = createService();
  repository.memberships.set(`${groupId}:${member}`, { group_id: groupId, user_id: member, role: "owner" });

  assert.equal((await service.update(member, groupId, { name: "No", description: "" })).error.code, "OWNER_REQUIRED");
  assert.equal((await service.delete(member, groupId)).error.code, "OWNER_REQUIRED");
  assert.equal((await service.removeMember(member, groupId, otherMember)).error.code, "OWNER_REQUIRED");
  assert.equal((await service.update(owner, groupId, { name: "Updated", description: "" })).data.name, "Updated");
  assert.equal((await service.removeMember(owner, groupId, otherMember)).data.userId, otherMember);
  assert.equal((await service.delete(owner, groupId)).data.groupId, groupId);
});

test("owner cannot leave and a normal member can leave", async () => {
  const { repository, service } = createService();
  assert.equal((await service.leave(owner, groupId)).error.code, "OWNER_CANNOT_LEAVE");
  assert.equal((await service.leave(member, groupId)).data.groupId, groupId);
  assert.equal(repository.memberships.has(`${groupId}:${member}`), false);
});

test("join requests validate the invite and do not create membership", async () => {
  const { repository, service } = createService();
  const result = await service.createJoinRequest(joiner, groupId, "collab-valid");
  assert.equal(result.data.status, "pending");
  assert.equal(repository.memberships.has(`${groupId}:${joiner}`), false);
  assert.equal((await service.createJoinRequest(joiner, groupId, "unknown-code")).error.code, "REQUEST_PENDING");
});

test("only the owner can review requests and acceptance creates one member", async () => {
  const { repository, service } = createService();
  await service.createJoinRequest(joiner, groupId, "collab-valid");
  assert.equal((await service.reviewJoinRequest(member, groupId, requestId, "accepted")).error.code, "OWNER_REQUIRED");
  const accepted = await service.reviewJoinRequest(owner, groupId, requestId, "accepted");
  assert.equal(accepted.data.status, "accepted");
  assert.equal(repository.memberships.get(`${groupId}:${joiner}`).role, "member");
  assert.equal((await service.reviewJoinRequest(owner, groupId, requestId, "accepted")).error.code, "REQUEST_ALREADY_REVIEWED");
});

test("rejecting a request does not create membership", async () => {
  const { repository, service } = createService();
  await service.createJoinRequest(joiner, groupId, "collab-valid");
  const rejected = await service.reviewJoinRequest(owner, groupId, requestId, "rejected");
  assert.equal(rejected.data.status, "rejected");
  assert.equal(repository.memberships.has(`${groupId}:${joiner}`), false);
});
