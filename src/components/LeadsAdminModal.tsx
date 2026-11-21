import React, { useEffect, useMemo, useState } from 'react';
import {
  Download,
  KeyRound,
  LogOut,
  Search,
  ShieldCheck,
  Trash2,
  X,
} from 'lucide-react';
import {
  LEADS_STORAGE_KEY,
  leadsToCsv,
  mergeLeadRecords,
  parseStoredLeads,
  type LeadRecord,
} from '../utils/leads';

interface LeadsAdminModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type AdminStatus = 'loading' | 'needs_claim' | 'needs_login' | 'authenticated';

function formatDatePeru(iso: string): string {
  try {
    return new Intl.DateTimeFormat('es-PE', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

export const LeadsAdminModal: React.FC<LeadsAdminModalProps> = ({ isOpen, onClose }) => {
  const [status, setStatus] = useState<AdminStatus>('loading');
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [passcodeInput, setPasscodeInput] = useState('');
  const [confirmPasscodeInput, setConfirmPasscodeInput] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(false);

  const [leads, setLeads] = useState<LeadRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [clearConfirm, setClearConfirm] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const loadMergedLeads = async (token: string) => {
    const localLeads = parseStoredLeads(window.localStorage.getItem(LEADS_STORAGE_KEY));
    try {
      const res = await fetch('/api/leads', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        const serverLeads: LeadRecord[] = Array.isArray(data.leads) ? data.leads : [];
        setLeads(mergeLeadRecords(serverLeads, localLeads));
        return;
      }
      if (res.status === 401) {
        setAuthToken(null);
        setStatus('needs_login');
        return;
      }
    } catch {
      // Fallback to localStorage leads when offline
    }
    setLeads(localLeads);
  };

  useEffect(() => {
    if (!isOpen) return;
    setAuthError(null);
    setPasscodeInput('');
    setConfirmPasscodeInput('');
    setClearConfirm(false);

    if (authToken) {
      setStatus('authenticated');
      void loadMergedLeads(authToken);
      return;
    }

    setStatus('loading');
    fetch('/api/admin/status')
      .then((res) => res.json())
      .then((data) => {
        if (data?.configured) {
          setStatus('needs_login');
        } else {
          setStatus('needs_claim');
        }
      })
      .catch(() => {
        setStatus('needs_login');
      });
  }, [isOpen, authToken]);

  const handleClaim = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    if (passcodeInput.trim().length < 6) {
      setAuthError('La clave debe tener al menos 6 caracteres.');
      return;
    }
    if (passcodeInput !== confirmPasscodeInput) {
      setAuthError('Las claves no coinciden.');
      return;
    }

    setAuthLoading(true);
    try {
      const res = await fetch('/api/admin/claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ passcode: passcodeInput.trim() }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok || !data?.ok || !data?.token) {
        setAuthError(data?.error || 'No se pudo configurar la clave.');
        return;
      }
      setAuthToken(data.token);
      setStatus('authenticated');
      await loadMergedLeads(data.token);
    } catch {
      setAuthError('Error de conexión con el servidor.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    if (!passcodeInput.trim()) {
      setAuthError('Ingresa tu clave de acceso.');
      return;
    }

    setAuthLoading(true);
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ passcode: passcodeInput.trim() }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok || !data?.ok || !data?.token) {
        setAuthError(data?.error || 'Clave incorrecta.');
        return;
      }
      setAuthToken(data.token);
      setStatus('authenticated');
      await loadMergedLeads(data.token);
    } catch {
      setAuthError('Error de conexión con el servidor.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    if (authToken) {
      await fetch('/api/admin/logout', {
        method: 'POST',
        headers: { Authorization: `Bearer ${authToken}` },
      }).catch(() => null);
    }
    setAuthToken(null);
    setPasscodeInput('');
    setStatus('needs_login');
  };

  const filteredLeads = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return leads;
    return leads.filter(
      (lead) =>
        lead.fullName.toLowerCase().includes(q) ||
        lead.storeName.toLowerCase().includes(q) ||
        lead.city.toLowerCase().includes(q) ||
        lead.email.toLowerCase().includes(q) ||
        lead.phone.includes(q),
    );
  }, [leads, searchQuery]);

  const handleDownloadCsv = () => {
    if (filteredLeads.length === 0) return;
    const csvContent = leadsToCsv(filteredLeads);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const dateStamp = new Date().toISOString().slice(0, 10);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `paki-interesados-${dateStamp}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleClearLocal = () => {
    if (!clearConfirm) {
      setClearConfirm(true);
      return;
    }
    window.localStorage.removeItem(LEADS_STORAGE_KEY);
    setLeads([]);
    setClearConfirm(false);
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-[2px]"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="admin-modal-title"
        className="relative flex max-h-[88vh] w-full max-w-6xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between gap-4 border-b border-slate-200 bg-[#144630] px-6 py-4 text-white">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="h-5 w-5 text-[#A6E236]" aria-hidden="true" />
            <h2 id="admin-modal-title" className="text-lg font-bold">
              Panel de interesados — Paki
            </h2>
          </div>

          <div className="flex items-center gap-2">
            {status === 'authenticated' && (
              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-white/20 transition-colors cursor-pointer"
              >
                <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Cerrar sesión</span>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              aria-label="Cerrar panel de interesados"
              className="inline-flex h-9 w-9 items-center justify-center rounded-full text-white/90 hover:bg-white/15 transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {status === 'loading' && (
            <div className="py-16 text-center text-sm text-slate-500">
              Verificando acceso seguro...
            </div>
          )}

          {status === 'needs_claim' && (
            <form onSubmit={handleClaim} className="mx-auto max-w-md py-6 space-y-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#144630]/10 text-[#144630]">
                <KeyRound className="h-6 w-6" aria-hidden="true" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-[#1E293B]">
                  Configura tu clave de administrador
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed text-slate-600">
                  Aún no se ha definido <code className="font-mono text-xs">ADMIN_PANEL_PASSCODE</code> en
                  el servidor. Crea una clave ahora para proteger el panel de interesados.
                </p>
              </div>

              <div>
                <label
                  htmlFor="admin-claim-pass"
                  className="block text-xs font-semibold text-slate-700 mb-1.5"
                >
                  Nueva clave (mínimo 6 caracteres)
                </label>
                <input
                  id="admin-claim-pass"
                  type="password"
                  required
                  minLength={6}
                  value={passcodeInput}
                  onChange={(e) => setPasscodeInput(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm text-[#1E293B] focus:border-[#144630] focus:outline-none focus:ring-2 focus:ring-[#144630]/20"
                  placeholder="Ingresa una clave segura"
                />
              </div>

              <div>
                <label
                  htmlFor="admin-claim-confirm"
                  className="block text-xs font-semibold text-slate-700 mb-1.5"
                >
                  Confirmar clave
                </label>
                <input
                  id="admin-claim-confirm"
                  type="password"
                  required
                  minLength={6}
                  value={confirmPasscodeInput}
                  onChange={(e) => setConfirmPasscodeInput(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm text-[#1E293B] focus:border-[#144630] focus:outline-none focus:ring-2 focus:ring-[#144630]/20"
                  placeholder="Repite tu clave"
                />
              </div>

              {authError && (
                <p role="alert" className="text-xs font-medium text-red-600">
                  {authError}
                </p>
              )}

              <button
                type="submit"
                disabled={authLoading}
                className="w-full rounded-full bg-[#A6E236] px-5 py-3 text-sm font-extrabold text-[#102E20] hover:bg-[#95D227] transition-colors disabled:opacity-60 cursor-pointer"
              >
                {authLoading ? 'Guardando clave...' : 'Activar clave y abrir panel'}
              </button>
            </form>
          )}

          {status === 'needs_login' && (
            <form onSubmit={handleLogin} className="mx-auto max-w-md py-6 space-y-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#144630]/10 text-[#144630]">
                <KeyRound className="h-6 w-6" aria-hidden="true" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-[#1E293B]">Acceso restringido</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-slate-600">
                  Ingresa tu clave de administrador para ver los registros guardados y exportarlos a
                  Excel (CSV).
                </p>
              </div>

              <div>
                <label
                  htmlFor="admin-login-pass"
                  className="block text-xs font-semibold text-slate-700 mb-1.5"
                >
                  Clave de acceso
                </label>
                <input
                  id="admin-login-pass"
                  type="password"
                  required
                  value={passcodeInput}
                  onChange={(e) => setPasscodeInput(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm text-[#1E293B] focus:border-[#144630] focus:outline-none focus:ring-2 focus:ring-[#144630]/20"
                  placeholder="••••••••"
                />
              </div>

              {authError && (
                <p role="alert" className="text-xs font-medium text-red-600">
                  {authError}
                </p>
              )}

              <button
                type="submit"
                disabled={authLoading}
                className="w-full rounded-full bg-[#144630] px-5 py-3 text-sm font-bold text-white hover:bg-[#194E37] transition-colors disabled:opacity-60 cursor-pointer"
              >
                {authLoading ? 'Verificando...' : 'Ingresar al panel'}
              </button>
            </form>
          )}

          {status === 'authenticated' && (
            <div className="space-y-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="relative flex-1 max-w-md">
                  <Search
                    className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                    aria-hidden="true"
                  />
                  <input
                    type="search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Buscar por nombre, bodega, ciudad o correo..."
                    aria-label="Buscar interesados"
                    className="w-full rounded-xl border border-slate-300 py-2.5 pl-10 pr-4 text-sm text-[#1E293B] focus:border-[#144630] focus:outline-none focus:ring-2 focus:ring-[#144630]/20"
                  />
                </div>

                <div className="flex flex-wrap items-center gap-2.5">
                  <span className="text-xs font-semibold text-slate-500 tabular-nums mr-1">
                    {filteredLeads.length} {filteredLeads.length === 1 ? 'registro' : 'registros'}
                  </span>

                  <button
                    type="button"
                    onClick={handleDownloadCsv}
                    disabled={filteredLeads.length === 0}
                    className="inline-flex items-center gap-2 rounded-full bg-[#A6E236] px-4 py-2.5 text-xs font-extrabold text-[#102E20] hover:bg-[#95D227] transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    <Download className="h-4 w-4" aria-hidden="true" />
                    <span>Descargar Excel (CSV)</span>
                  </button>

                  {leads.length > 0 && (
                    <button
                      type="button"
                      onClick={handleClearLocal}
                      className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-2.5 text-xs font-semibold transition-colors cursor-pointer ${
                        clearConfirm
                          ? 'border-red-600 bg-red-600 text-white'
                          : 'border-slate-300 text-slate-600 hover:border-red-300 hover:text-red-700'
                      }`}
                    >
                      <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                      <span>{clearConfirm ? 'Confirmar limpieza' : 'Limpiar respaldo local'}</span>
                    </button>
                  )}
                </div>
              </div>

              {filteredLeads.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 py-14 text-center">
                  <p className="text-sm font-semibold text-slate-700">
                    {leads.length === 0
                      ? 'Todavía no hay bodegas registradas.'
                      : 'No se encontraron registros para tu búsqueda.'}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    Cada registro completado en el formulario principal aparecerá aquí
                    automáticamente.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto rounded-2xl border border-slate-200">
                  <table className="w-full divide-y divide-slate-200 text-left text-[13px]">
                    <thead className="bg-slate-50 text-xs font-semibold text-slate-600">
                      <tr>
                        <th scope="col" className="px-3 py-3 whitespace-nowrap">
                          Fecha
                        </th>
                        <th scope="col" className="px-3 py-3">
                          Nombres
                        </th>
                        <th scope="col" className="px-3 py-3 whitespace-nowrap">
                          Celular
                        </th>
                        <th scope="col" className="px-3 py-3">
                          Correo
                        </th>
                        <th scope="col" className="px-3 py-3">
                          Bodega
                        </th>
                        <th scope="col" className="px-3 py-3">
                          Ciudad / Distrito
                        </th>
                        <th scope="col" className="px-3 py-3 whitespace-nowrap">
                          Estado
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                      {filteredLeads.map((lead) => (
                        <tr key={lead.id} className="hover:bg-slate-50/80 align-top">
                          <td className="px-3 py-3 text-xs text-slate-500 font-mono tabular-nums whitespace-nowrap">
                            {formatDatePeru(lead.createdAt)}
                          </td>
                          <td className="px-3 py-3 font-semibold text-[#1E293B]">
                            {lead.fullName}
                          </td>
                          <td className="px-3 py-3 font-mono text-xs text-slate-700 tabular-nums whitespace-nowrap">
                            +51 {lead.phone}
                          </td>
                          <td className="px-3 py-3 text-slate-600 break-all">
                            {lead.email}
                          </td>
                          <td className="px-3 py-3 font-medium text-[#1E293B]">
                            {lead.storeName}
                          </td>
                          <td className="px-3 py-3 text-slate-600">
                            {lead.city}
                          </td>
                          <td className="px-3 py-3 text-xs font-semibold whitespace-nowrap">
                            {lead.emailStatus === 'enviado' ? (
                              <span className="text-[#144630]">Correo enviado</span>
                            ) : lead.emailStatus === 'pendiente_smtp' ? (
                              <span className="text-amber-700">Pendiente SMTP</span>
                            ) : (
                              <span className="text-slate-600">Respaldo local</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
