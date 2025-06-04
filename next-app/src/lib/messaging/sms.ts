import axios from "axios"

const {
  SMS_SERVICE_AUTH_URL,
  SMS_SERVICE_CLIENT_ID,
  SMS_SERVICE_USERNAME,
  SMS_SERVICE_PASSWORD,
  SMS_SERVICE_SCOPE,
  SMS_SERVICE_SEND_URL,
} = process.env

let cachedToken: string | null = null
let tokenExpiry: number = 0

async function getSmsToken(): Promise<string> {
  const now = Date.now()
  if (cachedToken && now < tokenExpiry) return cachedToken

  const response = await axios.post(
    SMS_SERVICE_AUTH_URL!,
    new URLSearchParams({
      client_id: SMS_SERVICE_CLIENT_ID!,
      grant_type: "password",
      username: SMS_SERVICE_USERNAME!,
      password: SMS_SERVICE_PASSWORD!,
      scope: SMS_SERVICE_SCOPE!,
    }),
    {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    }
  )

  cachedToken = response.data.access_token
  tokenExpiry = now + response.data.expires_in * 1000 - 5000 // pequeño margen
  return cachedToken
}

export async function sendSms(to: string, body: string) {
  const token = await getSmsToken()
  const response = await axios.post(
    SMS_SERVICE_SEND_URL!,
    {
      body,
      to,
      provider: "MOVITEXT",
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  )

  console.log("📱 SMS enviado:", response.data)
  return response.data
}
