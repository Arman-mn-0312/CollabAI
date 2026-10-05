const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function isUuid(value) {
  return typeof value === "string" && UUID_PATTERN.test(value);
}

function validateTargetUserId(value, currentUserId) {
  if (!isUuid(value)) {
    return "userId must be a valid UUID";
  }
  if (value === currentUserId) {
    return "You cannot create a conversation with yourself";
  }
  return null;
}

function validateConversationId(value) {
  return isUuid(value) ? null : "conversationId must be a valid UUID";
}

function validateMessageContent(value, maxLength) {
  if (typeof value !== "string" || value.trim().length === 0) {
    return "content is required";
  }
  if (value.trim().length > maxLength) {
    return `content must be ${maxLength} characters or fewer`;
  }
  return null;
}

module.exports = { isUuid, validateTargetUserId, validateConversationId, validateMessageContent };
