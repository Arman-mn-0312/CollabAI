const express = require("express");
const { createGroupsController } = require("./controller");

function createGroupsRouter(service) {
  const router = express.Router();
  const controller = createGroupsController(service);
  router.post("/", controller.create);
  router.get("/", controller.list);
  router.get("/invite/:inviteCode", controller.getInvite);
  router.get("/:groupId/join-requests/me", controller.myJoinRequest);
  router.post("/:groupId/join-requests", controller.createJoinRequest);
  router.get("/:groupId/join-requests", controller.listJoinRequests);
  router.post("/:groupId/join-requests/:requestId/accept", controller.acceptJoinRequest);
  router.post("/:groupId/join-requests/:requestId/reject", controller.rejectJoinRequest);
  router.get("/:groupId/members", controller.members);
  router.delete("/:groupId/members/:userId", controller.removeMember);
  router.post("/:groupId/leave", controller.leave);
  router.put("/:groupId", controller.update);
  router.delete("/:groupId", controller.delete);
  router.get("/:groupId", controller.get);
  return router;
}

module.exports = { createGroupsRouter };
