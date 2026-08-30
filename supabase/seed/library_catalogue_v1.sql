-- Sakha Library — the V1 catalogue, as DRAFTS.
--
-- Every row here is published = false. Nothing in this file appears in the app
-- until somebody reads it and says so. To publish an approved item:
--
--   update public.library_items set published = true where youtube_id = '...';
--
-- To publish an approved category in one go:
--
--   update public.library_items set published = true
--    where category = 'pranayama_breathing' and curation_note is not null;
--
-- Re-running this file is safe: it clears its own rows by youtube_id first, so
-- the placeholder rows that predate it are left alone.
--
-- ---------------------------------------------------------------------------
-- How these were chosen
--
-- Every id below was verified against YouTube's oEmbed endpoint, which returns
-- the real title and channel for a public video and an error for anything
-- deleted, private or invented. The title and source columns are what YouTube
-- itself reported, not what a search result claimed.
--
-- Excluded on safety grounds, not for lack of popularity: anything framing a
-- food, herb or practice as curing or replacing treatment. That ruled out most
-- of the Hindi senior-health material on YouTube, which is dominated by
-- "banish every disease" and "doctors will never tell you" framing. It is the
-- reason this catalogue is lighter on Hindi than it should be, and the honest
-- fix is better sources rather than lower standards.
-- ---------------------------------------------------------------------------

delete from public.library_items where youtube_id in (
  'eFDTdHYz7dE','zEKgKSidlz4','8ch8_AX-7ZU','KTvIGZSD_9s',
  'Nhw92icsQ1A','eo9zBovLsfI','pOR5NDrlkKM','hcbm8czsHX4','gJoI5jbBiUk',
  'DulNz2CkoHI','ZgPHetPG4MY','HMOfD3VSbQ4',
  'q3faZkO4gbc','PopG90qze2g','UDtDkeMpYIE','zEfbLtJErJc','BNC4bi3Ucac',
  'iylk12bmlpY','7JKinbYMBFQ','J50kCQBeJxI',
  '9jXq6ANXL1g','goqOvjutvc8','BzpaQ0F49JE','EQeGGkGcfFM',
  'loaytMWKuIU','Neul7f-oJYY','dfAkIR5divI',
  'Z4CQIZZsJjE','gzelGJDyfpU','MnSpk0Np2ug'
);

insert into public.library_items
  (title, description, youtube_id, external_url, thumbnail_url, category,
   language, content_type, duration_seconds, source, sort_order, published,
   content_note, curation_note)
values

-- =========================================================================
-- Yoga & Gentle Movement
-- =========================================================================
('Common Yoga Protocol',
 'The government''s own guided yoga sequence, taken slowly from start to finish.',
 'eFDTdHYz7dE', 'https://www.youtube.com/watch?v=eFDTdHYz7dE',
 'https://img.youtube.com/vi/eFDTdHYz7dE/hqdefault.jpg',
 'yoga_movement', 'en', 'video', null, 'Ministry of Ayush', 10, false, null,
 'Official Ministry of Ayush channel. The most authoritative general yoga sequence available in India and designed for the general public rather than practitioners.'),

('सामान्य योग अभ्यासक्रम — पूरा अभ्यास',
 'पूरा योग अभ्यास, हिंदी में, शुरू से अंत तक धीरे-धीरे।',
 'zEKgKSidlz4', 'https://www.youtube.com/watch?v=zEKgKSidlz4',
 'https://img.youtube.com/vi/zEKgKSidlz4/hqdefault.jpg',
 'yoga_movement', 'hi', 'video', null,
 'Morarji Desai National Institute of Yoga', 20, false, null,
 'The national yoga institute under the Ministry of Ayush. Same protocol as the English version, so the Hindi speaker gets the authoritative sequence rather than a lesser substitute.'),

('Common Yoga Protocol — full 36 minutes',
 'The complete sequence with each posture named and demonstrated.',
 '8ch8_AX-7ZU', 'https://www.youtube.com/watch?v=8ch8_AX-7ZU',
 'https://img.youtube.com/vi/8ch8_AX-7ZU/hqdefault.jpg',
 'yoga_movement', 'en', 'video', 2160,
 'Morarji Desai National Institute of Yoga', 30, false, null,
 'Produced by the national yoga institute. Unhurried pacing and clear naming of each posture, which suits someone learning rather than following along at speed.'),

('Five minutes of yoga',
 'A short sequence for a day when there is not much time.',
 'KTvIGZSD_9s', 'https://www.youtube.com/watch?v=KTvIGZSD_9s',
 'https://img.youtube.com/vi/KTvIGZSD_9s/hqdefault.jpg',
 'yoga_movement', 'en', 'video', 300, 'MyGov India', 40, false, null,
 'Government of India channel. Included because a five-minute option is what actually gets done on a bad day, and the shelf needs one.'),

-- =========================================================================
-- Pranayama & Breathing
-- =========================================================================
('How to do Anuloma Viloma correctly',
 'Alternate nostril breathing, explained slowly and correctly.',
 'Nhw92icsQ1A', 'https://www.youtube.com/watch?v=Nhw92icsQ1A',
 'https://img.youtube.com/vi/Nhw92icsQ1A/hqdefault.jpg',
 'pranayama_breathing', 'en', 'video', null, 'The Yoga Institute', 10, false, null,
 'The Yoga Institute, Mumbai — founded 1918, among the oldest organised yoga centres in the world. Dr Hansaji teaches technique without health claims.'),

('Anulom Vilom, step by step',
 'A beginner''s walk-through of alternate nostril breathing.',
 'eo9zBovLsfI', 'https://www.youtube.com/watch?v=eo9zBovLsfI',
 'https://img.youtube.com/vi/eo9zBovLsfI/hqdefault.jpg',
 'pranayama_breathing', 'en', 'video', null, 'Siddhi Yoga International', 20, false, null,
 'A yoga teacher-training school. Chosen for its plain step-by-step framing and because it stays on technique rather than promising outcomes.'),

('अनुलोम विलोम प्राणायाम — पूरी जानकारी',
 'अनुलोम विलोम कैसे करें, शुरुआत से, हिंदी में।',
 'pOR5NDrlkKM', 'https://www.youtube.com/watch?v=pOR5NDrlkKM',
 'https://img.youtube.com/vi/pOR5NDrlkKM/hqdefault.jpg',
 'pranayama_breathing', 'hi', 'video', null, 'Yoga With Shaheeda', 30, false, null,
 'Clear Hindi instruction focused on how to sit and how to breathe. Selected over far more popular Hindi pranayama videos that pair the technique with disease-cure claims.'),

('अनुलोम विलोम — एक मिनट में',
 'शुरुआत करने वालों के लिए बहुत छोटी सीख।',
 'hcbm8czsHX4', 'https://www.youtube.com/shorts/hcbm8czsHX4',
 'https://img.youtube.com/vi/hcbm8czsHX4/hqdefault.jpg',
 'pranayama_breathing', 'hi', 'short', 60, 'Yoga Station', 40, false, null,
 'A Short, included so the catalogue exercises the vertical player. Very short Hindi refresher for someone who has already learnt the technique.'),

('Three breathing practices explained',
 'Kapalbhati, Anulom Vilom and Bhramari, one after the other.',
 'gJoI5jbBiUk', 'https://www.youtube.com/watch?v=gJoI5jbBiUk',
 'https://img.youtube.com/vi/gJoI5jbBiUk/hqdefault.jpg',
 'pranayama_breathing', 'en', 'video', null, 'Gen S Life', 50, false,
 'Kapalbhati is a vigorous practice. Skip it or go gently if you have high blood pressure, heart trouble, or have had recent surgery.',
 'Useful as an overview of the three practices in one place. Flagged with a caution because Kapalbhati is the one practice here that is not gentle by default.'),

-- =========================================================================
-- Meditation & Relaxation
-- =========================================================================
('A short meditation to begin with',
 'Ten quiet minutes, guided the whole way through.',
 'DulNz2CkoHI', 'https://www.youtube.com/watch?v=DulNz2CkoHI',
 'https://img.youtube.com/vi/DulNz2CkoHI/hqdefault.jpg',
 'meditation_relaxation', 'en', 'video', 600, 'Gurudev Sri Sri Ravi Shankar', 10, false, null,
 'Widely known Indian teacher; this particular video is a plain guided relaxation with no doctrine and no health claims attached.'),

('Ten minutes before sleep',
 'A calm voice to settle the mind at the end of the day.',
 'ZgPHetPG4MY', 'https://www.youtube.com/watch?v=ZgPHetPG4MY',
 'https://img.youtube.com/vi/ZgPHetPG4MY/hqdefault.jpg',
 'meditation_relaxation', 'en', 'video', 600, 'Great Meditation', 20, false, null,
 'Straightforward guided relaxation, unhurried pacing, no background music that would compete with the voice.'),

('A body scan for resting',
 'Attention moves slowly from head to feet until the body settles.',
 'HMOfD3VSbQ4', 'https://www.youtube.com/watch?v=HMOfD3VSbQ4',
 'https://img.youtube.com/vi/HMOfD3VSbQ4/hqdefault.jpg',
 'meditation_relaxation', 'en', 'video', 600, 'Great Meditation', 30, false, null,
 'Body scan is the easiest form of meditation to follow lying down, which matters for someone who finds sitting still uncomfortable.'),

-- =========================================================================
-- Walking & Mobility
-- =========================================================================
('Exercises to steady your balance',
 'A physical therapist shows simple ways to feel steadier on your feet.',
 'q3faZkO4gbc', 'https://www.youtube.com/watch?v=q3faZkO4gbc',
 'https://img.youtube.com/vi/q3faZkO4gbc/hqdefault.jpg',
 'walking_mobility', 'en', 'video', null, 'Johns Hopkins Medicine', 10, false, null,
 'A teaching hospital, presented by a named physical therapist. The most clinically trustworthy balance content found for this category.'),

('Ten minutes of balance practice',
 'A short routine you can hold a chair through.',
 'PopG90qze2g', 'https://www.youtube.com/watch?v=PopG90qze2g',
 'https://img.youtube.com/vi/PopG90qze2g/hqdefault.jpg',
 'walking_mobility', 'en', 'video', 600, 'Hospital for Special Surgery', 20, false, null,
 'HSS is a specialist orthopaedic hospital. Chair-supported throughout, which is the right default for someone worried about falling.'),

('Staying steady after sixty',
 'Gentle strength and balance work from a physiotherapist.',
 'UDtDkeMpYIE', 'https://www.youtube.com/watch?v=UDtDkeMpYIE',
 'https://img.youtube.com/vi/UDtDkeMpYIE/hqdefault.jpg',
 'walking_mobility', 'en', 'video', null, 'More Life Health Seniors', 30, false, null,
 'Run by a physiotherapist who works only with older adults. Pacing and language are pitched at exactly this audience.'),

('Walking practice to improve balance',
 'Slow, deliberate walking that helps with steadiness.',
 'zEfbLtJErJc', 'https://www.youtube.com/watch?v=zEfbLtJErJc',
 'https://img.youtube.com/vi/zEfbLtJErJc/hqdefault.jpg',
 'walking_mobility', 'en', 'video', null, 'Yes2Next', 40, false, null,
 'Tai chi style walking is low impact and needs no equipment or floor work. Included as the one item here that is about walking itself rather than exercises.'),

('Seven balance exercises',
 'Two physical therapists demonstrate one exercise at a time.',
 'BNC4bi3Ucac', 'https://www.youtube.com/watch?v=BNC4bi3Ucac',
 'https://img.youtube.com/vi/BNC4bi3Ucac/hqdefault.jpg',
 'walking_mobility', 'en', 'video', null, 'Bob & Brad', 50, false, null,
 'Two licensed physical therapists. Demonstrations are unhurried and each exercise is shown before it is explained.'),

-- =========================================================================
-- Morning & Daily Routine
-- =========================================================================
('Five minutes to start the day',
 'A short stretch to loosen up before anything else.',
 'iylk12bmlpY', 'https://www.youtube.com/watch?v=iylk12bmlpY',
 'https://img.youtube.com/vi/iylk12bmlpY/hqdefault.jpg',
 'morning_daily_routine', 'en', 'video', 300, 'More Life Health Seniors', 10, false, null,
 'Physiotherapist-led and genuinely five minutes. Short enough to become a habit, which is the point of a morning item.'),

('A gentle morning yoga routine',
 'Full-body stretching and joint movement, taken slowly.',
 '7JKinbYMBFQ', 'https://www.youtube.com/watch?v=7JKinbYMBFQ',
 'https://img.youtube.com/vi/7JKinbYMBFQ/hqdefault.jpg',
 'morning_daily_routine', 'en', 'video', null, 'Yoga & You', 20, false, null,
 'Explicitly built for older bodies and stays within a comfortable range of movement throughout.'),

('Stretches you can do in bed',
 'For mornings when getting up takes a moment.',
 'J50kCQBeJxI', 'https://www.youtube.com/watch?v=J50kCQBeJxI',
 'https://img.youtube.com/vi/J50kCQBeJxI/hqdefault.jpg',
 'morning_daily_routine', 'en', 'video', 900, 'Senior Fitness With Meredith', 30, false, null,
 'Everything is done lying down. The lowest-barrier item on the shelf, and the right one for a stiff or difficult morning.'),

-- =========================================================================
-- Healthy Ageing
-- =========================================================================
('Eating well as you get older',
 'A dietitian explains what changes about food with age.',
 '9jXq6ANXL1g', 'https://www.youtube.com/watch?v=9jXq6ANXL1g',
 'https://img.youtube.com/vi/9jXq6ANXL1g/hqdefault.jpg',
 'healthy_ageing', 'en', 'video', null, 'Didi de Zwarte — Registered Dietitian', 10, false, null,
 'A registered dietitian specialising in older adults. Describes how needs change rather than prescribing a diet.'),

('Nutrition for older adults',
 'Two dietitians talk through everyday eating after sixty.',
 'goqOvjutvc8', 'https://www.youtube.com/watch?v=goqOvjutvc8',
 'https://img.youtube.com/vi/goqOvjutvc8/hqdefault.jpg',
 'healthy_ageing', 'en', 'video', null, 'Hamilton Family Health Team', 20, false, null,
 'Presented by two registered dietitians through a family health organisation. Educational in tone, sells nothing.'),

('Why protein matters later in life',
 'What protein does for muscle as the years go on.',
 'BzpaQ0F49JE', 'https://www.youtube.com/watch?v=BzpaQ0F49JE',
 'https://img.youtube.com/vi/BzpaQ0F49JE/hqdefault.jpg',
 'healthy_ageing', 'en', 'video', null, 'Better Health While Aging', 30, false, null,
 'Run by a practising geriatrician. Explains the reasoning and is careful about what is and is not established.'),

('Three exercises for staying independent',
 'The movements that matter most for staying steady after 65.',
 'EQeGGkGcfFM', 'https://www.youtube.com/watch?v=EQeGGkGcfFM',
 'https://img.youtube.com/vi/EQeGGkGcfFM/hqdefault.jpg',
 'healthy_ageing', 'en', 'video', null, 'Will Harlow — Over-Fifties Specialist', 40, false, null,
 'A physiotherapist who works only with over-fifties. Narrow, practical and honest about what three exercises can and cannot do.'),

-- =========================================================================
-- Food & Everyday Wellness
-- =========================================================================
('Everyday Indian eating habits',
 'Small, practical habits around ordinary home food.',
 'loaytMWKuIU', 'https://www.youtube.com/watch?v=loaytMWKuIU',
 'https://img.youtube.com/vi/loaytMWKuIU/hqdefault.jpg',
 'food_wellness', 'en', 'video', null, 'Dietitian Shreya', 10, false, null,
 'A qualified dietitian working within an Indian diet rather than against it — no imported superfoods, no supplements.'),

('Eating rice well',
 'A nutritionist on how rice fits into a normal Indian meal.',
 'Neul7f-oJYY', 'https://www.youtube.com/watch?v=Neul7f-oJYY',
 'https://img.youtube.com/vi/Neul7f-oJYY/hqdefault.jpg',
 'food_wellness', 'en', 'video', null, 'Nutrition By Lovneet', 20, false, null,
 'Lovneet Batra is a well-established Delhi nutritionist. Chosen because rice is treated as normal food to balance, not something to fear.'),

('Making everyday food better',
 'Simple swaps in food you already eat.',
 'dfAkIR5divI', 'https://www.youtube.com/watch?v=dfAkIR5divI',
 'https://img.youtube.com/vi/dfAkIR5divI/hqdefault.jpg',
 'food_wellness', 'en', 'video', null, 'Nutrition By Lovneet', 30, false, null,
 'Same nutritionist. Practical and non-restrictive, which suits someone who is not going to change how the household cooks.'),

-- =========================================================================
-- Health Basics
-- =========================================================================
('हाई ब्लड प्रेशर क्या होता है?',
 'डॉक्टर आसान भाषा में समझाते हैं कि बीपी क्या है।',
 'Z4CQIZZsJjE', 'https://www.youtube.com/watch?v=Z4CQIZZsJjE',
 'https://img.youtube.com/vi/Z4CQIZZsJjE/hqdefault.jpg',
 'health_basics', 'hi', 'video', null, 'Apollo Hospitals Delhi', 10, false, null,
 'A major Indian hospital group explaining hypertension in Hindi. Explains the condition; does not promise to fix it.'),

('Understanding blood pressure',
 'A doctor explains what the numbers mean.',
 'gzelGJDyfpU', 'https://www.youtube.com/watch?v=gzelGJDyfpU',
 'https://img.youtube.com/vi/gzelGJDyfpU/hqdefault.jpg',
 'health_basics', 'en', 'video', null, 'Apollo Hospitals', 20, false, null,
 'Apollo Hospitals, presented by a named doctor. Pairs with the Hindi video so both languages get the same standard of source.'),

('Myths and facts about blood pressure',
 'Common beliefs about BP, and what is actually true.',
 'MnSpk0Np2ug', 'https://www.youtube.com/watch?v=MnSpk0Np2ug',
 'https://img.youtube.com/vi/MnSpk0Np2ug/hqdefault.jpg',
 'health_basics', 'en', 'video', null, 'Apollo Hospitals', 30, false, null,
 'Directly corrects the folk beliefs that circulate on WhatsApp, which is the most useful thing this category can do.');
