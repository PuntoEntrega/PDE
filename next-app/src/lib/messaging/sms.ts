import axios from "axios";

const SMS_SERVICE_SEND_URL = process.env.SMS_SERVICE_SEND_URL!;

export async function sendSMS(phone: string, message: string) {
  try {
    const response = await axios.post(SMS_SERVICE_SEND_URL, {
      phone,
      message,
    });

    console.log("📲 SMS enviado:", response.data);
  } catch (err) {
    console.error("❌ Error enviando SMS:", err);
  }
}