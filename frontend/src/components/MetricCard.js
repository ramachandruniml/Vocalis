import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export default function MetricCard({ label, value, sub, accent }) {
    return (_jsxs("div", { style: {
            background: "var(--bg-card)",
            border: `1px solid ${accent ? "var(--accent-dim)" : "var(--border)"}`,
            borderRadius: "8px",
            padding: "1rem",
            display: "flex",
            flexDirection: "column",
            gap: "0.25rem",
        }, children: [_jsx("span", { style: { fontSize: "0.7rem", color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.06em" }, children: label }), _jsx("span", { style: { fontSize: "1.5rem", fontFamily: "var(--font-display)", fontWeight: 700, color: accent ? "var(--accent)" : "var(--text-primary)" }, children: value }), sub && _jsx("span", { style: { fontSize: "0.7rem", color: "var(--text-muted)" }, children: sub })] }));
}
