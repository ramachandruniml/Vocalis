import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "Vocalis — AI Mock Interviewer",
  description: "Real-time AI-powered behavioral interview coaching",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-[#0a0a0a] text-zinc-100 antialiased">
        {children}
      </body>
    </html>
  )
}