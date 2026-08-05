import { Resend } from "resend";
import type { SendReviewNotificationParams } from "@/types/mail";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendResourceReviewNotification({
  adminEmail,
  teacherName,
  teacherEmail,
  resourceTitle,
  category,
  type,
  price,
}: SendReviewNotificationParams) {
  try {
    const displayName = teacherName || "Instructor";

    const data = await resend.emails.send({
      from: "Chessaz <onboarding@resend.dev>",
      to: [adminEmail],
      subject: `[Revisión Pendiente] Nuevo material subido: ${resourceTitle}`,
      html: `
        <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 10px;">
          <h2 style="color: #1e3a8a; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px;">Nuevo Recurso Pendiente de Revisión</h2>
          <p>Hola Administrador,</p>
          <p>El instructor <strong>${displayName}</strong> (${teacherEmail || "No disponible"}) ha subido un nuevo recurso educativo que requiere tu aprobación:</p>
          
          <ul style="background-color: #f9fafb; padding: 15px; border-radius: 8px; list-style-type: none;">
            <li style="margin-bottom: 8px;"><strong>Título:</strong> ${resourceTitle}</li>
            <li style="margin-bottom: 8px;"><strong>Categoría:</strong> ${category}</li>
            <li style="margin-bottom: 8px;"><strong>Tipo de Formato:</strong> ${type}</li>
            <li style="margin-bottom: 8px;"><strong>Precio:</strong> $${price} USD</li>
          </ul>

          <p>Por favor, ingresa al panel de administración para revisar el contenido y proceder con su publicación.</p>
          
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
          <p style="font-size: 12px; color: #6b7280; text-align: center;">Chessaz - Plataforma de Estudio de Ajedrez</p>
        </div>
      `,
    });

    return { ok: true, data };
  } catch (error) {
    console.error("Error al enviar correo mediante Resend:", error);
    return { ok: false, error };
  }
}
