"use client"

interface Props {
  iconHeight?: number
  wordmarkSize?: number
  stacked?: boolean
  color?: string
}

export default function VocalisLogo({
  iconHeight = 28,
  wordmarkSize = 22,
  stacked = false,
  color = "#1c0800",
}: Props) {
  // Aspect ratio is viewBox width / height: 260 / 138
  const iconWidth = iconHeight * (260 / 138)

  // Center of arc convergence at (130, 155), viewBox crops from y=17 → y=158
  const icon = (
    <svg
      width={iconWidth}
      height={iconHeight}
      viewBox="0 17 260 141"
      fill="none"
      aria-hidden
      style={{ display: "block", flexShrink: 0 }}
    >
      {/* 5 concentric arcs, outermost → innermost, light peach → deep burnt orange */}
      {/* Arc 1 – outermost, lightest */}
      <path
        d="M 2 155 A 128 128 0 0 1 258 155"
        stroke="#f0d0a8"
        strokeWidth="6.5"
        fill="none"
        strokeLinecap="butt"
      />
      {/* Arc 2 */}
      <path
        d="M 25 155 A 105 105 0 0 1 235 155"
        stroke="#dfa870"
        strokeWidth="6.5"
        fill="none"
        strokeLinecap="butt"
      />
      {/* Arc 3 */}
      <path
        d="M 47 155 A 83 83 0 0 1 213 155"
        stroke="#c98440"
        strokeWidth="6.5"
        fill="none"
        strokeLinecap="butt"
      />
      {/* Arc 4 */}
      <path
        d="M 68 155 A 62 62 0 0 1 192 155"
        stroke="#b46218"
        strokeWidth="6.5"
        fill="none"
        strokeLinecap="butt"
      />
      {/* Arc 5 – innermost, boldest */}
      <path
        d="M 87 155 A 43 43 0 0 1 173 155"
        stroke="#96480a"
        strokeWidth="6.5"
        fill="none"
        strokeLinecap="butt"
      />
      {/* Diamond at convergence point */}
      <polygon
        points="130,143 138,151 130,159 122,151"
        fill="#96480a"
      />
    </svg>
  )

  const wordmark = (
    <span style={{
      fontFamily: "var(--font-cinzel), serif",
      fontSize: `${wordmarkSize}px`,
      fontWeight: 400,
      color,
      letterSpacing: "0.35em",
      textTransform: "uppercase" as const,
      lineHeight: 1,
      display: "block",
    }}>
      Vocalis
    </span>
  )

  if (stacked) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
        {icon}
        {wordmark}
      </div>
    )
  }

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
      {icon}
      {wordmark}
    </div>
  )
}
