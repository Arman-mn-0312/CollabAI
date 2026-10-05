# Authentication and profiles

The frontend uses Supabase email/password authentication through the existing
`VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` variables. Supabase
persists the session in its client storage and exposes session changes through
`supabase.auth.onAuthStateChange`.

Registration sends `full_name`, optional `username`, and a null `avatar_url` as
Supabase Auth user metadata. The
`20261002000100_create_profile_on_signup.sql` migration installs an
`after insert` trigger on `auth.users`. The trigger creates one
`public.profiles` row with the same user ID and ignores a duplicate ID.

If Supabase email confirmation is enabled, registration creates the Auth user
and profile but does not create a frontend session. The UI asks the user to
confirm the email before logging in. If confirmation is disabled, Supabase
returns a session and the user is taken directly to the dashboard.

Protected API requests obtain the current Supabase access token from
`supabase.auth.getSession()` and send it as `Authorization: Bearer <token>`.
The backend continues to verify that token with Supabase and uses the verified
user ID as `req.user.id`.
