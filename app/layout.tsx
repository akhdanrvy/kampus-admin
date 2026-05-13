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
    <html lang="id" className="h-full">
      <body className="h-full w-full m-0 p-0 overflow-hidden">
        {children}
      </body>
    </html>
  );
}
