const express = require("express");
const { createDirectChatController } = require("./controller");

function createDirectChatRouter(service) {
  const router = express.Router();
  const controller = createDirectChatController(service);

  router.get("/", controller.listConversations);
  router.post("/", controller.createConversation);
  router.get("/:conversationId/messages", controller.listMessages);
  router.post("/:conversationId/messages", controller.sendMessage);
  return router;
}

module.exports = { createDirectChatRouter };
