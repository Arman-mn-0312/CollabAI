const { createClient } = require("@supabase/supabase-js");
const { getConfig } = require("./config");

function createSupabaseAdminClient(config = getConfig()) {
  return createClient(config.supabaseUrl, config.supabaseServiceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

module.exports = { createSupabaseAdminClient };
