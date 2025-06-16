// src/lib/templates/emailCompanyStatus.ts
export function getCompanyStatusEmail ({
  legalName,
  estado,
  motivo,
  logoUrl = "https://pde-content-img.s3.us-east-1.amazonaws.com/material-grafico/punto_entrega_logo.png",
}: {
  legalName : string
  estado    : string
  motivo?   : string
  logoUrl?  : string
}) {
  return `
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f5f7;padding:20px 0;font-family:Arial,Helvetica,sans-serif">
  <tr>
    <td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;overflow:hidden">
        <!-- Header / Logo -->
        <tr>
          <td align="center" style="padding:24px 0">
            <img src="${logoUrl}" alt="Punto Entrega" width="200" style="display:block;margin:auto">
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:24px 32px;color:#374151;font-size:15px;line-height:1.6">
            <p><strong>Actualización del estado de tu empresa</strong></p>

            <p>La empresa <strong>${legalName}</strong> ahora se encuentra en estado <strong>${estado}</strong>.</p>

            ${motivo ? `<p><strong>Motivo:</strong><br>${motivo}</p>` : ""}

            <p style="margin-top:32px">Puedes ingresar a la plataforma para revisar los detalles.</p>
          </td>
        </tr>

        <!-- Footer -->
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
