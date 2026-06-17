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

/** Original gold foil sticker-pack with an embossed "26" — homage, not the official emblem. */
function FoilPack({ reduced }: { reduced: boolean }) {
  return (
    <div
      className="anim-fade-up relative mx-auto w-[180px]"
      style={{ animationDelay: '80ms' }}
    >
      <div className="anim-float">
        <div className="anim-sheen relative aspect-[5/6] rotate-[-3deg] overflow-hidden rounded-2xl shadow-[0_22px_60px_-22px] shadow-gold/50">
          <div
            className="h-full w-full"
            style={
              reduced
                ? undefined
                : { animation: 'pop 0.5s cubic-bezier(.2,.7,.2,1) 80ms both' }
            }
          >
            <svg viewBox="0 0 200 240" className="block h-full w-full" aria-hidden="true">
              <defs>
                <linearGradient
                  id="foil"
                  x1="0"
                  y1="0"
                  x2="1"
                  y2="1"
                  gradientTransform="rotate(120 0.5 0.5)"
                >
                  <stop offset="0%" stopColor="#B8860B" />
                  <stop offset="28%" stopColor="#E1B530" />
                  <stop offset="50%" stopColor="#F7E7A6" />
                  <stop offset="72%" stopColor="#E1B530" />
                  <stop offset="100%" stopColor="#B8860B" />
                </linearGradient>
                <linearGradient id="curve" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#fff" stopOpacity="0.18" />
                  <stop offset="55%" stopColor="#fff" stopOpacity="0" />
                </linearGradient>
              </defs>
              <rect x="0" y="0" width="200" height="240" fill="url(#foil)" />
              <rect x="0" y="0" width="200" height="240" fill="url(#curve)" />
              <rect x="0" y="0" width="200" height="28" fill="#B8860B" opacity="0.5" />
              <line x1="6" y1="28" x2="194" y2="28" stroke="#0A0A0C" strokeOpacity="0.4" strokeWidth="1" strokeDasharray="2 4" />
              <line x1="6" y1="6" x2="194" y2="6" stroke="#0A0A0C" strokeOpacity="0.4" strokeWidth="1" strokeDasharray="2 4" />
              <text x="100" y="129" textAnchor="middle" fontFamily="Archivo, sans-serif" fontWeight="900" fontSize="92" fill="#F7E7A6" opacity="0.5">
                26
              </text>
              <text x="100" y="130" textAnchor="middle" fontFamily="Archivo, sans-serif" fontWeight="900" fontSize="92" fill="#0A0A0C">
                26
              </text>
              <path
                d="M150 150 l4.2 8.5 9.4 1.4 -6.8 6.6 1.6 9.3 -8.4 -4.4 -8.4 4.4 1.6 -9.3 -6.8 -6.6 9.4 -1.4 Z"
                fill="none"
                stroke="#0A0A0C"
                strokeOpacity="0.55"
                strokeWidth="2"
              />
              <circle cx="46" cy="170" r="5" fill="#0A0A0C" opacity="0.45" />
              <rect x="4" y="4" width="192" height="232" rx="12" fill="none" stroke="#F7E7A6" strokeOpacity="0.5" strokeWidth="1.5" />
              <circle cx="36" cy="60" r="1" fill="#fff" opacity="0.8" />
              <circle cx="170" cy="92" r="1" fill="#fff" opacity="0.7" />
              <circle cx="120" cy="200" r="1" fill="#fff" opacity="0.6" />
            </svg>
          </div>
        </div>
      </div>
    </div>
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
  const [reduced] = useState(
    () =>
      typeof window !== 'undefined' &&
      !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches,
  )

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
    <div className="relative mx-auto flex min-h-dvh max-w-sm flex-col justify-center overflow-hidden px-6">
      <div className="anim-float pointer-events-none absolute left-1/2 top-[10%] -z-10 size-[340px] -translate-x-1/2 rounded-full bg-gold/25 blur-3xl" />

      <p
        className="anim-fade-up text-center font-display text-xs font-bold uppercase tracking-[0.25em] text-gold"
        style={{ animationDelay: '0ms' }}
      >
        Cupa Mondială 2026
      </p>

      <div className="my-5">
        <FoilPack reduced={reduced} />
      </div>

      <div
        className="anim-fade-up text-center"
        style={{ animationDelay: '200ms' }}
      >
        <h1 className="font-display text-4xl font-extrabold">Album Abțibilduri</h1>
        <p className="mt-2 text-sm text-fg-muted">
          Deschide pachetul. Adună toate 980.
        </p>
      </div>

      <button
        type="button"
        onClick={() => signInWithGoogle()}
        className="anim-fade-up mt-7 flex h-12 w-full items-center justify-center gap-3 rounded-[12px] bg-white font-bold text-[#1f1f1f] active:scale-95"
        style={{ animationDelay: '320ms' }}
      >
        <GoogleIcon /> Continuă cu Google
      </button>

      <div
        className="anim-fade-up my-5 flex items-center gap-3 text-xs uppercase tracking-wide text-fg-muted"
        style={{ animationDelay: '400ms' }}
      >
        <div className="h-px flex-1 bg-border" />
        sau
        <div className="h-px flex-1 bg-border" />
      </div>

      <form
        onSubmit={submit}
        className="anim-fade-up space-y-3"
        style={{ animationDelay: '460ms' }}
      >
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
          className="h-12 w-full rounded-[12px] bg-gold font-bold text-black active:scale-[0.98] disabled:opacity-50"
        >
          {mode === 'signin' ? 'Conectare' : 'Creează cont'}
        </button>
      </form>

      <button
        type="button"
        onClick={magic}
        disabled={busy}
        className="anim-fade-up mt-3 flex h-11 w-full items-center justify-center gap-2 rounded-[12px] bg-surface-2 text-sm font-semibold active:scale-95 disabled:opacity-50"
        style={{ animationDelay: '520ms' }}
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
        className="anim-fade-up mt-6 text-center text-sm text-fg-muted underline"
        style={{ animationDelay: '580ms' }}
      >
        {mode === 'signin'
          ? 'Cont nou? Creează unul'
          : 'Ai deja cont? Conectează-te'}
      </button>
    </div>
  )
}
