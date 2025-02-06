import { NextRequest, NextResponse } from "next/server"
import { OrderStatus } from "@prisma/client"
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

  const { orderId } = await req.json()
  if (!orderId) {
    return NextResponse.json(
      { success: false, error: "Invalid order ID" },
      { status: 400 }
    )
  }

  try {
    const order = await db.order.findUnique({ where: { orderId } })
    if (!order) {
      return NextResponse.json(
        { success: false, error: "Order not found" },
        { status: 404 }
      )
    }

    if (
      order.status === OrderStatus.PAID ||
      order.status === OrderStatus.FAILED
    ) {
      return NextResponse.json({
        success: true,
        status: order.status,
        message: `Payment ${order.status.toLowerCase()}`,
      })
    }

    Cashfree.XClientId = process.env.NEXT_PUBLIC_CASHFREE_APP_ID!
    Cashfree.XClientSecret = process.env.CASHFREE_SECRET_KEY!
    Cashfree.XEnvironment =
      process.env.NEXT_PUBLIC_CASHFREE_ENVIRONMENT === "SANDBOX"
        ? Cashfree.Environment.SANDBOX
        : Cashfree.Environment.PRODUCTION

    const cashfreeResponse = await Cashfree.PGOrderFetchPayments(
      "2023-08-01",
      orderId
    )

    if (!cashfreeResponse.data || cashfreeResponse.data.length === 0) {
      console.log("No payment information found")
      return NextResponse.json({
        success: false,
        status: OrderStatus.PENDING,
        message: "Payment information not available",
      })
    }

    const latestPayment =
      cashfreeResponse.data[cashfreeResponse.data.length - 1]

    if (latestPayment.payment_status === "SUCCESS") {
      const updatedOrder = await db.$transaction(async (tx) => {
        // Update user subscription status
        await tx.user.update({
          where: { id: userId },
          data: {
            isPro: true,
            subscriptionStartDate: new Date(),
          },
        })

        // Update order status
        return tx.order.update({
          where: { orderId },
          data: { status: OrderStatus.PAID },
        })
      })

      return NextResponse.json({
        success: true,
        status: updatedOrder.status,
        message: `Payment ${updatedOrder.status.toLowerCase()}`,
      })
    }

    if (latestPayment.payment_status === "FAILED") {
      const updatedOrder = await db.order.update({
        where: { orderId },
        data: { status: OrderStatus.FAILED },
      })

      return NextResponse.json({
        success: true,
        status: updatedOrder.status,
        message: `Payment ${updatedOrder.status.toLowerCase()}`,
      })
    }

    // If we get here, the payment status is still pending
    return NextResponse.json({
      success: true,
      status: OrderStatus.PENDING,
      message: "Payment pending",
    })
  } catch (error) {
    console.error("Error processing payment:", error)
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to process payment",
      },
      { status: 500 }
    )
  }
}
