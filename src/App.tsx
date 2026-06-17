import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import type { ReactNode } from 'react'
import { useAuth } from './auth/AuthProvider'
import { AppShell } from './components/AppShell'
import { CollectionScreen } from './pages/CollectionScreen'
import { MissingScreen } from './pages/MissingScreen'
import { DuplicatesScreen } from './pages/DuplicatesScreen'
import { ShareScreen } from './pages/ShareScreen'
import { SwapScreen } from './pages/SwapScreen'
import { LoginScreen } from './pages/LoginScreen'

function AuthGate({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth()
  if (loading) {
    return (
      <div className="grid min-h-dvh place-items-center text-fg-muted">
        Loading…
      </div>
    )
  }
  if (!user) return <LoginScreen />
  return <>{children}</>
}

export function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL.replace(/\/$/, '')}>
      <AuthGate>
        <AppShell>
          <Routes>
            <Route path="/" element={<CollectionScreen />} />
            <Route path="/missing" element={<MissingScreen />} />
            <Route path="/spares" element={<DuplicatesScreen />} />
            <Route path="/swap" element={<SwapScreen />} />
            <Route path="/share" element={<ShareScreen />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AppShell>
      </AuthGate>
    </BrowserRouter>
  )
}
