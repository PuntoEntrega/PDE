import bcrypt from "bcrypt";
import { randomBytes } from "crypto";
import prisma from "@/lib/prisma";
import { sendEmailWithMandrill } from "@/lib/messaging/email";
import { sendSMS } from "@/lib/messaging/sms";

const SALT_ROUNDS = Number(process.env.SALT_ROUNDS ?? 10);
const DEFAULT_ROLE_ID = process.env.DEFAULT_ROLE_ID;

if (!DEFAULT_ROLE_ID) {
  throw new Error("❌ DEFAULT_ROLE_ID no está definido en el entorno.");
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      document_type_id,
      identification_number,
      first_name,
      last_name,
      email,
      phone,
    } = (body as Record<string, any>) ?? {};

    if (
      !document_type_id ||
      !identification_number ||
      !first_name ||
      !last_name ||
      (!email && !phone)
    ) {
      console.warn("⚠️ Campos obligatorios faltantes:", {
        document_type_id,
        identification_number,
        first_name,
        last_name,
        email,
        phone,
      });
      return new Response(
        JSON.stringify({ error: "Faltan campos obligatorios" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const tempPassword = randomBytes(4).toString("hex");
    const password_hash = await bcrypt.hash(tempPassword, SALT_ROUNDS);
    const username = email ?? phone ?? "";

    const nuevoUsuario = await prisma.users.create({
      data: {
        document_type_id,
        identification_number,
        first_name,
        last_name,
        email: email || null,
        phone: phone || null,
        password_hash,
        username,
        role_id: DEFAULT_ROLE_ID,
      },
    });

    // 🔔 Envío de la contraseña temporal
    const fullName = `${first_name} ${last_name}`;
    const message = `Hola ${fullName}, tu contraseña temporal es: ${tempPassword}`;

    if (email) {
      await sendEmailWithMandrill(email, "Tu acceso a Punto Entrega", message);
    } else if (phone) {
      await sendSMS(phone, message);
    }

    const payload =
      process.env.NODE_ENV !== "production"
        ? { ok: true }
        : { ok: true };

    return new Response(JSON.stringify(payload), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err: any) {
    console.error("❌ REGISTER ERROR:");
    console.dir(err, { depth: null });

    const errorMessage =
      err instanceof Error
        ? err.message
        : typeof err === "object"
        ? JSON.stringify(err)
        : String(err);

    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
