import { useEffect } from 'react'
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  Outlet,
  useLocation,
} from 'react-router-dom'
import { useAuth } from './auth/AuthProvider'
import { AppShell } from './components/AppShell'
import { CollectionScreen } from './pages/CollectionScreen'
import { FriendsScreen } from './pages/FriendsScreen'
import { AddFriendScreen } from './pages/AddFriendScreen'
import { LoginScreen } from './pages/LoginScreen'
import { PrivacyScreen } from './pages/PrivacyScreen'
import { TermsScreen } from './pages/TermsScreen'

/** Reset scroll to the top whenever the route changes. */
function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return null
}

/** Gate the app behind auth; the shell (tab bar) stays mounted across child routes. */
function ProtectedLayout() {
  const { user, loading } = useAuth()
  if (loading) {
    return (
      <div className="grid min-h-dvh place-items-center text-fg-muted">
        Se încarcă…
      </div>
    )
  }
  if (!user) return <LoginScreen />
  return (
    <AppShell>
      <Outlet />
    </AppShell>
  )
}

export function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL.replace(/\/$/, '')}>
      <ScrollToTop />
      <Routes>
        {/* Public legal pages — reachable without signing in. */}
        <Route path="/privacy" element={<PrivacyScreen />} />
        <Route path="/terms" element={<TermsScreen />} />

        {/* Everything else requires auth and lives inside the app shell. */}
        <Route element={<ProtectedLayout />}>
          <Route path="/" element={<CollectionScreen />} />
          <Route path="/friends" element={<FriendsScreen />} />
          <Route path="/friends/add" element={<AddFriendScreen />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
