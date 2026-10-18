-- E-Waste Connect schema. Run in the Supabase SQL Editor.
create extension if not exists postgis with schema extensions;
set search_path to public, extensions;

create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null unique,
  password_hash text not null,
  role text not null check (role in ('user','center_admin','system_admin')),
  created_at timestamptz not null default now()
);

create table if not exists centers (
  id uuid primary key default gen_random_uuid(),
  admin_id uuid not null references users(id) on delete cascade,
  name text not null,
  address text not null,
  pincode text,
  phone text,
  lat double precision not null,
  lng double precision not null,
  location geography(Point,4326) not null,
  pickup_available boolean not null default false,
  dropoff_available boolean not null default true,
  is_verified boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists centers_location_idx on centers using gist (location);
create index if not exists centers_admin_idx on centers (admin_id);

create table if not exists waste_categories (
  id serial primary key,
  name text not null unique
);

create table if not exists center_categories (
  center_id uuid not null references centers(id) on delete cascade,
  category_id int not null references waste_categories(id) on delete cascade,
  primary key (center_id, category_id)
);

create table if not exists requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  center_id uuid not null references centers(id) on delete cascade,
  category_id int not null references waste_categories(id),
  description text,
  quantity int not null default 1 check (quantity > 0),
  mode text not null check (mode in ('pickup','dropoff')),
  pickup_address text,
  status text not null default 'requested'
    check (status in ('requested','accepted','processing','completed','rejected')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists requests_user_idx on requests (user_id);
create index if not exists requests_center_idx on requests (center_id);

insert into waste_categories (name) values
  ('Mobile phones'), ('Laptops and computers'), ('Batteries'),
  ('Chargers and cables'), ('Electronic components'), ('Other electronic devices')
on conflict (name) do nothing;

create or replace function nearby_centers(
  p_lat double precision,
  p_lng double precision,
  p_radius_km double precision default 10,
  p_category int default null
)
returns table (
  id uuid, name text, address text, pincode text, phone text,
  pickup_available boolean, dropoff_available boolean,
  lat double precision, lng double precision,
  distance_km double precision, categories text[]
)
language sql stable
set search_path = public, extensions
as $$
  select c.id, c.name, c.address, c.pincode, c.phone,
         c.pickup_available, c.dropoff_available, c.lat, c.lng,
         round((ST_Distance(c.location, ST_SetSRID(ST_MakePoint(p_lng, p_lat), 4326)::geography) / 1000.0)::numeric, 2)::double precision,
         array(select wc.name from center_categories cc
               join waste_categories wc on wc.id = cc.category_id
               where cc.center_id = c.id order by wc.name)
  from centers c
  where c.is_verified
    and ST_DWithin(c.location, ST_SetSRID(ST_MakePoint(p_lng, p_lat), 4326)::geography, p_radius_km * 1000)
    and (p_category is null or exists (
          select 1 from center_categories cc
          where cc.center_id = c.id and cc.category_id = p_category))
  order by 10;
$$;

-- The backend uses the service key. Enabling RLS (no policies) blocks direct public access.
alter table users enable row level security;
alter table centers enable row level security;
alter table waste_categories enable row level security;
alter table center_categories enable row level security;
alter table requests enable row level security;
