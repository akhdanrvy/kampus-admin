# CLAUDE.md

This file provides guidance to Claude Code when working with kampus-app.

## Project

KampusGo Mobile App — React Native + Expo untuk mahasiswa kampus.

## Commands

```bash
npx expo start          # start dev server
npx expo start --clear  # start dengan clear cache
eas build --platform android --profile preview  # build Android
```

## Environment Variables

Required in `.env`:
EXPO_PUBLIC_SUPABASE_URL=
EXPO_PUBLIC_SUPABASE_ANON_KEY=

## Tech Stack

- React Native + Expo SDK 51
- Expo Router v3 (file-based routing)
- NativeWind v4 (Tailwind CSS for React Native)
- Zustand (UI state management)
- TanStack Query v5 (server state & caching)
- Supabase (Auth, PostgreSQL, Storage, Realtime)
- MMKV (local storage & offline cache)
- TypeScript strict mode

## Architecture

### Route Structure

app/
\_layout.tsx # Root layout, auth guard, providers
index.tsx # Redirect ke auth atau tabs
(auth)/
\_layout.tsx # Stack layout tanpa tab bar
login.tsx # Login email + password
(tabs)/
\_layout.tsx # Bottom tab navigator (5 tabs)
beranda.tsx # Home screen
berita/
index.tsx # News feed infinite scroll
[id].tsx # Detail artikel
scan.tsx # QR Scanner kehadiran
akademik/
index.tsx # Jadwal + absensi
profil/
index.tsx # Profil + E-Card
edit.tsx # Edit profil

### Supabase Client

Satu client untuk semua kebutuhan mobile:

- `lib/supabase.ts` — createClient dengan SecureStore adapter

### State Management

- `hooks/` — TanStack Query hooks untuk semua server state
- `stores/authStore.ts` — Zustand hanya untuk auth state (userId, role, isAuthenticated)
- `lib/mmkv.ts` — MMKV untuk offline cache (E-Card, profil)

### Supabase Tables

- `profiles` — data mahasiswa (extends auth.users)
- `news` — artikel & pengumuman kampus
- `events` — event & kegiatan kampus
- `schedules` — jadwal kuliah
- `attendance_sessions` — sesi QR kehadiran dari dosen/admin
- `attendance_records` — log kehadiran mahasiswa

### TypeScript Types

Semua interface ada di `types/index.ts`:

- `Profile` — data mahasiswa
- `NewsItem` — artikel berita
- `EventItem` — event kampus
- `Schedule` — jadwal kuliah
- `AttendanceSession` — sesi QR
- `AttendanceRecord` — record kehadiran

### Coding Rules

- Styling: NativeWind className ONLY, tidak pakai StyleSheet.create()
- Navigation: Expo Router router.push/replace, tidak pakai navigate()
- Data fetching: TanStack Query SELALU, tidak pakai useState + useEffect untuk fetch
- Local storage: MMKV untuk persist, tidak pakai AsyncStorage langsung
- Komentar: bahasa Inggris
- Penjelasan keputusan: bahasa Indonesia
- Max 150 baris per komponen
- Wajib ada: loading state (Skeleton), error state, empty state

### Design System Colors

```typescript
primary: "#1E3A5F"; // navy blue
primaryLight: "#2563EB"; // blue
accent: "#F59E0B"; // amber
background: "#F8FAFC"; // off-white
cardDark: "#1E293B"; // E-Card background
textPrimary: "#0F172A";
textMuted: "#64748B";
success: "#10B981";
danger: "#EF4444";
```

### Current Status

- Auth: Login email sudah berfungsi, Google OAuth & forgot password belum
- Mock data: masih ada di lib/mockData.ts — perlu diganti dengan Supabase real
- Register: sudah dihapus dari mobile, akun dibuat oleh admin di kampus-admin
