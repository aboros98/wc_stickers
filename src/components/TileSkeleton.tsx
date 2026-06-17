/** On-brand shimmer placeholder used while the collection loads. */
export function TileSkeleton({ className = '' }: { className?: string }) {
  return <div className={`shimmer rounded-[12px] ${className}`} />
}
