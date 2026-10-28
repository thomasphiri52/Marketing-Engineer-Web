# Thomas Phiri Marketing Engineer — V6

V6 connects the Business Assessment form to Supabase when credentials are configured, while preserving an email fallback for local/demo use.

## What's new
- Supabase JS v2 browser client
- Assessment submissions insert into `public.leads`
- Clear success/error status and email fallback if backend is unavailable
- Supabase schema with RLS enabled, public insert-only lead policy, client profile/project/document read policies
- Added `profiles` table and client ownership via `auth.users`
- No service-role key in frontend

## Configure Supabase
1. Create a project at https://supabase.com.
2. In **SQL Editor**, run `supabase-schema.sql` from this folder.
3. In **Project Settings → API**, copy the Project URL and anon/public key.
4. Add them to `supabase-config.js` as `url` and `anonKey` (do not use a service_role/secret key).
5. Commit and deploy the folder contents to your static host.
6. Submit a test assessment and verify a row appears in `Table Editor → leads`.
7. In Supabase Auth, configure the allowed redirect URLs before enabling client sign-in.

## Important limits
- The live lead submission works only after you configure a Supabase project and deploy these files. This ZIP is not connected to your account automatically.
- The public form is intentionally insert-only; it cannot read the lead table. Admin CRM access needs a server-side/admin-authenticated layer and must not be granted to every visitor.
- Client portal screens remain a UI/demo until Supabase Auth UI and signed-in data loading are implemented. Local demo login is not secure authentication.
- Create a **private** Storage bucket for documents. Use authenticated policies or signed URLs; do not make client documents public.
- Supabase anon key is intended for browser use only when RLS is configured correctly. Never expose service_role keys.

## Validate after deployment
- Submit an assessment with valid fields.
- Confirm the success message and a new lead row in Supabase.
- Temporarily clear the URL/key and confirm email fallback still works.
- Test with a non-admin account that it cannot select leads or access another client's project.


## V7 — Supabase Auth + GitHub Pages setup

V7 adds Supabase Auth sign-in, account registration, password reset, sign-out, and a live project list scoped to the signed-in user's `auth.uid()`. It replaces the V4 demo code login. It requires a real Supabase project and the existing V6 base schema.

### Deploy steps
1. In Supabase Dashboard, open **Project Settings → API** (or **Connect**) and copy the Project URL and `anon`/publishable public key. Never use `service_role`/secret keys in this static site.
2. Edit `supabase-config.js`: set `url` and `anonKey`. This file is public on GitHub Pages, so only use the public anon/publishable key and maintain correct RLS.
3. In **SQL Editor**, run the existing `supabase-schema.sql` if not already run. Then run `supabase-v7-setup.sql`.
4. In **Authentication → URL Configuration**, set Site URL to your GitHub Pages URL, e.g. `https://YOUR-USERNAME.github.io/YOUR-REPOSITORY/`. Add that same URL and its auth callback path to Redirect URLs if needed. Use your actual username/repository.
5. Under **Authentication → Providers → Email**, choose whether email confirmation is required. For production, keep confirmation enabled. Configure SMTP/custom SMTP for reliable email delivery.
6. Commit and push the contents of `mp/` (or the contents of this folder if it is your repo root) to the branch/folder configured for GitHub Pages. Ensure `index.html`, `script.js`, `styles.css`, `supabase-config.js`, and both SQL files are in the same published directory.
7. Open the published site, register using an email you control, confirm the email if prompted, and sign in. In Supabase **Authentication → Users**, verify the account appears. In **Table Editor → profiles**, verify the profile row appears.
8. To test project visibility, add a project row through Table Editor with `client_id` set to that user's Auth UUID. It should appear only when that user is signed in.

### Important limitations
- This static site does not include an admin console for assigning projects. Add projects through the trusted Supabase dashboard or a secured server-side admin workflow. Never grant anonymous users project write access.
- The lead CRM still does not expose lead reads to the browser; keep it that way until a server-side admin role/API is implemented.
- Private document storage and authenticated downloads are not enabled yet; V7 only prepares the client dashboard and auth flow.
- JavaScript code and the public Supabase key are visible to website visitors by design. Security depends on RLS policies, not hiding the public key.
