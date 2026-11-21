import React from 'react';
import { Lock } from 'lucide-react';
import { PakiLogo } from './PakiLogo';
import { buildWhatsAppDirectUrl } from '../utils/leads';

interface FooterProps {
  onOpenAdminPanel: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenAdminPanel }) => {
  const whatsappUrl = buildWhatsAppDirectUrl(import.meta.env.VITE_WHATSAPP_NUMBER);

  return (
    <footer className="bg-[#0F3524] text-white">
      <div className="mx-auto max-w-[1200px] px-5 sm:px-8 py-12">
        <div className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between pb-8 border-b border-white/10">
          <div>
            <PakiLogo variant="clean" size="md" />
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-[#C2DDD0]">
              Gestión de inventarios, control de vencimientos y reporte de ganancias diarias para
              bodegas en todo el Perú.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-x-7 gap-y-3 text-sm font-medium text-[#E0F0E8]">
            <a href="#inicio" className="hover:text-[#A6E236] transition-colors">
              Inicio
            </a>
            <a href="#como-funciona" className="hover:text-[#A6E236] transition-colors">
              Cómo funciona
            </a>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#A6E236] transition-colors"
            >
              Habla con nosotros
            </a>
            <a
              href="mailto:pakibodegas@gmail.com"
              className="hover:text-[#A6E236] transition-colors"
            >
              pakibodegas@gmail.com
            </a>
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between text-xs text-[#A9CBB9]">
          <p>© {new Date().getFullYear()} Paki · Hecho para bodegueros en Perú.</p>

          <button
            type="button"
            onClick={onOpenAdminPanel}
            className="inline-flex items-center gap-1.5 self-start sm:self-auto text-xs font-medium text-[#A9CBB9] hover:text-white transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#A6E236] rounded"
          >
            <Lock className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Panel de interesados</span>
          </button>
        </div>
      </div>
    </footer>
  );
};
