export function SpectatorOverlay({ text = 'cant interact' }: { text?: string }) {
  return (
    <div className="absolute inset-0 grid place-items-center bg-black/20 rounded-xl">
      <div className="px-3 py-1 text-xs font-semibold bg-white/90 text-black rounded">
        {text}
      </div>
    </div>
  )
}