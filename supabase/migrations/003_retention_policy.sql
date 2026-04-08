-- ============================================================
-- SNAPORA — Retention Policy
-- Run this in: Supabase Dashboard → SQL Editor → Run
-- ============================================================

-- 1. Add ordered_at to book_projects (separate from orders table —
--    makes cleanup queries simpler without a join)
alter table book_projects
  add column if not exists ordered_at timestamptz;

-- 2. Add 'archived' as a valid status
alter table book_projects
  drop constraint if exists book_projects_status_check;

alter table book_projects
  add constraint book_projects_status_check
  check (status in ('draft', 'completed', 'ordered', 'archived'));

-- 3. Enable required extensions
create extension if not exists pg_cron;
create extension if not exists pg_net;

-- 4. Schedule the cleanup Edge Function to run daily at 02:00 UTC
--    Replace <PROJECT_REF> and <SERVICE_ROLE_KEY> with your actual values.
--    You can also configure this via the Supabase Dashboard → Edge Functions → Schedules.
select cron.schedule(
  'cleanup-stale-projects',
  '0 2 * * *',  -- daily at 02:00 UTC
  $$
  select net.http_post(
    url := 'https://<PROJECT_REF>.supabase.co/functions/v1/cleanup-stale-projects',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer <SERVICE_ROLE_KEY>'
    ),
    body := '{}'::jsonb
  )
  $$
);
