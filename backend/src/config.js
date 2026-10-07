const requiredEnvironment = ["SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY"];

function getConfig(env = process.env) {
  const missing = requiredEnvironment.filter((name) => !env[name]);
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(", ")}`);
  }

  return {
    port: Number(env.PORT || 3000),
    supabaseUrl: env.SUPABASE_URL,
    supabaseServiceRoleKey: env.SUPABASE_SERVICE_ROLE_KEY,
    maxMessageLength: Number(env.DIRECT_MESSAGE_MAX_LENGTH || 4000),
    frontendUrl: env.FRONTEND_URL,
  };
}

module.exports = { getConfig };
