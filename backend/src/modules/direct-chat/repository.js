class DirectChatRepository {
  constructor(supabase) {
    this.supabase = supabase;
  }

  async userExists(userId) {
    const { data, error } = await this.supabase.auth.admin.getUserById(userId);
    if (error && error.status !== 404) throw error;
    return Boolean(data && data.user);
  }

  async listConversations(userId) {
    const { data: participantRows, error: participantError } = await this.supabase
      .from("direct_conversation_participants")
      .select("conversation_id, user_id, profiles(id, full_name, username, avatar_url)")
      .eq("user_id", userId);
    if (participantError) throw participantError;

    const conversationIds = participantRows.map((row) => row.conversation_id);
    if (conversationIds.length === 0) return [];

    const { data: conversations, error: conversationError } = await this.supabase
      .from("direct_conversations")
      .select("id, created_at, updated_at")
      .in("id", conversationIds)
      .order("updated_at", { ascending: false });
    if (conversationError) throw conversationError;

    const { data: allParticipants, error: allParticipantsError } = await this.supabase
      .from("direct_conversation_participants")
      .select("conversation_id, user_id, profiles(id, full_name, username, avatar_url)")
      .in("conversation_id", conversationIds);
    if (allParticipantsError) throw allParticipantsError;

    const { data: messages, error: messagesError } = await this.supabase
      .from("direct_messages")
      .select("id, conversation_id, sender_id, content, created_at, updated_at")
      .in("conversation_id", conversationIds)
      .order("created_at", { ascending: false });
    if (messagesError) throw messagesError;

    const latestByConversation = new Map();
    for (const message of messages) {
      if (!latestByConversation.has(message.conversation_id)) {
        latestByConversation.set(message.conversation_id, message);
      }
    }

    return conversations.map((conversation) => ({
      ...conversation,
      direct_conversation_participants: allParticipants.filter(
        (participant) => participant.conversation_id === conversation.id
      ),
      latestMessage: latestByConversation.get(conversation.id) || null,
    }));
  }

  async createConversation(currentUserId, targetUserId) {
    const { data, error } = await this.supabase.rpc("create_direct_conversation", {
      p_current_user_id: currentUserId,
      p_target_user_id: targetUserId,
    });
    if (error) throw error;
    return this.getConversation(data, currentUserId);
  }

  async getConversation(conversationId, userId) {
    const { data, error } = await this.supabase
      .from("direct_conversations")
      .select("id, created_at, updated_at, direct_conversation_participants(user_id, profiles(id, full_name, username, avatar_url))")
      .eq("id", conversationId)
      .maybeSingle();
    if (error) throw error;
    if (!data) return null;

    const isParticipant = data.direct_conversation_participants.some(
      (participant) => participant.user_id === userId
    );
    return isParticipant ? data : null;
  }

  async conversationExists(conversationId) {
    const { data, error } = await this.supabase
      .from("direct_conversations")
      .select("id")
      .eq("id", conversationId)
      .maybeSingle();
    if (error) throw error;
    return Boolean(data);
  }

  async listMessages(conversationId, { limit, before }) {
    let query = this.supabase
      .from("direct_messages")
      .select("id, conversation_id, sender_id, content, created_at, updated_at")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: false })
      .limit(limit);
    if (before) query = query.lt("created_at", before);

    const { data, error } = await query;
    if (error) throw error;
    return data.reverse();
  }

  async createMessage(conversationId, senderId, content) {
    const { data, error } = await this.supabase
      .from("direct_messages")
      .insert({ conversation_id: conversationId, sender_id: senderId, content })
      .select("id, conversation_id, sender_id, content, created_at, updated_at")
      .single();
    if (error) throw error;
    return data;
  }

  async sendMessage(conversationId, senderId, content) {
    try {
      const { data, error } = await this.supabase.rpc("send_direct_message", {
        p_conversation_id: conversationId,
        p_sender_id: senderId,
        p_content: content,
      });
      if (error) {
        if (error.code === "42501" || error.message?.includes("not a participant")) {
          const notParticipantError = new Error("You are not a participant in this conversation");
          notParticipantError.status = 403;
          throw notParticipantError;
        }
        return this.sendMessageFallback(conversationId, senderId, content);
      }
      const row = Array.isArray(data) ? data[0] : data;
      if (!row) {
        return this.sendMessageFallback(conversationId, senderId, content);
      }
      return row;
    } catch (err) {
      if (err.status === 403) throw err;
      return this.sendMessageFallback(conversationId, senderId, content);
    }
  }

  async sendMessageFallback(conversationId, senderId, content) {
    const conversation = await this.getConversation(conversationId, senderId);
    if (!conversation) {
      const notParticipantError = new Error("You are not a participant in this conversation");
      notParticipantError.status = 403;
      throw notParticipantError;
    }
    return this.createMessage(conversationId, senderId, content);
  }
}

module.exports = { DirectChatRepository };
