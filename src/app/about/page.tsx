'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { motion, useInView } from 'framer-motion';
import { ZoomParallax } from '@/components/ui/zoom-parallax';
import { Zap, Globe, Clock, Shield, ArrowRight, ChevronDown } from 'lucide-react';

/* ─── Lenis smooth scroll (graceful degradation if import fails) ─── */
function useLenis() {
  useEffect(() => {
    let lenis: import('lenis').default | null = null;
    import('lenis')
      .then(({ default: Lenis }) => {
        lenis = new Lenis({ lerp: 0.08, smoothWheel: true });
        function raf(time: number) {
          lenis?.raf(time);
          requestAnimationFrame(raf);
        }
        requestAnimationFrame(raf);
      })
      .catch(() => null); // silently ignore if lenis fails
    return () => lenis?.destroy();
  }, []);
}

/* ─── Animated counter ─── */
function Counter({ target, suffix = '' }: { target: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!inView) return;
    let current = 0;
    const step = Math.ceil(target / 60);
    const timer = setInterval(() => {
      current += step;
      if (current >= target) { setCount(target); clearInterval(timer); }
      else setCount(current);
    }, 20);
    return () => clearInterval(timer);
  }, [inView, target]);

  return <span ref={ref}>{count.toLocaleString('en-IN')}{suffix}</span>;
}

/* ─── Section fade-in on scroll ─── */
function FadeIn({ children, delay = 0, className = '' }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 28 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.65, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ─── Data ─── */
const PARALLAX_IMAGES = [
  { src: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=900&q=80', alt: 'EV charging station' },
  { src: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=900&q=80', alt: 'Modern cityscape' },
  { src: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=900&q=80', alt: 'Lush green forest' },
  { src: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=900&q=80', alt: 'Mountain sunrise highway' },
  { src: 'https://images.unsplash.com/photo-1473186505569-9c61870c11f9?w=900&q=80', alt: 'India Gate Delhi' },
  { src: 'https://images.unsplash.com/photo-1489824904134-891ab64532f1?w=900&q=80', alt: 'Cars at sunset' },
  { src: 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=900&q=80', alt: 'Modern office' },
];

const STATS = [
  { value: 1500, suffix: '+',   label: 'Charging Stations', sub: 'Across India' },
  { value: 10000, suffix: '+',  label: 'Happy Users',        sub: '& counting daily' },
  { value: 2,     suffix: 'Cr+', label: '₹ Savings',         sub: 'In fuel costs avoided' },
  { value: 98,    suffix: '%',   label: 'Uptime',             sub: 'Platform reliability' },
];

const FEATURES = [
  { icon: Clock,  title: 'Real-Time Availability', desc: 'Live charger status updated every 30 seconds — know what\'s free before you drive.' },
  { icon: Globe,  title: 'Pan-India Network',       desc: 'From metros to tier-3 cities — find a station wherever your journey takes you.' },
  { icon: Zap,    title: 'Advance Booking',          desc: 'Reserve your slot up to 24 hours ahead. Never wait in a queue again.' },
  { icon: Shield, title: 'Secure Payments',          desc: 'Encrypted UPI, card, and wallet payments. Your financial data is always safe.' },
];

const TIMELINE = [
  { year: '2023',    title: 'ChargeReserve Founded',    desc: 'Started in Ahmedabad with a mission to make EV ownership effortless for every Indian.' },
  { year: 'Q2 2023', title: 'First 100 Stations',       desc: 'Onboarded 100 charging stations across Gujarat — fastest-growing EV network in the state.' },
  { year: 'Q4 2023', title: '10,000 Users Milestone',   desc: 'Crossed 10,000 registered users. The community validated our vision.' },
  { year: '2024',    title: '1,500+ Stations Nationwide', desc: 'Expanded to 28 states. Now one of India\'s most comprehensive EV charging platforms.' },
];

/* ══════════════════════════ Page ══════════════════════════ */
export default function AboutPage() {
  useLenis();

  return (
    /* bg-background picks up :root light vars or .dark vars automatically */
    <main className="relative bg-background text-foreground overflow-x-hidden isolate">

      {/* Google Fonts */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        .display-font { font-family: 'DM Serif Display', serif; }
      `}</style>

      {/* ═══════════════════════════════════
          1. HERO
      ═══════════════════════════════════ */}
      <section className="relative min-h-screen flex flex-col items-center justify-center text-center px-6 overflow-hidden">

        {/* Radial glow — subtle enough for both modes */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse 80% 60% at 50% -10%, rgba(0,229,255,0.10) 0%, transparent 70%),' +
              'radial-gradient(ellipse 60% 50% at 80% 100%, rgba(123,94,167,0.08) 0%, transparent 70%)',
          }}
        />

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          className="relative z-10 max-w-4xl"
        >
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#00e5ff]/40 bg-[#00e5ff]/10 text-[#00bcd4] dark:text-[#00e5ff] text-sm font-semibold mb-8 tracking-wide">
            <Zap className="w-3.5 h-3.5" fill="currentColor" />
            India&apos;s EV Charging Platform
          </div>

          <h1 className="display-font text-5xl sm:text-7xl lg:text-8xl leading-[0.95] tracking-tight mb-6 text-foreground">
            Powering India&apos;s<br />
            <span
              style={{
                background: 'linear-gradient(90deg, #00bcd4 0%, #7b5ea7 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              EV Future
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed mb-12">
            ChargeReserve makes electric vehicle charging effortless — find, book, and charge at over 1,500 stations across the country.
          </p>

          <Link
            href="/find"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full font-semibold text-sm text-white hover:opacity-90 transition-opacity"
            style={{ background: 'linear-gradient(90deg, #00bcd4, #7b5ea7)' }}
          >
            Explore Stations <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>

        {/* Scroll cue */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4, duration: 1 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-muted-foreground text-xs tracking-widest uppercase"
        >
          <span>Scroll to explore</span>
          <motion.div animate={{ y: [0, 6, 0] }} transition={{ repeat: Infinity, duration: 1.4 }}>
            <ChevronDown className="w-4 h-4" />
          </motion.div>
        </motion.div>
      </section>

      {/* ═══════════════════════════════════
          2. ZOOM PARALLAX
      ═══════════════════════════════════ */}
      <ZoomParallax images={PARALLAX_IMAGES} />

      {/* ═══════════════════════════════════
          3. MISSION
      ═══════════════════════════════════ */}
      <section className="py-32 px-6 md:px-16 lg:px-24 max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-16 items-start">
          <FadeIn>
            <p className="text-xs font-semibold tracking-[0.2em] uppercase text-[#00bcd4] dark:text-[#00e5ff] mb-6">
              Our Mission
            </p>
            <h2 className="display-font text-4xl sm:text-5xl lg:text-6xl leading-tight text-foreground">
              Every Indian deserves a<br />
              <em
                className="not-italic"
                style={{
                  background: 'linear-gradient(90deg, #00bcd4 0%, #7b5ea7 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                frictionless charge.
              </em>
            </h2>
          </FadeIn>

          <FadeIn delay={0.15} className="lg:pt-16">
            <div className="space-y-5 text-muted-foreground text-lg leading-relaxed">
              <p>
                Range anxiety shouldn&apos;t be a reason to skip going electric. We built ChargeReserve to make the invisible infrastructure of EV ownership visible, predictable, and reliable.
              </p>
              <p>
                From solar-powered stations in Rajasthan to fast-chargers along NH48, we partner with operators who share our commitment to quality and uptime.
              </p>
              <p>
                Sustainability isn&apos;t a marketing word for us. It&apos;s the reason we exist.
              </p>
            </div>
            <div className="mt-10 h-px w-24" style={{ background: 'linear-gradient(90deg, #00bcd4, transparent)' }} />
          </FadeIn>
        </div>
      </section>

      {/* ═══════════════════════════════════
          4. STATS GRID
      ═══════════════════════════════════ */}
      <section className="py-16 px-6">
        <div className="max-w-6xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-px bg-border rounded-2xl overflow-hidden border border-border">
          {STATS.map(({ value, suffix, label, sub }, i) => (
            <FadeIn key={label} delay={i * 0.08} className="bg-background p-10 hover:bg-muted/40 transition-colors">
              <div
                className="text-4xl sm:text-5xl font-extrabold mb-2 tabular-nums"
                style={{
                  background: 'linear-gradient(135deg, #00bcd4 0%, #7b5ea7 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                {suffix === 'Cr+' ? '₹' : ''}
                <Counter target={value} suffix={suffix} />
              </div>
              <p className="text-foreground font-semibold text-sm mb-1">{label}</p>
              <p className="text-muted-foreground text-xs">{sub}</p>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════
          5. FEATURES
      ═══════════════════════════════════ */}
      <section className="py-32 px-6 md:px-16 lg:px-24 max-w-7xl mx-auto">
        <FadeIn className="text-center mb-20">
          <p className="text-xs font-semibold tracking-[0.2em] uppercase text-[#7b5ea7] mb-4">
            Why ChargeReserve
          </p>
          <h2 className="display-font text-4xl sm:text-5xl text-foreground">
            Charging, done right.
          </h2>
        </FadeIn>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {FEATURES.map(({ icon: Icon, title, desc }, i) => (
            <FadeIn key={title} delay={i * 0.1}>
              <div className="group relative p-8 rounded-2xl border border-border bg-card hover:border-[#00bcd4]/40 hover:bg-muted/30 transition-all duration-300 h-full">
                {/* Hover glow */}
                <div
                  className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
                  style={{ background: 'radial-gradient(ellipse at 30% 30%, rgba(0,188,212,0.06) 0%, transparent 70%)' }}
                />
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center mb-6 border border-[#00bcd4]/20"
                  style={{ background: 'linear-gradient(135deg, rgba(0,188,212,0.15), rgba(123,94,167,0.15))' }}
                >
                  <Icon className="w-5 h-5 text-[#00bcd4] dark:text-[#00e5ff]" />
                </div>
                <h3 className="font-bold text-foreground mb-3 text-base">{title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{desc}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════
          6. TIMELINE
      ═══════════════════════════════════ */}
      <section className="py-32 px-6 md:px-16 lg:px-24 max-w-5xl mx-auto">
        <FadeIn className="mb-20">
          <p className="text-xs font-semibold tracking-[0.2em] uppercase text-[#00bcd4] dark:text-[#00e5ff] mb-4">
            Our Story
          </p>
          <h2 className="display-font text-4xl sm:text-5xl text-foreground">
            From an idea to a movement.
          </h2>
        </FadeIn>

        <div className="relative">
          {/* Vertical line */}
          <div
            className="absolute left-[19px] top-0 bottom-0 w-px"
            style={{ background: 'linear-gradient(to bottom, rgba(0,188,212,0.5), rgba(123,94,167,0.3), transparent)' }}
          />

          <div className="space-y-12">
            {TIMELINE.map(({ year, title, desc }, i) => (
              <FadeIn key={year} delay={i * 0.12}>
                <div className="flex gap-8">
                  {/* Dot */}
                  <div className="flex-shrink-0 w-10 h-10 rounded-full border-2 border-[#00bcd4]/50 bg-background flex items-center justify-center z-10">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#00bcd4]" />
                  </div>
                  {/* Content */}
                  <div className="pb-2">
                    <span className="text-xs font-bold tracking-widest uppercase text-[#00bcd4]/80 mb-1 block">
                      {year}
                    </span>
                    <h3 className="text-foreground font-bold text-lg mb-2">{title}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed max-w-xl">{desc}</p>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════
          7. CTA
      ═══════════════════════════════════ */}
      <section className="px-6 pb-32">
        <FadeIn>
          <div
            className="relative max-w-5xl mx-auto rounded-3xl overflow-hidden p-16 text-center bg-card border border-border"
          >
            {/* Subtle gradient overlay — works in both modes */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  'radial-gradient(ellipse 70% 60% at 50% 0%, rgba(0,188,212,0.07) 0%, transparent 60%),' +
                  'radial-gradient(ellipse 50% 40% at 50% 100%, rgba(123,94,167,0.07) 0%, transparent 60%)',
              }}
            />

            <div className="relative z-10">
              <h2 className="display-font text-4xl sm:text-5xl lg:text-6xl text-foreground mb-6">
                Ready to charge smarter?
              </h2>
              <p className="text-muted-foreground text-lg max-w-xl mx-auto mb-12">
                Join thousands of EV drivers who trust ChargeReserve for a reliable, effortless charging experience across India.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  href="/find"
                  className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full font-bold text-sm text-white hover:opacity-90 transition-opacity"
                  style={{ background: 'linear-gradient(90deg, #00bcd4, #7b5ea7)' }}
                >
                  <Zap className="w-4 h-4" fill="currentColor" />
                  Find Stations
                </Link>
                <Link
                  href="/register"
                  className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full border border-border text-foreground font-semibold text-sm hover:bg-muted transition-colors"
                >
                  Get Started <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </FadeIn>
      </section>
    </main>
  );
}
