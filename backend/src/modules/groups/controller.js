function createGroupsController(service) {
  const send = (res, result, status = 200) => {
    if (result.error) return res.status(result.error.status).json({ success: false, error: { code: result.error.code, message: result.error.message } });
    return res.status(status).json({ success: true, data: result.data });
  };
  return {
    create: async (req, res, next) => { try { return send(res, await service.create(req.user.id, req.body), 201); } catch (e) { return next(e); } },
    list: async (req, res, next) => { try { return send(res, await service.list(req.user.id)); } catch (e) { return next(e); } },
    get: async (req, res, next) => { try { return send(res, await service.get(req.user.id, req.params.groupId)); } catch (e) { return next(e); } },
    getInvite: async (req, res, next) => { try { return send(res, await service.getInvite(req.params.inviteCode)); } catch (e) { return next(e); } },
    myJoinRequest: async (req, res, next) => { try { return send(res, await service.getMyJoinRequest(req.user.id, req.params.groupId)); } catch (e) { return next(e); } },
    createJoinRequest: async (req, res, next) => { try { return send(res, await service.createJoinRequest(req.user.id, req.params.groupId, req.body?.inviteCode), 201); } catch (e) { return next(e); } },
    listJoinRequests: async (req, res, next) => { try { return send(res, await service.listJoinRequests(req.user.id, req.params.groupId)); } catch (e) { return next(e); } },
    acceptJoinRequest: async (req, res, next) => { try { return send(res, await service.reviewJoinRequest(req.user.id, req.params.groupId, req.params.requestId, "accepted")); } catch (e) { return next(e); } },
    rejectJoinRequest: async (req, res, next) => { try { return send(res, await service.reviewJoinRequest(req.user.id, req.params.groupId, req.params.requestId, "rejected")); } catch (e) { return next(e); } },
    leave: async (req, res, next) => { try { return send(res, await service.leave(req.user.id, req.params.groupId)); } catch (e) { return next(e); } },
    members: async (req, res, next) => { try { return send(res, await service.members(req.user.id, req.params.groupId)); } catch (e) { return next(e); } },
    removeMember: async (req, res, next) => { try { return send(res, await service.removeMember(req.user.id, req.params.groupId, req.params.userId)); } catch (e) { return next(e); } },
    update: async (req, res, next) => { try { return send(res, await service.update(req.user.id, req.params.groupId, req.body)); } catch (e) { return next(e); } },
    delete: async (req, res, next) => { try { return send(res, await service.delete(req.user.id, req.params.groupId)); } catch (e) { return next(e); } },
  };
}

module.exports = { createGroupsController };
