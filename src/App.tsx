import { useEffect } from 'react'
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from 'react-router-dom'
import type { ReactNode } from 'react'
import { useAuth } from './auth/AuthProvider'
import { AppShell } from './components/AppShell'
import { CollectionScreen } from './pages/CollectionScreen'
import { FriendsScreen } from './pages/FriendsScreen'
import { LoginScreen } from './pages/LoginScreen'

/** Reset scroll to the top whenever the route changes. */
function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return null
}

function AuthGate({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth()
  if (loading) {
    return (
      <div className="grid min-h-dvh place-items-center text-fg-muted">
        Se încarcă…
      </div>
    )
  }
  if (!user) return <LoginScreen />
  return <>{children}</>
}

export function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL.replace(/\/$/, '')}>
      <ScrollToTop />
      <AuthGate>
        <AppShell>
          <Routes>
            <Route path="/" element={<CollectionScreen />} />
            <Route path="/friends" element={<FriendsScreen />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AppShell>
      </AuthGate>
    </BrowserRouter>
  )
}
