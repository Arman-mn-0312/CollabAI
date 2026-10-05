function parsePagination(query) {
  const requestedLimit = Number.parseInt(query.limit, 10);
  return {
    limit: Number.isInteger(requestedLimit) ? Math.min(Math.max(requestedLimit, 1), 100) : 50,
    before: query.before || null,
  };
}

function createDirectChatController(service) {
  const sendResult = (res, result, successStatus = 200) => {
    if (result.error) {
      return res.status(result.error.status).json({ success: false, error: { message: result.error.message } });
    }
    return res.status(successStatus).json({ success: true, data: result.data });
  };

  return {
    listConversations: async (req, res, next) => {
      try {
        const data = await service.listConversations(req.user.id);
        return res.json({ success: true, data });
      } catch (error) {
        return next(error);
      }
    },
    createConversation: async (req, res, next) => {
      try {
        return sendResult(res, await service.createConversation(req.user.id, req.body?.userId), 201);
      } catch (error) {
        return next(error);
      }
    },
    listMessages: async (req, res, next) => {
      try {
        return sendResult(res, await service.getMessages(req.user.id, req.params.conversationId, parsePagination(req.query)));
      } catch (error) {
        return next(error);
      }
    },
    sendMessage: async (req, res, next) => {
      try {
        return sendResult(res, await service.sendMessage(req.user.id, req.params.conversationId, req.body?.content), 201);
      } catch (error) {
        return next(error);
      }
    },
  };
}

module.exports = { createDirectChatController };
