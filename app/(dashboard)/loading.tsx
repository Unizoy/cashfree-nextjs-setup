import { Skeleton } from "@/components/ui/skeleton"
import { DashboardHeader } from "@/components/header"
import { DashboardShell } from "@/components/shell"

export default function DashboardLoading() {
  return (
    <DashboardShell>
      <DashboardHeader
        heading="Posts"
        text="Create and manage posts."
      ></DashboardHeader>
      <div className="divide-border-200 divide-y rounded-md border">
        <Skeleton className="h-[500px] w-full" />
        <Skeleton className="h-[500px] w-full" />
        <Skeleton className="h-[500px] w-full" />
        <Skeleton className="h-[500px] w-full" />
        <Skeleton className="h-[500px] w-full" />
      </div>
    </DashboardShell>
  )
}
