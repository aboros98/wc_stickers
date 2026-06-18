import { useEffect, useRef, useState } from 'react'
import QrScanner from 'qr-scanner'
import { Sheet } from './Sheet'

interface Props {
  open: boolean
  onClose: () => void
  onResult: (text: string) => void
}

/** Accept only QRs that look like a friend code or invite link. */
const looksLikeCode = (t: string) =>
  /add=[A-Za-z0-9]+/.test(t) || /^[A-Za-z0-9]{4,16}$/.test(t.trim())

/** Camera QR scanner in a bottom sheet. Starts the camera only while open. */
export function QrScannerSheet({ open, onClose, onResult }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const onResultRef = useRef(onResult)
  onResultRef.current = onResult
  const [error, setError] = useState<string | null>(null)
  const [invalid, setInvalid] = useState(false)

  useEffect(() => {
    if (!open || !videoRef.current) return
    setError(null)
    setInvalid(false)
    let handled = false
    const scanner = new QrScanner(
      videoRef.current,
      (res) => {
        if (handled) return
        if (!looksLikeCode(res.data)) {
          setInvalid(true) // keep scanning; just flag it instead of tearing down
          return
        }
        handled = true
        onResultRef.current(res.data)
      },
      {
        returnDetailedScanResult: true,
        highlightScanRegion: true,
        highlightCodeOutline: true,
      },
    )
    scanner
      .start()
      .catch(() =>
        setError('Camera indisponibilă. Închide și folosește câmpul „Cod sau link”.'),
      )
    return () => {
      scanner.stop()
      scanner.destroy()
    }
  }, [open])

  const isError = Boolean(error) || invalid
  const message =
    error ??
    (invalid
      ? 'Codul QR nu pare valid. Încearcă altul.'
      : 'Îndreaptă camera spre codul QR.')

  return (
    <Sheet open={open} onClose={onClose} title="Scanează codul prietenului">
      <div className="overflow-hidden rounded-[12px] bg-black">
        <video ref={videoRef} className="aspect-square w-full object-cover" />
      </div>
      <p
        role={isError ? 'alert' : 'status'}
        aria-live="polite"
        className={`mt-3 text-center text-sm ${isError ? 'text-danger' : 'text-fg-muted'}`}
      >
        {message}
      </p>
    </Sheet>
  )
}
