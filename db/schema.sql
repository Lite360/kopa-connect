-- ============================================================
-- KOPA CONNECT — COMPLETE DATABASE SCHEMA
-- Neon PostgreSQL (v15+)
-- ============================================================

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ============================================================
-- REFERENCE TABLES
-- ============================================================

CREATE TABLE IF NOT EXISTS states (
  id          SERIAL PRIMARY KEY,
  name        VARCHAR(100) NOT NULL UNIQUE,
  code        VARCHAR(10)  NOT NULL UNIQUE,  -- e.g. 'LA', 'OG'
  is_active   BOOLEAN DEFAULT TRUE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS batches (
  id          SERIAL PRIMARY KEY,
  year        INTEGER      NOT NULL,
  batch       CHAR(1)      NOT NULL,          -- A, B, C
  stream      INTEGER      NOT NULL DEFAULT 1, -- 1 or 2
  label       VARCHAR(20)  GENERATED ALWAYS AS (year::text || '/' || batch || '/' || stream::text) STORED,
  starts_at   DATE,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (year, batch, stream)
);

CREATE TABLE IF NOT EXISTS camps (
  id              SERIAL PRIMARY KEY,
  state_id        INTEGER      REFERENCES states(id) ON DELETE SET NULL,
  name            VARCHAR(150) NOT NULL,
  location        VARCHAR(200),
  capacity        INTEGER,
  camp_start_date DATE,
  camp_end_date   DATE,
  is_active       BOOLEAN DEFAULT TRUE,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- USERS & PROFILES
-- ============================================================

CREATE TABLE IF NOT EXISTS users (
  id                UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
  first_name        VARCHAR(80)  NOT NULL,
  last_name         VARCHAR(80)  NOT NULL,
  email             VARCHAR(255) UNIQUE,
  phone             VARCHAR(20)  UNIQUE,
  nysc_state_code   VARCHAR(30)  UNIQUE,       -- e.g. LA/25C/1234
  password_hash     TEXT         NOT NULL,
  is_verified       BOOLEAN DEFAULT FALSE,
  is_active         BOOLEAN DEFAULT TRUE,
  role              VARCHAR(20)  DEFAULT 'user' CHECK (role IN ('user','state_admin','super_admin')),
  serving_state_id  INTEGER      REFERENCES states(id) ON DELETE SET NULL,
  batch_id          INTEGER      REFERENCES batches(id) ON DELETE SET NULL,
  current_stage     VARCHAR(30)  DEFAULT 'before_nysc'
                    CHECK (current_stage IN ('before_nysc','camp','ppa','cds','career','pop')),
  last_login        TIMESTAMPTZ,
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS profiles (
  id              UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID         NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  bio             TEXT,
  avatar_url      TEXT,
  cover_url       TEXT,
  lga             VARCHAR(100),
  ppa_name        VARCHAR(200),
  ppa_address     TEXT,
  gender          VARCHAR(20)  CHECK (gender IN ('male','female','prefer_not_to_say')),
  date_of_birth   DATE,
  website_url     TEXT,
  twitter_handle  VARCHAR(80),
  instagram_handle VARCHAR(80),
  linkedin_url    TEXT,
  is_public       BOOLEAN DEFAULT TRUE,
  followers_count INTEGER DEFAULT 0,
  following_count INTEGER DEFAULT 0,
  posts_count     INTEGER DEFAULT 0,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- CAMP MEMBERSHIP
-- ============================================================

CREATE TABLE IF NOT EXISTS user_camps (
  id              SERIAL       PRIMARY KEY,
  user_id         UUID         NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  camp_id         INTEGER      NOT NULL REFERENCES camps(id) ON DELETE CASCADE,
  batch_id        INTEGER      REFERENCES batches(id),
  check_in_date   DATE,
  check_out_date  DATE,
  stage           VARCHAR(20)  DEFAULT 'active' CHECK (stage IN ('active','completed','dropped')),
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, camp_id, batch_id)
);

-- ============================================================
-- PPA / LOCATION
-- ============================================================

CREATE TABLE IF NOT EXISTS user_locations (
  id          SERIAL   PRIMARY KEY,
  user_id     UUID     NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  latitude    DECIMAL(10, 7),
  longitude   DECIMAL(10, 7),
  address     TEXT,
  lga         VARCHAR(100),
  state_id    INTEGER  REFERENCES states(id),
  label       VARCHAR(100) DEFAULT 'ppa',  -- 'ppa', 'home', 'current'
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- CDS INFORMATION
-- ============================================================

CREATE TABLE IF NOT EXISTS cds_information (
  id              SERIAL       PRIMARY KEY,
  user_id         UUID         NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  cds_group       VARCHAR(200),
  cds_day         VARCHAR(20)  CHECK (cds_day IN ('monday','tuesday','wednesday','thursday','friday','saturday')),
  cds_location    VARCHAR(200),
  cds_time        TIME,
  cds_state_id    INTEGER      REFERENCES states(id),
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- SKILLS
-- ============================================================

CREATE TABLE IF NOT EXISTS skills (
  id          SERIAL       PRIMARY KEY,
  name        VARCHAR(100) NOT NULL UNIQUE,
  category    VARCHAR(80),
  icon        VARCHAR(80),
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_skills (
  id          SERIAL   PRIMARY KEY,
  user_id     UUID     NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  skill_id    INTEGER  NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
  level       VARCHAR(20) DEFAULT 'intermediate' CHECK (level IN ('beginner','intermediate','expert')),
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, skill_id)
);

-- ============================================================
-- POSTS & SOCIAL FEED
-- ============================================================

CREATE TABLE IF NOT EXISTS posts (
  id              UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID         NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content         TEXT,
  post_type       VARCHAR(30)  DEFAULT 'update'
                  CHECK (post_type IN ('update','question','opportunity','job','event','marketplace','announcement')),
  visibility      VARCHAR(20)  DEFAULT 'public'
                  CHECK (visibility IN ('public','state','camp','community','private')),
  state_id        INTEGER      REFERENCES states(id),
  camp_id         INTEGER      REFERENCES camps(id),
  community_id    UUID,         -- FK added after communities table
  is_pinned       BOOLEAN DEFAULT FALSE,
  is_archived     BOOLEAN DEFAULT FALSE,
  likes_count     INTEGER DEFAULT 0,
  comments_count  INTEGER DEFAULT 0,
  shares_count    INTEGER DEFAULT 0,
  saves_count     INTEGER DEFAULT 0,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS post_media (
  id          SERIAL       PRIMARY KEY,
  post_id     UUID         NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  url         TEXT         NOT NULL,
  media_type  VARCHAR(20)  NOT NULL CHECK (media_type IN ('image','video','audio')),
  mime_type   VARCHAR(80),
  size_bytes  INTEGER,
  width       INTEGER,
  height      INTEGER,
  thumbnail_url TEXT,
  sort_order  INTEGER DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS likes (
  id          SERIAL   PRIMARY KEY,
  user_id     UUID     NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  post_id     UUID     REFERENCES posts(id) ON DELETE CASCADE,
  comment_id  INTEGER, -- FK added after comments
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, post_id)
);

CREATE TABLE IF NOT EXISTS comments (
  id              SERIAL       PRIMARY KEY,
  post_id         UUID         NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id         UUID         NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  parent_id       INTEGER      REFERENCES comments(id) ON DELETE CASCADE,
  content         TEXT         NOT NULL,
  likes_count     INTEGER DEFAULT 0,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS saved_posts (
  id          SERIAL   PRIMARY KEY,
  user_id     UUID     NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  post_id     UUID     NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, post_id)
);

-- ============================================================
-- CONNECTIONS
-- ============================================================

CREATE TABLE IF NOT EXISTS connections (
  id              SERIAL   PRIMARY KEY,
  requester_id    UUID     NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  addressee_id    UUID     NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status          VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending','accepted','declined','blocked')),
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (requester_id, addressee_id),
  CHECK (requester_id <> addressee_id)
);

-- ============================================================
-- CHAT & MESSAGING
-- ============================================================

CREATE TABLE IF NOT EXISTS conversations (
  id              UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
  type            VARCHAR(20)  DEFAULT 'direct' CHECK (type IN ('direct','group')),
  name            VARCHAR(200),
  avatar_url      TEXT,
  last_message_at TIMESTAMPTZ DEFAULT NOW(),
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS conversation_members (
  id                  SERIAL   PRIMARY KEY,
  conversation_id     UUID     NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  user_id             UUID     NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  is_admin            BOOLEAN DEFAULT FALSE,
  joined_at           TIMESTAMPTZ DEFAULT NOW(),
  last_read_at        TIMESTAMPTZ DEFAULT NOW(),
  is_muted            BOOLEAN DEFAULT FALSE,
  UNIQUE (conversation_id, user_id)
);

CREATE TABLE IF NOT EXISTS messages (
  id                  UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id     UUID         NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id           UUID         NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content             TEXT,
  message_type        VARCHAR(20)  DEFAULT 'text' CHECK (message_type IN ('text','image','video','audio','system')),
  media_url           TEXT,
  is_read             BOOLEAN DEFAULT FALSE,
  is_deleted          BOOLEAN DEFAULT FALSE,
  reply_to_id         UUID         REFERENCES messages(id),
  created_at          TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- JOBS
-- ============================================================

CREATE TABLE IF NOT EXISTS jobs (
  id              UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
  poster_id       UUID         NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title           VARCHAR(200) NOT NULL,
  description     TEXT         NOT NULL,
  company_name    VARCHAR(200),
  location        VARCHAR(200),
  state_id        INTEGER      REFERENCES states(id),
  job_type        VARCHAR(30)  CHECK (job_type IN ('weekend','part_time','remote','freelance','internship','temporary','nysc_friendly','full_time')),
  pay_min         DECIMAL(12,2),
  pay_max         DECIMAL(12,2),
  pay_currency    VARCHAR(10)  DEFAULT 'NGN',
  pay_period      VARCHAR(20)  CHECK (pay_period IN ('hourly','daily','weekly','monthly','project')),
  requirements    TEXT,
  application_method VARCHAR(30) CHECK (application_method IN ('email','whatsapp','phone','url','in_app')),
  application_email   VARCHAR(255),
  application_phone   VARCHAR(30),
  application_url     TEXT,
  whatsapp_number     VARCHAR(30),
  is_active           BOOLEAN DEFAULT TRUE,
  expires_at          DATE,
  views_count         INTEGER DEFAULT 0,
  applications_count  INTEGER DEFAULT 0,
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS job_applications (
  id              SERIAL   PRIMARY KEY,
  job_id          UUID     NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  applicant_id    UUID     NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  cover_letter    TEXT,
  status          VARCHAR(20) DEFAULT 'applied' CHECK (status IN ('applied','viewed','shortlisted','rejected','hired')),
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (job_id, applicant_id)
);

CREATE TABLE IF NOT EXISTS saved_jobs (
  id          SERIAL   PRIMARY KEY,
  user_id     UUID     NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  job_id      UUID     NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, job_id)
);

-- ============================================================
-- MARKETPLACE
-- ============================================================

CREATE TABLE IF NOT EXISTS vendors (
  id              UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id        UUID         NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  business_name   VARCHAR(200) NOT NULL,
  description     TEXT,
  logo_url        TEXT,
  location        VARCHAR(200),
  state_id        INTEGER      REFERENCES states(id),
  phone           VARCHAR(30),
  whatsapp        VARCHAR(30),
  email           VARCHAR(255),
  website_url     TEXT,
  category        VARCHAR(100),
  is_verified     BOOLEAN DEFAULT FALSE,
  is_active       BOOLEAN DEFAULT TRUE,
  rating          DECIMAL(2,1) DEFAULT 0,
  total_reviews   INTEGER DEFAULT 0,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS marketplace_listings (
  id              UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
  vendor_id       UUID         NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  title           VARCHAR(200) NOT NULL,
  description     TEXT,
  price           DECIMAL(12,2),
  price_label     VARCHAR(50),  -- e.g. "From ₦5,000" or "Contact for price"
  category        VARCHAR(100),
  location        VARCHAR(200),
  state_id        INTEGER      REFERENCES states(id),
  is_negotiable   BOOLEAN DEFAULT FALSE,
  is_featured     BOOLEAN DEFAULT FALSE,
  is_active       BOOLEAN DEFAULT TRUE,
  views_count     INTEGER DEFAULT 0,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS listing_media (
  id          SERIAL   PRIMARY KEY,
  listing_id  UUID     NOT NULL REFERENCES marketplace_listings(id) ON DELETE CASCADE,
  url         TEXT     NOT NULL,
  is_primary  BOOLEAN DEFAULT FALSE,
  sort_order  INTEGER DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- COMMUNITIES
-- ============================================================

CREATE TABLE IF NOT EXISTS communities (
  id              UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
  name            VARCHAR(200) NOT NULL,
  description     TEXT,
  avatar_url      TEXT,
  cover_url       TEXT,
  category        VARCHAR(50)  CHECK (category IN ('location','skills','interests','nysc','career','general')),
  state_id        INTEGER      REFERENCES states(id),
  is_private      BOOLEAN DEFAULT FALSE,
  is_verified     BOOLEAN DEFAULT FALSE,
  members_count   INTEGER DEFAULT 0,
  posts_count     INTEGER DEFAULT 0,
  created_by      UUID         REFERENCES users(id),
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE posts ADD CONSTRAINT fk_community
  FOREIGN KEY (community_id) REFERENCES communities(id) ON DELETE SET NULL;

CREATE TABLE IF NOT EXISTS community_members (
  id              SERIAL   PRIMARY KEY,
  community_id    UUID     NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
  user_id         UUID     NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role            VARCHAR(20) DEFAULT 'member' CHECK (role IN ('member','moderator','admin')),
  joined_at       TIMESTAMPTZ DEFAULT NOW(),
  is_muted        BOOLEAN DEFAULT FALSE,
  UNIQUE (community_id, user_id)
);

-- ============================================================
-- EVENTS
-- ============================================================

CREATE TABLE IF NOT EXISTS events (
  id              UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
  organizer_id    UUID         NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title           VARCHAR(200) NOT NULL,
  description     TEXT,
  cover_url       TEXT,
  event_type      VARCHAR(30)  CHECK (event_type IN ('camp','state','community','cds','career','networking','training','pop','online','other')),
  location        VARCHAR(300),
  state_id        INTEGER      REFERENCES states(id),
  community_id    UUID         REFERENCES communities(id),
  camp_id         INTEGER      REFERENCES camps(id),
  starts_at       TIMESTAMPTZ,
  ends_at         TIMESTAMPTZ,
  is_online       BOOLEAN DEFAULT FALSE,
  online_url      TEXT,
  is_free         BOOLEAN DEFAULT TRUE,
  ticket_price    DECIMAL(12,2),
  max_attendees   INTEGER,
  attendees_count INTEGER DEFAULT 0,
  is_active       BOOLEAN DEFAULT TRUE,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS event_attendees (
  id          SERIAL   PRIMARY KEY,
  event_id    UUID     NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  user_id     UUID     NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status      VARCHAR(20) DEFAULT 'going' CHECK (status IN ('going','interested','not_going')),
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (event_id, user_id)
);

-- ============================================================
-- NOTIFICATIONS
-- ============================================================

CREATE TABLE IF NOT EXISTS notifications (
  id              SERIAL       PRIMARY KEY,
  user_id         UUID         NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  from_user_id    UUID         REFERENCES users(id) ON DELETE CASCADE,
  type            VARCHAR(50)  NOT NULL,  -- 'like','comment','connection','message','job','event','system'
  title           VARCHAR(200),
  body            TEXT,
  data            JSONB,                  -- flexible payload
  is_read         BOOLEAN DEFAULT FALSE,
  deep_link       VARCHAR(500),           -- e.g. '/posts/uuid'
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- REPORTS / MODERATION
-- ============================================================

CREATE TABLE IF NOT EXISTS reports (
  id              SERIAL       PRIMARY KEY,
  reporter_id     UUID         NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reason          VARCHAR(100) NOT NULL,
  description     TEXT,
  -- Polymorphic target
  target_type     VARCHAR(30)  NOT NULL CHECK (target_type IN ('post','comment','job','listing','user','community','event')),
  target_id       TEXT         NOT NULL, -- UUID or int as string
  status          VARCHAR(20)  DEFAULT 'pending' CHECK (status IN ('pending','reviewed','resolved','dismissed')),
  reviewed_by     UUID         REFERENCES users(id),
  reviewed_at     TIMESTAMPTZ,
  action_taken    VARCHAR(100),
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- ADMIN TABLES
-- ============================================================

CREATE TABLE IF NOT EXISTS admins (
  id              UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID         NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  level           VARCHAR(20)  DEFAULT 'state' CHECK (level IN ('super','state')),
  is_active       BOOLEAN DEFAULT TRUE,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS state_admins (
  id              SERIAL   PRIMARY KEY,
  admin_id        UUID     NOT NULL REFERENCES admins(id) ON DELETE CASCADE,
  state_id        INTEGER  NOT NULL REFERENCES states(id) ON DELETE CASCADE,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (admin_id, state_id)
);

-- ============================================================
-- CAMP ANNOUNCEMENTS
-- ============================================================

CREATE TABLE IF NOT EXISTS camp_announcements (
  id          SERIAL       PRIMARY KEY,
  camp_id     INTEGER      NOT NULL REFERENCES camps(id) ON DELETE CASCADE,
  posted_by   UUID         REFERENCES users(id),
  title       VARCHAR(200) NOT NULL,
  content     TEXT         NOT NULL,
  priority    VARCHAR(20)  DEFAULT 'normal' CHECK (priority IN ('low','normal','high','urgent')),
  is_active   BOOLEAN DEFAULT TRUE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- FOLLOWS
-- ============================================================

CREATE TABLE IF NOT EXISTS follows (
  id              SERIAL   PRIMARY KEY,
  follower_id     UUID     NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  following_id    UUID     NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (follower_id, following_id),
  CHECK (follower_id <> following_id)
);

-- ============================================================
-- INDEXES
-- ============================================================

-- Users
CREATE INDEX IF NOT EXISTS idx_users_email         ON users (email);
CREATE INDEX IF NOT EXISTS idx_users_phone         ON users (phone);
CREATE INDEX IF NOT EXISTS idx_users_nysc_code     ON users (nysc_state_code);
CREATE INDEX IF NOT EXISTS idx_users_state         ON users (serving_state_id);
CREATE INDEX IF NOT EXISTS idx_users_stage         ON users (current_stage);
CREATE INDEX IF NOT EXISTS idx_users_batch         ON users (batch_id);

-- Posts
CREATE INDEX IF NOT EXISTS idx_posts_user          ON posts (user_id);
CREATE INDEX IF NOT EXISTS idx_posts_created       ON posts (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_visibility    ON posts (visibility);
CREATE INDEX IF NOT EXISTS idx_posts_type          ON posts (post_type);
CREATE INDEX IF NOT EXISTS idx_posts_state         ON posts (state_id);
CREATE INDEX IF NOT EXISTS idx_posts_camp          ON posts (camp_id);
CREATE INDEX IF NOT EXISTS idx_posts_community     ON posts (community_id);

-- Full text search on posts
CREATE INDEX IF NOT EXISTS idx_posts_fts           ON posts USING gin(to_tsvector('english', coalesce(content,'')));

-- Jobs
CREATE INDEX IF NOT EXISTS idx_jobs_state          ON jobs (state_id);
CREATE INDEX IF NOT EXISTS idx_jobs_type           ON jobs (job_type);
CREATE INDEX IF NOT EXISTS idx_jobs_active         ON jobs (is_active);
CREATE INDEX IF NOT EXISTS idx_jobs_created        ON jobs (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_jobs_fts            ON jobs USING gin(to_tsvector('english', title || ' ' || coalesce(description,'')));

-- Marketplace
CREATE INDEX IF NOT EXISTS idx_listings_vendor     ON marketplace_listings (vendor_id);
CREATE INDEX IF NOT EXISTS idx_listings_category   ON marketplace_listings (category);
CREATE INDEX IF NOT EXISTS idx_listings_state      ON marketplace_listings (state_id);
CREATE INDEX IF NOT EXISTS idx_listings_active     ON marketplace_listings (is_active);

-- Messages
CREATE INDEX IF NOT EXISTS idx_messages_conv       ON messages (conversation_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_sender     ON messages (sender_id);

-- Communities
CREATE INDEX IF NOT EXISTS idx_community_members   ON community_members (community_id);
CREATE INDEX IF NOT EXISTS idx_community_user      ON community_members (user_id);

-- Notifications
CREATE INDEX IF NOT EXISTS idx_notif_user          ON notifications (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notif_unread        ON notifications (user_id, is_read) WHERE is_read = FALSE;

-- User locations (for proximity search)
CREATE INDEX IF NOT EXISTS idx_user_locations_geo  ON user_locations (latitude, longitude);

-- Skills
CREATE INDEX IF NOT EXISTS idx_user_skills_user    ON user_skills (user_id);
CREATE INDEX IF NOT EXISTS idx_user_skills_skill   ON user_skills (skill_id);

-- Events
CREATE INDEX IF NOT EXISTS idx_events_starts       ON events (starts_at);
CREATE INDEX IF NOT EXISTS idx_events_state        ON events (state_id);

-- Follows
CREATE INDEX IF NOT EXISTS idx_follows_follower    ON follows (follower_id);
CREATE INDEX IF NOT EXISTS idx_follows_following   ON follows (following_id);

-- ============================================================
-- TRIGGERS — auto-update updated_at
-- ============================================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_users_updated_at       BEFORE UPDATE ON users              FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_profiles_updated_at    BEFORE UPDATE ON profiles            FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_posts_updated_at       BEFORE UPDATE ON posts               FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_jobs_updated_at        BEFORE UPDATE ON jobs                FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_vendors_updated_at     BEFORE UPDATE ON vendors             FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_listings_updated_at    BEFORE UPDATE ON marketplace_listings FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_communities_updated_at BEFORE UPDATE ON communities         FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_events_updated_at      BEFORE UPDATE ON events              FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_cds_updated_at         BEFORE UPDATE ON cds_information     FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_connections_updated_at BEFORE UPDATE ON connections         FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- SEED DATA — NYSC States
-- ============================================================

INSERT INTO states (name, code) VALUES
  ('Abia', 'AB'), ('Adamawa', 'AD'), ('Akwa Ibom', 'AK'), ('Anambra', 'AN'),
  ('Bauchi', 'BA'), ('Bayelsa', 'BY'), ('Benue', 'BE'), ('Borno', 'BO'),
  ('Cross River', 'CR'), ('Delta', 'DE'), ('Ebonyi', 'EB'), ('Edo', 'ED'),
  ('Ekiti', 'EK'), ('Enugu', 'EN'), ('FCT Abuja', 'FC'), ('Gombe', 'GO'),
  ('Imo', 'IM'), ('Jigawa', 'JI'), ('Kaduna', 'KD'), ('Kano', 'KN'),
  ('Katsina', 'KT'), ('Kebbi', 'KB'), ('Kogi', 'KO'), ('Kwara', 'KW'),
  ('Lagos', 'LA'), ('Nasarawa', 'NA'), ('Niger', 'NI'), ('Ogun', 'OG'),
  ('Ondo', 'ON'), ('Osun', 'OS'), ('Oyo', 'OY'), ('Plateau', 'PL'),
  ('Rivers', 'RI'), ('Sokoto', 'SO'), ('Taraba', 'TA'), ('Yobe', 'YO'),
  ('Zamfara', 'ZA')
ON CONFLICT (code) DO NOTHING;

-- ============================================================
-- SEED DATA — Common Skills
-- ============================================================

INSERT INTO skills (name, category) VALUES
  ('Programming', 'Technology'),
  ('Web Development', 'Technology'),
  ('Mobile Development', 'Technology'),
  ('Data Analysis', 'Technology'),
  ('Machine Learning', 'Technology'),
  ('UI/UX Design', 'Design'),
  ('Graphic Design', 'Design'),
  ('Photography', 'Creative'),
  ('Video Editing', 'Creative'),
  ('Content Writing', 'Creative'),
  ('Copywriting', 'Creative'),
  ('Digital Marketing', 'Marketing'),
  ('Social Media Management', 'Marketing'),
  ('SEO', 'Marketing'),
  ('Fashion Design', 'Lifestyle'),
  ('Catering / Cooking', 'Lifestyle'),
  ('Event Planning', 'Business'),
  ('Project Management', 'Business'),
  ('Accounting / Finance', 'Business'),
  ('Teaching / Tutoring', 'Education'),
  ('Music Production', 'Creative'),
  ('Videography', 'Creative'),
  ('Translation', 'Languages'),
  ('Public Speaking', 'Soft Skills'),
  ('Sales', 'Business'),
  ('Customer Service', 'Business'),
  ('Tailoring / Sewing', 'Lifestyle'),
  ('Hair Styling', 'Lifestyle'),
  ('Makeup / Beauty', 'Lifestyle'),
  ('Electrical Engineering', 'Engineering'),
  ('Civil Engineering', 'Engineering'),
  ('Medical / Healthcare', 'Healthcare')
ON CONFLICT (name) DO NOTHING;
