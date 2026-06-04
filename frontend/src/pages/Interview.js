import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useCallback } from "react";
import { useAudioCapture } from "../hooks/useAudioCapture";
import Waveform from "../components/Waveform";
import FeedbackPanel from "../components/FeedbackPanel";
export default function Interview({ token, onLogout }) {
    const [messages, setMessages] = useState([]);
    const handleMessage = useCallback((msg) => {
        setMessages((prev) => [...prev, msg]);
    }, []);
    const { start, stop, recording, analyserRef, error } = useAudioCapture(token, handleMessage);
    return (_jsxs("div", { style: { minHeight: "100vh", background: "var(--bg)", display: "flex", flexDirection: "column" }, children: [_jsxs("header", { style: {
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "1rem 2rem",
                    borderBottom: "1px solid var(--border)",
                    background: "var(--bg-panel)",
                }, children: [_jsxs("div", { style: { display: "flex", alignItems: "center", gap: "0.75rem" }, children: [_jsx("span", { style: {
                                    display: "inline-flex", alignItems: "center", justifyContent: "center",
                                    width: "32px", height: "32px", background: "var(--accent)", color: "#0a0a0a",
                                    borderRadius: "6px", fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "0.8rem",
                                }, children: "IC" }), _jsx("span", { style: { fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "1rem" }, children: "InterviewCoach" }), recording && (_jsxs("span", { style: {
                                    display: "flex", alignItems: "center", gap: "0.4rem",
                                    fontSize: "0.7rem", color: "var(--danger)",
                                    animation: "pulse 1.5s ease infinite",
                                }, children: [_jsx("span", { style: { width: 6, height: 6, borderRadius: "50%", background: "var(--danger)", display: "inline-block" } }), "LIVE"] }))] }), _jsx("button", { onClick: onLogout, style: {
                            background: "transparent", border: "1px solid var(--border)", borderRadius: "6px",
                            color: "var(--text-secondary)", padding: "0.4rem 0.75rem", fontSize: "0.75rem", cursor: "pointer",
                        }, children: "Logout" })] }), _jsxs("div", { style: { flex: 1, display: "grid", gridTemplateColumns: "1fr 420px", gap: 0 }, children: [_jsxs("div", { style: { padding: "2rem", display: "flex", flexDirection: "column", gap: "2rem", borderRight: "1px solid var(--border)" }, children: [_jsxs("div", { children: [_jsx("h2", { style: { fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "1.25rem", marginBottom: "0.4rem" }, children: "Mock Interview Session" }), _jsx("p", { style: { fontSize: "0.8rem", color: "var(--text-secondary)" }, children: "Speak naturally. Your audio is analyzed every 5 seconds." })] }), _jsxs("div", { style: {
                                    background: "var(--bg-panel)",
                                    border: "1px solid var(--border)",
                                    borderRadius: "10px",
                                    padding: "1.5rem",
                                }, children: [_jsx("p", { style: { fontSize: "0.7rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "1rem" }, children: "Audio Input" }), _jsx(Waveform, { analyserRef: analyserRef, active: recording })] }), _jsx("div", { style: { display: "flex", gap: "1rem" }, children: !recording ? (_jsx("button", { onClick: start, style: {
                                        flex: 1, padding: "0.875rem", background: "var(--accent)", color: "#0a0a0a",
                                        border: "none", borderRadius: "8px", fontFamily: "var(--font-display)",
                                        fontWeight: 700, fontSize: "0.9rem", cursor: "pointer",
                                        transition: "opacity 0.15s",
                                    }, children: "Start Interview" })) : (_jsx("button", { onClick: stop, style: {
                                        flex: 1, padding: "0.875rem", background: "transparent",
                                        color: "var(--danger)", border: "1px solid var(--danger)",
                                        borderRadius: "8px", fontFamily: "var(--font-display)",
                                        fontWeight: 700, fontSize: "0.9rem", cursor: "pointer",
                                    }, children: "Stop" })) }), error && (_jsx("p", { style: { fontSize: "0.8rem", color: "var(--danger)", padding: "0.5rem 0.75rem", background: "rgba(255,95,87,0.08)", border: "1px solid rgba(255,95,87,0.2)", borderRadius: "6px" }, children: error })), messages.length > 0 && (_jsxs("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }, children: [_jsxs("div", { style: { background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "8px", padding: "1rem" }, children: [_jsx("p", { style: { fontSize: "0.7rem", color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.06em" }, children: "Segments" }), _jsx("p", { style: { fontSize: "1.5rem", fontFamily: "var(--font-display)", fontWeight: 700 }, children: messages.length })] }), _jsxs("div", { style: { background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "8px", padding: "1rem" }, children: [_jsx("p", { style: { fontSize: "0.7rem", color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.06em" }, children: "Avg Confidence" }), _jsxs("p", { style: { fontSize: "1.5rem", fontFamily: "var(--font-display)", fontWeight: 700, color: "var(--accent)" }, children: [Math.round(messages.reduce((a, m) => a + m.confidence_score, 0) / messages.length), "%"] })] })] }))] }), _jsxs("div", { style: { padding: "2rem", overflowY: "auto" }, children: [_jsx("p", { style: { fontSize: "0.7rem", color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "1.5rem" }, children: "Real-time Analysis" }), _jsx(FeedbackPanel, { messages: messages })] })] })] }));
}
