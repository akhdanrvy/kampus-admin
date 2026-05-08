"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Newspaper,
  CalendarDays,
  Users,
  QrCode,
} from "lucide-react";

const NAV_ITEMS = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/berita", label: "Berita", icon: Newspaper },
  { href: "/event", label: "Event", icon: CalendarDays },
  { href: "/mahasiswa", label: "Mahasiswa", icon: Users },
  { href: "/kehadiran", label: "Kehadiran / QR", icon: QrCode },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-60 min-h-screen bg-[#1e3a5f] flex flex-col shrink-0">
      {/* Logo / Brand */}
      <div className="px-6 py-5 border-b border-white/10">
        <span className="text-white text-xl font-bold tracking-tight">KampusGo</span>
        <span className="block text-white/50 text-xs mt-0.5">Admin CMS</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 flex flex-col gap-1">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const isActive =
            href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? "bg-white/15 text-white"
                  : "text-white/60 hover:bg-white/10 hover:text-white"
              }`}
            >
              <Icon size={18} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-white/10">
        <span className="text-white/40 text-xs">v1.0.0</span>
      </div>
    </aside>
  );
}
