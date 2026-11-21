import { useState } from 'react';
import { Footer } from './components/Footer';
import { HowItWorksSection } from './components/HowItWorksSection';
import { LeadsAdminModal } from './components/LeadsAdminModal';
import { Navbar } from './components/Navbar';
import { PhoneMockups } from './components/PhoneMockups';
import { RegistrationCard } from './components/RegistrationCard';

const HERO_BG_IMAGE = '/src/assets/images/bodega_hero_bg_1795224779216.jpg';

export default function App() {
  const [adminOpen, setAdminOpen] = useState(false);
  const [bgFailed, setBgFailed] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-white text-[#1E293B]">
      <Navbar />

      <main className="flex-1">
        {/* Hero Section */}
        <section
          id="inicio"
          className="relative overflow-hidden bg-[#144630]"
        >
          {/* Background Bodega Photo with Deep Forest Green Overlay */}
          {!bgFailed && (
            <img
              src={HERO_BG_IMAGE}
              alt="Bodeguero peruano sonriendo dentro de su bodega surtida"
              referrerPolicy="no-referrer"
              onError={() => setBgFailed(true)}
              className="pointer-events-none absolute inset-0 h-full w-full object-cover object-[62%_center]"
            />
          )}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[#113C29]/92 via-[#144630]/82 to-[#144630]/78"
          />

          <div className="relative z-10 mx-auto max-w-[1200px] px-5 sm:px-8 pt-12 pb-16 lg:pt-14 lg:pb-0">
            <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12 lg:gap-8">
              {/* Left Column: Headline, Subtitle & Dual Phone Mockups */}
              <div className="lg:col-span-7 flex flex-col justify-between lg:pt-2">
                <div className="max-w-[590px]">
                  <h1 className="text-[36px] sm:text-[46px] lg:text-[52px] font-extrabold leading-[1.08] tracking-tight text-white [text-wrap:balance]">
                    Evita pérdidas por productos vencidos y controla tu bodega desde tu celular
                  </h1>

                  <p className="mt-5 max-w-[540px] text-[16px] sm:text-[17.5px] leading-[1.6] text-[#E8F4EE]">
                    No pierdas más dinero. Con Paki, lleva un registro automático de tus ventas,
                    recibe alertas al instante antes de que tu mercadería caduque y conoce tu
                    ganancia diaria sin usar cuadernos.
                  </p>
                </div>

                <PhoneMockups />
              </div>

              {/* Right Column: Registration Form Card */}
              <div className="lg:col-span-5 lg:pb-14">
                <RegistrationCard />
              </div>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <HowItWorksSection />
      </main>

      <Footer onOpenAdminPanel={() => setAdminOpen(true)} />

      <LeadsAdminModal isOpen={adminOpen} onClose={() => setAdminOpen(false)} />
    </div>
  );
}
