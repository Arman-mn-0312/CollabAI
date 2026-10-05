const { createApp } = require("./app");
const { getConfig } = require("./config");
const { createSupabaseAdminClient } = require("./supabase");

const config = getConfig();
const app = createApp({ config, supabase: createSupabaseAdminClient(config) });

app.listen(config.port, () => {
  console.log(`CollabAI backend listening on port ${config.port}`);
});