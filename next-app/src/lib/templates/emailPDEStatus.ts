export function getPDEStatusEmail({
  tradeName,
  estado,
  motivo,
  logoUrl = "https://pde-content-img.s3.us-east-1.amazonaws.com/material-grafico/punto_entrega_logo.png",
}: {
  tradeName: string
  estado: string
  motivo?: string
  logoUrl?: string
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
            <p><strong>Actualización del estado de tu Punto de Entrega</strong></p>

            <p>Tu punto de entrega <strong>${tradeName}</strong> ahora se encuentra en estado <strong>${estado}</strong>.</p>

            ${
              motivo
                ? `<p><strong>Motivo:</strong><br/>${motivo}</p>`
                : ""
            }

            <p style="margin-top:32px">Gracias por ser parte de Punto Entrega.</p>
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
