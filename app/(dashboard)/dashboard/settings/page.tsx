import { redirect } from "next/navigation"

import { db } from "@/lib/db"
import { getCurrentUser } from "@/lib/session"
import { toast } from "@/components/ui/use-toast"
import { DashboardHeader } from "@/components/header"
import { DashboardShell } from "@/components/shell"
import { UserNameForm } from "@/components/user-name-form"

export const metadata = {
  title: "Settings",
  description: "Manage account and website settings.",
}

export default async function SettingsPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/login")
  }

  const dbUser = await db.user.findUnique({
    where: {
      id: user.id,
    },
    select: {
      name: true,
      email: true,
      phoneNumber: true,
    },
  })

  if (!dbUser) {
    return toast({
      title: "User not found",
      description: "Please try again later.",
    })
  }

  return (
    <DashboardShell>
      <DashboardHeader
        heading="Settings"
        text="Manage account and website settings."
      />
      <div className="grid gap-10">
        <UserNameForm
          user={{
            id: user.id,
            name: user.name || "",
            phoneNumber: dbUser.phoneNumber || "",
          }}
        />
      </div>
    </DashboardShell>
  )
}
