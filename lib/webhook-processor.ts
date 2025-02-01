// lib/webhookProcessor.ts

import { OrderStatus } from "@prisma/client"

import { db } from "@/lib/db"

// types.ts
export interface WebhookData {
  data: {
    order: {
      order_id: string
      order_amount: number
      order_currency: string
    }
    payment: {
      cf_payment_id: string
      payment_status: string
      payment_amount: number
      payment_currency: string
      payment_message: string
      payment_time: string
    }
    customer_details: {
      customer_id: string
      customer_name: string
      customer_email: string
      customer_phone: string
    }
  }
  event_time: string
  type: string
}

export async function processWebhook(webhookData: WebhookData) {
  try {
    // Use Prisma transaction
    return await db.$transaction(async (tx) => {
      const order = await tx.order.findUnique({
        where: { orderId: webhookData.data.order.order_id },
      })

      if (!order) {
        throw new Error(`Order not found: ${webhookData.data.order.order_id}`)
      }

      switch (webhookData.type) {
        case "PAYMENT_SUCCESS_WEBHOOK":
        case "PAYMENT_SUCCESS":
          if (order.status !== OrderStatus.PAID) {
            // Update order status
            const updatedOrder = await tx.order.update({
              where: { orderId: webhookData.data.order.order_id },
              data: {
                status: OrderStatus.PAID,
              },
            })

            // Update user subscription
            await tx.user.update({
              where: { id: order.userId },
              data: {
                isPro: true,
                subscriptionStartDate: new Date(),
                // Add any other subscription-related fields
              },
            })

            return updatedOrder
          }
          break

        case "PAYMENT_FAILED_WEBHOOK":
        case "PAYMENT_FAILED":
          return await tx.order.update({
            where: { orderId: webhookData.data.order.order_id },
            data: {
              status: OrderStatus.FAILED,
            },
          })

        default:
          console.log(`Unhandled webhook event: ${webhookData.type}`)
          return order
      }
    })
  } catch (error) {
    console.error("Error processing webhook:", error)
    throw error
  }
}
