import { NextRequest, NextResponse } from "next/server"
import { Cashfree } from "cashfree-pg"

import { db } from "@/lib/db"
import { getCurrentUser } from "@/lib/session"

export async function POST(req: NextRequest) {
  const user = await getCurrentUser()
  const userId = user?.id

  if (!userId) {
    return NextResponse.json(
      { success: false, error: "User not found" },
      { status: 404 }
    )
  }
  const existingUser = await db.user.findUnique({ where: { id: user?.id } })
  if (!existingUser) {
    return NextResponse.json(
      { success: false, error: "User not found" },
      { status: 404 }
    )
  }
  console.log(existingUser.phoneNumber)
  console.log(typeof existingUser.phoneNumber)
  try {
    Cashfree.XClientId = process.env.NEXT_PUBLIC_CASHFREE_APP_ID!
    Cashfree.XClientSecret = process.env.CASHFREE_SECRET_KEY!
    Cashfree.XEnvironment =
      process.env.NEXT_PUBLIC_CASHFREE_ENVIRONMENT === "SANDBOX"
        ? Cashfree.Environment.SANDBOX
        : Cashfree.Environment.PRODUCTION

    const tempOrderId = `order_${userId}`

    const request = {
      order_amount: 122,
      order_currency: "INR",
      customer_details: {
        customer_id: userId,
        customer_name: existingUser.name ?? undefined,
        customer_email: existingUser.email ?? undefined,
        // needs to be at least 10 digits (with optional country code)
        customer_phone: existingUser.phoneNumber
          ? String(existingUser.phoneNumber)
          : "+919090407368",
      },
      order_meta: {
        return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing?order_id=${tempOrderId}`,
        notify_url: `${process.env.NEXT_PUBLIC_CASHFREE_WEBHOOK_ENDPOINT}/api/payments/webhook`,
      },
      order_note: "Purchase of upgrade",
    }
    const response = await Cashfree.PGCreateOrder("2023-08-01", request)
    console.log({ response })
    if (
      !response.data ||
      !response.data.payment_session_id ||
      !response.data.order_id
    ) {
      console.error("Failed to create Cashfree order:", response.data)
      return NextResponse.json(
        { success: false, error: "Failed to create Cashfree order" },
        { status: 500 }
      )
    }

    await db.order.create({
      data: {
        userId: userId,
        orderId: response.data.order_id,
        amount: 122,
        status: "PENDING",
        paymentSessionId: response.data.payment_session_id,
      },
    })

    return NextResponse.json({
      success: true,
      message: "Order created successfully",
      data: {
        payment_session_id: response.data.payment_session_id,
        order_id: response.data.order_id,
        pricing: 122,
      },
    })
  } catch (error) {
    console.error("Error during order creation:", error)
    return NextResponse.json(
      { success: false, error: "Order creation failed" },
      { status: 500 }
    )
  }
}
