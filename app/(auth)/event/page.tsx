export default function EventPage() {
  return (
    <div className="p-8">
      <div>
        <h1 className="text-2xl font-bold text-[#0f172a]">Event & Kegiatan</h1>
        <p className="text-[#64748b] text-sm mt-0.5">Kelola event kampus</p>
      </div>
      <div className="mt-10 flex flex-col items-center justify-center text-center text-[#94a3b8] py-20">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-14 h-14 mb-4 opacity-40"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
        <p className="text-lg font-semibold text-[#64748b]">Segera Hadir</p>
        <p className="text-sm mt-1">Fitur manajemen event sedang dalam pengembangan.</p>
      </div>
    </div>
  );
}
