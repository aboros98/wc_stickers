import { useEffect, useRef, useState } from 'react'
import QrScanner from 'qr-scanner'
import { Sheet } from './Sheet'

interface Props {
  open: boolean
  onClose: () => void
  onResult: (text: string) => void
}

/** Camera QR scanner in a bottom sheet. Starts the camera only while open. */
export function QrScannerSheet({ open, onClose, onResult }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const onResultRef = useRef(onResult)
  onResultRef.current = onResult
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open || !videoRef.current) return
    setError(null)
    let handled = false
    const scanner = new QrScanner(
      videoRef.current,
      (res) => {
        if (handled) return
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
        setError(
          'Camera indisponibilă — verifică permisiunile sau lipește linkul mai jos.',
        ),
      )
    return () => {
      scanner.stop()
      scanner.destroy()
    }
  }, [open])

  return (
    <Sheet open={open} onClose={onClose} title="Scanează codul prietenului">
      <div className="overflow-hidden rounded-[12px] bg-black">
        <video ref={videoRef} className="aspect-square w-full object-cover" />
      </div>
      <p
        className={`mt-3 text-center text-sm ${error ? 'text-danger' : 'text-fg-muted'}`}
      >
        {error ?? 'Îndreaptă camera spre codul QR.'}
      </p>
    </Sheet>
  )
}
