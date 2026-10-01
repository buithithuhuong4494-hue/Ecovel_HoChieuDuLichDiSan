create table if not exists public.locations (
    id bigint generated always as identity primary key,

    name text not null,
    slug text not null unique,

    description text,
    address text,

    latitude double precision not null,
    longitude double precision not null,

    checkin_radius integer not null default 100
        check (checkin_radius > 0),

    image_url text,

    is_active boolean not null default true,

    created_at timestamptz not null default now()
);

create policy "Locations are public"
on public.locations
for select
to anon, authenticated
using (true);

insert into public.locations
(
    name,
    slug,
    description,
    address,
    latitude,
    longitude,
    checkin_radius,
    image_url
)
values
(
    'Nhà thờ Đức Bà',
    'nha-tho-duc-ba',
    'Nhà thờ Đức Bà là công trình kiến trúc nổi bật tại trung tâm TP.HCM.',
    'Quận 1, TP.HCM',
    10.7798,
    106.6990,
    100,
    '/images/Nha_tho_Duc_Ba.jpg'
),
(
    'Chợ Bến Thành',
    'cho-ben-thanh',
    'Chợ Bến Thành là biểu tượng văn hóa và thương mại lâu đời của Sài Gòn.',
    'Quận 1, TP.HCM',
    10.7721,
    106.6983,
    100,
    '/images/Cho_Ben_Thanh.jpg'
),
(
    'Dinh Độc Lập',
    'dinh-doc-lap',
    'Dinh Độc Lập là di tích lịch sử quốc gia đặc biệt của Việt Nam.',
    'Quận 1, TP.HCM',
    10.7770,
    106.6954,
    100,
    '/images/Dinh_Doc_Lap.jpg'
);