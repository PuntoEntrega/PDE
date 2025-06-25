// src/lib/templates/emailNewCompanyUnderReview.ts
export function getCompanyUnderReviewEmail ({
  legal_name,
  trade_name,
  contact_email,
  contact_phone,
  logoUrl = "https://pde-content-img.s3.us-east-1.amazonaws.com/material-grafico/punto_entrega_logo.png",
}: {
  legal_name    : string
  trade_name?   : string | null
  contact_email?: string | null
  contact_phone?: string | null
  logoUrl?      : string
}) {
  return /*html*/ `
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
            <p style="font-size:18px">⚠️ Nueva empresa pendiente de revisión</p>

            <table style="font-size:14px;margin-top:16px">
              <tr><td style="padding:4px 0"><strong>Razón social:</strong></td><td>${legal_name}</td></tr>
              ${trade_name     ? `<tr><td style="padding:4px 0"><strong>Nombre comercial:</strong></td><td>${trade_name}</td></tr>` : ""}
              ${contact_email  ? `<tr><td style="padding:4px 0"><strong>Email de contacto:</strong></td><td>${contact_email}</td></tr>` : ""}
              ${contact_phone  ? `<tr><td style="padding:4px 0"><strong>Teléfono:</strong></td><td>${contact_phone}</td></tr>` : ""}
            </table>

            <p style="margin-top:24px">Ingresa al panel de administración para aprobar o rechazar esta solicitud.</p>
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
