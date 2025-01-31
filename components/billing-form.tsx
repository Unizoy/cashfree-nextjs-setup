"use client"

import * as React from "react"
import { load } from "@cashfreepayments/cashfree-js"

import { UserSubscriptionPlan } from "types"
import { getCurrentUser } from "@/lib/session"
import { cn, formatDate } from "@/lib/utils"
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
  subscriptionPlan: UserSubscriptionPlan & { isCanceled: boolean }
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

  // Fetch Cashfree Payment Session
  const fetchCashfreeSession = async () => {
    try {
      const response = await fetch("/api/payments/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // body: JSON.stringify({
        //   userId: "", // Replace with actual user ID
        //   generations: 1, // Replace with actual generations count
        //   orderNote: "Your order note here", // Replace with actual order note
        //   // pricePerGeneration: subscriptionPlan.price, // Assuming price is part of the subscription plan
        // }),
      })
      if (!response.ok) throw new Error("Failed to fetch Cashfree session.")

      const data = await response.json()
      console.log("API Response:", data) // Log the entire response for debugging
      // Access the payment_session_id correctly
      if (data.success && data.data && data.data.payment_session_id) {
        return data.data.payment_session_id
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

  const handleSubmit = React.useCallback(async (event: React.FormEvent) => {
    event.preventDefault()
    setIsLoading(true)

    const paymentSessionId = await fetchCashfreeSession()
    if (paymentSessionId) {
      console.log("Payment Session ID:", paymentSessionId) // Log the session ID
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
    } else {
      console.error("Failed to retrieve payment session ID.")
    }

    setIsLoading(false)
  }, [])

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
          <button
            type="submit"
            className={cn(buttonVariants(), "flex items-center")}
            disabled={isLoading}
          >
            {isLoading && (
              <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
            )}
            {subscriptionPlan.isPro ? "Manage Subscription" : "Upgrade to PRO"}
          </button>
          {subscriptionPlan.isPro && (
            <p className="rounded-full text-xs font-medium">
              {subscriptionPlan.isCanceled
                ? "Your plan will be canceled on "
                : "Your plan renews on "}
              {formatDate(subscriptionPlan.stripeCurrentPeriodEnd)}.
            </p>
          )}
        </CardFooter>
      </Card>
    </form>
  )
}
