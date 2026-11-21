import React from 'react';
import { AlertTriangle, PackageCheck, TrendingUp, Wifi, Battery } from 'lucide-react';
import { PakiLogo } from './PakiLogo';

export const PhoneMockups: React.FC = () => {
  return (
    <div
      className="relative mt-8 flex items-end justify-center lg:justify-start select-none"
      aria-label="Vista previa de la aplicación móvil Paki mostrando panel de ganancias, alertas e inventario"
    >
      <div className="relative flex items-end w-[326px] sm:w-[404px] h-[318px] sm:h-[358px]">
        {/* Left Phone: Tilted Dashboard Screen */}
        <div
          className="relative z-10 w-[182px] sm:w-[220px] h-[308px] sm:h-[346px] origin-bottom-right -rotate-[10deg] translate-x-2 sm:translate-x-3 translate-y-1 rounded-[32px] border-[5px] border-[#1A1F24] bg-[#144630] shadow-[0_24px_50px_rgba(4,18,11,0.55)] ring-1 ring-white/20 overflow-hidden"
        >
          {/* Phone Status Bar */}
          <div className="relative flex items-center justify-between px-4 pt-2 pb-1 text-[10px] font-semibold text-white bg-[#144630]">
            <span className="tabular-nums">9:41</span>
            <span
              aria-hidden="true"
              className="absolute left-1/2 top-1.5 -translate-x-1/2 h-3.5 w-14 rounded-full bg-[#0C1114]"
            />
            <span className="flex items-center gap-1 opacity-90">
              <Wifi className="h-2.5 w-2.5" aria-hidden="true" />
              <Battery className="h-3 w-3" aria-hidden="true" />
            </span>
          </div>

          {/* App Green Header */}
          <div className="bg-[#144630] px-3 pt-0.5 pb-2.5 text-center">
            <PakiLogo variant="clean" size="sm" />
          </div>

          {/* App Dashboard Cards */}
          <div className="h-full bg-[#F3F6F4] px-2.5 pt-2 pb-4 space-y-1.5 sm:space-y-2">
            {/* Ganancias Card */}
            <div className="flex items-center gap-2 rounded-xl bg-white p-2 sm:p-2.5 shadow-[0_2px_8px_rgba(15,23,42,0.06)] border border-slate-100">
              <div className="flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-lg bg-[#144630] text-[#A6E236]">
                <TrendingUp className="h-4 w-4" aria-hidden="true" />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-bold text-[#1E293B] leading-tight">Ganancias</p>
                <p className="text-[9px] text-slate-500 leading-tight mt-0.5">Ventas de hoy</p>
                <p className="text-[12.5px] sm:text-[13.5px] font-extrabold text-[#144630] tabular-nums whitespace-nowrap leading-tight mt-0.5">
                  S/ 532.40
                </p>
              </div>
            </div>

            {/* Alertas Card */}
            <div className="flex items-center gap-2 rounded-xl bg-white p-2 sm:p-2.5 shadow-[0_2px_8px_rgba(15,23,42,0.06)] border border-slate-100">
              <div className="flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-lg bg-[#FEF3C7] text-[#D97706]">
                <AlertTriangle className="h-4 w-4" aria-hidden="true" />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-bold text-[#1E293B] leading-tight">Alertas</p>
                <p className="text-[9px] text-slate-500 leading-tight mt-0.5">Por vencer</p>
                <p className="text-[12.5px] sm:text-[13.5px] font-extrabold text-[#1E293B] tabular-nums whitespace-nowrap leading-tight mt-0.5">
                  12 lotes
                </p>
              </div>
            </div>

            {/* Inventario Card */}
            <div className="flex items-center gap-2 rounded-xl bg-white p-2 sm:p-2.5 shadow-[0_2px_8px_rgba(15,23,42,0.06)] border border-slate-100">
              <div className="flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-lg bg-[#FEE2E2] text-[#DC2626]">
                <PackageCheck className="h-4 w-4" aria-hidden="true" />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-bold text-[#1E293B] leading-tight">Inventario</p>
                <p className="text-[9px] text-slate-500 leading-tight mt-0.5">En stock</p>
                <p className="text-[12.5px] sm:text-[13.5px] font-extrabold text-[#1E293B] tabular-nums whitespace-nowrap leading-tight mt-0.5">
                  248 ítems
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Phone: Upright Forest Green Welcome Screen */}
        <div
          className="relative z-20 -ml-7 sm:-ml-8 w-[178px] sm:w-[214px] h-[296px] sm:h-[334px] translate-y-1 rounded-[32px] border-[5px] border-[#1A1F24] bg-gradient-to-b from-[#194E37] via-[#144630] to-[#0E3323] shadow-[0_28px_60px_rgba(4,18,11,0.65)] ring-1 ring-white/25 overflow-hidden flex flex-col"
        >
          {/* Phone Status Bar */}
          <div className="relative flex items-center justify-between px-4 pt-2.5 pb-1.5 text-[10px] font-semibold text-white">
            <span className="tabular-nums">9:41</span>
            <span
              aria-hidden="true"
              className="absolute left-1/2 top-2 -translate-x-1/2 h-3.5 w-14 rounded-full bg-[#0C1114]"
            />
            <span className="flex items-center gap-1 opacity-90">
              <Wifi className="h-2.5 w-2.5" aria-hidden="true" />
              <Battery className="h-3 w-3" aria-hidden="true" />
            </span>
          </div>

          {/* Centered Paki Splash Content */}
          <div className="flex-1 flex flex-col items-center justify-center px-4 pb-8 text-center">
            <PakiLogo variant="clean" size="lg" />
            <div className="mt-6 w-24 h-1 rounded-full bg-[#A6E236]/40 overflow-hidden">
              <div className="w-14 h-full rounded-full bg-[#A6E236]" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
