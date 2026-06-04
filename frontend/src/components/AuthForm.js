import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import styles from "./AuthForm.module.css";
import { useState } from "react";
export default function AuthForm({ onLogin, onRegister, error, loading }) {
    const [mode, setMode] = useState("login");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const handleSubmit = (e) => {
        e.preventDefault();
        if (mode === "login")
            onLogin(email, password);
        else
            onRegister(email, password);
    };
    return (_jsx("div", { className: styles.wrapper, children: _jsxs("div", { className: styles.card, children: [_jsxs("div", { className: styles.header, children: [_jsx("span", { className: styles.logo, children: "IC" }), _jsx("h1", { className: styles.title, children: "InterviewCoach" }), _jsx("p", { className: styles.subtitle, children: "AI-powered mock interviewer" })] }), _jsxs("div", { className: styles.tabs, children: [_jsx("button", { className: mode === "login" ? styles.tabActive : styles.tab, onClick: () => setMode("login"), type: "button", children: "Login" }), _jsx("button", { className: mode === "register" ? styles.tabActive : styles.tab, onClick: () => setMode("register"), type: "button", children: "Register" })] }), _jsxs("form", { onSubmit: handleSubmit, className: styles.form, children: [_jsxs("div", { className: styles.field, children: [_jsx("label", { className: styles.label, children: "Email" }), _jsx("input", { className: styles.input, type: "email", value: email, onChange: (e) => setEmail(e.target.value), placeholder: "you@example.com", required: true, autoComplete: "email" })] }), _jsxs("div", { className: styles.field, children: [_jsx("label", { className: styles.label, children: "Password" }), _jsx("input", { className: styles.input, type: "password", value: password, onChange: (e) => setPassword(e.target.value), placeholder: "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022", required: true, autoComplete: mode === "login" ? "current-password" : "new-password", minLength: 8 })] }), error && _jsx("p", { className: styles.error, children: error }), _jsx("button", { className: styles.submit, type: "submit", disabled: loading, children: loading ? (_jsx("span", { className: styles.spinner })) : mode === "login" ? "Sign in" : "Create account" })] })] }) }));
}
