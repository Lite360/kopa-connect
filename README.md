# 🟢 Kopa Connect

**The NYSC Social, Opportunity & Community Platform**

A full-stack progressive web app (PWA) built for Nigerian Youth Service Corps (NYSC) members — connecting corps members across camps, PPAs, CDS groups, and career opportunities.

---

## 🚀 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Vue 3 (Composition API) + Vite |
| State Management | Pinia |
| Styling | Tailwind CSS v3 |
| Backend/API | Vercel Serverless Functions (Node 20) |
| Database | Neon PostgreSQL (v15) |
| Auth | JWT (jsonwebtoken + bcryptjs) |
| File Storage | Vercel Blob |
| PWA | vite-plugin-pwa + Workbox |
| Icons | Font Awesome 6 Free |
| Maps | Leaflet.js |

---

## 📱 Features

### Core Social
- **Feed** — Tabs: For You / Following / Camp / State
- **Posts** — Create, like, comment, share
- **Discover** — Find corps members by state, camp, batch, skill
- **Profile** — Full NYSC lifecycle profile with CDS info, PPA details, skills

### NYSC Lifecycle Stages
- `before_nysc` → `camp` → `ppa` → `cds` → `career` → `pop`
- Auto-stage transitions on login based on camp end date

### Camp
- Camp dashboard with batch info, countdown, and camp-mate discovery
- PPA map view (Leaflet) showing corps members near you

### Jobs & Marketplace
- Post and browse job listings (full-time, part-time, freelance, NYSC-friendly)
- Vendor marketplace for selling/buying goods and services

### Communities & Events
- Create and join interest communities
- Create, RSVP, and discover events

### Chat
- Real-time-like messaging (5s polling for Vercel Hobby plan compatibility)
- Conversation list with unread badge counts

### Notifications
- Real-time-like notification polling
- Mark as read individually or all-at-once

### Admin Panel (`/assets`)
- Dashboard with platform analytics
- Manage users, camps, states, jobs, posts, events, communities, marketplace
- Reports & moderation

### PWA
- Installable on Android (native prompt) and iOS (manual instructions)
- Offline caching via Workbox
- App icons in all required sizes

---

## 📁 Project Structure

```
kopaconnect/
├── api/                        # Vercel Serverless Functions
│   ├── _lib/                   # Shared utilities (db, auth, cors)
│   ├── admin/                  # Admin-only endpoints
│   ├── auth/                   # login, register, me, forgot-password
│   ├── camp/                   # Camp data & people
│   ├── cds/                    # CDS information
│   ├── chat/                   # Conversations & messages
│   ├── communities/            # Community CRUD
│   ├── connections/            # Follow/unfollow
│   ├── events/                 # Events CRUD
│   ├── feed/                   # Posts, likes, comments
│   ├── jobs/                   # Job listings
│   ├── marketplace/            # Listings & vendors
│   ├── notifications/          # Notifications
│   ├── ppa/                    # PPA info
│   ├── skills/                 # Skills reference
│   ├── upload.js               # Vercel Blob upload
│   └── users/                  # User profile & discovery
├── db/
│   ├── schema.sql              # Full database schema (28 tables)
│   └── migration_001.sql       # CDS/PPA profile field migration
├── public/
│   └── icons/                  # PWA icons (all sizes)
├── src/
│   ├── App.vue                 # Root shell (nav, toast, PWA prompt)
│   ├── main.js                 # Entry point
│   ├── style.css               # Global styles & design tokens
│   ├── router/index.js         # Vue Router (auth guards)
│   ├── stores/                 # Pinia stores
│   │   ├── auth.js
│   │   ├── camp.js
│   │   ├── chat.js
│   │   ├── feed.js
│   │   ├── notifications.js
│   │   └── pwa.js
│   ├── components/
│   │   ├── common/             # AppButton, Avatar, Toast, Modal, etc.
│   │   ├── layout/             # AppHeader, MobileNav, DesktopSidebar
│   │   ├── feed/               # PostCard, CreatePost, FeedTabs
│   │   ├── camp/               # CampDashboard, CampPeopleCard
│   │   ├── jobs/               # JobCard, JobFilter
│   │   ├── events/             # EventCard
│   │   ├── communities/        # CommunityCard
│   │   ├── marketplace/        # ListingCard
│   │   ├── people/             # PersonCard
│   │   └── pwa/                # InstallPrompt
│   └── views/
│       ├── auth/               # Login, Register, ForgotPassword
│       ├── feed/               # Feed, PostDetail
│       ├── camp/               # Camp, CampPeople
│       ├── discover/           # Discover, PeopleSearch
│       ├── jobs/               # Jobs, JobDetail, CreateJob
│       ├── marketplace/        # Marketplace, VendorProfile, CreateListing
│       ├── communities/        # Communities, CommunityDetail
│       ├── events/             # Events, EventDetail, CreateEvent
│       ├── chat/               # Chat, Conversation
│       ├── notifications/      # Notifications
│       ├── profile/            # Profile, EditProfile, CDSForm, PPAMap
│       └── admin/              # AdminLayout + all admin sub-views
├── index.html
├── vite.config.js
├── tailwind.config.js
├── vercel.json
└── .env.example
```

---

## ⚙️ Local Development

### 1. Clone and install dependencies
```bash
git clone https://github.com/Lite360/kopa-connect.git
cd kopa-connect
npm install
```

### 2. Set up environment variables
```bash
cp .env.example .env
# Fill in DATABASE_URL, JWT_SECRET, BLOB_READ_WRITE_TOKEN, etc.
```

### 3. Set up the database
Run `db/schema.sql` against your Neon PostgreSQL database:
```bash
psql $DATABASE_URL -f db/schema.sql
psql $DATABASE_URL -f db/migration_001.sql
```

### 4. Run the dev server
```bash
npm run dev
```

The app runs at `http://localhost:3000`. API calls are proxied to `http://localhost:3001` in development.

> **Note:** For local API testing, use `vercel dev` (requires Vercel CLI) to run serverless functions locally.

---

## 🚢 Deployment (Vercel)

1. Connect the GitHub repo to Vercel
2. Set the following **Environment Variables** in Vercel dashboard:
   - `DATABASE_URL` — Neon PostgreSQL connection string
   - `JWT_SECRET` — Strong random secret (min 32 chars)
   - `BLOB_READ_WRITE_TOKEN` — From Vercel Blob storage
   - `SUPER_ADMIN_EMAIL` — Email that auto-gets `super_admin` role on registration
3. Vercel auto-detects Vite and builds with `npm run build`
4. Serverless functions in `api/` are deployed automatically

---

## 🗄️ Database Schema

The database has **28 tables** covering:

| Category | Tables |
|----------|--------|
| Reference | `states`, `batches`, `camps` |
| Users | `users`, `profiles`, `user_locations` |
| NYSC Data | `user_camps`, `cds_information`, `skills`, `user_skills` |
| Social | `posts`, `post_media`, `post_likes`, `post_comments`, `follows` |
| Jobs | `jobs`, `job_applications` |
| Marketplace | `listings`, `vendors` |
| Communities | `communities`, `community_members` |
| Events | `events`, `event_attendees` |
| Chat | `conversations`, `conversation_participants`, `messages` |
| Notifications | `notifications` |
| Admin | `admins`, `reports` |

---

## 🔐 Authentication

- JWT-based auth (tokens stored in `localStorage`)
- Login supports: **email**, **phone number**, or **NYSC state code** (e.g. `LA/25C/1234`)
- Passwords hashed with `bcryptjs` (cost factor 12)
- Auth guard on all private routes via Vue Router navigation guard
- Super admin auto-provisioned on first registration if email matches `SUPER_ADMIN_EMAIL`

---

## 🛣️ Route Reference

| Path | View | Auth Required |
|------|------|:---:|
| `/` | Feed | ✅ |
| `/login` | Login | ❌ |
| `/register` | Register | ❌ |
| `/forgot-password` | ForgotPassword | ❌ |
| `/discover` | Discover | ✅ |
| `/camp` | Camp | ✅ |
| `/jobs` | Jobs | ✅ |
| `/marketplace` | Marketplace | ✅ |
| `/communities` | Communities | ✅ |
| `/events` | Events | ✅ |
| `/chat` | Chat | ✅ |
| `/notifications` | Notifications | ✅ |
| `/profile` | My Profile | ✅ |
| `/profile/edit` | Edit Profile | ✅ |
| `/profile/cds` | CDS Form | ✅ |
| `/profile/ppa` | PPA Map | ✅ |
| `/assets` | Admin Dashboard | ✅ (admin) |
| `/assets/users` | Admin Users | ✅ (admin) |
| `/assets/camps` | Admin Camps | ✅ (admin) |
| `/assets/states` | Admin States | ✅ (admin) |
| `/assets/jobs` | Admin Jobs | ✅ (admin) |
| `/assets/posts` | Admin Posts | ✅ (admin) |
| `/assets/events` | Admin Events | ✅ (admin) |
| `/assets/communities` | Admin Communities | ✅ (admin) |
| `/assets/marketplace` | Admin Marketplace | ✅ (admin) |
| `/assets/reports` | Admin Reports | ✅ (admin) |
| `/assets/settings` | Admin Settings | ✅ (admin) |

---

## 📡 API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login (email/phone/state code) |
| GET | `/api/auth/me` | Get current user |
| POST | `/api/auth/forgot-password` | Request password reset |

### Feed & Posts
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/feed` | Get posts (tab, page params) |
| POST | `/api/feed` | Create post |
| GET | `/api/feed/posts/[id]` | Get single post |
| PUT | `/api/feed/posts/[id]` | Update post |
| DELETE | `/api/feed/posts/[id]` | Delete post |
| POST | `/api/feed/posts/[id]/like` | Like/unlike post |
| GET | `/api/feed/posts/[id]/comments` | Get comments |
| POST | `/api/feed/posts/[id]/comments` | Add comment |

### Users
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users/discover` | Discover corps members |
| GET | `/api/users/[id]` | Get user profile |
| PUT | `/api/users/profile` | Update own profile |
| POST | `/api/connections` | Follow/unfollow user |

### Camp
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/camp` | Get camp info |
| GET | `/api/camp/people` | Get camp-mates |

### Jobs, Marketplace, Events, Communities, Chat, Notifications
All support standard CRUD via `GET`, `POST`, `PUT`, `DELETE` on their respective `/api/[resource]` routes.

---

## 📄 License

MIT © 2025 Lite360 / Kopa Connect
