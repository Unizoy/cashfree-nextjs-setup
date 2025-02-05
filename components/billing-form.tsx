"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { load } from "@cashfreepayments/cashfree-js"

import { UserSubscriptionPlan } from "types"
import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { toast } from "@/components/ui/use-toast"
import { Icons } from "@/components/icons"

interface BillingFormProps extends React.HTMLAttributes<HTMLFormElement> {
  subscriptionPlan: UserSubscriptionPlan
  // & { isCanceled: boolean }
}

export function BillingForm({
  subscriptionPlan,
  className,
  ...props
}: BillingFormProps) {
  const [isLoading, setIsLoading] = React.useState(false)

  let cashfree
  var initializeSDK = async function () {
    cashfree = await load({
      mode: "sandbox",
    })
  }
  initializeSDK()

  const router = useRouter()
  const fetchCashfreeSession = async () => {
    try {
      const response = await fetch("/api/payments/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderAmount: 499 }),
      })
      if (!response.ok) throw new Error("Failed to fetch Cashfree session.")

      const data = await response.json()
      // console.log("API Response:", data)
      if (data.success && data.data && data.data.payment_session_id) {
        return {
          paymentSessionId: data.data.payment_session_id,
          orderId: data.data.order_id,
        }
      } else {
        throw new Error("Payment session ID not found in response.")
      }
    } catch (error) {
      toast({
        title: "Payment Error",
        description: "Unable to process your request. Please try again.",
        variant: "destructive",
      })
      return null
    }
  }

  const pollOrderStatus = React.useCallback(
    async (orderId: string) => {
      const pollInterval = 2000
      const maxAttempts = 2 // Increased to account for longer processing times

      for (let attempt = 0; attempt < maxAttempts; attempt++) {
        try {
          const response = await fetch("/api/payments/process", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ orderId }),
          })

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`)
          }

          const data = await response.json()
          console.log({ data })
          if (data.status === "PAID") {
            toast({
              title: "Payment Successful!",
              description: "You are now subscribed to the PRO plan.",
              variant: "default",
            })
            router.push("/dashboard/settings")
            return
          } else if (data.status === "FAILED") {
            toast({
              title: "Payment Failed",
              description:
                data.errorDetails?.errorDescription ||
                "Payment failed. Please try again.",
              variant: "destructive",
            })
            return
          } else if (data.status === "PENDING") {
            // Continue polling
            await new Promise((resolve) => setTimeout(resolve, pollInterval))
          } else {
            // Unexpected status
            console.error("Unexpected payment status:", data.status)
            toast({
              title: "Payment Error",
              description: "Unable to process your request. Please try again.",
              variant: "destructive",
            })
            return
          }
        } catch (error) {
          console.error("Polling Error:", error)
          // Don't break the loop on error, try again
        }
      }

      // If we've reached here, we've exceeded max attempts
      toast({
        title:
          "Unable to confirm payment status. Please check your account or contact support.",
        variant: "destructive",
      })
    },
    [router]
  )

  const handleSubmit = React.useCallback(
    async (event: React.FormEvent) => {
      event.preventDefault()
      setIsLoading(true)

      const sessionData = await fetchCashfreeSession()

      if (!sessionData) {
        console.error("Failed to retrieve payment session data.")
        setIsLoading(false)
        return
      }

      const { paymentSessionId, orderId } = sessionData

      if (paymentSessionId) {
        if (!cashfree) {
          toast({
            title: "SDK Load Error",
            description: "Failed to load Cashfree SDK. Please try again.",
            variant: "destructive",
          })
          return
        }

        const checkoutOptions = {
          paymentSessionId,
          redirectTarget: "_modal",
        }
        await cashfree.checkout(checkoutOptions)
        await pollOrderStatus(orderId)
      } else {
        console.error("Failed to retrieve payment session ID.")
      }

      setIsLoading(false)
    },
    [cashfree, pollOrderStatus]
  )

  return (
    <form className={cn(className)} onSubmit={handleSubmit} {...props}>
      <Card>
        <CardHeader>
          <CardTitle>Subscription Plan</CardTitle>
          <CardDescription>
            You are currently on the <strong>{subscriptionPlan.name}</strong>{" "}
            plan.
          </CardDescription>
        </CardHeader>
        <CardContent>{subscriptionPlan.description}</CardContent>
        <CardFooter className="flex flex-col items-start space-y-2 md:flex-row md:justify-between">
          {!subscriptionPlan.isPro && (
            <button
              type="submit"
              className={cn(buttonVariants(), "flex items-center")}
              disabled={isLoading}
            >
              {isLoading && (
                <Icons.spinner className="mr-2 size-4 animate-spin" />
              )}
              Upgrade to PRO
            </button>
          )}
        </CardFooter>
      </Card>
    </form>
  )
}
