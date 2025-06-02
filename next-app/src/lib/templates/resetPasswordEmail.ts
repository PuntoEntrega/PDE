// lib/templates/resetPasswordEmail.ts

export function getResetPasswordEmailHTML({ username, resetUrl }: { username: string; resetUrl: string }) {
  return `
    <div style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px;">
      <div style="max-width: 480px; margin: auto; background-color: #ffffff; border-radius: 10px; padding: 30px; text-align: center; box-shadow: 0 4px 10px rgba(0,0,0,0.1);">
        <img src="https://pde-content-img.s3.us-east-1.amazonaws.com/branding/logo_punto_entrega_blue.png" alt="Punto Entrega" width="100" style="margin-bottom: 20px;" />

        <p style="font-size: 16px; color: #333;">Se ha solicitado la recuperación de contraseña de tu usuario <strong>${username}</strong>.</p>

        <p style="font-size: 16px; color: #333;">Para continuar con el cambio de tu contraseña, haz click en el siguiente botón:</p>

        <a href="${resetUrl}" target="_blank" style="display: inline-block; margin: 20px auto; padding: 12px 24px; background-color: #2e69ec; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: bold;">
          Recuperar contraseña
        </a>

        <p style="font-size: 14px; color: #555;">Si tú no realizaste esta solicitud por favor comunícate con nuestro servicio al cliente PdE.<br/>
        (+506) 1234-5678</p>
      </div>
    </div>
  `
}
