interface InviteParams {
    toName: string
    fromName: string
    companyName: string
    inviteUrl: string
    username: string
    password: string
}

export function getCollaboratorInviteTemplate({
    toName,
    fromName,
    companyName,
    inviteUrl,
    username,
    password,
}: InviteParams) {
    return `
    <div style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px;">
      <div style="max-width: 480px; margin: auto; background-color: #ffffff; border-radius: 10px; padding: 30px; text-align: center; box-shadow: 0 4px 10px rgba(0,0,0,0.1);">
        <img src="https://pde-content-img.s3.us-east-1.amazonaws.com/material-grafico/punto_entrega_logo.png" alt="Punto Entrega" width="100" style="margin-bottom: 20px;" />

        <h2 style="color: #2e69ec; margin-bottom: 10px;">¡Hola ${toName || 'colaborador/a'}!</h2>

        <p style="font-size: 16px; color: #333;">
          Has sido invitado por <strong>${fromName}</strong> a unirte a la empresa <strong>${companyName}</strong> en la plataforma <strong>Punto Entrega</strong>.
        </p>

        <p style="font-size: 16px; color: #333;">
          Para completar tu registro y empezar a colaborar, haz clic en el siguiente botón:
        </p>

        <a href="${inviteUrl}" target="_blank" style="display: inline-block; margin: 20px auto; padding: 12px 24px; background-color: #2e69ec; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: bold;">
          Completar Registro
        </a>

        <p style="font-size: 14px; color: #555; margin-top: 20px;">
          Aquí tienes tus credenciales provisionales:
        </p>

        <div style="font-size: 15px; color: #000; background-color: #f0f0f0; border-radius: 6px; padding: 12px; margin: 0 auto 20px; text-align: left;">
          <strong>Usuario:</strong> ${username}<br/>
          <strong>Contraseña:</strong> ${password}
        </div>

        <p style="font-size: 13px; color: #777;">
          Te recomendamos cambiar tu contraseña después del primer inicio de sesión.
        </p>

        <p style="font-size: 13px; color: #999;">
          Si tienes alguna duda, comunícate con el administrador de tu empresa.
        </p>
      </div>
    </div>
  `;
}
