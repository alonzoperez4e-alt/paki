import React from 'react';
import { ArrowUpRight, BellRing, Calculator, ScanBarcode } from 'lucide-react';

const BENEFITS = [
  {
    number: '01',
    title: 'Control rápido de ventas y stock',
    description:
      'Registra cada venta desde tu celular en segundos. Tu inventario se actualiza solo para que sepas exactamente qué productos se agotan y cuándo reponer.',
    detail: 'Sin equipos costosos ni hojas sueltas',
    icon: ScanBarcode,
  },
  {
    number: '02',
    title: 'Alertas antes de que venzan tus productos',
    description:
      'Recibe avisos automáticos con días de anticipación cuando un lote de leche, galletas o bebidas esté próximo a caducar, evitando pérdidas innecesarias.',
    detail: 'Avisos claros por fecha de vencimiento',
    icon: BellRing,
  },
  {
    number: '03',
    title: 'Reporte de ganancias diarias sin cuadernos',
    description:
      'Al cerrar tu bodega, consulta en una sola pantalla cuánto vendiste, cuánto invertiste y tu ganancia real del día sin pasar horas sumando a mano.',
    detail: 'Cierre de caja diario listo en un toque',
    icon: Calculator,
  },
];

export const HowItWorksSection: React.FC = () => {
  return (
    <section id="como-funciona" className="bg-[#F6FAF7] py-20 lg:py-24 border-t border-[#E2ECE5]">
      <div className="mx-auto max-w-[1200px] px-5 sm:px-8">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold text-[#194E37]">Cómo funciona</p>
          <h2 className="mt-2 text-3xl sm:text-4xl font-extrabold tracking-tight text-[#1E293B] [text-wrap:balance]">
            Todo el control de tu bodega en tres pasos simples
          </h2>
          <p className="mt-3 text-base sm:text-lg leading-relaxed text-slate-600">
            Diseñado para el ritmo real de las bodegas en Perú: rápido de usar, claro desde el
            primer día y directamente desde tu celular.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
          {BENEFITS.map((item) => {
            const Icon = item.icon;
            return (
              <article
                key={item.number}
                className="flex flex-col justify-between rounded-2xl border border-[#DCE8E0] bg-white p-7 transition-shadow duration-200 hover:shadow-[0_12px_30px_rgba(20,70,48,0.08)]"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#144630] text-[#A6E236]">
                      <Icon className="h-6 w-6" aria-hidden="true" />
                    </div>
                    <span className="font-mono text-sm font-semibold text-slate-400 tabular-nums">
                      {item.number}
                    </span>
                  </div>

                  <h3 className="mt-6 text-xl font-bold leading-snug text-[#1E293B]">
                    {item.title}
                  </h3>

                  <p className="mt-3 text-[15px] leading-relaxed text-slate-600">
                    {item.description}
                  </p>
                </div>

                <p className="mt-6 pt-4 border-t border-slate-100 text-xs font-semibold text-[#194E37]">
                  {item.detail}
                </p>
              </article>
            );
          })}
        </div>

        {/* Claim-to-proof summary banner */}
        <div className="mt-12 rounded-3xl bg-[#144630] px-7 py-8 sm:px-10 sm:py-10 text-white">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-center">
            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div>
                <p className="text-3xl font-extrabold text-[#A6E236] tabular-nums">7 días</p>
                <p className="mt-1 text-sm text-[#D6EAE0]">
                  Prueba gratuita completa al lanzamiento, sin compromiso.
                </p>
              </div>
              <div>
                <p className="text-3xl font-extrabold text-[#A6E236] tabular-nums">&lt; 30 s</p>
                <p className="mt-1 text-sm text-[#D6EAE0]">
                  Para registrar ventas y actualizar tu inventario al instante.
                </p>
              </div>
              <div>
                <p className="text-3xl font-extrabold text-[#A6E236] tabular-nums">0 cuadernos</p>
                <p className="mt-1 text-sm text-[#D6EAE0]">
                  Tu ganancia diaria y alertas de vencimiento siempre en tu bolsillo.
                </p>
              </div>
            </div>

            <div className="lg:col-span-5 flex lg:justify-end">
              <a
                href="#registro"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-[#A6E236] px-7 py-3.5 text-sm font-extrabold text-[#102E20] transition-colors hover:bg-[#95D227] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white whitespace-nowrap"
              >
                <span>Reservar mi prueba gratuita</span>
                <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
