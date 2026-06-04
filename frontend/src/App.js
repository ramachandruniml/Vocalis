import { jsx as _jsx } from "react/jsx-runtime";
import { useAuth } from "./hooks/useAuth";
import AuthForm from "./components/AuthForm";
import Interview from "./pages/Interview";
export default function App() {
    const { token, error, loading, login, register, logout } = useAuth();
    if (!token) {
        return (_jsx(AuthForm, { onLogin: login, onRegister: register, error: error, loading: loading }));
    }
    return _jsx(Interview, { token: token, onLogout: logout });
}
