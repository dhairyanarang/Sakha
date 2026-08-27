-- Library: curated things she can watch or read to live a little better.
--
-- Not health documents — those stay under Health and belong to her. This is a
-- small, hand-picked shelf that is the SAME for everyone, so there is no
-- account_id here and nothing personal in the table.
--
-- Deliberately not built: recommendations, search, fetching from YouTube,
-- likes, ratings, or anything that would need a CMS. Rows are added by hand
-- with approved links, which is the whole point of the shape below.
create type public.library_category as enum (
  'morning_routine',
  'movement',
  'mind',
  'health_education',
  'food'
);

create table if not exists public.library_items (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  -- YouTube's own thumbnail, when we have one:
  -- https://img.youtube.com/vi/<id>/hqdefault.jpg
  thumbnail_url text,
  external_url text not null,
  category public.library_category not null,
  language text not null default 'en',
  duration_minutes integer,
  content_type text not null default 'video',
  published boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  constraint library_items_language_check check (language in ('en', 'hi')),
  constraint library_items_duration_check
    check (duration_minutes is null or duration_minutes > 0)
);

create index if not exists library_items_browse_idx
  on public.library_items (category, sort_order)
  where published;

alter table public.library_items enable row level security;

-- Everyone signed in reads what is published; nothing writes from the app.
-- Content is curated by us, so there is deliberately no insert, update or
-- delete policy — adding a row is an administrative act, not a user action.
drop policy if exists library_items_select on public.library_items;
create policy library_items_select on public.library_items
  for select to authenticated
  using (published);
