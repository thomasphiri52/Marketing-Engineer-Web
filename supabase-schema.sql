-- Run in Supabase SQL Editor. This schema allows public lead INSERT only.
-- It deliberately does NOT grant public SELECT/UPDATE/DELETE on leads.
create extension if not exists pgcrypto;
create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 120),
  company text not null check (char_length(company) between 1 and 180),
  email text not null check (char_length(email) between 3 and 254),
  industry text,
  need text,
  challenge text,
  status text not null default 'New' check (status in ('New','Contacted','Qualified','Proposal','Won','Lost')),
  created_at timestamptz not null default now()
);
alter table public.leads enable row level security;
drop policy if exists "public can submit lead" on public.leads;
create policy "public can submit lead" on public.leads for insert to anon, authenticated
with check (char_length(name) between 1 and 120 and char_length(company) between 1 and 180 and char_length(email) between 3 and 254);
-- No public lead read/update/delete policy. Use a protected admin API/Edge Function for CRM access.
