const {
  validateTargetUserId,
  validateConversationId,
  validateMessageContent,
} = require("./validation");
const { serializeConversation, serializeMessage } = require("./serializer");

class DirectChatService {
  constructor(repository, { maxMessageLength = 4000 } = {}) {
    this.repository = repository;
    this.maxMessageLength = maxMessageLength;
  }

  async listConversations(userId) {
    const conversations = await this.repository.listConversations(userId);
    return conversations.map((conversation) => serializeConversation(conversation, userId));
  }

  async createConversation(userId, targetUserId) {
    const validationError = validateTargetUserId(targetUserId, userId);
    if (validationError) return { error: { status: 400, message: validationError } };
    if (!(await this.repository.userExists(targetUserId))) {
      return { error: { status: 404, message: "Target user not found" } };
    }

    const conversation = await this.repository.createConversation(userId, targetUserId);
    return { data: serializeConversation(conversation, userId) };
  }

  async getMessages(userId, conversationId, pagination) {
    const conversationIdError = validateConversationId(conversationId);
    if (conversationIdError) return { error: { status: 400, message: conversationIdError } };
    const conversation = await this.repository.getConversation(conversationId, userId);
    if (!conversation) {
      const exists = await this.repository.conversationExists(conversationId);
      return { error: { status: exists ? 403 : 404, message: exists ? "You are not a participant in this conversation" : "Conversation not found" } };
    }

    const messages = await this.repository.listMessages(conversationId, pagination);
    return { data: messages.map(serializeMessage) };
  }

  async sendMessage(userId, conversationId, content) {
    const serviceStart = Date.now();
    const conversationIdError = validateConversationId(conversationId);
    if (conversationIdError) return { error: { status: 400, message: conversationIdError } };
    const contentError = validateMessageContent(content, this.maxMessageLength);
    if (contentError) return { error: { status: 400, message: contentError } };

    try {
      let message;
      if (typeof this.repository.sendMessage === "function") {
        message = await this.repository.sendMessage(conversationId, userId, content.trim());
      } else {
        const conversation = await this.repository.getConversation(conversationId, userId);
        if (!conversation) {
          const exists = await this.repository.conversationExists(conversationId);
          return { error: { status: exists ? 403 : 404, message: exists ? "You are not a participant in this conversation" : "Conversation not found" } };
        }
        message = await this.repository.createMessage(conversationId, userId, content.trim());
      }
      console.log(`[DirectChat Backend] Total service.sendMessage elapsed: ${Date.now() - serviceStart} ms`);
      return { data: serializeMessage(message) };
    } catch (error) {
      if (error.status === 403 || error.status === 404) {
        return { error: { status: error.status, message: error.message } };
      }
      throw error;
    }
  }
}

module.exports = { DirectChatService };
