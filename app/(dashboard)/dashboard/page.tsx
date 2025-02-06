import { redirect } from "next/navigation"

import { getCurrentUser } from "@/lib/session"
import { getUserSubscriptionPlan } from "@/lib/subscription"
import { BillingForm } from "@/components/billing-form"
import { DashboardHeader } from "@/components/header"
import { DashboardShell } from "@/components/shell"

export const metadata = {
  title: "Billing",
  description: "Manage billing and your subscription plan.",
}

export default async function BillingPage() {
  const user = await getCurrentUser()

  if (!user) {
    console.log("Not authenticated")
    redirect("/login")
  }

  const subscriptionPlan = await getUserSubscriptionPlan(user.id)

  return (
    <DashboardShell>
      <DashboardHeader
        heading="Billing"
        text="Manage billing and your subscription plan."
      />
      <div className="grid gap-8">
        <BillingForm
          subscriptionPlan={{
            ...subscriptionPlan,
            // isCanceled,
          }}
        />
      </div>
    </DashboardShell>
  )
}
