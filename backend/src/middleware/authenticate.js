function createAuthenticationMiddleware(supabase) {
  return async function authenticateUser(req, res, next) {
    const authorization = req.get("authorization") || "";
    const token = authorization.startsWith("Bearer ")
      ? authorization.slice("Bearer ".length).trim()
      : "";

    if (!token) {
      return res.status(401).json({ success: false, error: { code: "UNAUTHENTICATED", message: "Authentication required" } });
    }

    const authStart = Date.now();
    const { data, error } = await supabase.auth.getUser(token);
    console.log(`[DirectChat Backend] Auth check elapsed: ${Date.now() - authStart} ms`);
    if (error || !data.user) {
      return res.status(401).json({ success: false, error: { code: "UNAUTHENTICATED", message: "Invalid authentication token" } });
    }

    req.user = data.user;
    return next();
  };
}

module.exports = { createAuthenticationMiddleware };
