-- Library V1: the shelf gets its real categories, and enough about each item
-- to play it inside Sakha instead of handing her to YouTube.
--
-- The table's shape is deliberately almost unchanged. It is still one flat list
-- of hand-picked rows with no account_id, still read-only from the app, still
-- gated on `published`. What changes is what a row can say about itself.

-- ---------------------------------------------------------------------------
-- 1. The categories she actually browses by.
--
-- The first five were a guess made before there was any content. These eight
-- are the shelf as it is really being stocked, and they are the primary
-- navigation now — language moved out of the way, because "Hindi" is not a
-- reason to watch something and "Breathing" is.
--
-- Nothing is renamed and nothing is converted; see below for why.
-- ---------------------------------------------------------------------------
-- Added, not replaced.
--
-- The obvious move is to swap the old five values for these eight. It is also
-- the wrong one right now: fourteen placeholder rows are published and live,
-- and the deployed app groups the shelf by the old names. Convert the column
-- and the running app matches nothing and quietly shows "coming soon" — a
-- regression on the URL currently being used for testing, caused by a
-- migration that was supposed to be preparation.
--
-- So the type grows instead. Old values keep working for the app that is
-- deployed; new values are there for the app that isn't yet. The old five come
-- out in a later migration, once the new shelf is live and the placeholders
-- have been retired — which is a decision for whoever reviews this catalogue,
-- not something to do on their behalf here.
alter type public.library_category add value if not exists 'yoga_movement';
alter type public.library_category add value if not exists 'pranayama_breathing';
alter type public.library_category add value if not exists 'meditation_relaxation';
alter type public.library_category add value if not exists 'walking_mobility';
alter type public.library_category add value if not exists 'morning_daily_routine';
alter type public.library_category add value if not exists 'healthy_ageing';
alter type public.library_category add value if not exists 'food_wellness';
alter type public.library_category add value if not exists 'health_basics';

-- ---------------------------------------------------------------------------
-- 2. What a row needs to play in place.
--
-- youtube_id rather than parsing external_url at render time: the URL is what
-- a curator pastes and what she would share, the id is what the player needs,
-- and deriving one from the other in the client means every card carries a
-- little parser that can fail on a URL shape nobody anticipated.
--
-- duration_seconds because a Short is measured in seconds and the existing
-- duration_minutes cannot express forty of them. Minutes stays for the rows
-- that already use it; nothing is dropped.
-- ---------------------------------------------------------------------------
alter table public.library_items
  add column if not exists youtube_id text,
  add column if not exists duration_seconds integer,
  -- Who made it. Shown to her, because on a health shelf the answer to "says
  -- who?" belongs next to the thing being said.
  add column if not exists source text,
  -- Rare, optional, and hers to read: a plain caution or clarification where
  -- the video alone could be misread.
  add column if not exists content_note text,
  -- Never shown in the app. This is the curator's own record of why an item
  -- earned its place, so a later reviewer is reading a reason rather than
  -- guessing at one.
  add column if not exists curation_note text;

alter table public.library_items
  drop constraint if exists library_items_content_type_check;
alter table public.library_items
  add constraint library_items_content_type_check
  check (content_type in ('video', 'short'));

alter table public.library_items
  drop constraint if exists library_items_duration_seconds_check;
alter table public.library_items
  add constraint library_items_duration_seconds_check
  check (duration_seconds is null or duration_seconds > 0);

-- A YouTube id is 11 characters of URL-safe base64. Checking it here means a
-- typo in a seed file fails loudly at insert rather than quietly rendering an
-- empty player weeks later.
alter table public.library_items
  drop constraint if exists library_items_youtube_id_check;
alter table public.library_items
  add constraint library_items_youtube_id_check
  check (youtube_id is null or youtube_id ~ '^[A-Za-z0-9_-]{11}$');

comment on column public.library_items.youtube_id is
  'The 11-character video id, for the embedded player. external_url stays the human link.';
comment on column public.library_items.curation_note is
  'Why this item was chosen. Curator-facing only — never rendered in the app.';
