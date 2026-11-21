import crypto from 'node:crypto';
import nodemailer from 'nodemailer';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const SENDER_ADDRESS = '"Paki - Tu bodega bajo control" <pakibodegas@gmail.com>';

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function sanitizeHeader(value) {
  return String(value ?? '').replace(/[\r\n]+/g, ' ').trim();
}

function normalizePeruvianPhone(raw) {
  const digits = String(raw ?? '').replace(/\D/g, '');
  if (digits.length === 11 && digits.startsWith('51')) {
    return digits.slice(2);
  }
  return digits;
}

export function validateRegistrationPayload(body) {
  if (!body || typeof body !== 'object') {
    return { valid: false, error: 'Solicitud inválida. Envía los datos del formulario.' };
  }

  const fullName = sanitizeHeader(body.fullName);
  const phone = normalizePeruvianPhone(body.phone);
  const email = sanitizeHeader(body.email).toLowerCase();
  const storeName = sanitizeHeader(body.storeName);
  const city = sanitizeHeader(body.city);
  const consent = Boolean(body.consent);

  if (!fullName || fullName.length < 3 || fullName.length > 120) {
    return { valid: false, error: 'Ingresa tus nombres completos (3 a 120 caracteres).' };
  }
  if (!/^\d{9}$/.test(phone)) {
    return { valid: false, error: 'El celular de contacto debe tener exactamente 9 dígitos.' };
  }
  if (!email || !EMAIL_REGEX.test(email) || email.length > 160) {
    return { valid: false, error: 'Ingresa un correo electrónico válido.' };
  }
  if (!storeName || storeName.length < 2 || storeName.length > 120) {
    return { valid: false, error: 'Ingresa el nombre de tu bodega.' };
  }
  if (!city || city.length < 2 || city.length > 120) {
    return { valid: false, error: 'Indica la ciudad o distrito de tu bodega.' };
  }
  if (!consent) {
    return { valid: false, error: 'Debes autorizar el tratamiento de tus datos para continuar.' };
  }

  return {
    valid: true,
    data: { fullName, phone, email, storeName, city, consent },
  };
}

export function buildWelcomeEmailHtml(lead, whatsappNumber = '51987654321') {
  const safeName = escapeHtml(lead.fullName);
  const safeStore = escapeHtml(lead.storeName);
  const safeCity = escapeHtml(lead.city);
  const safePhone = escapeHtml(lead.phone);
  const cleanWa = String(whatsappNumber || '51987654321').replace(/\D/g, '') || '51987654321';
  const waText = encodeURIComponent(
    `Hola Paki! Recibí mi invitación por correo. Soy ${lead.fullName} de la bodega "${lead.storeName}" en ${lead.city}.`,
  );
  const waUrl = `https://wa.me/${cleanWa}?text=${waText}`;

  return `<!DOCTYPE html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Bienvenido a Paki - Tu prueba gratuita de 7 días</title>
  </head>
  <body style="margin:0;padding:0;background-color:#F3F7F4;font-family:'Segoe UI',Arial,Helvetica,sans-serif;color:#1E293B;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:#F3F7F4;padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="max-width:600px;width:100%;background-color:#FFFFFF;border-radius:20px;overflow:hidden;box-shadow:0 12px 32px rgba(20,70,48,0.10);">
            <tr>
              <td style="background-color:#144630;padding:32px 36px;text-align:center;">
                <div style="display:inline-block;background-color:#3D7A4E;border-radius:999px;padding:10px 24px;">
                  <span style="font-size:28px;font-weight:800;color:#FFFFFF;letter-spacing:-0.02em;">Pak<span style="color:#A6E236;">i</span></span>
                  <div style="font-size:11px;color:#E2F3E7;margin-top:2px;">Tu bodega, bajo control</div>
                </div>
                <h1 style="margin:24px 0 8px;color:#FFFFFF;font-size:24px;line-height:1.3;font-weight:700;">
                  ¡Tu prueba gratuita de 7 días está reservada!
                </h1>
                <p style="margin:0;color:#D4EAE0;font-size:15px;line-height:1.5;">
                  Gracias por unirte al lanzamiento de Paki en Perú.
                </p>
              </td>
            </tr>
            <tr>
              <td style="padding:32px 36px;">
                <p style="margin:0 0 16px;font-size:16px;line-height:1.6;color:#1E293B;">
                  Hola <strong>${safeName}</strong>,
                </p>
                <p style="margin:0 0 20px;font-size:15px;line-height:1.65;color:#334155;">
                  Hemos confirmado tu registro para <strong>${safeStore}</strong> (${safeCity}). Muy pronto recibirás el enlace directo para activar tus <strong>7 días de prueba gratuita</strong> y empezar a controlar tu inventario, alertas de vencimiento y ganancias diarias desde tu celular.
                </p>

                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:#F7FAF8;border:1px solid #DCE9E1;border-radius:14px;margin-bottom:24px;">
                  <tr>
                    <td style="padding:18px 20px;">
                      <div style="font-size:13px;font-weight:700;color:#144630;margin-bottom:10px;">Resumen de tu registro</div>
                      <div style="font-size:14px;color:#334155;line-height:1.7;">
                        <strong>Bodega:</strong> ${safeStore}<br />
                        <strong>Ciudad / Distrito:</strong> ${safeCity}<br />
                        <strong>WhatsApp:</strong> +51 ${safePhone}
                      </div>
                    </td>
                  </tr>
                </table>

                <p style="margin:0 0 24px;font-size:14px;line-height:1.6;color:#475569;">
                  ¿Quieres activar tu acceso prioritario o resolver alguna duda ahora mismo? Escríbenos directo por WhatsApp:
                </p>

                <table role="presentation" cellspacing="0" cellpadding="0" style="margin:0 auto 24px;">
                  <tr>
                    <td align="center" style="border-radius:999px;background-color:#A6E236;">
                      <a href="${waUrl}" target="_blank" rel="noopener noreferrer" style="display:inline-block;padding:14px 28px;font-size:14px;font-weight:800;color:#144630;text-decoration:none;letter-spacing:0.02em;">
                        HABLAR CON EL EQUIPO DE PAKI
                      </a>
                    </td>
                  </tr>
                </table>

                <p style="margin:0;font-size:13px;line-height:1.6;color:#64748B;">
                  Si no realizaste este registro, puedes ignorar este mensaje con total tranquilidad.
                </p>
              </td>
            </tr>
            <tr>
              <td style="background-color:#0F3524;padding:20px 36px;text-align:center;">
                <p style="margin:0;font-size:12px;color:#B8D5C5;">
                  Paki - Tu bodega, bajo control &middot; Hecho para bodegueros en Perú<br />
                  pakibodegas@gmail.com
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

export async function processRegistration(body) {
  const validation = validateRegistrationPayload(body);
  if (!validation.valid) {
    return { status: 400, payload: { ok: false, error: validation.error } };
  }

  const data = validation.data;
  const createdAt = new Date().toISOString();
  const id = `paki_${crypto.randomBytes(6).toString('hex')}`;

  const gmailUser = (process.env.GMAIL_USER || '').trim();
  const gmailPass = (process.env.GMAIL_APP_PASSWORD || '').trim();
  const whatsappNumber = process.env.VITE_WHATSAPP_NUMBER || '51987654321';

  let emailSent = false;
  let mode = 'preview';

  if (gmailUser && gmailPass) {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: gmailUser,
        pass: gmailPass,
      },
    });

    await transporter.sendMail({
      from: SENDER_ADDRESS,
      replyTo: gmailUser,
      to: data.email,
      subject: `¡Bienvenido a Paki, ${data.fullName}! Tu prueba gratuita de 7 días está lista`,
      text: `Hola ${data.fullName}, gracias por registrar ${data.storeName} (${data.city}) en Paki. Tu acceso a la prueba gratuita de 7 días está reservado.`,
      html: buildWelcomeEmailHtml(data, whatsappNumber),
    });

    emailSent = true;
    mode = 'smtp';
  }

  const lead = {
    id,
    createdAt,
    ...data,
    emailStatus: emailSent ? 'enviado' : 'pendiente_smtp',
  };

  return {
    status: 200,
    payload: {
      ok: true,
      emailSent,
      mode,
      lead,
      message: emailSent
        ? '¡Invitación enviada! Revisa tu correo electrónico para confirmar tu prueba gratuita de 7 días.'
        : '¡Registro confirmado! Guardamos tu solicitud para la prueba gratuita de 7 días.',
    },
  };
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ ok: false, error: 'Método no permitido. Usa POST.' });
  }

  try {
    const result = await processRegistration(req.body);
    return res.status(result.status).json(result.payload);
  } catch (error) {
    console.error('Error en /api/register:', error instanceof Error ? error.message : 'Unknown error');
    return res.status(500).json({
      ok: false,
      error: 'No pudimos enviar el correo en este momento. Tus datos fueron respaldados localmente; intenta nuevamente o confirma por WhatsApp.',
    });
  }
}
