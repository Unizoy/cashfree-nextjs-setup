declare module "@cashfreepayments/cashfree-js" {
  export interface CashfreeConfig {
    mode: "sandbox" | "production"
  }

  export interface PaymentSessionConfig {
    paymentSessionId: string
    orderId?: string
    returnUrl?: string
    onSuccess?: (data: any) => void
    onFailure?: (data: any) => void
    onClose?: () => void
  }

  export interface Cashfree {
    initialiseDropin: (
      element: HTMLElement,
      config: PaymentSessionConfig
    ) => Promise<void>
  }

  export function load(config: CashfreeConfig): Promise<Cashfree>
}
