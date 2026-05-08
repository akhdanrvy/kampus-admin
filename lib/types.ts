// Shared TypeScript types for the Admin CMS — mirrors the mobile app's types/index.ts

export type NewsCategory = "akademik" | "kampus" | "nasional" | "umum";
export type StudentStatus = "active" | "inactive" | "graduated";
export type UserRole = "student" | "admin" | "lecturer";

export interface Profile {
  id: string;
  nim: string;
  full_name: string;
  email: string;
  phone?: string;
  avatar_url?: string;
  faculty?: string;
  major?: string;
  year_entry?: number;
  student_status: StudentStatus;
  role: UserRole;
  created_at: string;
}

export interface NewsItem {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  thumbnail_url?: string;
  category: NewsCategory;
  is_featured: boolean;
  is_published: boolean;
  published_at: string;
  author_name?: string;
}

export interface AttendanceSession {
  id: string;
  title: string;
  course_name?: string;
  qr_token: string;
  qr_expires_at: string;
  is_active: boolean;
  created_by: string;
  created_at: string;
}

export interface AttendanceRecord {
  id: string;
  session_id: string;
  user_id: string;
  scanned_at: string;
  status: "present" | "late";
  profiles?: { full_name: string; nim: string };
}
