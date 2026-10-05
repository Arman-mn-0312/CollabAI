const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function validateGroupId(value) {
  return typeof value === "string" && UUID_PATTERN.test(value) ? null : "Invalid group id";
}

function validateGroupInput(body) {
  if (!body || typeof body.name !== "string" || !body.name.trim()) return "Group name is required";
  if (body.name.trim().length > 120) return "Group name must be 120 characters or fewer";
  if (body.description !== undefined && typeof body.description !== "string") return "Description must be text";
  if (typeof body.description === "string" && body.description.trim().length > 1000) return "Description must be 1000 characters or fewer";
  return null;
}

function validateInviteCode(value) {
  return typeof value === "string" && /^[A-Z0-9-]{6,64}$/.test(value.trim().toUpperCase())
    ? null
    : "A valid invite code is required";
}

module.exports = { validateGroupId, validateGroupInput, validateInviteCode };
