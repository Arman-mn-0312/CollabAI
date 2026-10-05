const { validateGroupId, validateGroupInput, validateInviteCode } = require("./validation");

class GroupsService {
  constructor(repository) {
    this.repository = repository;
  }

  async create(userId, body) {
    const error = validateGroupInput(body);
    return error ? { error: { status: 422, code: "VALIDATION_ERROR", message: error } } : { data: await this.repository.createGroup(userId, body) };
  }

  async list(userId) { return { data: await this.repository.listGroups(userId) }; }

  async get(userId, groupId) {
    const idError = validateGroupId(groupId);
    if (idError) return { error: { status: 400, code: "INVALID_GROUP_ID", message: idError } };
    const group = await this.repository.getGroup(groupId, userId);
    if (!group) return { error: { status: (await this.repository.groupExists(groupId)) ? 403 : 404, code: "GROUP_ACCESS_DENIED", message: "Group not found or access denied" } };
    return { data: group };
  }

  async getInvite(inviteCode) {
    const validationError = validateInviteCode(inviteCode);
    if (validationError) return { error: { status: 422, code: "VALIDATION_ERROR", message: validationError } };
    const group = await this.repository.findByInviteCode(inviteCode.trim().toUpperCase());
    return group
      ? { data: { id: group.id, name: group.name, description: group.description, invite_code: group.invite_code } }
      : { error: { status: 404, code: "GROUP_NOT_FOUND", message: "Invite code not found" } };
  }

  async getMyJoinRequest(userId, groupId) {
    const access = await this.authorizeGroup(groupId);
    if (access.error) return access;
    const request = await this.repository.getJoinRequest(groupId, userId);
    return { data: request };
  }

  async createJoinRequest(userId, groupId, inviteCode) {
    const idError = validateGroupId(groupId);
    if (idError) return { error: { status: 400, code: "INVALID_GROUP_ID", message: idError } };
    const validationError = validateInviteCode(inviteCode);
    if (validationError) return { error: { status: 422, code: "VALIDATION_ERROR", message: validationError } };
    if (await this.repository.getMembership(groupId, userId)) {
      return { error: { status: 409, code: "ALREADY_MEMBER", message: "You are already a member of this group" } };
    }
    const existing = await this.repository.getJoinRequest(groupId, userId);
    if (existing?.status === "pending") {
      return { error: { status: 409, code: "REQUEST_PENDING", message: "Your request is pending approval" } };
    }
    if (existing?.status === "rejected") {
      return { error: { status: 409, code: "REQUEST_REJECTED", message: "Your request was rejected" } };
    }
    try {
      return { data: await this.repository.createJoinRequest(groupId, userId, inviteCode.trim().toUpperCase()) };
    } catch (error) {
      if (error.code === "22023") return { error: { status: 403, code: "INVALID_INVITE", message: "Invalid invite code" } };
      if (error.code === "23505") return { error: { status: 409, code: "ALREADY_MEMBER", message: "You are already a member of this group" } };
      throw error;
    }
  }

  async listJoinRequests(userId, groupId) {
    const access = await this.authorizeOwner(userId, groupId);
    if (access.error) return access;
    const requests = await this.repository.listJoinRequests(groupId);
    return { data: requests.map((request) => ({ ...request, applicant: request.profiles })) };
  }

  async reviewJoinRequest(userId, groupId, requestId, decision) {
    const access = await this.authorizeOwner(userId, groupId);
    if (access.error) return access;
    if (!/^[0-9a-f-]{36}$/i.test(requestId)) {
      return { error: { status: 400, code: "INVALID_REQUEST_ID", message: "Invalid join request id" } };
    }
    try {
      const request = await this.repository.reviewJoinRequest(requestId, userId, decision);
      if (request.group_id !== groupId) return { error: { status: 404, code: "REQUEST_NOT_FOUND", message: "Join request not found" } };
      return { data: request };
    } catch (error) {
      if (error.code === "42501") return { error: { status: 403, code: "OWNER_REQUIRED", message: "Only the group owner can review requests" } };
      if (error.code === "55000") return { error: { status: 409, code: "REQUEST_ALREADY_REVIEWED", message: "Join request has already been reviewed" } };
      throw error;
    }
  }

  async leave(userId, groupId) {
    const access = await this.authorizeMember(userId, groupId);
    if (access.error) return access;
    if (access.ownerId === userId) return { error: { status: 403, code: "OWNER_CANNOT_LEAVE", message: "The owner cannot leave this group" } };
    await this.repository.removeMember(groupId, userId);
    return { data: { groupId } };
  }

  async members(userId, groupId) {
    const result = await this.get(userId, groupId);
    if (result.error) return result;
    return { data: result.data.group_members.map((member) => ({ ...member.profiles, role: member.role, joined_at: member.joined_at })) };
  }

  async removeMember(userId, groupId, targetUserId) {
    const access = await this.authorizeOwner(userId, groupId);
    if (access.error) return access;
    if (targetUserId === userId) return { error: { status: 400, code: "OWNER_CANNOT_REMOVE_SELF", message: "The owner cannot remove themselves" } };
    if (!(await this.repository.getMembership(groupId, targetUserId))) return { error: { status: 404, code: "MEMBER_NOT_FOUND", message: "Member not found" } };
    await this.repository.removeMember(groupId, targetUserId);
    return { data: { groupId, userId: targetUserId } };
  }

  async update(userId, groupId, body) {
    const access = await this.authorizeOwner(userId, groupId);
    if (access.error) return access;
    const validationError = validateGroupInput(body);
    if (validationError) return { error: { status: 422, code: "VALIDATION_ERROR", message: validationError } };
    return { data: await this.repository.updateGroup(groupId, { name: body.name.trim(), description: (body.description || "").trim() }) };
  }

  async delete(userId, groupId) {
    const access = await this.authorizeOwner(userId, groupId);
    if (access.error) return access;
    await this.repository.deleteGroup(groupId);
    return { data: { groupId } };
  }

  async authorizeMember(userId, groupId) {
    const idError = validateGroupId(groupId);
    if (idError) return { error: { status: 400, code: "INVALID_GROUP_ID", message: idError } };
    const membership = await this.repository.getMembership(groupId, userId);
    if (!membership) return { error: { status: (await this.repository.groupExists(groupId)) ? 403 : 404, code: "GROUP_ACCESS_DENIED", message: "Group not found or access denied" } };
    return { membership, ownerId: await this.repository.getGroupOwner(groupId) };
  }

  async authorizeGroup(groupId) {
    const idError = validateGroupId(groupId);
    if (idError) return { error: { status: 400, code: "INVALID_GROUP_ID", message: idError } };
    if (!(await this.repository.groupExists(groupId))) return { error: { status: 404, code: "GROUP_NOT_FOUND", message: "Group not found" } };
    return {};
  }

  async authorizeOwner(userId, groupId) {
    const access = await this.authorizeMember(userId, groupId);
    if (access.error) return access;
    if (access.ownerId !== userId) return { error: { status: 403, code: "OWNER_REQUIRED", message: "Only the group owner can perform this operation" } };
    return access;
  }
}

module.exports = { GroupsService };
