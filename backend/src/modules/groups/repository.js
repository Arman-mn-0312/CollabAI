class GroupsRepository {
  constructor(supabase) {
    this.supabase = supabase;
  }

  async createGroup(ownerId, { name, description }) {
    const { data: group, error } = await this.supabase.rpc("create_group_with_owner", {
      p_name: name.trim(),
      p_description: (description || "").trim(),
      p_owner_id: ownerId,
    });
    if (error) throw error;
    return this.getGroup(group.id, ownerId);
  }

  async listGroups(userId) {
    const { data, error } = await this.supabase
      .from("group_members")
      .select("group_id, role, groups(id, name, description, owner_id, created_at, updated_at)")
      .eq("user_id", userId);
    if (error) throw error;
    const groupIds = data.map((row) => row.group_id);
    if (!groupIds.length) return [];
    const { data: members, error: memberError } = await this.supabase
      .from("group_members").select("group_id").in("group_id", groupIds);
    if (memberError) throw memberError;
    return data.filter((row) => row.groups).map((row) => ({
      ...row.groups, role: row.role, member_count: members.filter((member) => member.group_id === row.group_id).length,
    }));
  }

  async getGroup(groupId, userId) {
    const { data, error } = await this.supabase
      .from("groups")
      .select("id, name, description, invite_code, owner_id, created_at, updated_at, group_members(user_id, role, joined_at, profiles(id, full_name, username, avatar_url))")
      .eq("id", groupId).maybeSingle();
    if (error) throw error;
    if (!data || !data.group_members.some((member) => member.user_id === userId)) return null;
    return data;
  }

  async groupExists(groupId) {
    const { data, error } = await this.supabase.from("groups").select("id").eq("id", groupId).maybeSingle();
    if (error) throw error;
    return Boolean(data);
  }

  async findByInviteCode(inviteCode) {
    const { data, error } = await this.supabase.from("groups").select("id, name, description, invite_code, owner_id").eq("invite_code", inviteCode).maybeSingle();
    if (error) throw error;
    return data;
  }

  async createJoinRequest(groupId, userId, inviteCode) {
    const { data, error } = await this.supabase.rpc("create_group_join_request", {
      p_group_id: groupId,
      p_user_id: userId,
      p_invite_code: inviteCode,
    });
    if (error) throw error;
    return data;
  }

  async getJoinRequest(groupId, userId) {
    const { data, error } = await this.supabase.from("group_join_requests")
      .select("id, group_id, user_id, status, requested_at, reviewed_at, reviewed_by")
      .eq("group_id", groupId).eq("user_id", userId)
      .order("requested_at", { ascending: false }).limit(1).maybeSingle();
    if (error) throw error;
    return data;
  }

  async listJoinRequests(groupId) {
    const { data, error } = await this.supabase.from("group_join_requests")
      .select("id, group_id, user_id, status, requested_at, reviewed_at, reviewed_by, profiles(id, full_name, username, avatar_url)")
      .eq("group_id", groupId).order("requested_at", { ascending: false });
    if (error) throw error;
    return data;
  }

  async reviewJoinRequest(requestId, ownerId, decision) {
    const { data, error } = await this.supabase.rpc("review_group_join_request", {
      p_request_id: requestId,
      p_owner_id: ownerId,
      p_decision: decision,
    });
    if (error) throw error;
    return data;
  }

  async getMembership(groupId, userId) {
    const { data, error } = await this.supabase.from("group_members")
      .select("group_id, user_id, role, joined_at").eq("group_id", groupId).eq("user_id", userId).maybeSingle();
    if (error) throw error;
    return data;
  }

  async getGroupOwner(groupId) {
    const { data, error } = await this.supabase.from("groups").select("owner_id").eq("id", groupId).maybeSingle();
    if (error) throw error;
    return data?.owner_id || null;
  }

  async removeMember(groupId, userId) {
    const { error } = await this.supabase.from("group_members").delete().eq("group_id", groupId).eq("user_id", userId);
    if (error) throw error;
  }

  async updateGroup(groupId, updates) {
    const { data, error } = await this.supabase.from("groups").update(updates)
      .eq("id", groupId).select("id, name, description, invite_code, owner_id, created_at, updated_at").single();
    if (error) throw error;
    return data;
  }

  async deleteGroup(groupId) {
    const { error } = await this.supabase.from("groups").delete().eq("id", groupId);
    if (error) throw error;
  }
}

module.exports = { GroupsRepository };
