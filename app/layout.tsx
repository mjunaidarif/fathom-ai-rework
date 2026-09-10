import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { StoreProvider } from "@/lib/store";
import { Sidebar } from "@/components/Sidebar";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Fathom — AI Meeting Notetaker",
  description:
    "A rebuild of Fathom: records, transcribes and summarizes your meetings with switchable templates, action items, highlights, search and shareable clips.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full">
        <StoreProvider>
          <div className="flex">
            <Sidebar />
            <main className="flex-1 min-w-0 min-h-screen">{children}</main>
          </div>
        </StoreProvider>
      </body>
    </html>
  );
}
