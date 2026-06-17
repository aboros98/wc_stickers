import { useState, type FormEvent } from 'react'
import { Mail } from 'lucide-react'
import { useAuth } from '../auth/AuthProvider'

function GoogleIcon() {
  return (
    <svg viewBox="0 0 48 48" width="18" height="18" aria-hidden="true">
      <path
        fill="#EA4335"
        d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
      />
      <path
        fill="#4285F4"
        d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
      />
      <path
        fill="#FBBC05"
        d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
      />
      <path
        fill="#34A853"
        d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
      />
    </svg>
  )
}

export function LoginScreen() {
  const { signInWithPassword, signUp, signInWithMagicLink, signInWithGoogle } =
    useAuth()
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [msg, setMsg] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setBusy(true)
    setMsg(null)
    const { error } =
      mode === 'signin'
        ? await signInWithPassword(email, password)
        : await signUp(email, password)
    if (error) setMsg(error)
    else if (mode === 'signup')
      setMsg('Cont creat — verifică emailul pentru confirmare.')
    setBusy(false)
  }

  const magic = async () => {
    if (!email) {
      setMsg('Introdu mai întâi emailul.')
      return
    }
    setBusy(true)
    setMsg(null)
    const { error } = await signInWithMagicLink(email)
    setMsg(error ?? 'Link trimis — verifică emailul.')
    setBusy(false)
  }

  return (
    <div className="mx-auto flex min-h-dvh max-w-sm flex-col justify-center px-6">
      <div className="mb-8 text-center">
        <p className="font-display text-xs font-bold uppercase tracking-[0.25em] text-gold">
          Cupa Mondială 2026
        </p>
        <h1 className="mt-1 font-display text-4xl font-extrabold">
          Album Abțibilduri
        </h1>
        <p className="mt-2 text-sm text-fg-muted">
          Colectează toate 980. Vezi ce-ți lipsește, schimbă dublurile.
        </p>
      </div>

      <button
        type="button"
        onClick={() => signInWithGoogle()}
        className="flex h-12 w-full items-center justify-center gap-3 rounded-[12px] bg-white font-bold text-[#1f1f1f] active:scale-95"
      >
        <GoogleIcon /> Continuă cu Google
      </button>

      <div className="my-5 flex items-center gap-3 text-xs uppercase tracking-wide text-fg-muted">
        <div className="h-px flex-1 bg-border" />
        sau
        <div className="h-px flex-1 bg-border" />
      </div>

      <form onSubmit={submit} className="space-y-3">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="tu@email.com"
          autoComplete="email"
          className="h-12 w-full rounded-[12px] border border-border bg-surface-2 px-4 text-base outline-none focus:border-primary"
        />
        <input
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Parolă"
          autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
          className="h-12 w-full rounded-[12px] border border-border bg-surface-2 px-4 text-base outline-none focus:border-primary"
        />
        <button
          type="submit"
          disabled={busy}
          className="h-12 w-full rounded-[12px] bg-gold font-bold text-black disabled:opacity-50"
        >
          {mode === 'signin' ? 'Conectare' : 'Creează cont'}
        </button>
      </form>

      <button
        type="button"
        onClick={magic}
        disabled={busy}
        className="mt-3 flex h-11 w-full items-center justify-center gap-2 rounded-[12px] bg-surface-2 text-sm font-semibold disabled:opacity-50"
      >
        <Mail size={16} /> Link pe email
      </button>

      {msg && <p className="mt-4 text-center text-sm text-fg-muted">{msg}</p>}

      <button
        type="button"
        onClick={() => {
          setMode((m) => (m === 'signin' ? 'signup' : 'signin'))
          setMsg(null)
        }}
        className="mt-6 text-center text-sm text-fg-muted underline"
      >
        {mode === 'signin'
          ? 'Cont nou? Creează unul'
          : 'Ai deja cont? Conectează-te'}
      </button>
    </div>
  )
}
