// app/api/webhooks/cashfree/route.ts

import crypto from "crypto"
import { NextRequest, NextResponse } from "next/server"
import { Cashfree } from "cashfree-pg"

import { processWebhook } from "@/lib/webhook-processor"

// Initialize Cashfree SDK
Cashfree.XClientId = process.env.NEXT_PUBLIC_CASHFREE_APP_ID!
Cashfree.XClientSecret = process.env.CASHFREE_SECRET_KEY!
Cashfree.XEnvironment =
  process.env.NEXT_PUBLIC_CASHFREE_ENVIRONMENT === "SANDBOX"
    ? Cashfree.Environment.SANDBOX
    : Cashfree.Environment.PRODUCTION

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text()
    const parsedBody = JSON.parse(rawBody)
    const signature = req.headers.get("x-webhook-signature") || ""
    const timestamp = req.headers.get("x-webhook-timestamp") || ""

    if (!signature || !timestamp) {
      console.error("Missing required headers")
      return NextResponse.json(
        { success: false, error: "Missing required headers" },
        { status: 400 }
      )
    }

    // Verify webhook signature
    const isValidSignature = verifyWebhookSignature(
      timestamp,
      rawBody,
      signature
    )

    if (!isValidSignature) {
      console.error("Invalid webhook signature")
      return NextResponse.json(
        { success: false, error: "Invalid signature" },
        { status: 400 }
      )
    }

    // Process the webhook
    await processWebhook(parsedBody)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Webhook processing error:", error)
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to process webhook",
      },
      { status: 500 }
    )
  }
}

function verifyWebhookSignature(
  timestamp: string,
  rawBody: string,
  receivedSignature: string
): boolean {
  const secretKey = process.env.CASHFREE_SECRET_KEY!
  const data = timestamp + rawBody
  const computedSignature = crypto
    .createHmac("sha256", secretKey)
    .update(data)
    .digest("base64")
  return computedSignature === receivedSignature
}
