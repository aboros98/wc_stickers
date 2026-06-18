import { Component, type ReactNode } from 'react'

interface Props {
  children: ReactNode
}
interface State {
  hasError: boolean
}

/** Last-resort fallback so a render-time throw never leaves a blank screen. */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  componentDidCatch(error: unknown) {
    console.error('Render error:', error)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="grid min-h-dvh place-items-center px-6 text-center">
          <div>
            <h1 className="font-display text-xl font-bold">A apărut o eroare</h1>
            <p className="mt-2 text-sm text-fg-muted">
              Ceva nu a funcționat. Reîncarcă pagina.
            </p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-4 rounded-[12px] bg-primary px-5 py-2.5 font-bold text-black active:scale-[0.98]"
            >
              Reîncarcă
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
