import axios from "axios";

const MANDRILL_API_KEY = process.env.MANDRILL_API_KEY!;
const FROM_EMAIL = "cm@sgpv.cr";

export async function sendEmailWithMandrill(to: string, subject: string, text: string) {
  try {
    const response = await axios.post("https://mandrillapp.com/api/1.0/messages/send.json", {
      key: MANDRILL_API_KEY,
      message: {
        from_email: FROM_EMAIL,
        to: [{ email: to, type: "to" }],
        subject,
        text,
      },
    });

    console.log("📧 Email enviado:", response.data);
  } catch (err) {
    console.error("❌ Error enviando email:", err);
  }
}
