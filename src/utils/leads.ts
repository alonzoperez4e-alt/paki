export interface LeadFormInput {
  fullName: string;
  phone: string;
  email: string;
  storeName: string;
  city: string;
  consent: boolean;
}

export interface LeadRecord extends LeadFormInput {
  id: string;
  createdAt: string;
  emailStatus: 'enviado' | 'pendiente_smtp' | 'guardado_local';
}

export interface ValidationErrors {
  fullName?: string;
  phone?: string;
  email?: string;
  storeName?: string;
  city?: string;
  consent?: string;
}

export const LEADS_STORAGE_KEY = 'paki_leads_v1';
export const DEFAULT_WHATSAPP_NUMBER = '51987654321';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function normalizePeruvianPhone(raw: string): string {
  const digits = raw.replace(/\D/g, '');
  if (digits.length === 11 && digits.startsWith('51')) {
    return digits.slice(2);
  }
  return digits;
}

export function validateLeadForm(input: LeadFormInput): ValidationErrors {
  const errors: ValidationErrors = {};

  const fullName = input.fullName.trim();
  if (!fullName || fullName.length < 3) {
    errors.fullName = 'Ingresa tus nombres completos (mínimo 3 caracteres).';
  } else if (fullName.length > 120) {
    errors.fullName = 'El nombre no puede superar los 120 caracteres.';
  }

  const normalizedPhone = normalizePeruvianPhone(input.phone);
  if (!/^\d{9}$/.test(normalizedPhone)) {
    errors.phone = 'Ingresa un número de celular válido de 9 dígitos (ej. 987654321).';
  }

  const email = input.email.trim();
  if (!email || !EMAIL_REGEX.test(email) || email.length > 160) {
    errors.email = 'Ingresa un correo electrónico válido.';
  }

  const storeName = input.storeName.trim();
  if (!storeName || storeName.length < 2) {
    errors.storeName = 'Ingresa el nombre de tu bodega.';
  } else if (storeName.length > 120) {
    errors.storeName = 'El nombre de la bodega no puede superar los 120 caracteres.';
  }

  const city = input.city.trim();
  if (!city || city.length < 2) {
    errors.city = 'Indica la ciudad o distrito donde está tu bodega.';
  } else if (city.length > 120) {
    errors.city = 'La ciudad o distrito no puede superar los 120 caracteres.';
  }

  if (!input.consent) {
    errors.consent = 'Debes autorizar el tratamiento de datos para recibir tu prueba gratuita.';
  }

  return errors;
}

export function hasValidationErrors(errors: ValidationErrors): boolean {
  return Object.keys(errors).length > 0;
}

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function sanitizeHeaderValue(value: string): string {
  return value.replace(/[\r\n]+/g, ' ').trim();
}

export function sanitizeWhatsAppNumber(raw?: string): string {
  const digits = (raw || '').replace(/\D/g, '');
  if (digits.length >= 9 && digits.length <= 15) {
    return digits;
  }
  return DEFAULT_WHATSAPP_NUMBER;
}

export function buildWhatsAppDirectUrl(whatsappNumber?: string): string {
  const num = sanitizeWhatsAppNumber(whatsappNumber);
  const msg =
    'Hola equipo Paki, quiero conocer más sobre la app para controlar mi bodega y evitar productos vencidos.';
  return `https://wa.me/${num}?text=${encodeURIComponent(msg)}`;
}

export function buildWhatsAppConfirmUrl(
  lead: Pick<LeadFormInput, 'fullName' | 'storeName' | 'city'>,
  whatsappNumber?: string,
): string {
  const num = sanitizeWhatsAppNumber(whatsappNumber);
  const msg = `Hola Paki! Acabo de registrarme para la prueba gratuita de 7 días. Soy ${lead.fullName.trim()}, de la bodega "${lead.storeName.trim()}" en ${lead.city.trim()}. Quiero confirmar mi acceso.`;
  return `https://wa.me/${num}?text=${encodeURIComponent(msg)}`;
}

function escapeCsvCell(raw: string): string {
  const str = String(raw ?? '');
  const formulaSafe = /^[=+\-@\t\r]/.test(str) ? `'${str}` : str;
  const escaped = formulaSafe.replace(/"/g, '""');
  return `"${escaped}"`;
}

export function leadsToCsv(leads: LeadRecord[]): string {
  const headers = [
    'Fecha de registro',
    'Nombres completos',
    'Celular / WhatsApp',
    'Correo electrónico',
    'Nombre de bodega',
    'Ciudad o distrito',
    'Estado de invitación',
  ];

  const rows = leads.map((lead) =>
    [
      lead.createdAt,
      lead.fullName,
      lead.phone,
      lead.email,
      lead.storeName,
      lead.city,
      lead.emailStatus === 'enviado'
        ? 'Correo enviado'
        : lead.emailStatus === 'pendiente_smtp'
          ? 'Guardado (SMTP pendiente)'
          : 'Guardado localmente',
    ]
      .map(escapeCsvCell)
      .join(','),
  );

  return `\uFEFF${headers.map(escapeCsvCell).join(',')}\r\n${rows.join('\r\n')}`;
}

export function parseStoredLeads(rawJson: string | null): LeadRecord[] {
  if (!rawJson) return [];
  try {
    const parsed = JSON.parse(rawJson);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (item): item is LeadRecord =>
        typeof item === 'object' &&
        item !== null &&
        typeof item.id === 'string' &&
        typeof item.fullName === 'string' &&
        typeof item.phone === 'string' &&
        typeof item.email === 'string' &&
        typeof item.storeName === 'string' &&
        typeof item.city === 'string' &&
        typeof item.createdAt === 'string',
    );
  } catch {
    return [];
  }
}

export function mergeLeadRecords(
  primary: LeadRecord[],
  secondary: LeadRecord[],
): LeadRecord[] {
  const byKey = new Map<string, LeadRecord>();
  for (const record of [...secondary, ...primary]) {
    const key = record.id || `${record.email.toLowerCase()}|${record.createdAt}`;
    byKey.set(key, record);
  }
  return Array.from(byKey.values()).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}
