-- Notifications and feedback. Run once in the Supabase SQL Editor.
create table if not exists notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  request_id uuid references requests(id) on delete cascade,
  title text not null,
  body text not null,
  kind text not null default 'info' check (kind in ('info','success')),
  href text,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists notifications_user_idx on notifications (user_id, created_at desc);
alter table notifications enable row level security;

create table if not exists feedback (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null unique references requests(id) on delete cascade,
  user_id uuid not null references users(id) on delete cascade,
  center_id uuid not null references centers(id) on delete cascade,
  rating int not null check (rating between 1 and 5),
  comment text not null,
  created_at timestamptz not null default now()
);
create index if not exists feedback_center_idx on feedback (center_id);
create index if not exists feedback_user_idx on feedback (user_id);
alter table feedback enable row level security;
