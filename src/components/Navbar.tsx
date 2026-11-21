import React, { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { PakiLogo } from './PakiLogo';
import { buildWhatsAppDirectUrl } from '../utils/leads';

export const Navbar: React.FC = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const whatsappUrl = buildWhatsAppDirectUrl(import.meta.env.VITE_WHATSAPP_NUMBER);

  return (
    <header className="sticky top-0 z-40 w-full bg-[#144630] border-b border-white/10 shadow-sm">
      <div className="mx-auto flex h-[74px] max-w-[1200px] items-center justify-between gap-6 px-5 sm:px-8">
        <a
          href="#inicio"
          aria-label="Paki - Inicio"
          className="shrink-0 rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#A6E236]"
        >
          <PakiLogo variant="pill" size="md" />
        </a>

        <div className="hidden md:flex items-center gap-8">
          <nav aria-label="Navegación principal" className="flex items-center gap-7">
            <a
              href="#inicio"
              className="text-[15px] font-medium text-white/95 hover:text-[#A6E236] transition-colors whitespace-nowrap shrink-0"
            >
              Inicio
            </a>
            <a
              href="#como-funciona"
              className="text-[15px] font-medium text-white/95 hover:text-[#A6E236] transition-colors whitespace-nowrap shrink-0"
            >
              Cómo funciona
            </a>
          </nav>

          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center rounded-full bg-white px-6 py-2.5 text-[15px] font-semibold text-[#1E293B] shadow-sm transition-colors hover:bg-[#F1F5F9] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#A6E236] whitespace-nowrap shrink-0"
          >
            Habla con nosotros
          </a>
        </div>

        <button
          type="button"
          onClick={() => setMobileOpen((prev) => !prev)}
          aria-expanded={mobileOpen}
          aria-label={mobileOpen ? 'Cerrar menú de navegación' : 'Abrir menú de navegación'}
          className="md:hidden inline-flex h-11 w-11 items-center justify-center rounded-xl text-white hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#A6E236]"
        >
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="md:hidden bg-[#144630] border-t border-white/10 px-5 pb-5 pt-3">
          <nav aria-label="Navegación móvil" className="flex flex-col gap-3">
            <a
              href="#inicio"
              onClick={() => setMobileOpen(false)}
              className="rounded-lg px-3 py-2.5 text-base font-medium text-white hover:bg-white/10"
            >
              Inicio
            </a>
            <a
              href="#como-funciona"
              onClick={() => setMobileOpen(false)}
              className="rounded-lg px-3 py-2.5 text-base font-medium text-white hover:bg-white/10"
            >
              Cómo funciona
            </a>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setMobileOpen(false)}
              className="mt-1 inline-flex items-center justify-center rounded-full bg-white px-5 py-3 text-sm font-semibold text-[#1E293B] hover:bg-[#F1F5F9]"
            >
              Habla con nosotros
            </a>
          </nav>
        </div>
      )}
    </header>
  );
};
