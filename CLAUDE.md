# CLAUDE.md

This file provides guidance to Claude Code when working with kampus-admin.

## Project

KampusGo Admin CMS — Next.js web app untuk admin kampus mengelola mahasiswa, berita, kehadiran, dan event.

## Commands

```bash
npm run dev    # start dev server (localhost:3000)
npm run build  # build for production
npm run start  # start production server
npm run lint   # run ESLint
```

## Environment Variables

Required in `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_SUPABASE_SERVICE_ROLE_KEY=
```

## Tech Stack

- Next.js 16 + React 19 (App Router)
- Tailwind CSS v4 (PostCSS plugin, no config file)
- Supabase (`@supabase/ssr` — session via cookies)
- TypeScript strict mode
- lucide-react (icons)
- qrcode (QR generation)

## Architecture

### Route Structure

```
app/
  layout.tsx              # Root layout (html/body, metadata)
  globals.css             # Tailwind base styles
  login/
    page.tsx              # Login with Supabase email/password
    layout.tsx            # Login layout (no sidebar)
  (auth)/
    layout.tsx            # Protected layout — Sidebar + Header + main
    page.tsx              # Dashboard with nav cards
    berita/page.tsx       # News CRUD (list + inline modal)
    mahasiswa/page.tsx    # Student list + filter/search + status actions
    kehadiran/page.tsx    # QR attendance — auto-refresh every 60s + Realtime
    event/page.tsx        # Event management (placeholder, not yet implemented)
  api/
    mahasiswa/route.ts    # PATCH student_status
    mahasiswa/list/route.ts  # GET all profiles (server-side, uses supabaseAdmin)
```

### Supabase Clients

Two separate clients — never mix them:

- `lib/supabase.ts` — `createBrowserClient` from `@supabase/ssr`, for Client Components. Session stored in cookies.
- `lib/supabase-server.ts` — server-only. Exports `supabase` (anon) and `supabaseAdmin` (service role, bypasses RLS). Use only in Server Components and API routes.

### Components

- `components/Sidebar.tsx` — nav sidebar with logout
- `components/Header.tsx` — top bar with user info
- `components/UserInfo.tsx` — user avatar/name display
- `components/TambahMahasiswaModal.tsx` — modal for creating new student accounts

### TypeScript Types

All interfaces in `lib/types.ts`:

- `Profile` — student data (id, nim, full_name, email, faculty, major, year_entry, student_status, role)
- `NewsItem` — news article (id, title, slug, content, excerpt, category, is_featured, is_published)
- `AttendanceSession` — QR session (id, title, course_name, qr_token, qr_expires_at, is_active)
- `AttendanceRecord` — attendance log (id, session_id, user_id, scanned_at, status)

### Supabase Tables

- `profiles` — student accounts (managed by admin, not self-registered)
- `news` — articles and announcements
- `events` — campus events (not yet used in UI)
- `attendance_sessions` — QR sessions created by admin/lecturer
- `attendance_records` — student scan log

### Coding Rules

- Styling: Tailwind className ONLY, no inline styles or CSS modules
- Data fetching: plain `fetch` or Supabase client directly — no TanStack Query
- Comments: English only for code comments; Indonesian for decision explanations
- Max 150 lines per component

### Design System Colors

```
primary:     #1e3a5f  (navy blue)
primaryLight:#2563eb  (blue)
accent:      #f59e0b  (amber)
background:  #f8fafc  (off-white)
textPrimary: #0f172a
textMuted:   #64748b
border:      #e2e8f0
success:     #10b981
danger:      #ef4444
```

### Current Status

- Login: Supabase email/password auth berfungsi
- Dashboard: nav cards ke semua section
- Berita: full CRUD (create, edit, delete, publish toggle) berfungsi
- Mahasiswa: list + filter status + search + update status + tambah mahasiswa berfungsi
- Kehadiran: QR generate + auto-refresh 60s + Supabase Realtime live count berfungsi
- Event: placeholder UI, fitur belum diimplementasi
