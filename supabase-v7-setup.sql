-- V7 additive setup for an existing V6 Supabase project. Run in SQL Editor.
-- Safe to re-run. Does not create an admin role or expose CRM lead reads to browsers.
create or replace function public.tp_handle_new_user()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id, full_name, company)
  values (new.id, new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'company')
  on conflict (id) do update set
    full_name = coalesce(excluded.full_name, public.profiles.full_name),
    company = coalesce(excluded.company, public.profiles.company);
  return new;
end;
$$;
drop trigger if exists tp_on_auth_user_created on auth.users;
create trigger tp_on_auth_user_created after insert on auth.users
for each row execute procedure public.tp_handle_new_user();

-- Ensure the client can see only its own projects. Keep RLS enabled.
alter table public.profiles enable row level security;
alter table public.projects enable row level security;
alter table public.documents enable row level security;
drop policy if exists "client reads own profile" on public.profiles;
create policy "client reads own profile" on public.profiles for select to authenticated using (id = (select auth.uid()));
drop policy if exists "client updates own profile" on public.profiles;
create policy "client updates own profile" on public.profiles for update to authenticated using (id = (select auth.uid())) with check (id = (select auth.uid()));
drop policy if exists "client reads own projects" on public.projects;
create policy "client reads own projects" on public.projects for select to authenticated using (client_id = (select auth.uid()));
drop policy if exists "client reads project documents" on public.documents;
create policy "client reads project documents" on public.documents for select to authenticated using (exists (select 1 from public.projects p where p.id = project_id and p.client_id = (select auth.uid())));

-- Important: assign projects from a trusted admin/server workflow only. Do not add public INSERT/UPDATE policies.
-- Leads remain insert-only for visitors; never expose a service_role key in browser code.
