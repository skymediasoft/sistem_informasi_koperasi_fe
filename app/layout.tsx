import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/auth/auth-context";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";


const geist = Geist({ subsets: ["latin"], variable: "--font-geist-sans" });
const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono" });

export const metadata: Metadata = {
  title: "kopera — Koperasi untuk semua",
  description: "Simpan, tumbuh, dan berdampak bersama koperasi",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "kopera",
  },
};

export const viewport: Viewport = {
  colorScheme: "light",
  themeColor: "#f8f8f1",
  userScalable: false,
};

 
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
      
  return (
    <html lang="id" className="bg-background">
      <body className={`${geist.variable} ${geistMono.variable} antialiased`}>
        <AuthProvider>
          <DashboardLayout>{children}</DashboardLayout>
        </AuthProvider>
      </body>
    </html>
  );
}
