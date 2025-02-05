import { redirect } from "next/navigation"

import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { getCurrentUser } from "@/lib/session"
import { Toast } from "@/components/ui/toast"
import { DashboardHeader } from "@/components/header"
import { DashboardShell } from "@/components/shell"
import { UserNameForm } from "@/components/user-name-form"

export const metadata = {
  title: "Settings",
  description: "Manage account and website settings.",
}

export default async function SettingsPage() {
  const session = await auth()
  const user = session?.user

  if (!user) {
    redirect("/login")
  }

  const dbUser = await db.user.findUnique({
    where: {
      id: user?.id,
    },
    select: {
      name: true,
      email: true,
      phoneNumber: true,
    },
  })

  if (!dbUser) {
    return Toast({
      title: "User not found.",
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
