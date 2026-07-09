export interface PaystackResponse {
  reference: string
  trans: string
  status: 'success' | 'cancelled'
  message: string
  transaction: string
  trxref: string
}

export interface PaystackConfig {
  key: string
  email: string
  amount: number
  ref: string
  metadata: Record<string, unknown>
  onSuccess: (response: PaystackResponse) => void
  onCancel: () => void
  onError?: () => void
}

declare global {
  interface Window {
    PaystackPop: {
      setup: (config: PaystackConfig) => { openIframe: () => void }
    }
  }
}

export function loadPaystackScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if ((window as any).PaystackPop) return resolve()
    const s = document.createElement('script')
    s.src = 'https://js.paystack.co/v1/inline.js'
    s.onload = () => resolve()
    s.onerror = () => reject(new Error('Failed to load Paystack'))
    document.head.appendChild(s)
  })
}

export function openPaystack(config: PaystackConfig) {
  const handler = window.PaystackPop.setup(config)
  handler.openIframe()
}
