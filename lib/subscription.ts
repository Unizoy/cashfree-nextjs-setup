import { Cashfree } from "cashfree-pg"

import { UserSubscriptionPlan } from "types"
import { freePlan, proPlan } from "@/config/subscriptions"
import { db } from "@/lib/db"

Cashfree.XClientId = process.env.NEXT_PUBLIC_CASHFREE_APP_ID!
Cashfree.XClientSecret = process.env.CASHFREE_CLIENT_SECRET!
Cashfree.XEnvironment = Cashfree.Environment.PRODUCTION

export async function getUserSubscriptionPlan(
  userId: string
): Promise<UserSubscriptionPlan> {
  const user = await db.user.findFirst({
    where: {
      id: userId,
    },
    select: {
      isPro: true,
    },
  })

  if (!user) {
    throw new Error("User not found")
  }

  const isPro = user.isPro
  const plan = isPro ? proPlan : freePlan

  return {
    ...plan,
    isPro,
  }
}
