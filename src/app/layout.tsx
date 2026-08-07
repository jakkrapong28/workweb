import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Workweb Blog",
    template: "%s | Workweb Blog",
  },
  description: "ระบบจัดการบทความภาษาไทย พร้อมหลังบ้านและการคัดกรองความคิดเห็น",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-gray-50 text-gray-900 font-sans">
        {children}
      </body>
    </html>
  );
}
