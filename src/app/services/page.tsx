'use client';

import { useRef } from 'react';
import Link from 'next/link';
import { motion, useInView, useScroll, useTransform } from 'framer-motion';
import {
  BatteryCharging, CalendarCheck, BarChart4,
  Map, ShieldCheck, Zap, ArrowRight,
  Settings, Network, Lock, Wallet, History
} from 'lucide-react';
import { MaskRevealHero } from '@/components/ui/mask-reveal-hero';

/* ══════ SHARED ══════ */
function FadeIn({
  children, delay = 0, className = '', direction = 'up',
}: {
  children: React.ReactNode; delay?: number; className?: string;
  direction?: 'up' | 'left' | 'right' | 'none';
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  const iy = direction === 'up' ? 32 : 0;
  const ix = direction === 'left' ? -32 : direction === 'right' ? 32 : 0;
  return (
    <motion.div ref={ref}
      initial={{ opacity: 0, x: ix, y: iy }}
      animate={inView ? { opacity: 1, x: 0, y: 0 } : {}}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}>
      {children}
    </motion.div>
  );
}

const GRAD = 'linear-gradient(135deg, #00e5ff 0%, #7b5ea7 100%)';
const GT: React.CSSProperties = {
  background: GRAD, WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent', backgroundClip: 'text',
};

/* ══════ DATA ══════ */
const MAIN_SERVICES = [
  {
    icon: BatteryCharging,
    title: 'Real-Time Discovery',
    desc: 'Instantly locate available charging stations near you or along your route. Filter by connector type, charging speed, and availability status.',
    features: ['Live availability status', 'Connector-specific filters', 'Real-time pricing', 'Station health metrics']
  },
  {
    icon: CalendarCheck,
    title: 'Advance Spot Reservation',
    desc: 'Never wait in line again. Book a charging slot up to 24 hours in advance and arrive knowing your spot is waiting exclusively for you.',
    features: ['Guaranteed availability', 'Flexible time windows', 'Automated reminders', 'Easy cancellation']
  },
  {
    icon: Map,
    title: 'Intelligent Route Planning',
    desc: 'Plan long-haul journeys with integrated EV charging waypoints. Our algorithm calculates optimal stops based on your vehicle range and traffic.',
    features: ['Range-aware routing', 'Multi-stop planning', 'Traffic optimization', 'Export to GPS']
  },
  {
    icon: BarChart4,
    title: 'Operator Intelligence',
    desc: 'A comprehensive dashboard for station owners to monitor utilization, track revenue, and analyze peak charging hours across their network.',
    features: ['Revenue analytics', 'Utilization heatmaps', 'Dynamic pricing controls', 'Hardware diagnostics']
  },
  {
    icon: ShieldCheck,
    title: 'Secure Digital Payments',
    desc: 'Seamlessly pay for your charging sessions through our integrated wallet. Auto-deduct features make your charging experience truly plug-and-play.',
    features: ['In-app wallet', 'Auto-billing', 'Digital VAT receipts', 'Corporate invoicing']
  },
  {
    icon: Network,
    title: 'B2B Fleet Management',
    desc: 'Dedicated enterprise solutions for managing electric vehicle fleets. Monitor charging costs, track driver schedules, and optimize fleet downtime.',
    features: ['Centralized billing', 'Driver role management', 'Fleet utilization tracking', 'CO2 reduction reports']
  }
];

const PLATFORM_FEATURES = [
  { icon: Zap, title: 'Ultra-Fast Sync', desc: 'Station status updates in under 500ms.' },
  { icon: Lock, title: 'Encrypted Data', desc: 'Bank-grade security for your vehicle and payment data.' },
  { icon: Settings, title: 'API Integrations', desc: 'Connect ChargeReserve with enterprise ERP systems.' },
  { icon: Wallet, title: 'Smart Subscriptions', desc: 'Monthly plans tailored for heavy and occasional drivers.' },
  { icon: History, title: 'Charging Logs', desc: 'Maintain a complete lifetime ledger of your EV charging.' },
];

/* ══════════════════════════════════════════════
   PAGE
══════════════════════════════════════════════ */
export default function ServicesPage() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: scrollRef, offset: ['start start', 'end end'] });
  const yParallax = useTransform(scrollYProgress, [0, 1], [0, 200]);

  return (
    <main className="relative bg-[#050810] text-foreground overflow-x-clip isolate">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        .display-font { font-family: 'DM Serif Display', serif; }
        .body-font { font-family: 'Plus Jakarta Sans', sans-serif; }
      `}</style>

      {/* ── 1. HERO ── */}
      <section className="relative h-[80vh] min-h-[600px] flex items-center justify-center overflow-hidden">
        {/* Abstract Background Elements */}
        <div className="absolute inset-0 bg-[#050810] z-0" />
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-[#00e5ff]/10 blur-[120px] pointer-events-none z-0" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-[#7b5ea7]/15 blur-[120px] pointer-events-none z-0" />
        <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)', backgroundSize: '40px 40px', opacity: 0.5 }} />

        <div className="relative z-10 w-full max-w-7xl mx-auto px-6 md:px-12 lg:px-20 pt-20 text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}>
            <p className="body-font text-xs font-semibold tracking-[0.25em] uppercase text-[#00e5ff] mb-6 inline-block px-4 py-1.5 rounded-full border border-[#00e5ff]/20 bg-[#00e5ff]/5">
              Our Services
            </p>
            <h1 className="display-font text-4xl sm:text-5xl md:text-6xl lg:text-7xl text-white leading-[1.1] mb-6 max-w-4xl mx-auto">
              Empowering the transition to <span style={GT}>electric mobility.</span>
            </h1>
            <p className="body-font text-base sm:text-lg text-white/50 max-w-2xl mx-auto leading-relaxed mb-10">
              From individual drivers looking for their next charge to station operators managing nationwide networks, ChargeReserve provides the tools to power the EV revolution.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/register" className="body-font inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full font-bold text-sm text-black hover:opacity-90 transition-opacity" style={{ background: GRAD }}>
                Create Free Account
              </Link>
              <button onClick={() => window.scrollTo({ top: window.innerHeight * 0.8, behavior: 'smooth' })} className="body-font inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full border border-white/15 text-white font-semibold text-sm hover:bg-white/5 transition-colors">
                Explore Solutions
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── 2. MAIN SERVICES BENTO GRID ── */}
      <section className="relative py-24 px-6 md:px-12 lg:px-20 z-10 bg-[#080c14] border-t border-white/[0.04]">
        <div className="max-w-7xl mx-auto">
          <div className="mb-16">
            <FadeIn>
              <p className="body-font text-xs font-semibold tracking-[0.2em] uppercase text-[#7b5ea7] mb-3">Core Offerings</p>
              <h2 className="display-font text-3xl sm:text-4xl md:text-5xl text-white">Solutions for every EV journey.</h2>
            </FadeIn>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-[minmax(300px,_auto)]">
            {MAIN_SERVICES.map((service, i) => (
              <FadeIn key={i} delay={i * 0.1} className={`group relative rounded-3xl border border-white/[0.06] bg-gradient-to-br from-white/[0.03] to-transparent p-8 overflow-hidden hover:border-[#00e5ff]/30 transition-all duration-500 ${i === 0 || i === 3 ? 'md:col-span-2 lg:col-span-2' : ''}`}>
                <div className="absolute inset-0 bg-gradient-to-br from-[#00e5ff]/0 via-[#00e5ff]/0 to-[#7b5ea7]/0 group-hover:from-[#00e5ff]/5 group-hover:via-transparent group-hover:to-[#7b5ea7]/10 transition-colors duration-500" />
                
                <div className="relative z-10 h-full flex flex-col">
                  {/* Icon & Header */}
                  <div className="flex items-start justify-between mb-6">
                    <div className="w-14 h-14 rounded-2xl bg-black/50 border border-white/10 flex items-center justify-center shadow-inner">
                      <service.icon className="w-6 h-6 text-[#00e5ff]" strokeWidth={1.5} />
                    </div>
                  </div>
                  
                  <h3 className="display-font text-2xl text-white mb-3">{service.title}</h3>
                  <p className="body-font text-white/55 text-sm leading-relaxed mb-8 flex-grow">
                    {service.desc}
                  </p>

                  {/* Features List */}
                  <ul className="space-y-2 mt-auto">
                    {service.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#7b5ea7]" />
                        <span className="body-font text-white/40 text-xs font-medium">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── 3. FEATURE SHOWCASE (PARALLAX + REVEAL) ── */}
      <section ref={scrollRef} className="relative py-32 px-6 md:px-12 lg:px-20 border-t border-white/[0.04] overflow-hidden bg-[#050810]">
        {/* Parallax Background */}
        <motion.div style={{ y: yParallax }} className="absolute inset-0 opacity-20 pointer-events-none flex items-center justify-center">
          <div className="w-[800px] h-[800px] border-[1px] border-[#00e5ff]/20 rounded-full flex items-center justify-center border-dashed">
            <div className="w-[600px] h-[600px] border-[1px] border-[#7b5ea7]/20 rounded-full flex items-center justify-center">
              <div className="w-[400px] h-[400px] border-[1px] border-[#00e5ff]/20 rounded-full border-dashed" />
            </div>
          </div>
        </motion.div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <FadeIn direction="left" className="order-2 lg:order-1 relative">
              <div className="relative aspect-[4/5] rounded-3xl overflow-hidden border border-white/10 bg-[#0d1220] shadow-2xl">
                <div className="absolute inset-0 bg-cover bg-center opacity-40 mix-blend-luminosity" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1593941707882-a56bff233fb2?w=800&q=80')" }} />
                <div className="absolute inset-0 bg-gradient-to-t from-[#050810] via-transparent to-transparent" />
                
                {/* Mock UI Overlay */}
                <div className="absolute inset-4 sm:inset-8 border border-white/5 bg-black/40 backdrop-blur-md rounded-2xl overflow-hidden flex flex-col">
                  {/* Mock App Header */}
                  <div className="h-14 border-b border-white/10 flex items-center px-6 gap-4 bg-white/[0.02]">
                    <div className="w-8 h-8 rounded-full bg-white/10" />
                    <div className="h-3 w-24 bg-white/20 rounded-full" />
                  </div>
                  {/* Mock App Content */}
                  <div className="p-6 flex-1 flex flex-col gap-4">
                    <div className="h-32 rounded-xl bg-gradient-to-r from-[#00e5ff]/20 to-[#7b5ea7]/20 border border-white/10 relative overflow-hidden">
                       <div className="absolute left-6 bottom-6 right-6">
                         <div className="h-4 w-1/2 bg-white/40 rounded-full mb-3" />
                         <div className="h-8 w-1/3 bg-white/80 rounded-full" />
                       </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="h-24 rounded-xl border border-white/10 bg-white/[0.03] p-4 flex flex-col justify-end">
                        <div className="h-6 w-1/2 bg-[#00e5ff]/50 rounded-full mb-2" />
                        <div className="h-3 w-2/3 bg-white/20 rounded-full" />
                      </div>
                      <div className="h-24 rounded-xl border border-white/10 bg-white/[0.03] p-4 flex flex-col justify-end">
                        <div className="h-6 w-1/2 bg-[#7b5ea7]/50 rounded-full mb-2" />
                        <div className="h-3 w-2/3 bg-white/20 rounded-full" />
                      </div>
                    </div>
                    <div className="flex-1 rounded-xl border border-white/10 bg-white/[0.03]" />
                  </div>
                </div>
              </div>
            </FadeIn>

            <div className="order-1 lg:order-2">
              <FadeIn>
                <p className="body-font text-xs font-semibold tracking-[0.2em] uppercase text-[#00e5ff] mb-4">Under The Hood</p>
                <h2 className="display-font text-4xl sm:text-5xl text-white leading-tight mb-8">
                  Engineered for scale, speed, and absolute reliability.
                </h2>
                <p className="body-font text-white/55 text-base leading-relaxed mb-10">
                  ChargeReserve isn't just an app — it's a robust infrastructure layer connecting fractured hardware networks into a single, cohesive driver experience.
                </p>
              </FadeIn>

              <div className="space-y-6">
                {PLATFORM_FEATURES.map((feat, i) => (
                  <FadeIn key={i} delay={0.1 * i} className="flex items-start gap-4 p-4 rounded-xl hover:bg-white/[0.03] transition-colors border border-transparent hover:border-white/[0.05]">
                    <div className="w-10 h-10 rounded-full bg-[#00e5ff]/10 flex flex-shrink-0 items-center justify-center">
                      <feat.icon className="w-5 h-5 text-[#00e5ff]" />
                    </div>
                    <div>
                      <h4 className="body-font font-bold text-white text-sm mb-1">{feat.title}</h4>
                      <p className="body-font text-white/40 text-sm leading-relaxed">{feat.desc}</p>
                    </div>
                  </FadeIn>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 4. CTA SECTION ── */}
      <section className="relative py-28 px-6 md:px-12 lg:px-20 border-t border-white/[0.06] bg-[#050810] overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#00e5ff]/5 pointer-events-none" />
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <FadeIn>
            <h2 className="display-font text-4xl sm:text-5xl lg:text-6xl text-white mb-6">
              Ready to elevate your EV charging experience?
            </h2>
            <p className="body-font text-lg text-white/50 mb-10 max-w-2xl mx-auto">
              Join tens of thousands of drivers who trust ChargeReserve for their daily commutes and long-distance road trips alike.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link href="/register" className="body-font inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full font-bold text-sm text-black hover:opacity-90 transition-opacity" style={{ background: GRAD }}>
                Start Charging Now <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
              <Link href="/contact" className="body-font inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full border border-white/20 text-white font-semibold text-sm hover:bg-white/10 transition-colors">
                Contact Sales for Operators
              </Link>
            </div>
          </FadeIn>
        </div>
      </section>
    </main>
  );
}
