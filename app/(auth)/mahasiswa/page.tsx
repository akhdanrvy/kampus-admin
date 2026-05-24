"use client";

import { useState, useEffect, useMemo } from "react";
import { formatDate } from "@/lib/utils";
import type { Profile } from "@/lib/types";
import { Search, Plus } from "lucide-react";
import TambahMahasiswaModal from "@/components/TambahMahasiswaModal";

type FilterStatus = "semua" | "active" | "inactive" | "graduated";

const STATUS_COLORS: Record<string, string> = {
  active: "bg-emerald-100 text-emerald-700",
  inactive: "bg-red-100 text-red-600",
  graduated: "bg-blue-100 text-blue-700",
  pending: "bg-amber-100 text-amber-700",
};

const ROLE_COLORS: Record<string, string> = {
  admin: "bg-purple-100 text-purple-700",
  mahasiswa: "bg-slate-100 text-slate-600",
  dosen: "bg-cyan-100 text-cyan-700",
};

export default function MahasiswaPage() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("semua");
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchProfiles = async () => {
    setLoading(true);
    const res = await fetch('/api/mahasiswa/list');
    const json = await res.json();
    setProfiles((json.data as Profile[]) ?? []);
    setLoading(false);
  };

  useEffect(() => {
    let cancelled = false;
    (async () => { if (!cancelled) await fetchProfiles(); })();
    return () => { cancelled = true; };
  }, []);

  // Derive filtered list from profiles without a separate effect.
  // useMemo avoids the setState-in-effect anti-pattern while keeping
  // the filtered array reactive to changes in profiles, filterStatus, and search.
  const filtered = useMemo(() => {
    let result = profiles;
    if (filterStatus !== "semua") {
      result = result.filter((p) => p.student_status === filterStatus);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (p) =>
          p.full_name?.toLowerCase().includes(q) ||
          p.nim?.toLowerCase().includes(q) ||
          p.major?.toLowerCase().includes(q)
      );
    }
    return result;
  }, [profiles, filterStatus, search]);

  const updateStatus = async (id: string, status: string) => {
    await fetch('/api/mahasiswa', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, student_status: status }),
    });
    fetchProfiles();
  };

  const FILTER_BUTTONS: { label: string; value: FilterStatus }[] = [
    { label: "Semua", value: "semua" },
    { label: "Aktif", value: "active" },
    { label: "Non-aktif", value: "inactive" },
    { label: "Lulus", value: "graduated" },
  ];

  const handleMahasiswaAdded = () => {
    setIsModalOpen(false);
    fetchProfiles();
  };

  return (
    <div className="p-8">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#0f172a]">Data Mahasiswa</h1>
          <p className="text-[#64748b] text-sm mt-0.5">{profiles.length} mahasiswa terdaftar</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-[#1e3a5f] rounded-lg hover:bg-[#16304f] transition-colors"
        >
          <Plus size={16} />
          Tambah Mahasiswa
        </button>
      </div>

      {/* Controls */}
      <div className="mt-5 flex flex-wrap items-center gap-3">
        {/* Filter buttons */}
        <div className="flex items-center gap-1 bg-[#f1f5f9] rounded-lg p-1">
          {FILTER_BUTTONS.map((btn) => (
            <button
              key={btn.value}
              onClick={() => setFilterStatus(btn.value)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                filterStatus === btn.value
                  ? "bg-white text-[#0f172a] shadow-sm"
                  : "text-[#64748b] hover:text-[#0f172a]"
              }`}
            >
              {btn.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="flex-1 min-w-55 relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94a3b8]" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama, NIM, atau prodi..."
            className="w-full pl-8 pr-3 py-2 text-sm border border-[#e2e8f0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/30"
          />
        </div>
      </div>

      {/* Table */}
      <div className="mt-4 bg-white border border-[#e2e8f0] rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-[#f8fafc] border-b border-[#e2e8f0]">
            <tr>
              <th className="text-left px-4 py-3 font-semibold text-[#64748b]">Mahasiswa</th>
              <th className="text-left px-4 py-3 font-semibold text-[#64748b]">NIM</th>
              <th className="text-left px-4 py-3 font-semibold text-[#64748b]">Prodi / Angkatan</th>
              <th className="text-left px-4 py-3 font-semibold text-[#64748b]">Role</th>
              <th className="text-left px-4 py-3 font-semibold text-[#64748b]">Status</th>
              <th className="text-left px-4 py-3 font-semibold text-[#64748b]">Bergabung</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-[#64748b]">Memuat data...</td>
              </tr>
            )}
            {!loading && filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-[#64748b]">
                  Tidak ada data yang cocok.
                </td>
              </tr>
            )}
            {filtered.map((p) => (
              <tr key={p.id} className="border-b border-[#e2e8f0] last:border-0 hover:bg-[#f8fafc]">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#1e3a5f] text-white flex items-center justify-center text-xs font-bold shrink-0">
                      {(p.full_name ?? "?").charAt(0).toUpperCase()}
                    </div>
                    <span className="font-medium text-[#0f172a]">{p.full_name ?? "-"}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-[#64748b] font-mono text-xs">{p.nim ?? "-"}</td>
                <td className="px-4 py-3">
                  <div className="text-[#0f172a]">{p.major ?? "-"}</div>
                  {p.year_entry && (
                    <div className="text-xs text-[#94a3b8]">Angkatan {p.year_entry}</div>
                  )}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`text-xs font-semibold px-2 py-0.5 rounded-full capitalize ${
                      ROLE_COLORS[p.role ?? "mahasiswa"] ?? "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {p.role ?? "mahasiswa"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`text-xs font-semibold px-2 py-0.5 rounded-full capitalize ${
                      STATUS_COLORS[p.student_status ?? "active"] ?? "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {p.student_status ?? "active"}
                  </span>
                </td>
                <td className="px-4 py-3 text-[#64748b] text-xs whitespace-nowrap">
                  {formatDate(p.created_at ?? "")}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2 justify-end">
                    {p.student_status !== "active" && (
                      <button
                        onClick={() => updateStatus(p.id, "active")}
                        className="text-xs font-semibold px-2 py-1 rounded-md bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                      >
                        Aktifkan
                      </button>
                    )}
                    {p.student_status === "active" && (
                      <button
                        onClick={() => updateStatus(p.id, "inactive")}
                        className="text-xs font-semibold px-2 py-1 rounded-md bg-red-100 text-red-600 hover:bg-red-200"
                      >
                        Suspend
                      </button>
                    )}
                    {p.student_status !== "graduated" && (
                      <button
                        onClick={() => updateStatus(p.id, "graduated")}
                        className="text-xs font-semibold px-2 py-1 rounded-md bg-blue-100 text-blue-700 hover:bg-blue-200"
                      >
                        Lulus
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <TambahMahasiswaModal
        key={isModalOpen ? "open" : "closed"}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleMahasiswaAdded}
      />
    </div>
  );
}
