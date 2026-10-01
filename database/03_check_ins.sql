create table public.check_ins (
    id bigint generated always as identity primary key,

    user_id uuid not null
        references public.profiles(id)
        on delete cascade,

    location_id bigint not null
        references public.locations(id)
        on delete cascade,

    latitude double precision,
    longitude double precision,

    distance_meters double precision,

    method text not null default 'gps'
        check (method in ('gps', 'qr')),

    status text not null default 'verified'
        check (status in ('pending', 'verified', 'rejected')),

    checked_in_at timestamptz not null default now(),

    unique (user_id, location_id)
);

create policy "Users can view own checkins"
on public.check_ins
for select
to authenticated
using (
    auth.uid() = user_id
);

create policy "Users can create own checkins"
on public.check_ins
for insert
to authenticated
with check (
    auth.uid() = user_id
);