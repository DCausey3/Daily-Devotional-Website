# Daily Devotional

Next.js app intended for deployment on Vercel. Supabase provides admin authentication and persistent devotional and subscriber data.

## Local setup

1. Install dependencies with `npm install`.
2. Create a Supabase project and copy `.env.example` to `.env.local`. Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` from the Supabase project settings.
3. Apply both SQL files in `supabase/migrations/` in filename order in the Supabase SQL Editor.
4. Create the admin account in Supabase Authentication, then authorize it by running this in the SQL Editor, replacing the email:

   ```sql
   insert into public.admin_users (user_id, email)
   select id, email
   from auth.users
   where lower(email) = lower('admin@example.com');
   ```

5. Start the app with `npm run dev`. The public site is `/`; the private dashboard sign-in is `/admin/login`.
6. Add the same two Supabase environment variables to the Vercel project before deploying.

The admin account must be listed in `public.admin_users`; being able to sign into Supabase alone does not grant dashboard access. Row-level security protects subscriber records and unpublished devotionals. Public signups collect an email, an optional phone number, and separate SMS consent. No email or text delivery is performed yet.

For a local preview without Supabase, run `npm run dev` with both Supabase variables unset. The public home page, About, Contact, Prayer Request, devotional archive, devotional detail pages, and `/admin` work with sample data. Form submissions only show a preview message—they are not saved. This fallback only activates in Next.js development mode and is never enabled in production.
