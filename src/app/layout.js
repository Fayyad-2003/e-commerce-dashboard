import { Cairo } from "next/font/google";
import "./globals.css";
import ClientLayoutWrapper from "../../components/home/layout-wrapper";
const cairo = Cairo({ subsets: ["arabic"] });

// 👇 Define and export metadata (title, icon, etc.) here
export const metadata = {
  // Use a proper name for your app
  title: "لوحة التحكم",
  description: "A description of my awesome app.",
};

export default function RootLayout({ children }) {
  // Pass children and className down to the client wrapper
  return (
    <html lang="ar" dir="rtl">
      <body
        className={`${cairo.className} flex flex-col bg-[#FFF8F0] text-[#171717]`}
      >
        {/* 👇 Render the Client Component and pass children */}
        <ClientLayoutWrapper>{children}</ClientLayoutWrapper>
      </body>
    </html>
  );
}
