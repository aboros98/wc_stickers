import { useState } from 'react'
import { SectionHeader } from './SectionHeader'
import { StickerGrid } from './StickerGrid'
import type { CollectionItem, CountrySection } from '../lib/types'

interface Props {
  section: CountrySection
  defaultOpen?: boolean
  onSetCount: (stickerId: number, count: number) => void
  onLongPress: (item: CollectionItem) => void
}

/** Collapsible team section; the grid only renders while open. */
export function SectionAccordion({
  section,
  defaultOpen = false,
  onSetCount,
  onLongPress,
}: Props) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="scroll-mt-28" id={`sec-${section.code}`}>
      <SectionHeader
        name={section.name}
        code={section.code}
        have={section.have}
        total={section.total}
        open={open}
        onToggle={() => setOpen((o) => !o)}
      />
      {open && (
        <div className="px-1 pb-3 pt-2">
          <StickerGrid
            items={section.items}
            onSetCount={onSetCount}
            onLongPress={onLongPress}
          />
        </div>
      )}
    </div>
  )
}
