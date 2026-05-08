import Link from "next/link";
import { Newspaper, Users, QrCode, CalendarDays } from "lucide-react";

const CARDS = [
  { href: "/berita", label: "Manage Berita", icon: Newspaper, color: "bg-blue-500", desc: "Tambah & edit artikel berita" },
  { href: "/mahasiswa", label: "Manage Mahasiswa", icon: Users, color: "bg-emerald-500", desc: "Lihat & approve data mahasiswa" },
  { href: "/kehadiran", label: "QR Kehadiran", icon: QrCode, color: "bg-amber-500", desc: "Generate QR sesi kehadiran" },
  { href: "/event", label: "Manage Event", icon: CalendarDays, color: "bg-purple-500", desc: "Kelola event & kegiatan kampus" },
];

export default function DashboardPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-[#0f172a]">Dashboard</h1>
      <p className="text-[#64748b] mt-1">Selamat datang di Admin CMS KampusGo</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
        {CARDS.map(({ href, label, icon: Icon, color, desc }) => (
          <Link
            key={href}
            href={href}
            className="bg-white rounded-xl border border-[#e2e8f0] p-6 flex flex-col gap-3 hover:shadow-md transition-shadow"
          >
            <div className={`w-10 h-10 ${color} rounded-lg flex items-center justify-center`}>
              <Icon size={20} className="text-white" />
            </div>
            <div>
              <div className="font-semibold text-[#0f172a]">{label}</div>
              <div className="text-sm text-[#64748b] mt-0.5">{desc}</div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
