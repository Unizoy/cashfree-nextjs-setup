import { Cashfree, CashfreeConfig } from "@cashfreepayments/cashfree-sdk"

const config: CashfreeConfig = {
  apiKey: process.env.NEXT_PUBLIC_CASHFREE_APP_ID!,
  secretKey: process.env.CASHFREE_SECRET_KEY!,
  environment: process.env.NODE_ENV === "production" ? "PRODUCTION" : "SANDBOX",
}

export const cashfree = new Cashfree(config)
