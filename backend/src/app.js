const express = require("express");
const { createAuthenticationMiddleware } = require("./middleware/authenticate");
const { DirectChatRepository } = require("./modules/direct-chat/repository");
const { DirectChatService } = require("./modules/direct-chat/service");
const { createDirectChatRouter } = require("./modules/direct-chat/routes");
const { GroupsRepository } = require("./modules/groups/repository");
const { GroupsService } = require("./modules/groups/service");
const { createGroupsRouter } = require("./modules/groups/routes");

function createApp({ supabase, config, repository = new DirectChatRepository(supabase), groupsRepository = new GroupsRepository(supabase) }) {
  const app = express();
  const service = new DirectChatService(repository, { maxMessageLength: config.maxMessageLength });
  const groupsService = new GroupsService(groupsRepository);

  app.use((req, res, next) => {
    const origin = req.get("origin");
    const isLocalDevelopmentOrigin = origin && /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);
    const isConfiguredFrontendOrigin = origin && config.frontendUrl && origin === config.frontendUrl;
    if (origin && (isLocalDevelopmentOrigin || isConfiguredFrontendOrigin)) {
      res.setHeader("Access-Control-Allow-Origin", origin);
    }
    res.setHeader("Vary", "Origin");
    res.setHeader("Access-Control-Allow-Headers", "Authorization, Content-Type");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    if (req.method === "OPTIONS") return res.sendStatus(204);
    return next();
  });

  app.use(express.json({ limit: "32kb" }));
  app.get("/health", (_req, res) => res.json({ success: true, data: { status: "ok" } }));
  app.use("/api/direct-chats", createAuthenticationMiddleware(supabase), createDirectChatRouter(service));
  app.use("/api/groups", createAuthenticationMiddleware(supabase), createGroupsRouter(groupsService));
  app.use((error, _req, res, _next) => {
    console.error(error);
    if (error?.code === "23505") {
      return res.status(409).json({ success: false, error: { code: "CONFLICT", message: "That group membership or invite code already exists" } });
    }
    if (error?.code === "23503") {
      return res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "The requested group or user was not found" } });
    }
    return res.status(500).json({ success: false, error: { code: "INTERNAL_ERROR", message: "Unexpected server error" } });
  });
  return app;
}

module.exports = { createApp };
