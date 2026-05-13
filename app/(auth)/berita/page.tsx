"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { formatDate, slugify } from "@/lib/utils";
import type { NewsItem, NewsCategory } from "@/lib/types";
import { Plus, Pencil, Trash2, X } from "lucide-react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface NewsForm {
  title: string;
  category: NewsCategory;
  excerpt: string;
  content: string;
  thumbnail_url: string;
  is_featured: boolean;
  is_published: boolean;
}

const EMPTY_FORM: NewsForm = {
  title: "",
  category: "umum",
  excerpt: "",
  content: "",
  thumbnail_url: "",
  is_featured: false,
  is_published: false,
};

const CATEGORY_OPTIONS: NewsCategory[] = ["akademik", "kampus", "nasional", "umum"];

const CATEGORY_COLORS: Record<NewsCategory, string> = {
  akademik: "bg-blue-100 text-blue-700",
  kampus: "bg-emerald-100 text-emerald-700",
  nasional: "bg-amber-100 text-amber-700",
  umum: "bg-slate-100 text-slate-600",
};

// ---------------------------------------------------------------------------
// BeritaPage
// ---------------------------------------------------------------------------

export default function BeritaPage() {
  const [articles, setArticles] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<NewsForm>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchArticles = useCallback(async () => {
    setLoading(true);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data } = await (supabase.from("news") as any)
      .select("*")
      .order("published_at", { ascending: false });
    setArticles((data as NewsItem[]) ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => { if (!cancelled) await fetchArticles(); })();
    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openCreate = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setError(null);
    setShowDialog(true);
  };

  const openEdit = (article: NewsItem) => {
    setEditingId(article.id);
    setForm({
      title: article.title,
      category: article.category,
      excerpt: article.excerpt ?? "",
      content: article.content,
      thumbnail_url: article.thumbnail_url ?? "",
      is_featured: article.is_featured,
      is_published: article.is_published,
    });
    setError(null);
    setShowDialog(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Hapus artikel ini?")) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase.from("news") as any).delete().eq("id", id);
    fetchArticles();
  };

  const handleSave = async () => {
    if (!form.title.trim() || !form.content.trim()) {
      setError("Judul dan konten wajib diisi.");
      return;
    }
    setSaving(true);
    setError(null);

    try {
      // Get current user session
      const { data: { session } } = await supabase.auth.getSession();
      const userId = session?.user?.id;

      if (!userId && !editingId) {
        setError("Harus login untuk membuat artikel baru.");
        setSaving(false);
        return;
      }

      const payload = {
        ...form,
        slug: slugify(form.title),
        published_at: new Date().toISOString(),
        ...(userId && !editingId && { author_id: userId }), // Only set author_id for new articles
      };

      if (editingId) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error: e } = await (supabase.from("news") as any).update(payload).eq("id", editingId);
        if (e) { setError(e.message); setSaving(false); return; }
      } else {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error: e } = await (supabase.from("news") as any).insert(payload);
        if (e) { setError(e.message); setSaving(false); return; }
      }

      setSaving(false);
      setShowDialog(false);
      fetchArticles();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
      setSaving(false);
    }
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#0f172a]">Berita & Pengumuman</h1>
          <p className="text-[#64748b] text-sm mt-0.5">{articles.length} artikel</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-[#1e3a5f] text-white rounded-lg px-4 py-2 text-sm font-semibold hover:bg-[#162d4a] transition-colors"
        >
          <Plus size={16} /> Tambah Berita
        </button>
      </div>

      {/* Table */}
      <div className="mt-6 bg-white border border-[#e2e8f0] rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-[#f8fafc] border-b border-[#e2e8f0]">
            <tr>
              <th className="text-left px-4 py-3 font-semibold text-[#64748b]">Judul</th>
              <th className="text-left px-4 py-3 font-semibold text-[#64748b]">Kategori</th>
              <th className="text-left px-4 py-3 font-semibold text-[#64748b]">Status</th>
              <th className="text-left px-4 py-3 font-semibold text-[#64748b]">Tanggal</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-[#64748b]">
                  Memuat data...
                </td>
              </tr>
            )}
            {!loading && articles.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-[#64748b]">
                  Belum ada artikel. Klik &ldquo;Tambah Berita&rdquo; untuk mulai.
                </td>
              </tr>
            )}
            {articles.map((a) => (
              <tr key={a.id} className="border-b border-[#e2e8f0] last:border-0 hover:bg-[#f8fafc]">
                <td className="px-4 py-3">
                  <div className="font-medium text-[#0f172a] max-w-xs truncate">{a.title}</div>
                  {a.is_featured && (
                    <span className="text-xs text-amber-600 font-medium">★ Featured</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full capitalize ${CATEGORY_COLORS[a.category]}`}>
                    {a.category}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                      a.is_published
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {a.is_published ? "Published" : "Draft"}
                  </span>
                </td>
                <td className="px-4 py-3 text-[#64748b] whitespace-nowrap">
                  {formatDate(a.published_at)}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2 justify-end">
                    <button
                      onClick={() => openEdit(a)}
                      className="p-1.5 rounded-lg hover:bg-[#f1f5f9] text-[#64748b] hover:text-[#0f172a]"
                    >
                      <Pencil size={15} />
                    </button>
                    <button
                      onClick={() => handleDelete(a.id)}
                      className="p-1.5 rounded-lg hover:bg-red-50 text-[#64748b] hover:text-red-500"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Dialog */}
      {showDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-xl max-h-[90vh] overflow-y-auto">
            {/* Dialog header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#e2e8f0]">
              <h2 className="font-bold text-lg text-[#0f172a]">
                {editingId ? "Edit Artikel" : "Tambah Artikel"}
              </h2>
              <button onClick={() => setShowDialog(false)} className="p-1 rounded-lg hover:bg-[#f1f5f9]">
                <X size={18} />
              </button>
            </div>

            {/* Dialog body */}
            <div className="px-6 py-5 flex flex-col gap-4">
              {error && (
                <div className="px-3 py-2 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                  {error}
                </div>
              )}

              <Field label="Judul *">
                <input
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className={INPUT_CLASS}
                  placeholder="Judul artikel"
                />
              </Field>

              <Field label="Kategori">
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value as NewsCategory })}
                  className={INPUT_CLASS}
                >
                  {CATEGORY_OPTIONS.map((c) => (
                    <option key={c} value={c} className="capitalize">{c}</option>
                  ))}
                </select>
              </Field>

              <Field label="Thumbnail URL">
                <input
                  value={form.thumbnail_url}
                  onChange={(e) => setForm({ ...form, thumbnail_url: e.target.value })}
                  className={INPUT_CLASS}
                  placeholder="https://..."
                />
              </Field>

              <Field label="Excerpt (ringkasan singkat)">
                <textarea
                  value={form.excerpt}
                  onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
                  className={`${INPUT_CLASS} resize-none`}
                  rows={2}
                  placeholder="Ringkasan artikel..."
                />
              </Field>

              <Field label="Konten *">
                <textarea
                  value={form.content}
                  onChange={(e) => setForm({ ...form, content: e.target.value })}
                  className={`${INPUT_CLASS} resize-y`}
                  rows={6}
                  placeholder="Isi konten artikel lengkap..."
                />
              </Field>

              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.is_featured}
                    onChange={(e) => setForm({ ...form, is_featured: e.target.checked })}
                    className="w-4 h-4 rounded"
                  />
                  <span className="text-sm text-[#0f172a]">Featured</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.is_published}
                    onChange={(e) => setForm({ ...form, is_published: e.target.checked })}
                    className="w-4 h-4 rounded"
                  />
                  <span className="text-sm text-[#0f172a]">Published</span>
                </label>
              </div>
            </div>

            {/* Dialog footer */}
            <div className="px-6 py-4 border-t border-[#e2e8f0] flex justify-end gap-3">
              <button
                onClick={() => setShowDialog(false)}
                className="px-4 py-2 rounded-lg text-sm font-medium text-[#64748b] hover:bg-[#f1f5f9]"
              >
                Batal
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-5 py-2 rounded-lg text-sm font-semibold bg-[#1e3a5f] text-white hover:bg-[#162d4a] disabled:opacity-50"
              >
                {saving ? "Menyimpan..." : "Simpan"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Small helper components
// ---------------------------------------------------------------------------

const INPUT_CLASS =
  "w-full border border-[#e2e8f0] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/30";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium text-[#0f172a]">{label}</label>
      {children}
    </div>
  );
}
