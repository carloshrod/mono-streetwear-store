-- ============================================================
-- MONO — Admin user setup
-- Run in the Supabase SQL Editor (requires superuser / postgres role).
-- Safe to re-run: idempotent.
--
-- ⚠  Change the email and password before running.
-- ============================================================

create extension if not exists pgcrypto;

do $$
declare
  admin_email    text := 'chrod.dev@gmail.com';  -- ← change this
  admin_password text := 'Admin1234!';            -- ← change this
  admin_id       uuid;
begin

  -- ── 1. Check if the user already exists ───────────────────
  select id into admin_id
  from auth.users
  where email = admin_email;

  -- ── 2. Create or update the auth user ─────────────────────
  if admin_id is null then
    admin_id := gen_random_uuid();

    insert into auth.users (
      instance_id, id, aud, role, email,
      encrypted_password, email_confirmed_at,
      invited_at, confirmation_token, confirmation_sent_at,
      recovery_token, recovery_sent_at,
      email_change_token_new, email_change, email_change_sent_at,
      last_sign_in_at, raw_app_meta_data, raw_user_meta_data,
      is_super_admin, created_at, updated_at,
      phone, phone_confirmed_at, phone_change, phone_change_token,
      phone_change_sent_at, email_change_token_current,
      email_change_confirm_status, banned_until,
      reauthentication_token, reauthentication_sent_at,
      is_sso_user, deleted_at
    ) values (
      '00000000-0000-0000-0000-000000000000',
      admin_id, 'authenticated', 'authenticated', admin_email,
      crypt(admin_password, gen_salt('bf')), now(),
      null, '', null,
      '', null,
      '', '', null,
      null,
      '{"provider":"email","providers":["email"]}',
      '{"full_name":"MONO Admin"}',
      false, now(), now(),
      null, null, '', '',
      null, '',
      0, null,
      '', null,
      false, null
    );

    raise notice 'Admin user created: %', admin_email;
  else
    update auth.users set
      encrypted_password = crypt(admin_password, gen_salt('bf')),
      email_confirmed_at = coalesce(email_confirmed_at, now()),
      updated_at         = now()
    where id = admin_id;

    raise notice 'User existed — password updated for: %', admin_email;
  end if;

  -- ── 3. Ensure identity record exists (required by GoTrue) ──
  -- Without this row, signInWithPassword returns 500.
  insert into auth.identities (
    id,
    provider_id,
    user_id,
    identity_data,
    provider,
    last_sign_in_at,
    created_at,
    updated_at
  )
  values (
    gen_random_uuid(),
    admin_id::text,
    admin_id,
    jsonb_build_object(
      'sub',            admin_id::text,
      'email',          admin_email,
      'email_verified', true,
      'provider_id',    admin_id::text
    ),
    'email',
    now(), now(), now()
  )
  on conflict (provider_id, provider) do nothing;

  -- ── 4. Promote profile to admin ────────────────────────────
  update public.profiles set role = 'admin' where id = admin_id;

  raise notice 'Done — % is now admin', admin_email;
end;
$$;

-- ── Verify ────────────────────────────────────────────────────
select
  u.email,
  p.role,
  u.email_confirmed_at is not null  as email_confirmed,
  u.encrypted_password is not null  as has_password,
  exists(
    select 1 from auth.identities i
    where i.user_id = u.id and i.provider = 'email'
  )                                  as has_identity
from auth.users u
join public.profiles p on p.id = u.id
where u.email = 'chrod.dev@gmail.com';
