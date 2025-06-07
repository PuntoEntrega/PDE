import StatusInfoPage, { ValidStatus } from "@/Components/stepperConfig/status-info/StatusInfoPage"
import { getSession } from "@/lib/auth"
import prisma from "@/lib/prisma"

export default async function StatusInfoRoutePage() {
  const user = await getSession()

  const validStatuses: ValidStatus[] = ["draft", "under_review", "active", "inactive", "rejected"]
  const userStatus: ValidStatus = validStatuses.includes(user?.status as ValidStatus)
    ? (user?.status as ValidStatus)
    : "draft"

  const latestStatus = await prisma.userStatusHistory.findFirst({
    where: { user_id: user?.sub },
    orderBy: { created_at: "desc" },
  })

  return (
    <StatusInfoPage
      userStatus={userStatus}
      reason={latestStatus?.reason ?? ""}
      userName={`${user?.first_name} ${user?.last_name}`}
    />
  )
}
