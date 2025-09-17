export type ToastVariant = 'default' | 'success' | 'error' | 'warning' | 'info'

export type ToastPayload = {
  id?: string
  title?: string
  description?: string
  variant?: ToastVariant
  durationMs?: number
}

export type ToastItem = Required<Pick<ToastPayload, 'id' | 'variant' | 'durationMs'>> & Omit<ToastPayload, 'id' | 'variant' | 'durationMs'>

let counter = 0
const genId = () => `${Date.now()}_${counter++}`

// Subscribers receive the current list of toasts
const listeners = new Set<(toasts: ToastItem[]) => void>()
let toasts: ToastItem[] = []

function notify() {
  for (const l of listeners) l(toasts)
}

export function subscribe(listener: (toasts: ToastItem[]) => void): () => void {
  listeners.add(listener)
  // initial push
  listener(toasts)
  return () => {
    listeners.delete(listener)
  }
}

export function dismiss(id: string) {
  toasts = toasts.filter(t => t.id !== id)
  notify()
}

export function toast(payload: ToastPayload | string) {
  const t: ToastItem = {
    id: typeof payload === 'string' ? genId() : payload.id ?? genId(),
    title: typeof payload === 'string' ? undefined : payload.title,
    description: typeof payload === 'string' ? payload : payload.description,
    variant: typeof payload === 'string' ? 'default' : payload.variant ?? 'default',
    durationMs: typeof payload === 'string' ? 3500 : payload.durationMs ?? 3500,
  }

  toasts = [...toasts, t]
  notify()

  if (t.durationMs && t.durationMs > 0) {
    setTimeout(() => dismiss(t.id), t.durationMs)
  }

  return t.id
}

// Convenience helpers
toast.success = (description: string, opts: Omit<ToastPayload, 'description' | 'variant'> = {}) =>
  toast({ ...opts, description, variant: 'success' })

toast.error = (description: string, opts: Omit<ToastPayload, 'description' | 'variant'> = {}) =>
  toast({ ...opts, description, variant: 'error' })

toast.info = (description: string, opts: Omit<ToastPayload, 'description' | 'variant'> = {}) =>
  toast({ ...opts, description, variant: 'info' })

toast.warning = (description: string, opts: Omit<ToastPayload, 'description' | 'variant'> = {}) =>
  toast({ ...opts, description, variant: 'warning' })

// note: `dismiss` is already exported via its function declaration above; avoid duplicate export
