import { redirect } from "next/navigation"

const DashboardPage = () => {
  return redirect("/dashboard/billing")
}

export default DashboardPage
