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

export function LoginScreen() {
  const { signInWithGoogle } = useAuth()

  return (
    <div className="mx-auto flex min-h-dvh max-w-sm flex-col justify-center px-6 py-8">
      <section className="anim-fade-up relative mb-6 overflow-hidden rounded-[24px] border border-border bg-gradient-to-br from-surface-2 to-surface p-7 text-center">
        <div className="pointer-events-none absolute -top-10 left-1/2 h-40 w-40 -translate-x-1/2 rounded-full bg-gold/15 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-12 right-0 h-32 w-32 rounded-full bg-turquoise/15 blur-3xl" />
        <img
          src={wc26}
          alt="Cupa Mondială 2026"
          className="relative mx-auto h-auto w-[126px] drop-shadow-[0_12px_28px_rgba(0,0,0,0.2)]"
        />
        <p className="relative mt-5 font-display text-[10px] font-bold uppercase tracking-[0.25em] text-gold">
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
        onClick={() => signInWithGoogle()}
        className="anim-fade-up flex w-full items-center justify-center gap-3 rounded-[14px] bg-white py-3.5 text-base font-bold text-[#1f1f1f] shadow-sm ring-1 ring-black/5 active:scale-[0.98]"
        style={{ animationDelay: '120ms' }}
      >
        <GoogleIcon /> Continuă cu Google
      </button>
    </div>
  )
}
