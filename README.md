# Thomas Phiri — Marketing Engineer Website V15–V19

A responsive static website package for GitHub Pages. The package includes a premium dark navy/cyan/purple design, project portfolio and case-study style descriptions, interactive proposal builder, illustrative ROI calculator, local demo lead pipeline, SEO metadata and an optional Supabase public lead-submission connection.

## Included
- **V15 Premium redesign:** responsive navigation, dark SaaS theme, motion effects with reduced-motion support, dashboard illustration and mobile layout.
- **V16 Portfolio:** project descriptions, live demo/source links and technology tags. Portfolio content distinguishes concepts/prototypes from verified outcomes.
- **V17 Proposal + ROI:** package and service selection, project summary, copy/email actions, and adjustable illustrative revenue model.
- **V18 Lead management foundation:** local browser-only demo pipeline with stage updates and CSV export; optional Supabase lead INSERT. A secure shared CRM admin interface is intentionally not faked: it requires a protected server-side/admin-authenticated endpoint.
- **V19 SEO and tracking readiness:** title/description, Open Graph metadata, canonical URL, Person JSON-LD, robots.txt, sitemap.xml and basic interaction structure. No analytics provider is activated by default; add your own measurement ID only after configuring consent/privacy notices as appropriate.

## Deploy on GitHub Pages
1. Download and extract the ZIP.
2. Open your repository: https://github.com/thomasphiri52/Marketing-Engineer-Web
3. Back up the existing files or create a branch before replacing files.
4. Upload the contents of this folder to the repository root (not the containing folder itself), replacing `index.html`, `styles.css`, `script.js`, `supabase-config.js`, `README.md` and `supabase-schema.sql`; add `supabase-config.example.js`, `robots.txt` and `sitemap.xml` if they do not already exist.
5. Commit the changes to `main` with a message such as `Upgrade Marketing Engineer website V15-V19`.
6. Open repository **Settings → Pages** and confirm publishing source is the `main` branch and `/(root)` (or retain your existing correct publishing source).
7. Wait for the Pages deployment to finish. Check the **Actions** tab for the Pages workflow status, then open https://thomasphiri52.github.io/Marketing-Engineer-Web/ in a private window or hard-refresh with Ctrl+F5.
8. Test the menu on mobile, project links, ROI sliders, proposal validation, copy/email actions, local lead stages and CSV export.

## Optional Supabase setup
1. Create a Supabase project.
2. Open **SQL Editor** and run `supabase-schema.sql`.
3. Open project API/Connect settings and copy the project URL and anon/publishable public key.
4. Put those two public values in `supabase-config.js`. Never use a `service_role`/secret key in frontend code.
5. Commit the configured file and deploy. Submit a test brief and verify a new row appears in Table Editor → `leads`.
6. Test that anonymous users cannot SELECT, UPDATE or DELETE rows from `leads`.

## Important security and capability notes
- The local demo lead pipeline uses `localStorage` in the current browser. It is not shared, backed up, or appropriate for real sensitive customer data.
- The optional public form can insert leads to Supabase under the provided insert-only policy. It cannot read the shared lead table.
- To complete a production CRM, create an authenticated admin role and a server-side API/Edge Function that verifies admin authorization before reading/updating leads. Never place a service-role key in the browser or give public visitors broad table access.
- The client portal is not represented as a secure shared portal in this version; authenticated client workspaces require properly scoped auth and RLS policies.
- Analytics is SEO/measurement-ready but no tracking code or ID has been invented or activated. Configure a real provider and appropriate privacy/consent notice if you choose to use one.
- ROI results are illustrative calculations, not promised results or financial advice.
- Replace the generic LinkedIn URL in `index.html` with your exact profile URL when available.
- The current package prices are the site's stated indicative amounts. Confirm scope, taxes (if applicable), deliverables and recurring support in writing before accepting work.

## Files
- `index.html` — semantic website markup and SEO metadata
- `styles.css` — responsive styling and animation system
- `script.js` — proposal builder, ROI calculator, local demo lead pipeline and optional Supabase submit
- `supabase-config.js` — empty safe config placeholder
- `supabase-config.example.js` — setup example
- `supabase-schema.sql` — minimal insert-only leads table policy
- `robots.txt`, `sitemap.xml` — search-engine discovery files
