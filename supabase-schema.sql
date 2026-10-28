-- V6 Supabase schema. Run in Supabase SQL Editor.
create extension if not exists pgcrypto;
create table if not exists public.leads (
 id uuid primary key default gen_random_uuid(),
 name text not null, company text not null, email text not null,
 industry text, need text, challenge text,
 status text not null default 'New' check (status in ('New','Contacted','Qualified','Proposal','Won','Lost')),
 created_at timestamptz not null default now()
);
create table if not exists public.profiles (
 id uuid primary key references auth.users(id) on delete cascade,
 full_name text, company text, created_at timestamptz not null default now()
);
create table if not exists public.projects (
 id uuid primary key default gen_random_uuid(),
 client_id uuid references auth.users(id) on delete cascade,
 name text not null, status text not null default 'Active',
 progress integer not null default 0 check (progress between 0 and 100),
 created_at timestamptz not null default now()
);
create table if not exists public.documents (
 id uuid primary key default gen_random_uuid(),
 project_id uuid references public.projects(id) on delete cascade,
 name text not null, storage_path text, created_at timestamptz not null default now()
);
alter table public.leads enable row level security;
alter table public.profiles enable row level security;
alter table public.projects enable row level security;
alter table public.documents enable row level security;
-- Public visitors may submit leads, but cannot read, update, or delete them.
drop policy if exists "public can submit lead" on public.leads;
create policy "public can submit lead" on public.leads for insert to anon, authenticated
 with check (char_length(name) between 1 and 120 and char_length(company) between 1 and 180 and char_length(email) between 3 and 254);
-- Clients may read/update only their own profile and read only their projects.
drop policy if exists "client reads own profile" on public.profiles;
create policy "client reads own profile" on public.profiles for select to authenticated using (id = auth.uid());
drop policy if exists "client updates own profile" on public.profiles;
create policy "client updates own profile" on public.profiles for update to authenticated using (id = auth.uid()) with check (id = auth.uid());
drop policy if exists "client reads own projects" on public.projects;
create policy "client reads own projects" on public.projects for select to authenticated using (client_id = auth.uid());
drop policy if exists "client reads project documents" on public.documents;
create policy "client reads project documents" on public.documents for select to authenticated using (exists (select 1 from public.projects p where p.id = project_id and p.client_id = auth.uid()));
-- Keep CRM reads/admin updates server-side until an authenticated admin role is implemented.
