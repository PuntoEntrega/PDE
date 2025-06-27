import StatusInfoPage, { ValidStatus } from "@/Components/stepperConfig/status-info/StatusInfoPage"
import { getSession } from "@/lib/auth"
import prisma from "@/lib/prisma"

export default async function StatusInfoRoutePage() {
  const user = await getSession()

  const userStatus = 'active' //Luego se deberá obtener de una respuesta de la bd mediante el unico id que se
                              // guardará en la cookie del usuario en sesión

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
