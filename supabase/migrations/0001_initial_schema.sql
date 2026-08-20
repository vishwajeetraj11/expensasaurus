-- Expensasaurus Supabase foundation.
-- Apply this migration before replacing the Appwrite client layer.

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  legacy_appwrite_user_id text unique,
  display_name text,
  currency text not null default 'INR',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.expenses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  description text not null default '',
  amount numeric(14, 2) not null check (amount >= 0),
  category text not null,
  tag text not null default '',
  currency text not null default 'INR',
  date timestamptz not null,
  attachments text[] not null default '{}',
  legacy_appwrite_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.incomes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  description text not null default '',
  amount numeric(14, 2) not null check (amount >= 0),
  category text not null,
  tag text not null default '',
  currency text not null default 'INR',
  date timestamptz not null,
  attachments text[] not null default '{}',
  legacy_appwrite_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.budgets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  description text not null default '',
  amount numeric(14, 2) not null check (amount >= 0),
  currency text not null default 'INR',
  starting_date timestamptz not null,
  end_date timestamptz not null,
  food numeric(14, 2),
  transportation numeric(14, 2),
  travel numeric(14, 2),
  housing numeric(14, 2),
  healthcare numeric(14, 2),
  education numeric(14, 2),
  personal numeric(14, 2),
  insurance numeric(14, 2),
  savings numeric(14, 2),
  investments numeric(14, 2),
  business numeric(14, 2),
  utilities numeric(14, 2),
  other numeric(14, 2),
  entertainment numeric(14, 2),
  legacy_appwrite_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (end_date >= starting_date)
);

create table if not exists public.attachments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  expense_id uuid references public.expenses(id) on delete cascade,
  income_id uuid references public.incomes(id) on delete cascade,
  legacy_appwrite_file_id text unique,
  storage_path text not null unique,
  original_name text not null,
  content_type text,
  file_size bigint,
  position smallint not null default 0 check (position between 0 and 4),
  created_at timestamptz not null default now(),
  check ((expense_id is not null) or (income_id is not null))
);

create index if not exists expenses_user_date_idx on public.expenses (user_id, date desc);
create index if not exists incomes_user_date_idx on public.incomes (user_id, date desc);
create index if not exists budgets_user_dates_idx on public.budgets (user_id, starting_date, end_date);
create index if not exists attachments_user_idx on public.attachments (user_id);

alter table public.profiles enable row level security;
alter table public.expenses enable row level security;
alter table public.incomes enable row level security;
alter table public.budgets enable row level security;
alter table public.attachments enable row level security;

create policy "Users manage their own profile"
  on public.profiles for all to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

create policy "Users manage their own expenses"
  on public.expenses for all to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "Users manage their own incomes"
  on public.incomes for all to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "Users manage their own budgets"
  on public.budgets for all to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "Users manage their own attachments"
  on public.attachments for all to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id)
  values (new.id)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
