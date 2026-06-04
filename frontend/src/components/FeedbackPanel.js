import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import MetricCard from "./MetricCard";
export default function FeedbackPanel({ messages }) {
    if (messages.length === 0) {
        return (_jsx("div", { style: { color: "var(--text-muted)", fontSize: "0.8rem", textAlign: "center", padding: "3rem 1rem" }, children: "Start speaking \u2014 feedback will appear here." }));
    }
    const latest = messages[messages.length - 1];
    return (_jsxs("div", { style: { display: "flex", flexDirection: "column", gap: "1.5rem" }, children: [_jsxs("div", { style: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "0.75rem" }, children: [_jsx(MetricCard, { label: "WPM", value: latest.features.wpm, sub: "words/min", accent: true }), _jsx(MetricCard, { label: "Confidence", value: `${latest.confidence_score}%`, accent: true }), _jsx(MetricCard, { label: "Filler Rate", value: `${(latest.features.filler_rate * 100).toFixed(1)}%`, sub: "of words" })] }), latest.features.filler_words.length > 0 && (_jsxs("div", { children: [_jsx("p", { style: { fontSize: "0.7rem", color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "0.5rem" }, children: "Filler words detected" }), _jsx("div", { style: { display: "flex", flexWrap: "wrap", gap: "0.4rem" }, children: [...new Set(latest.features.filler_words)].map((w) => (_jsx("span", { style: {
                                padding: "0.2rem 0.5rem",
                                background: "rgba(255,189,46,0.1)",
                                border: "1px solid rgba(255,189,46,0.2)",
                                borderRadius: "4px",
                                fontSize: "0.75rem",
                                color: "var(--warning)",
                            }, children: w }, w))) })] })), _jsxs("div", { style: {
                    background: "var(--accent-bg)",
                    border: "1px solid rgba(200,245,100,0.15)",
                    borderRadius: "8px",
                    padding: "1rem 1.25rem",
                }, children: [_jsx("p", { style: { fontSize: "0.7rem", color: "var(--accent-dim)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "0.5rem" }, children: "AI Feedback" }), _jsx("p", { style: { fontSize: "0.875rem", color: "var(--text-primary)", lineHeight: 1.6 }, children: latest.feedback })] }), _jsxs("div", { children: [_jsx("p", { style: { fontSize: "0.7rem", color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "0.75rem" }, children: "Transcript History" }), _jsx("div", { style: { display: "flex", flexDirection: "column", gap: "0.5rem", maxHeight: "240px", overflowY: "auto" }, children: [...messages].reverse().map((m, i) => (_jsxs("div", { style: {
                                background: "var(--bg-panel)",
                                border: "1px solid var(--border)",
                                borderRadius: "6px",
                                padding: "0.75rem",
                                fontSize: "0.8rem",
                                color: "var(--text-secondary)",
                                lineHeight: 1.5,
                            }, children: [_jsx("span", { style: { color: "var(--text-muted)", marginRight: "0.5rem" }, children: new Date(m.timestamp).toLocaleTimeString() }), m.transcript] }, i))) })] })] }));
}
