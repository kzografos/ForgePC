-- ============================================================================
-- ForgePC rebrand — move demo accounts off the old @kzproducts.dev domain.
--
-- One-off. Run in the Supabase SQL Editor, then delete nothing: this script is
-- idempotent (re-running it matches zero rows).
--
-- The email lives in THREE places and all three must move together:
--   auth.users.email            -> what password login matches against
--   auth.identities.identity_data->>'email'  -> the email provider's own copy
--   public.profiles.email       -> denormalised mirror kept by handle_new_user()
--
-- Passwords, user IDs, orders, and reviews are untouched.
-- ============================================================================

begin;

update auth.users
set    email = replace(email, '@kzproducts.dev', '@forgepc.dev')
where  email like '%@kzproducts.dev';

update auth.identities
set    identity_data = jsonb_set(
         identity_data,
         '{email}',
         to_jsonb(replace(identity_data->>'email', '@kzproducts.dev', '@forgepc.dev'))
       )
where  provider = 'email'
and    identity_data->>'email' like '%@kzproducts.dev';

update public.profiles
set    email = replace(email, '@kzproducts.dev', '@forgepc.dev')
where  email like '%@kzproducts.dev';

commit;

-- Verification: every row should read *@forgepc.dev, and all three columns
-- should agree.
select u.email                        as auth_email,
       i.identity_data->>'email'      as identity_email,
       p.email                        as profile_email
from   auth.users u
left   join auth.identities i on i.user_id = u.id and i.provider = 'email'
left   join public.profiles p on p.id = u.id
order  by u.email;
