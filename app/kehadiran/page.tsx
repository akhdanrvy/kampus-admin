"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import QRCode from "qrcode";
import { supabase } from "@/lib/supabase";
import { formatDate } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const QR_LIFETIME_S = 60; // seconds before QR is refreshed

// ---------------------------------------------------------------------------
// Kenapa QR refresh harus dari server (update di database)?
//
// Jika QR hanya di-generate di client (browser dosen) tanpa update database:
// 1. Mahasiswa yang screenshot QR lama bisa absen kapan saja — tidak ada expiry
// 2. Tidak ada sumber kebenaran (source of truth) — server tidak tahu token mana
//    yang valid saat ini
// 3. Race condition — jika mahasiswa scan QR yang sudah tidak valid secara client
//    tapi belum di-invalidate di server, attendance tercatat tidak semestinya
//
// Dengan update ke database (qr_token + qr_expires_at):
// - Server selalu menjadi authority: "token ini valid jika ada di DB dan belum expired"
// - Screenshot QR lama otomatis tidak bisa dipakai setelah 60 detik
// - Audit trail lengkap — setiap token yang pernah dipakai tersimpan di DB
// ---------------------------------------------------------------------------

interface Session {
  id: string;
  course_name: string;
  qr_token: string;
  qr_expires_at: string;
  is_active: boolean;
  created_at: string;
}

export default function KehadiranPage() {
  const [courseName, setCourseName] = useState("");
  const [room, setRoom] = useState("");
  const [session, setSession] = useState<Session | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [countdown, setCountdown] = useState(QR_LIFETIME_S);
  const [attendeeCount, setAttendeeCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const countdownIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const realtimeChannelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  // Generate QR image from the JSON payload
  const generateQRImage = useCallback(async (token: string, sessionId: string, expiresAt: string) => {
    const payload = JSON.stringify({ session_id: sessionId, token, expires_at: expiresAt });
    try {
      const dataUrl = await QRCode.toDataURL(payload, { width: 300, margin: 2, color: { dark: "#1e3a5f" } });
      setQrDataUrl(dataUrl);
    } catch {
      setError("Gagal generate QR code.");
    }
  }, []);

  // Push a new token to the database and re-render QR
  const refreshToken = useCallback(async (sessionId: string) => {
    const newToken = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + QR_LIFETIME_S * 1000).toISOString();

    const { error: updateError } = await supabase
      .from("attendance_sessions")
      .update({ qr_token: newToken, qr_expires_at: expiresAt })
      .eq("id", sessionId);

    if (updateError) { setError(updateError.message); return; }

    setCountdown(QR_LIFETIME_S);
    await generateQRImage(newToken, sessionId, expiresAt);
  }, [generateQRImage]);

  // Start a new attendance session
  const handleStart = async () => {
    if (!courseName.trim()) { setError("Masukkan nama mata kuliah."); return; }
    setLoading(true);
    setError(null);

    const { data: authData } = await supabase.auth.getUser();
    const userId = authData?.user?.id ?? "admin";

    const firstToken = crypto.randomUUID();
    const firstExpiry = new Date(Date.now() + QR_LIFETIME_S * 1000).toISOString();

    const { data, error: insertError } = await supabase
      .from("attendance_sessions")
      .insert({
        title: `${courseName}${room ? " — " + room : ""}`,
        course_name: courseName,
        qr_token: firstToken,
        qr_expires_at: firstExpiry,
        is_active: true,
        created_by: userId,
      })
      .select("*")
      .single();

    setLoading(false);

    if (insertError || !data) { setError(insertError?.message ?? "Gagal membuat sesi."); return; }

    const sess = data as Session;
    setSession(sess);
    setCountdown(QR_LIFETIME_S);
    await generateQRImage(firstToken, sess.id, firstExpiry);

    // Auto-refresh QR every QR_LIFETIME_S seconds
    refreshIntervalRef.current = setInterval(() => refreshToken(sess.id), QR_LIFETIME_S * 1000);

    // Countdown ticker — decrements every second
    countdownIntervalRef.current = setInterval(() => {
      setCountdown((c) => (c <= 1 ? QR_LIFETIME_S : c - 1));
    }, 1000);

    // ---------------------------------------------------------------------------
    // Supabase Realtime — subscribe to attendance_records for this session
    //
    // Bagaimana Supabase Realtime bekerja untuk update hitungan kehadiran live:
    // 1. Supabase membuka WebSocket antara browser admin dan server PostgreSQL
    // 2. Setiap INSERT ke tabel attendance_records yang match filter session_id
    //    akan menghasilkan event "postgres_changes" yang dikirim via WebSocket
    // 3. Browser admin menerima event ini dan update state attendeeCount secara
    //    instan — tanpa polling, tanpa reload halaman
    // 4. Ini memungkinkan dosen melihat "● 12 mahasiswa hadir" yang terupdate
    //    langsung saat mahasiswa scan QR dari HP mereka
    // ---------------------------------------------------------------------------
    const channel = supabase
      .channel(`attendance-${sess.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "attendance_records",
          filter: `session_id=eq.${sess.id}`,
        },
        () => {
          setAttendeeCount((c) => c + 1);
        }
      )
      .subscribe();

    realtimeChannelRef.current = channel;
  };

  // End the session
  const handleEnd = async () => {
    if (!session) return;

    // Clear all intervals
    if (refreshIntervalRef.current) clearInterval(refreshIntervalRef.current);
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    if (realtimeChannelRef.current) supabase.removeChannel(realtimeChannelRef.current);

    await supabase
      .from("attendance_sessions")
      .update({ is_active: false })
      .eq("id", session.id);

    setSession(null);
    setQrDataUrl("");
    setAttendeeCount(0);
    setCountdown(QR_LIFETIME_S);
    setCourseName("");
    setRoom("");
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (refreshIntervalRef.current) clearInterval(refreshIntervalRef.current);
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
      if (realtimeChannelRef.current) supabase.removeChannel(realtimeChannelRef.current);
    };
  }, []);

  return (
    <div className="p-8 max-w-2xl">
      <h1 className="text-2xl font-bold text-[#0f172a]">Generate QR Kehadiran</h1>
      <p className="text-[#64748b] mt-1 text-sm">
        QR code otomatis diperbarui setiap 60 detik untuk mencegah kecurangan.
      </p>

      {error && (
        <div className="mt-4 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
          {error}
        </div>
      )}

      {/* ── Setup form (before session started) ── */}
      {!session && (
        <div className="mt-6 bg-white border border-[#e2e8f0] rounded-xl p-6 flex flex-col gap-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-[#0f172a] mb-1">
                Mata Kuliah <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={courseName}
                onChange={(e) => setCourseName(e.target.value)}
                placeholder="Algoritma Pemrograman"
                className="w-full border border-[#e2e8f0] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/30"
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-[#0f172a] mb-1">Ruangan</label>
              <input
                type="text"
                value={room}
                onChange={(e) => setRoom(e.target.value)}
                placeholder="Ruang A101"
                className="w-full border border-[#e2e8f0] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/30"
              />
            </div>
          </div>
          <button
            onClick={handleStart}
            disabled={loading}
            className="bg-[#1e3a5f] text-white rounded-lg px-6 py-2.5 text-sm font-semibold hover:bg-[#162d4a] disabled:opacity-50 transition-colors self-start"
          >
            {loading ? "Memulai..." : "Mulai Sesi Kehadiran"}
          </button>
        </div>
      )}

      {/* ── Active session ── */}
      {session && qrDataUrl && (
        <div className="mt-6 bg-white border border-[#e2e8f0] rounded-xl p-6 flex flex-col items-center gap-6">
          {/* QR Code */}
          <div className="border-4 border-[#1e3a5f] rounded-2xl p-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={qrDataUrl} alt="QR Kehadiran" width={300} height={300} />
          </div>

          {/* Session info */}
          <div className="w-full text-center">
            <div className="text-lg font-bold text-[#0f172a]">{session.course_name}</div>
            <div className="text-sm text-[#64748b]">{formatDate(session.created_at)}</div>
          </div>

          {/* Countdown */}
          <div className="flex items-center gap-6">
            <div className="flex flex-col items-center">
              <div className="text-3xl font-mono font-bold text-[#f59e0b]">
                {String(countdown).padStart(2, "0")}
              </div>
              <div className="text-xs text-[#64748b] mt-0.5">detik</div>
            </div>
            <div className="h-10 w-px bg-[#e2e8f0]" />
            <div className="flex flex-col items-center">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-lg font-bold text-[#0f172a]">{attendeeCount}</span>
              </div>
              <div className="text-xs text-[#64748b] mt-0.5">mahasiswa hadir</div>
            </div>
          </div>

          {/* Progress bar */}
          <div className="w-full">
            <div className="flex justify-between text-xs text-[#64748b] mb-1">
              <span>QR refresh dalam {countdown}s</span>
              <span>{Math.round((countdown / QR_LIFETIME_S) * 100)}%</span>
            </div>
            <div className="w-full h-2 bg-[#f1f5f9] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#f59e0b] rounded-full transition-all duration-1000"
                style={{ width: `${(countdown / QR_LIFETIME_S) * 100}%` }}
              />
            </div>
          </div>

          {/* End session button */}
          <button
            onClick={handleEnd}
            className="w-full bg-red-500 text-white rounded-lg px-6 py-2.5 text-sm font-semibold hover:bg-red-600 transition-colors"
          >
            Akhiri Sesi
          </button>
        </div>
      )}
    </div>
  );
}
