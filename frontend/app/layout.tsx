import type { Metadata } from "next"
import "./globals.css"
import MeshBackground from "@/components/MeshBackground"

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
          background: "transparent",
          color: "#0d0d0d",
          fontFamily: "var(--font-space), sans-serif",
        }}
      >
        <MeshBackground />
        {children}
      </body>
    </html>
  )
}
