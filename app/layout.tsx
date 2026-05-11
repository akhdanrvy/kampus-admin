import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "KampusGo Admin",
  description: "Admin CMS untuk aplikasi kampus KampusGo",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body className="flex min-h-screen bg-[#f8fafc] text-[#0f172a]">
        {children}
      </body>
    </html>
  );
}
