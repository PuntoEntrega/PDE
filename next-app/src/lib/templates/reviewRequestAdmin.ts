export function getReviewRequestEmail({
  fullName,
  email,
  phone,
  logoUrl = "https://pde-content-img.s3.us-east-1.amazonaws.com/material-grafico/punto_entrega_logo.png",
  panelUrl = "https://puntoentrega.app/admin-panel/review-users"
}: {
  fullName: string
  email?: string
  phone?: string
  logoUrl?: string
  panelUrl?: string
}) {
  return /*html*/ `
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f5f7;padding:20px 0;font-family:Arial,Helvetica,sans-serif">
  <tr>
    <td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;overflow:hidden">
        <tr>
          <td align="center" style="padding:24px 0">
            <img src="${logoUrl}" alt="Punto Entrega" width="200" style="display:block;margin:auto"/>
          </td>
        </tr>

        <tr>
          <td style="padding:24px 32px;color:#374151;font-size:15px;line-height:1.6">
            <p><strong>Nueva solicitud de revisión</strong></p>

            <p>Un usuario se encuentra <strong>BAJO REVISIÓN</strong> y requiere aprobación:</p>

            <ul style="margin:16px 0 24px 0;padding-left:20px;color:#374151">
              <li><strong>Nombre:</strong> ${fullName}</li>
              <li><strong>Email:</strong> ${email ?? "No especificado"}</li>
              <li><strong>Teléfono:</strong> ${phone ?? "No especificado"}</li>
            </ul>

            <p>
              Puedes gestionar esta solicitud haciendo clic en el siguiente enlace:
            </p>

            <p style="text-align:center;margin:24px 0">
              <a href="${panelUrl}" style="background:#1d4ed8;color:#ffffff;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:bold">
                Revisar solicitud
              </a>
            </p>

            <p style="margin-top:32px">Gracias por tu atención.<br/>Equipo Punto&nbsp;Entrega</p>
          </td>
        </tr>

        <tr>
          <td align="center" style="background:#f3f4f6;padding:16px;font-size:12px;color:#6b7280">
            © ${new Date().getFullYear()} Punto Entrega · Todos los derechos reservados
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
`.trim()
}
