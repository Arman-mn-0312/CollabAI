# CollabAI backend

The Direct Chat API uses the Supabase service-role client on the server. Keep `SUPABASE_SERVICE_ROLE_KEY` server-side and never expose it to the frontend.

Run from this directory:

```text
npm install
npm test
npm start
```

Apply `../supabase/migrations/20260930000100_direct_chat.sql` to the Supabase project before starting the server.
