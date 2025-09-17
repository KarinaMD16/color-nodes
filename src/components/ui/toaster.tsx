import React from 'react'
import { dismiss, subscribe, type ToastItem } from '@/lib/toast'
import { cn } from '@/lib/utils'

function VariantIcon({ variant }: { variant: ToastItem['variant'] }) {
  const common = 'w-4 h-4'
  switch (variant) {
    case 'success':
      return (
        <svg className={common} viewBox="0 0 24 24" fill="none"><path d="M20 7L9 18l-5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
      )
    case 'error':
      return (
        <svg className={common} viewBox="0 0 24 24" fill="none"><path d="M12 9v4m0 4h.01M10 3h4l7 7v4l-7 7h-4l-7-7v-4l7-7z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
      )
    case 'warning':
      return (
        <svg className={common} viewBox="0 0 24 24" fill="none"><path d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
      )
    case 'info':
      return (
        <svg className={common} viewBox="0 0 24 24" fill="none"><path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
      )
    default:
      return null
  }
}

const variantClasses: Record<ToastItem['variant'], string> = {
  default: 'bg-neutral-800 text-white border-neutral-700',
  success: 'bg-green-600 text-white border-green-500',
  error: 'bg-red-600 text-white border-red-500',
  warning: 'bg-yellow-600 text-black border-yellow-500',
  info: 'bg-blue-600 text-white border-blue-500',
}

export function Toaster() {
  const [items, setItems] = React.useState<ToastItem[]>([])

  React.useEffect(() => {
    return subscribe(setItems)
  }, [])

  return (
    <div className="pointer-events-none fixed inset-0 z-[100] flex flex-col items-center gap-2 p-4 sm:p-6">
      <div className="mx-auto flex w-full max-w-sm flex-col gap-2">
        {items.map((t) => (
          <div
            key={t.id}
            role="status"
            className={cn(
              'pointer-events-auto flex w-full items-start gap-3 rounded border p-3 shadow-lg ring-1 ring-black/5 animate-in fade-in-0 zoom-in-95',
              variantClasses[t.variant]
            )}
          >
            <div className="mt-1"><VariantIcon variant={t.variant} /></div>
            <div className="flex-1 text-sm">
              {t.title && <div className="font-semibold mb-0.5">{t.title}</div>}
              {t.description && <div className="opacity-90">{t.description}</div>}
            </div>
            <button
              onClick={() => dismiss(t.id)}
              className="nes-btn is-error is-small ml-2"
              aria-label="Close notification"
            >x</button>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Toaster
