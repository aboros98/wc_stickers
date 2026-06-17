import type { ReactNode } from 'react'
import { TabBar } from './TabBar'

/** App layout: centered mobile column with room for the fixed tab bar. */
export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto min-h-dvh max-w-2xl pb-24">
      {children}
      <TabBar />
    </div>
  )
}
