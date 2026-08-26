-- db/seed_states.sql — Nigerian States (NYSC deployment states)
-- Run once after schema.sql

INSERT INTO states (name, code) VALUES
  ('Abia', 'AB'),
  ('Adamawa', 'AD'),
  ('Akwa Ibom', 'AK'),
  ('Anambra', 'AN'),
  ('Bauchi', 'BA'),
  ('Bayelsa', 'BY'),
  ('Benue', 'BE'),
  ('Borno', 'BO'),
  ('Cross River', 'CR'),
  ('Delta', 'DE'),
  ('Ebonyi', 'EB'),
  ('Edo', 'ED'),
  ('Ekiti', 'EK'),
  ('Enugu', 'EN'),
  ('FCT Abuja', 'FC'),
  ('Gombe', 'GO'),
  ('Imo', 'IM'),
  ('Jigawa', 'JI'),
  ('Kaduna', 'KD'),
  ('Kano', 'KN'),
  ('Katsina', 'KT'),
  ('Kebbi', 'KB'),
  ('Kogi', 'KG'),
  ('Kwara', 'KW'),
  ('Lagos', 'LA'),
  ('Nasarawa', 'NA'),
  ('Niger', 'NI'),
  ('Ogun', 'OG'),
  ('Ondo', 'ON'),
  ('Osun', 'OS'),
  ('Oyo', 'OY'),
  ('Plateau', 'PL'),
  ('Rivers', 'RI'),
  ('Sokoto', 'SO'),
  ('Taraba', 'TA'),
  ('Yobe', 'YO'),
  ('Zamfara', 'ZA')
ON CONFLICT (code) DO NOTHING;

-- Seed a sample batch (2025 Batch A Stream 1)
INSERT INTO batches (year, batch, stream, starts_at) VALUES
  (2025, 'A', 1, '2025-01-15'),
  (2025, 'A', 2, '2025-02-12'),
  (2025, 'B', 1, '2025-05-20'),
  (2025, 'B', 2, '2025-06-17'),
  (2025, 'C', 1, '2025-09-09'),
  (2025, 'C', 2, '2025-10-07')
ON CONFLICT (year, batch, stream) DO NOTHING;

-- Seed skill categories
INSERT INTO skills (name, category) VALUES
  ('Web Development', 'Technology'),
  ('Mobile Development', 'Technology'),
  ('Data Analysis', 'Technology'),
  ('Graphic Design', 'Creative'),
  ('Content Writing', 'Creative'),
  ('Photography', 'Creative'),
  ('Videography', 'Creative'),
  ('Teaching', 'Education'),
  ('Medical/Health', 'Health'),
  ('Agriculture', 'Agriculture'),
  ('Accounting', 'Finance'),
  ('Marketing', 'Business'),
  ('Project Management', 'Business'),
  ('Legal', 'Law'),
  ('Engineering', 'Engineering'),
  ('Architecture', 'Engineering'),
  ('Music', 'Arts'),
  ('Fashion Design', 'Creative'),
  ('Catering', 'Hospitality'),
  ('Sports Coaching', 'Sports')
ON CONFLICT (name) DO NOTHING;
