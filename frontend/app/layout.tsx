import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "Vocalis — AI Mock Interviewer",
  description: "Real-time AI-powered behavioral interview coaching",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body
        className="antialiased"
        style={{
          background: "#03060e",
          color: "#d4eeff",
          fontFamily: "var(--font-space), sans-serif",
        }}
      >
        {children}
      </body>
    </html>
  )
}
