# Daily Devotional

Next.js app intended for deployment on Vercel. Supabase provides admin authentication and persistent devotional and subscriber data.

## Local setup

1. Install dependencies with `npm install`.
2. Create a Supabase project and copy `.env.example` to `.env.local`. Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` from the Supabase project settings.
3. Configure email delivery in `.env.local`: set `RESEND_API_KEY`, set `RESEND_FROM_EMAIL` to an address on a verified Resend domain, and set `SUPABASE_SECRET_KEY` to the project secret key. Keep the Supabase secret key server-only; never prefix it with `NEXT_PUBLIC_`.
4. Apply all SQL files in `supabase/migrations/` in filename order in the Supabase SQL Editor. The email delivery and admin dashboard migrations must be applied before using those features.
5. Create the admin account in Supabase Authentication, then authorize it by running this in the SQL Editor, replacing the email:

   ```sql
   insert into public.admin_users (user_id, email)
   select id, email
   from auth.users
   where lower(email) = lower('admin@example.com');
   ```

6. Create a Resend webhook pointing to `https://your-domain/api/webhooks/resend` and subscribe to `email.delivered`, `email.failed`, `email.bounced`, `email.suppressed`, `email.opened`, and `email.clicked`. Set the webhook's signing secret as `RESEND_WEBHOOK_SECRET` in `.env.local`. Enable open and click tracking for the sending domain in Resend to receive engagement events.
7. Start the app with `npm run dev`. The public site is `/`; the private dashboard sign-in is `/admin/login`.
8. Add the Supabase URL, publishable key, secret key, Resend API key, verified sender address, and webhook signing secret to the Vercel project before deploying. Only the URL and publishable key should use the `NEXT_PUBLIC_` prefix.

The admin account must be listed in `public.admin_users`; being able to sign into Supabase alone does not grant dashboard access. Row-level security protects subscriber records and unpublished devotionals. Public signups collect an email, an optional phone number, and separate email and SMS preferences. Email subscriptions use double opt-in; pending email addresses are not sent devotionals until confirmed. The dashboard supports subscriber search/filtering, preference management, draft preview, test emails to the signed-in admin, and manual devotional sends. Publishing does not send email automatically. Per-recipient records show Resend acceptance, delivery/failure, and open/click activity when tracking is enabled. Text delivery is not implemented.

For a local preview without Supabase, run `npm run dev` with both Supabase variables unset. The public home page, About, Contact, Prayer Request, devotional archive, devotional detail pages, and `/admin` work with sample data. Form submissions only show a preview message—they are not saved. This fallback only activates in Next.js development mode and is never enabled in production.
