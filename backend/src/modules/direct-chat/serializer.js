function serializeParticipant(participant) {
  const profile = participant.profiles || {};
  return {
    id: participant.user_id,
    name: profile.full_name || profile.username || participant.user_id,
    username: profile.username || null,
    avatarUrl: profile.avatar_url || null,
  };
}

function serializeMessage(message) {
  return {
    id: message.id,
    conversationId: message.conversation_id,
    senderId: message.sender_id,
    content: message.content,
    createdAt: message.created_at,
    updatedAt: message.updated_at,
  };
}

function serializeConversation(conversation, currentUserId) {
  const participant = (conversation.direct_conversation_participants || []).find(
    (item) => item.user_id !== currentUserId
  );
  const latestMessage = conversation.latestMessage || null;

  return {
    id: conversation.id,
    createdAt: conversation.created_at,
    updatedAt: conversation.updated_at,
    otherParticipant: participant ? serializeParticipant(participant) : null,
    latestMessage: latestMessage ? serializeMessage(latestMessage) : null,
  };
}

module.exports = { serializeConversation, serializeMessage };
