-- Weekly poll / burn battle migration
-- Run this against an existing PouchBase database.

begin;

create table if not exists polls (
  id uuid default uuid_generate_v4() primary key,
  slug text not null unique,
  question text not null,
  status text not null default 'draft' check (status in ('draft', 'active', 'archived')),
  category text not null default 'burn' check (category in ('burn', 'flavor', 'value', 'packaging')),
  week_label text,
  starts_at timestamptz default now(),
  ends_at timestamptz,
  cta_label text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create unique index if not exists idx_polls_one_active on polls(status) where status = 'active';

create table if not exists poll_options (
  id uuid default uuid_generate_v4() primary key,
  poll_id uuid references polls(id) on delete cascade not null,
  product_id uuid references products(id) on delete set null,
  label text,
  sort_order integer not null check (sort_order in (1, 2)),
  vote_count integer not null default 0 check (vote_count >= 0),
  created_at timestamptz default now(),
  check (label is not null or product_id is not null),
  unique(id, poll_id),
  unique(poll_id, sort_order)
);

create table if not exists poll_votes (
  id uuid default uuid_generate_v4() primary key,
  poll_id uuid references polls(id) on delete cascade not null,
  poll_option_id uuid not null,
  user_id uuid references profiles(id) on delete cascade,
  voter_key text,
  created_at timestamptz default now(),
  check (
    (user_id is not null and voter_key is null) or
    (user_id is null and voter_key is not null)
  ),
  foreign key (poll_option_id, poll_id) references poll_options(id, poll_id) on delete cascade
);

create index if not exists idx_poll_options_poll on poll_options(poll_id);
create index if not exists idx_poll_votes_poll on poll_votes(poll_id);
create index if not exists idx_poll_votes_option on poll_votes(poll_option_id);
create unique index if not exists idx_poll_votes_unique_user on poll_votes(poll_id, user_id) where user_id is not null;
create unique index if not exists idx_poll_votes_unique_voter on poll_votes(poll_id, voter_key) where voter_key is not null;

create or replace function update_poll_option_vote_counts()
returns trigger as $$
declare
  old_poll_id uuid;
  new_poll_id uuid;
begin
  old_poll_id := case when tg_op <> 'INSERT' then old.poll_id else null end;
  new_poll_id := case when tg_op <> 'DELETE' then new.poll_id else null end;

  if tg_op <> 'INSERT' then
    update poll_options
    set vote_count = (
      select count(*)
      from poll_votes
      where poll_option_id = old.poll_option_id
    )
    where id = old.poll_option_id;
  end if;

  if tg_op <> 'DELETE' then
    update poll_options
    set vote_count = (
      select count(*)
      from poll_votes
      where poll_option_id = new.poll_option_id
    )
    where id = new.poll_option_id;
  end if;

  update polls
  set updated_at = now()
  where id in (
    coalesce(new_poll_id, '00000000-0000-0000-0000-000000000000'::uuid),
    coalesce(old_poll_id, '00000000-0000-0000-0000-000000000000'::uuid)
  );

  return coalesce(new, old);
end;
$$ language plpgsql;

drop trigger if exists on_poll_vote_change on poll_votes;
create trigger on_poll_vote_change
  after insert or update or delete on poll_votes
  for each row execute function update_poll_option_vote_counts();

alter table polls enable row level security;
alter table poll_options enable row level security;
alter table poll_votes enable row level security;

drop policy if exists "Polls are viewable by everyone" on polls;
create policy "Polls are viewable by everyone" on polls for select using (true);

drop policy if exists "Poll options are viewable by everyone" on poll_options;
create policy "Poll options are viewable by everyone" on poll_options for select using (true);

drop policy if exists "Users can read own poll votes" on poll_votes;
create policy "Users can read own poll votes" on poll_votes for select using (auth.uid() = user_id);

drop policy if exists "Authenticated users can create poll votes" on poll_votes;
create policy "Authenticated users can create poll votes" on poll_votes for insert with check (
  auth.uid() = user_id and voter_key is null
);

drop policy if exists "Anonymous users can create browser-bound poll votes" on poll_votes;
create policy "Anonymous users can create browser-bound poll votes" on poll_votes for insert with check (
  auth.uid() is null and user_id is null and voter_key is not null
);

commit;
