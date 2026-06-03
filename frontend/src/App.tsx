import { useAuth } from "./hooks/useAuth"
import AuthForm from "./components/AuthForm"
import Interview from "./pages/Interview"

export default function App() {
  const { token, error, loading, login, register, logout } = useAuth()

  if (!token) {
    return (
      <AuthForm
        onLogin={login}
        onRegister={register}
        error={error}
        loading={loading}
      />
    )
  }

  return <Interview token={token} onLogout={logout} />
}