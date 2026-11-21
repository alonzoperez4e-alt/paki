import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildWhatsAppConfirmUrl,
  escapeHtml,
  hasValidationErrors,
  leadsToCsv,
  mergeLeadRecords,
  normalizePeruvianPhone,
  parseStoredLeads,
  sanitizeHeaderValue,
  validateLeadForm,
  type LeadRecord,
} from './leads';

test('validateLeadForm accepts a complete Peruvian bodega registration', () => {
  const errors = validateLeadForm({
    fullName: 'María Quispe Mamani',
    phone: '987 654 321',
    email: 'maria.quispe@bodegaperu.pe',
    storeName: 'Bodega Don Pepe',
    city: 'San Juan de Lurigancho, Lima',
    consent: true,
  });

  assert.equal(hasValidationErrors(errors), false);
  assert.equal(normalizePeruvianPhone('+51 987-654-321'), '987654321');
});

test('validateLeadForm rejects invalid 9-digit phone, invalid email, and missing consent', () => {
  const errors = validateLeadForm({
    fullName: 'Jo',
    phone: '9876543',
    email: 'correo-invalido',
    storeName: '',
    city: ' ',
    consent: false,
  });

  assert.equal(hasValidationErrors(errors), true);
  assert.ok(errors.fullName);
  assert.ok(errors.phone);
  assert.ok(errors.email);
  assert.ok(errors.storeName);
  assert.ok(errors.city);
  assert.ok(errors.consent);
});

test('escapeHtml and sanitizeHeaderValue neutralize HTML and SMTP header injections', () => {
  assert.equal(
    escapeHtml('<script>alert("xss")</script> & \'test\''),
    '&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt; &amp; &#39;test&#39;',
  );
  assert.equal(
    sanitizeHeaderValue("Ana\r\nBcc: attacker@evil.com"),
    'Ana Bcc: attacker@evil.com',
  );
});

test('leadsToCsv includes UTF-8 BOM, quotes fields properly, and neutralizes spreadsheet formulas', () => {
  const leads: LeadRecord[] = [
    {
      id: 'lead-1',
      createdAt: '2026-11-20T15:00:00.000Z',
      fullName: '=HYPERLINK("http://evil.com","Click")',
      phone: '987654321',
      email: 'carlos@bodega.pe',
      storeName: 'Bodega "El Sol", S.A.',
      city: 'Miraflores, Lima',
      consent: true,
      emailStatus: 'enviado',
    },
  ];

  const csv = leadsToCsv(leads);
  assert.ok(csv.startsWith('\uFEFF"Fecha de registro"'));
  assert.ok(csv.includes(`"'=HYPERLINK(""http://evil.com"",""Click"")"`));
  assert.ok(csv.includes(`"Bodega ""El Sol"", S.A."`));
  assert.ok(csv.includes('"Correo enviado"'));
});

test('buildWhatsAppConfirmUrl creates a valid wa.me URL with encoded bodega context', () => {
  const url = buildWhatsAppConfirmUrl(
    {
      fullName: 'Carlos Ramos',
      storeName: 'Bodega La Esquina',
      city: 'Arequipa',
    },
    '+51 999 111 222',
  );

  assert.ok(url.startsWith('https://wa.me/51999111222?text='));
  assert.ok(decodeURIComponent(url).includes('Carlos Ramos'));
  assert.ok(decodeURIComponent(url).includes('Bodega La Esquina'));
  assert.ok(decodeURIComponent(url).includes('Arequipa'));
});

test('parseStoredLeads recovers safely from malformed JSON and mergeLeadRecords deduplicates by id', () => {
  assert.deepEqual(parseStoredLeads('{bad json'), []);
  assert.deepEqual(parseStoredLeads(null), []);

  const a: LeadRecord = {
    id: '1',
    createdAt: '2026-11-20T10:00:00.000Z',
    fullName: 'Rosa Flores',
    phone: '912345678',
    email: 'rosa@bodega.pe',
    storeName: 'Bodega Rosita',
    city: 'Trujillo',
    consent: true,
    emailStatus: 'guardado_local',
  };
  const b: LeadRecord = {
    ...a,
    emailStatus: 'enviado',
  };
  const c: LeadRecord = {
    id: '2',
    createdAt: '2026-11-20T12:00:00.000Z',
    fullName: 'Luis Paredes',
    phone: '922334455',
    email: 'luis@bodega.pe',
    storeName: 'Minimarket Paredes',
    city: 'Cusco',
    consent: true,
    emailStatus: 'enviado',
  };

  const merged = mergeLeadRecords([b, c], [a]);
  assert.equal(merged.length, 2);
  assert.equal(merged[0].id, '2');
  assert.equal(merged[1].emailStatus, 'enviado');
});
