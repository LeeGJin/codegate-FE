import { createContext, useContext, useState, type ReactNode } from 'react'

type ToastType = 'error' | 'success'

const ToastContext = createContext<((message: string, type: ToastType) => void) | null>(null)

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null)

  function showToast(message: string, type: ToastType) {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  return (
    <ToastContext.Provider value={showToast}>
      {children}
      {toast && (
        <div
          className={`fixed bottom-8 left-1/2 z-50 -translate-x-1/2 rounded-xl px-4 py-3 text-sm font-bold text-white shadow-lg ${
            toast.type === 'error' ? 'bg-red-500' : 'bg-primary'
          }`}
        >
          {toast.message}
        </div>
      )}
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}
