import React, { useState } from 'react';
import { CheckCircle2, Loader2, MessageCircle, RotateCcw } from 'lucide-react';
import {
  LEADS_STORAGE_KEY,
  buildWhatsAppConfirmUrl,
  hasValidationErrors,
  normalizePeruvianPhone,
  parseStoredLeads,
  validateLeadForm,
  type LeadFormInput,
  type LeadRecord,
  type ValidationErrors,
} from '../utils/leads';

interface RegistrationCardProps {
  onLeadSaved?: (lead: LeadRecord) => void;
}

const INITIAL_FORM: LeadFormInput = {
  fullName: '',
  phone: '',
  email: '',
  storeName: '',
  city: '',
  consent: false,
};

function saveLeadToLocalStorage(lead: LeadRecord): void {
  try {
    const existing = parseStoredLeads(window.localStorage.getItem(LEADS_STORAGE_KEY));
    const filtered = existing.filter((item) => item.id !== lead.id);
    window.localStorage.setItem(LEADS_STORAGE_KEY, JSON.stringify([lead, ...filtered]));
  } catch {
    // Ignore storage quota or private mode failures safely
  }
}

export const RegistrationCard: React.FC<RegistrationCardProps> = ({ onLeadSaved }) => {
  const [form, setForm] = useState<LeadFormInput>(INITIAL_FORM);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedState, setSubmittedState] = useState<{
    lead: LeadRecord;
    emailSent: boolean;
    message: string;
  } | null>(null);

  const whatsappNumber = import.meta.env.VITE_WHATSAPP_NUMBER;

  const updateField = <K extends keyof LeadFormInput>(key: K, value: LeadFormInput[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    }
    if (submitError) setSubmitError(null);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitError(null);

    const validationErrors = validateLeadForm(form);
    if (hasValidationErrors(validationErrors)) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);
    const normalizedPayload: LeadFormInput = {
      fullName: form.fullName.trim(),
      phone: normalizePeruvianPhone(form.phone),
      email: form.email.trim().toLowerCase(),
      storeName: form.storeName.trim(),
      city: form.city.trim(),
      consent: form.consent,
    };

    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(normalizedPayload),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok || !data?.ok) {
        if (response.status === 400 && data?.error) {
          setSubmitError(data.error);
          setIsSubmitting(false);
          return;
        }

        // Still persist local backup so the lead is never lost even if SMTP fails temporarily
        const fallbackLead: LeadRecord = {
          id: `local_${Date.now()}`,
          createdAt: new Date().toISOString(),
          ...normalizedPayload,
          emailStatus: 'guardado_local',
        };
        saveLeadToLocalStorage(fallbackLead);
        onLeadSaved?.(fallbackLead);

        setSubmittedState({
          lead: fallbackLead,
          emailSent: false,
          message:
            data?.error ||
            'Guardamos tu registro correctamente. Puedes confirmar tu prueba gratuita de 7 días al instante por WhatsApp.',
        });
        setIsSubmitting(false);
        return;
      }

      const savedLead: LeadRecord = data.lead || {
        id: `paki_${Date.now()}`,
        createdAt: new Date().toISOString(),
        ...normalizedPayload,
        emailStatus: data.emailSent ? 'enviado' : 'pendiente_smtp',
      };

      saveLeadToLocalStorage(savedLead);
      onLeadSaved?.(savedLead);

      setSubmittedState({
        lead: savedLead,
        emailSent: Boolean(data.emailSent),
        message:
          data.message ||
          '¡Tu invitación fue enviada a tu correo electrónico! Revisa tu bandeja de entrada para activar tus 7 días gratis.',
      });
    } catch {
      const offlineLead: LeadRecord = {
        id: `local_${Date.now()}`,
        createdAt: new Date().toISOString(),
        ...normalizedPayload,
        emailStatus: 'guardado_local',
      };
      saveLeadToLocalStorage(offlineLead);
      onLeadSaved?.(offlineLead);

      setSubmittedState({
        lead: offlineLead,
        emailSent: false,
        message:
          'Registramos tu solicitud en tu navegador. Confirma también por WhatsApp para recibir tu acceso de 7 días de inmediato.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setForm(INITIAL_FORM);
    setErrors({});
    setSubmitError(null);
    setSubmittedState(null);
  };

  return (
    <div
      id="registro"
      className="w-full max-w-[440px] mx-auto lg:ml-auto lg:mr-0 rounded-3xl bg-white p-7 sm:p-9 shadow-[0_24px_60px_rgba(5,22,14,0.42)]"
    >
      {submittedState ? (
        <div className="py-2 text-center" role="status" aria-live="polite">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#144630] text-[#A6E236]">
            <CheckCircle2 className="h-8 w-8" aria-hidden="true" />
          </div>

          <h2 className="mt-4 text-2xl font-extrabold tracking-tight text-[#1E293B]">
            ¡Bienvenido a Paki, {submittedState.lead.fullName.split(' ')[0]}!
          </h2>

          <p className="mt-2.5 text-[15px] leading-relaxed text-slate-600">
            {submittedState.emailSent
              ? 'Enviamos tu invitación de prueba gratuita de 7 días a:'
              : 'Tu acceso a la prueba gratuita de 7 días quedó registrado para:'}
          </p>
          <p className="mt-1 text-[15px] font-bold text-[#144630] break-words">
            {submittedState.lead.email}
          </p>

          <p className="mt-2 text-xs leading-relaxed text-slate-500">
            {submittedState.emailSent
              ? 'Revisa tu bandeja de entrada o promociones. También puedes confirmar ahora por WhatsApp para atención prioritaria.'
              : 'Te contactaremos muy pronto con tu acceso. También puedes confirmar al instante por WhatsApp para activar tu prueba.'}
          </p>

          <div className="mt-5 rounded-2xl bg-[#F4F9F6] border border-[#DCEAE1] p-4 text-left text-sm text-slate-700 space-y-1.5">
            <div className="flex justify-between gap-2">
              <span className="text-slate-500">Bodega:</span>
              <span className="font-semibold text-[#1E293B] text-right">
                {submittedState.lead.storeName}
              </span>
            </div>
            <div className="flex justify-between gap-2">
              <span className="text-slate-500">Ubicación:</span>
              <span className="font-semibold text-[#1E293B] text-right">
                {submittedState.lead.city}
              </span>
            </div>
            <div className="flex justify-between gap-2">
              <span className="text-slate-500">WhatsApp:</span>
              <span className="font-semibold text-[#1E293B] tabular-nums">
                +51 {submittedState.lead.phone}
              </span>
            </div>
          </div>

          <a
            href={buildWhatsAppConfirmUrl(submittedState.lead, whatsappNumber)}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#144630] px-6 py-3.5 text-sm font-bold text-white shadow-sm transition-colors hover:bg-[#194E37] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#144630]"
          >
            <MessageCircle className="h-4 w-4 text-[#A6E236]" aria-hidden="true" />
            <span>Confirmar también por WhatsApp</span>
          </a>

          <button
            type="button"
            onClick={handleReset}
            className="mt-3 inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-500 hover:text-[#144630] transition-colors"
          >
            <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Registrar otra bodega</span>
          </button>
        </div>
      ) : (
        <>
          <h2 className="text-center text-[24px] sm:text-[26px] font-extrabold leading-tight tracking-tight text-[#1E293B] [text-wrap:balance]">
            Regístrate gratis para el lanzamiento
          </h2>

          <form onSubmit={handleSubmit} noValidate className="mt-6 space-y-3.5">
            <div>
              <label htmlFor="paki-fullName" className="sr-only">
                Nombres completos
              </label>
              <input
                id="paki-fullName"
                name="fullName"
                type="text"
                autoComplete="name"
                required
                value={form.fullName}
                onChange={(e) => updateField('fullName', e.target.value)}
                placeholder="Nombres completos"
                aria-invalid={Boolean(errors.fullName)}
                aria-describedby={errors.fullName ? 'err-fullName' : undefined}
                className={`w-full rounded-xl border bg-white px-4 py-3 text-[15px] text-[#1E293B] placeholder:text-slate-400 transition-colors focus:outline-none focus:ring-2 focus:ring-[#144630]/25 ${
                  errors.fullName
                    ? 'border-red-500 focus:border-red-500'
                    : 'border-slate-300 focus:border-[#144630]'
                }`}
              />
              {errors.fullName && (
                <p id="err-fullName" role="alert" className="mt-1 text-xs font-medium text-red-600">
                  {errors.fullName}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="paki-phone" className="sr-only">
                Celular de contacto / WhatsApp
              </label>
              <input
                id="paki-phone"
                name="phone"
                type="tel"
                inputMode="numeric"
                autoComplete="tel-national"
                maxLength={15}
                required
                value={form.phone}
                onChange={(e) => updateField('phone', e.target.value)}
                placeholder="Celular de contacto / WhatsApp (9 dígitos)"
                aria-invalid={Boolean(errors.phone)}
                aria-describedby={errors.phone ? 'err-phone' : undefined}
                className={`w-full rounded-xl border bg-white px-4 py-3 text-[15px] text-[#1E293B] placeholder:text-slate-400 transition-colors focus:outline-none focus:ring-2 focus:ring-[#144630]/25 tabular-nums ${
                  errors.phone
                    ? 'border-red-500 focus:border-red-500'
                    : 'border-slate-300 focus:border-[#144630]'
                }`}
              />
              {errors.phone && (
                <p id="err-phone" role="alert" className="mt-1 text-xs font-medium text-red-600">
                  {errors.phone}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="paki-email" className="sr-only">
                Correo electrónico
              </label>
              <input
                id="paki-email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={form.email}
                onChange={(e) => updateField('email', e.target.value)}
                placeholder="Correo electrónico"
                aria-invalid={Boolean(errors.email)}
                aria-describedby={errors.email ? 'err-email' : undefined}
                className={`w-full rounded-xl border bg-white px-4 py-3 text-[15px] text-[#1E293B] placeholder:text-slate-400 transition-colors focus:outline-none focus:ring-2 focus:ring-[#144630]/25 ${
                  errors.email
                    ? 'border-red-500 focus:border-red-500'
                    : 'border-slate-300 focus:border-[#144630]'
                }`}
              />
              {errors.email && (
                <p id="err-email" role="alert" className="mt-1 text-xs font-medium text-red-600">
                  {errors.email}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="paki-storeName" className="sr-only">
                Nombre de tu bodega
              </label>
              <input
                id="paki-storeName"
                name="storeName"
                type="text"
                autoComplete="organization"
                required
                value={form.storeName}
                onChange={(e) => updateField('storeName', e.target.value)}
                placeholder="Nombre de tu bodega"
                aria-invalid={Boolean(errors.storeName)}
                aria-describedby={errors.storeName ? 'err-storeName' : undefined}
                className={`w-full rounded-xl border bg-white px-4 py-3 text-[15px] text-[#1E293B] placeholder:text-slate-400 transition-colors focus:outline-none focus:ring-2 focus:ring-[#144630]/25 ${
                  errors.storeName
                    ? 'border-red-500 focus:border-red-500'
                    : 'border-slate-300 focus:border-[#144630]'
                }`}
              />
              {errors.storeName && (
                <p id="err-storeName" role="alert" className="mt-1 text-xs font-medium text-red-600">
                  {errors.storeName}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="paki-city" className="sr-only">
                ¿En qué ciudad o distrito está tu bodega?
              </label>
              <input
                id="paki-city"
                name="city"
                type="text"
                autoComplete="address-level2"
                required
                value={form.city}
                onChange={(e) => updateField('city', e.target.value)}
                placeholder="¿En qué ciudad o distrito está tu bodega?"
                aria-invalid={Boolean(errors.city)}
                aria-describedby={errors.city ? 'err-city' : undefined}
                className={`w-full rounded-xl border bg-white px-4 py-3 text-[15px] text-[#1E293B] placeholder:text-slate-400 transition-colors focus:outline-none focus:ring-2 focus:ring-[#144630]/25 ${
                  errors.city
                    ? 'border-red-500 focus:border-red-500'
                    : 'border-slate-300 focus:border-[#144630]'
                }`}
              />
              {errors.city && (
                <p id="err-city" role="alert" className="mt-1 text-xs font-medium text-red-600">
                  {errors.city}
                </p>
              )}
            </div>

            <div className="pt-1">
              <label className="flex items-start gap-2.5 cursor-pointer select-none">
                <input
                  id="paki-consent"
                  name="consent"
                  type="checkbox"
                  checked={form.consent}
                  onChange={(e) => updateField('consent', e.target.checked)}
                  aria-invalid={Boolean(errors.consent)}
                  className="mt-0.5 h-4 w-4 shrink-0 rounded border-slate-300 accent-[#144630] focus:ring-2 focus:ring-[#144630]/30"
                />
                <span className="text-xs leading-snug text-slate-600">
                  Autorizo el tratamiento de mis datos y recibir información de la prueba gratuita.
                </span>
              </label>
              {errors.consent && (
                <p role="alert" className="mt-1 text-xs font-medium text-red-600">
                  {errors.consent}
                </p>
              )}
            </div>

            {submitError && (
              <div
                role="alert"
                className="rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-xs font-medium text-red-700"
              >
                {submitError}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#A6E236] px-5 py-3.5 text-[13.5px] sm:text-[14px] font-extrabold tracking-wide text-[#102E20] shadow-sm transition-colors hover:bg-[#95D227] active:bg-[#89C41E] disabled:opacity-70 disabled:cursor-not-allowed focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#144630] cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                  <span>Enviando tu invitación...</span>
                </>
              ) : (
                <span>QUIERO MI PRUEBA GRATUITA DE 7 DÍAS</span>
              )}
            </button>
          </form>
        </>
      )}
    </div>
  );
};
