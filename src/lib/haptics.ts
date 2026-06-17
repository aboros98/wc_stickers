// Lightweight haptic feedback via the Vibration API (no-op where unsupported).

type HapticKind = 'selection' | 'success' | 'warning'

const patterns: Record<HapticKind, number | number[]> = {
  selection: 8,
  success: [12, 30, 60],
  warning: [20, 40, 20],
}

export function haptic(kind: HapticKind): void {
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    try {
      navigator.vibrate(patterns[kind])
    } catch {
      /* ignore — some browsers throw on rapid calls */
    }
  }
}
