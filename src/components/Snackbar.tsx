interface Props {
  message: string
  actionLabel?: string
  onAction?: () => void
}

/** Transient bottom pill (floats above the tab bar). Used for undo actions. */
export function Snackbar({ message, actionLabel, onAction }: Props) {
  return (
    <div className="anim-fade-up pointer-events-none fixed inset-x-0 bottom-[calc(5.25rem+env(safe-area-inset-bottom))] z-50 flex justify-center px-4">
      <div className="pointer-events-auto flex items-center gap-4 rounded-full bg-fg px-4 py-2.5 text-background shadow-[0_12px_40px_-8px_rgba(0,0,0,0.6)]">
        <span className="text-sm font-semibold">{message}</span>
        {actionLabel && (
          <button
            type="button"
            onClick={onAction}
            className="text-sm font-extrabold text-turquoise active:opacity-70"
          >
            {actionLabel}
          </button>
        )}
      </div>
    </div>
  )
}
