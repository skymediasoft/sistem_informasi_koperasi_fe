import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'

const geist = Geist({ subsets: ['latin'], variable: '--font-geist-sans' })
const geistMono = Geist_Mono({ subsets: ['latin'], variable: '--font-geist-mono' })

export const metadata: Metadata = {
  title: 'kopera — Koperasi untuk semua',
  description: 'Simpan, tumbuh, dan berdampak bersama koperasi',
}

export const viewport: Viewport = {
  colorScheme: 'light',
  themeColor: '#f8f8f1',
  userScalable: false,
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id" className="bg-background">
      <body className={`${geist.variable} ${geistMono.variable} antialiased`}>
        {children}
        {process.env.NODE_ENV === 'production'}
      </body>
    </html>
  )
}
