-- PLACEHOLDER Library content. Deliberately NOT a migration, so it never runs
-- against production by accident.
--
-- To publish the real shelf: replace external_url with the approved YouTube
-- link and thumbnail_url with https://img.youtube.com/vi/<video-id>/hqdefault.jpg,
-- then insert. Nothing in the UI has to change — the page renders whatever
-- published rows exist, grouped by category and ordered by sort_order.
--
-- Clear the placeholders first:
--   delete from public.library_items where external_url like 'https://example.com/%';

-- Placeholder shelf. Every row is stand-in copy with an example.com URL so it
-- is obvious what is real and what is not; replace external_url and
-- thumbnail_url with approved YouTube links and nothing else has to change.
insert into public.library_items
  (title, description, external_url, category, language, duration_minutes, content_type, sort_order)
values
  ('Starting your day gently', 'A short routine to wake up your body before you get out of bed.', 'https://example.com/placeholder/morning-1', 'morning_routine', 'en', 6, 'video', 1),
  ('सुबह की शुरुआत', 'बिस्तर से उठने से पहले शरीर को धीरे-धीरे जगाने का आसान तरीका।', 'https://example.com/placeholder/morning-2', 'morning_routine', 'hi', 8, 'video', 2),
  ('Drinking enough water', 'Why it matters and a simple way to keep track through the day.', 'https://example.com/placeholder/morning-3', 'morning_routine', 'en', 4, 'video', 3),

  ('Chair exercises you can do at home', 'Gentle movements for your arms and legs, sitting down.', 'https://example.com/placeholder/move-1', 'movement', 'en', 10, 'video', 1),
  ('कुर्सी पर बैठकर व्यायाम', 'घर पर बैठे-बैठे हाथ और पैर की आसान कसरत।', 'https://example.com/placeholder/move-2', 'movement', 'hi', 12, 'video', 2),
  ('A steady walk, step by step', 'How to build up a daily walk without tiring yourself.', 'https://example.com/placeholder/move-3', 'movement', 'en', 7, 'video', 3),

  ('Breathing to settle yourself', 'Five slow breaths you can take any time you feel uneasy.', 'https://example.com/placeholder/mind-1', 'mind', 'en', 5, 'video', 1),
  ('प्राणायाम: शांत साँसें', 'मन को शांत करने के लिए धीमी साँस लेने का अभ्यास।', 'https://example.com/placeholder/mind-2', 'mind', 'hi', 9, 'video', 2),
  ('Sleeping better at night', 'Small changes to your evening that help you rest.', 'https://example.com/placeholder/mind-3', 'mind', 'en', 6, 'video', 3),

  ('Understanding your blood pressure', 'What the two numbers mean, in plain words.', 'https://example.com/placeholder/edu-1', 'health_education', 'en', 8, 'video', 1),
  ('शुगर को समझें', 'ब्लड शुगर क्या है और इसे कैसे देखें, आसान भाषा में।', 'https://example.com/placeholder/edu-2', 'health_education', 'hi', 10, 'video', 2),
  ('Taking your medicines safely', 'How to keep track and what to ask your doctor.', 'https://example.com/placeholder/edu-3', 'health_education', 'en', 7, 'video', 3),

  ('Everyday meals that are kind to you', 'Simple changes to food you already cook at home.', 'https://example.com/placeholder/food-1', 'food', 'en', 9, 'video', 1),
  ('रोज़ का खाना, थोड़ा बेहतर', 'घर के बने खाने में छोटे-छोटे बदलाव।', 'https://example.com/placeholder/food-2', 'food', 'hi', 11, 'video', 2)
on conflict do nothing;
