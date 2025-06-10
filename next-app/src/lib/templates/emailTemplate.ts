export function getAccountStatusEmail({
  userFullName,
  logoUrl = "https://pde-content-img.s3.us-east-1.amazonaws.com/material-grafico/punto_entrega_logo.png",
  estadoCuenta,          // "activa", "bajo revisión", "inactiva", "rechazada"
  motivo                // string opcional
}: {
  userFullName: string
  estadoCuenta: string
  motivo?: string
  logoUrl?: string
}) {
  return /*html*/ `
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f5f7;padding:20px 0;font-family:Arial,Helvetica,sans-serif">
  <tr>
    <td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;overflow:hidden">
        <!-- Encabezado con logo -->
        <tr>
          <td align="center" style="padding:24px 0;background:#ffffff">
            <img src="${logoUrl}" alt="Punto Entrega" width="200" style="display:block;margin:auto" />
          </td>
        </tr>

        <!-- Cuerpo del mensaje -->
        <tr>
          <td style="padding:24px 32px;color:#374151;font-size:15px;line-height:1.6">
            <p style="margin:0 0 16px 0">Hola <strong>${userFullName}</strong>,</p>

            <p style="margin:0 0 16px 0">
              Te informamos que el estado de tu cuenta en <strong>Punto&nbsp;Entrega</strong> ahora es:
              <br /><span style="display:inline-block;padding:4px 8px;border-radius:4px;background:#e5f3ff;color:#1d4ed8;font-weight:bold">
                ${estadoCuenta.toUpperCase()}
              </span>
            </p>

            ${motivo ? `
            <p style="margin:0 0 16px 0"><strong>Motivo:</strong><br/>${motivo}</p>
            ` : ""}

            <!-- Texto según estado -->
            ${
              estadoCuenta === "activa"
                ? `<p style="margin:0 0 16px 0">¡Ya puedes acceder y aprovechar todas las funciones de la plataforma!</p>`
                : estadoCuenta === "bajo revisión"
                ? `<p style="margin:0 0 16px 0">Nuestro equipo está revisando tu información. Te contactaremos a la mayor brevedad.</p>`
                : estadoCuenta === "inactiva"
                ? `<p style="margin:0 0 16px 0">Tu cuenta ha sido desactivada temporalmente. Si necesitas más detalles, contáctanos.</p>`
                : `<p style="margin:0 0 16px 0">Tu cuenta fue rechazada. Si consideras que es un error, comunícate con soporte.</p>`
            }

            <p style="margin:32px 0 0 0">Gracias por utilizar Punto&nbsp;Entrega.<br/>Equipo de Soporte</p>
          </td>
        </tr>

        <!-- Pie -->
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
