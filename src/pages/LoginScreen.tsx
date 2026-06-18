import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../auth/AuthProvider'
import wc26 from '../assets/wc2026.webp'

function GoogleIcon() {
  return (
    <svg viewBox="0 0 48 48" width="20" height="20" aria-hidden="true">
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

/** Map common Supabase auth errors to friendly Romanian copy. */
function friendlyError(msg: string): string {
  const m = msg.toLowerCase()
  if (m.includes('invalid login')) return 'Email sau parolă greșită.'
  if (m.includes('already registered') || m.includes('already exists'))
    return 'Există deja un cont cu acest email. Conectează-te.'
  if (m.includes('password should be')) return 'Parola trebuie să aibă minim 6 caractere.'
  if (m.includes('email not confirmed'))
    return 'Confirmă emailul înainte de conectare.'
  if (m.includes('unable to validate email') || m.includes('invalid email'))
    return 'Adresă de email invalidă.'
  return msg
}

export function LoginScreen() {
  const { signInWithGoogle, signInWithPassword, signUp } = useAuth()
  const [mode, setMode] = useState<'in' | 'up'>('in')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [msg, setMsg] = useState<string | null>(null)
  const [info, setInfo] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setMsg(null)
    setInfo(null)
    setBusy(true)
    if (mode === 'in') {
      const { error } = await signInWithPassword(email.trim(), password)
      if (error) setMsg(friendlyError(error))
    } else {
      const { error, needsConfirmation } = await signUp(
        email.trim(),
        password,
        name.trim() || undefined,
      )
      if (error) setMsg(friendlyError(error))
      else if (needsConfirmation)
        setInfo('Ți-am trimis un email de confirmare. Confirmă-l, apoi conectează-te.')
      // otherwise the auth listener logs you in automatically
    }
    setBusy(false)
  }

  const onGoogle = async () => {
    setMsg(null)
    setInfo(null)
    setBusy(true)
    const { error } = await signInWithGoogle()
    if (error) {
      setMsg(friendlyError(error))
      setBusy(false)
    }
    // on success a full-page OAuth redirect takes over, so leave busy on
  }

  const swap = () => {
    setMode((m) => (m === 'in' ? 'up' : 'in'))
    setMsg(null)
    setInfo(null)
  }

  const field =
    'h-12 w-full rounded-[12px] border border-border bg-surface-2 px-3.5 text-base outline-none focus:border-turquoise'

  return (
    <div className="mx-auto flex min-h-dvh max-w-sm flex-col justify-center px-6 py-8">
      <section className="anim-fade-up relative mb-6 overflow-hidden rounded-[24px] border border-border bg-gradient-to-br from-surface-2 to-surface p-7 text-center">
        <div className="pointer-events-none absolute -top-10 left-1/2 h-40 w-40 -translate-x-1/2 rounded-full bg-gold/15 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-12 right-0 h-32 w-32 rounded-full bg-turquoise/15 blur-3xl" />
        <img
          src={wc26}
          alt="Cupa Mondială 2026"
          className="relative mx-auto h-auto w-[112px] drop-shadow-[0_12px_28px_rgba(0,0,0,0.2)]"
        />
        <p className="relative mt-4 font-display text-[10px] font-bold uppercase tracking-[0.25em] text-gold-text">
          Cupa Mondială 2026
        </p>
        <h1 className="relative mt-1 font-display text-3xl font-extrabold">
          Album Abțibilduri
        </h1>
        <p className="relative mt-2 text-sm text-fg-muted">
          Deschide pachetul. Adună toate 980.
        </p>
      </section>

      <button
        type="button"
        onClick={onGoogle}
        disabled={busy}
        className="anim-fade-up flex w-full items-center justify-center gap-3 rounded-[12px] bg-white py-3.5 text-base font-bold text-[#1f1f1f] shadow-sm ring-1 ring-black/5 transition active:scale-[0.98] disabled:opacity-60"
        style={{ animationDelay: '80ms' }}
      >
        <GoogleIcon /> Continuă cu Google
      </button>

      <div
        className="anim-fade-up my-4 flex items-center gap-3 text-[11px] font-semibold uppercase tracking-wider text-fg-muted/70"
        style={{ animationDelay: '120ms' }}
      >
        <span className="h-px flex-1 bg-border" />
        sau cu email
        <span className="h-px flex-1 bg-border" />
      </div>

      <form
        onSubmit={submit}
        className="anim-fade-up space-y-2.5"
        style={{ animationDelay: '160ms' }}
      >
        {mode === 'up' && (
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Numele tău"
            autoComplete="name"
            className={field}
          />
        )}
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          autoComplete="email"
          autoCapitalize="off"
          required
          className={field}
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Parolă"
          autoComplete={mode === 'in' ? 'current-password' : 'new-password'}
          required
          className={field}
        />

        {msg && (
          <p role="alert" className="text-center text-sm font-semibold text-danger">
            {msg}
          </p>
        )}
        {info && (
          <p
            role="status"
            className="text-center text-sm font-semibold text-turquoise-text"
          >
            {info}
          </p>
        )}

        <button
          type="submit"
          disabled={busy}
          className="w-full rounded-[12px] bg-primary py-3.5 text-base font-bold text-black transition active:scale-[0.98] disabled:opacity-50"
        >
          {busy ? 'Un moment…' : mode === 'in' ? 'Conectează-te' : 'Creează cont'}
        </button>
      </form>

      <button
        type="button"
        onClick={swap}
        className="mt-3 text-center text-sm text-fg-muted"
      >
        {mode === 'in' ? (
          <>
            N-ai cont?{' '}
            <span className="font-semibold text-turquoise-text">Creează unul</span>
          </>
        ) : (
          <>
            Ai deja cont?{' '}
            <span className="font-semibold text-turquoise-text">
              Conectează-te
            </span>
          </>
        )}
      </button>

      <p className="mt-6 text-center text-[11px] text-fg-muted/70">
        <Link to="/privacy" className="underline-offset-2 hover:underline">
          Confidențialitate
        </Link>
        <span className="mx-1.5">·</span>
        <Link to="/terms" className="underline-offset-2 hover:underline">
          Termeni
        </Link>
      </p>
    </div>
  )
}
