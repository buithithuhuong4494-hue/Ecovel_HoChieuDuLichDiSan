create table if not exists public.profiles (
    id uuid primary key references auth.users(id) on delete cascade,

    full_name text,
    avatar_url text,
    phone text,

    total_points integer not null default 0
        check (total_points >= 0),

    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
    insert into public.profiles (
        id,
        full_name
    )
    values (
        new.id,
        new.raw_user_meta_data ->> 'full_name'
    );

    return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
after insert on auth.users
for each row
execute procedure public.handle_new_user();

alter table public.profiles enable row level security;

create policy "Users can view own profile"
on public.profiles
for select
to authenticated
using (
    auth.uid() = id
);

create policy "Users can update own profile"
on public.profiles
for update
to authenticated
using (
    auth.uid() = id
)
with check (
    auth.uid() = id
);