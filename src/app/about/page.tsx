'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import {
  motion,
  AnimatePresence,
  useInView,
  useScroll,
  useTransform,
  useMotionValueEvent,
} from 'framer-motion';
import {
  Zap, Globe, Clock, ChevronUp, ChevronDown,
  ArrowRight, MapPin, Phone, Mail, Users,
  TrendingUp, Cpu,
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

function Counter({ target, suffix = '' }: { target: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!inView) return;
    let cur = 0;
    const step = Math.max(1, Math.ceil(target / 60));
    const t = setInterval(() => {
      cur = Math.min(cur + step, target);
      setCount(cur);
      if (cur >= target) clearInterval(t);
    }, 20);
    return () => clearInterval(t);
  }, [inView, target]);
  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
}

const GRAD = 'linear-gradient(135deg, #00e5ff 0%, #7b5ea7 100%)';
const GT: React.CSSProperties = {
  background: GRAD, WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent', backgroundClip: 'text',
};

/* ══════ DATA ══════ */
const STATS = [
  { value: 3,     suffix: '+',  label: 'Years of Growth',     sub: 'Since 2022' },
  { value: 1500,  suffix: '+',  label: 'Stations Listed',     sub: 'Across India' },
  { value: 10000, suffix: '+',  label: 'Registered Drivers',  sub: 'And growing daily' },
  { value: 28,    suffix: '',   label: 'States Covered',      sub: 'Pan-India network' },
];

const VALUE_PROPS = [
  {
    num: '01', title: 'Real-Time Discovery', sub: 'Find any station, anywhere.',
    desc: 'Our platform aggregates live charger availability from thousands of stations. Search by location, connector type, or operator — and see exactly what\'s free right now before you leave home.',
    icon: Globe,
  },
  {
    num: '02', title: 'Advance Reservation', sub: 'Your slot. Reserved.',
    desc: 'Book your slot up to 24 hours in advance. No more arriving at a station only to find every port occupied. Your time and your charge are both guaranteed.',
    icon: Clock,
  },
  {
    num: '03', title: 'Smart Route Planning', sub: 'Drive further. Worry less.',
    desc: 'Plan long-distance EV trips with integrated charging waypoints. ChargeReserve identifies the optimal stops along your route, so range anxiety becomes a thing of the past.',
    icon: TrendingUp,
  },
  {
    num: '04', title: 'Operator Intelligence', sub: 'Built for station owners too.',
    desc: 'Our operator portal gives charging station owners real-time utilisation data, booking revenue tracking, and station health monitoring — all in one dashboard.',
    icon: Cpu,
  },
];

const TEAM_DEPTS = [
  'Platform Engineering', 'Mobile Applications', 'Station Operations',
  'Driver Experience', 'Data & Analytics', 'Business Development',
];

const FOUNDER = {
  name: 'Arjun Mehta',
  title: 'Founder & CEO, ChargeReserve',
  bio: 'Arjun spent over a decade in the automotive industry before the EV wave made him rethink everything. After experiencing the chaos of hunting for a working charger on a cross-country road trip, he built the solution he wished existed.',
  vision: '"We are building the operating system for EV mobility in India. The next generation of drivers shouldn\'t have to think about charging any more than they think about petrol today. It should just work."',
};

const ZONES = [
  { name: 'North', cities: ['Delhi NCR', 'Jaipur', 'Chandigarh', 'Lucknow'],
    address: '12th Floor, Worldmark 3, Aerocity, New Delhi — 110037', phone: '+91 11 4567 8901' },
  { name: 'West', cities: ['Mumbai', 'Pune', 'Ahmedabad', 'Surat'],
    address: 'Level 8, One BKC, Bandra Kurla Complex, Mumbai — 400051', phone: '+91 22 6789 0123' },
  { name: 'South', cities: ['Bengaluru', 'Chennai', 'Hyderabad', 'Kochi'],
    address: '5th Floor, Prestige Towers, MG Road, Bengaluru — 560001', phone: '+91 80 2345 6789' },
  { name: 'East', cities: ['Kolkata', 'Bhubaneswar', 'Guwahati', 'Patna'],
    address: '3rd Floor, Merlin Infinite, Salt Lake Sector V, Kolkata — 700091', phone: '+91 33 4567 8902' },
];

const PARTNERS = ['Tata Motors', 'MG Motor', 'Ola Electric', 'NTPC', 'EESL', 'ChargeGrid'];

/* Floating image configs for CTA [top%, left%, width, rotate, scrollMultiplier] */
const FLOAT_IMGS = [
  { src: '/images/about-cta/float-1.png', top: '5%',  left: '3%',  w: 220, r: -4,  m: -80 },
  { src: '/images/about-cta/float-2.png', top: '0%',  left: '38%', w: 200, r: 2,   m: -50 },
  { src: '/images/about-cta/float-3.png', top: '8%',  left: '72%', w: 210, r: 5,   m: -70 },
  { src: '/images/about-cta/float-4.png', top: '55%', left: '0%',  w: 230, r: 3,   m: -40 },
  { src: '/images/about-cta/float-5.png', top: '60%', left: '37%', w: 200, r: -3,  m: -90 },
  { src: '/images/about-cta/float-6.png', top: '52%', left: '71%', w: 215, r: -5,  m: -60 },
];

/* ══════ SCROLL-STICKY VALUE PROPS ══════ */
function ScrollValueProps() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeIdx, setActiveIdx] = useState(0);

  // Track scroll within this tall section
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  useMotionValueEvent(scrollYProgress, 'change', (v) => {
    // Map 0→1 progress to 0→3 index
    const idx = Math.min(VALUE_PROPS.length - 1, Math.floor(v * VALUE_PROPS.length));
    setActiveIdx(idx);
  });

  const prop = VALUE_PROPS[activeIdx];
  const PropIcon = prop.icon;

  return (
    /* Outer: tall so scroll can drive content */
    <div ref={containerRef} style={{ height: `${VALUE_PROPS.length * 100}vh` }} className="bg-[#050810]">
      {/* Inner: sticky so it stays visible */}
      <div className="sticky top-0 h-screen flex flex-col justify-center bg-[#050810] px-6 md:px-12 lg:px-20 overflow-hidden">
        {/* Section header */}
        <div className="max-w-7xl mx-auto w-full">
          <div className="text-center mb-12">
            <p className="body-font text-xs font-semibold tracking-[0.2em] uppercase text-[#7b5ea7] mb-3">
              COMPREHENSIVE PLATFORM
            </p>
            <h2 className="display-font text-4xl sm:text-5xl text-white max-w-2xl mx-auto leading-tight">
              One platform for every EV charging need.
            </h2>
            <p className="body-font text-white/45 text-base mt-3 max-w-xl mx-auto">
              Our goal is to make every charge meet the driver&apos;s needs — fast, safe, and completely hassle-free.
            </p>
          </div>

          {/* Two-col layout */}
          <div className="grid lg:grid-cols-[1fr_1.5fr] gap-12 items-center">
            {/* Left: icon + index + nav */}
            <div className="flex flex-col justify-between gap-8">
              {/* Icon */}
              <div
                className="w-28 h-28 md:w-36 md:h-36 rounded-3xl flex items-center justify-center border border-[#00e5ff]/20"
                style={{ background: 'linear-gradient(135deg, rgba(0,229,255,0.1), rgba(123,94,167,0.1))' }}
              >
                <AnimatePresence mode="wait">
                  <motion.div key={activeIdx}
                    initial={{ opacity: 0, scale: 0.75, rotate: -10 }}
                    animate={{ opacity: 1, scale: 1, rotate: 0 }}
                    exit={{ opacity: 0, scale: 0.75, rotate: 10 }}
                    transition={{ duration: 0.35 }}>
                    <PropIcon className="w-14 h-14 md:w-20 md:h-20 text-[#00e5ff]" strokeWidth={1.2} />
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Counter */}
              <p className="body-font text-white/20 text-3xl font-black tracking-widest tabular-nums select-none">
                {String(activeIdx + 1).padStart(2, '0')} / {String(VALUE_PROPS.length).padStart(2, '0')}
              </p>

              {/* Scroll hint gradient bar */}
              <div className="space-y-2">
                <p className="body-font text-white/30 text-xs tracking-widest uppercase">Scroll to explore</p>
                <div className="w-32 h-1 rounded-full bg-white/10 overflow-hidden">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ background: GRAD, width: `${((activeIdx + 1) / VALUE_PROPS.length) * 100}%` }}
                    animate={{ width: `${((activeIdx + 1) / VALUE_PROPS.length) * 100}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              </div>

              {/* Manual nav for non-scroll (mobile fallback) */}
              <div className="flex gap-3">
                <button
                  onClick={() => setActiveIdx((i) => Math.max(0, i - 1))}
                  className="w-10 h-10 rounded-full border border-white/15 flex items-center justify-center text-white/50 hover:border-[#00e5ff]/50 hover:text-[#00e5ff] transition-colors"
                  aria-label="Previous">
                  <ChevronUp className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setActiveIdx((i) => Math.min(VALUE_PROPS.length - 1, i + 1))}
                  className="w-10 h-10 rounded-full border border-white/15 flex items-center justify-center text-white/50 hover:border-[#00e5ff]/50 hover:text-[#00e5ff] transition-colors"
                  aria-label="Next">
                  <ChevronDown className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Right: content card */}
            <AnimatePresence mode="wait">
              <motion.div key={activeIdx}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                className="rounded-2xl border border-white/[0.07] bg-white/[0.03] p-8 md:p-12">
                <p className="body-font text-5xl font-black text-white/[0.07] mb-4 tabular-nums">{prop.num}</p>
                <h3 className="display-font text-3xl sm:text-4xl text-white mb-2">{prop.title}</h3>
                <p className="body-font text-[#00e5ff] font-semibold text-sm mb-6">{prop.sub}</p>
                <p className="body-font text-white/55 text-base leading-relaxed">{prop.desc}</p>

                {/* Pill nav */}
                <div className="flex flex-wrap gap-2 mt-8">
                  {VALUE_PROPS.map((vp, i) => (
                    <button key={vp.num} onClick={() => setActiveIdx(i)}
                      className={`body-font text-xs font-semibold px-3 py-1 rounded-full border transition-colors duration-200 ${
                        i === activeIdx
                          ? 'border-[#00e5ff]/60 text-[#00e5ff] bg-[#00e5ff]/10'
                          : 'border-white/15 text-white/35 hover:border-white/40'
                      }`}>{vp.num}</button>
                  ))}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ══════ FLOATING IMAGES CTA ══════ */
function FloatingImagesCTA() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  });

  return (
    <div
      ref={sectionRef}
      className="relative bg-[#06080f] overflow-hidden border-t border-white/[0.06]"
      style={{ minHeight: '100vh' }}
    >
      {/* Floating images — each has its own parallax offset */}
      {FLOAT_IMGS.map((img, i) => (
        <FloatImg key={i} {...img} scrollProg={scrollYProgress} />
      ))}

      {/* Vignette to blend edges */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 70% 70% at 50% 50%, transparent 30%, rgba(6,8,15,0.85) 100%)' }} />

      {/* Central text */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6 text-center py-32">
        <FadeIn delay={0.1}>
          <p className="body-font text-xs font-semibold tracking-[0.25em] uppercase text-[#00e5ff] mb-6">
            WHAT WE DO
          </p>
        </FadeIn>
        <FadeIn delay={0.2}>
          <h2 className="display-font text-4xl sm:text-5xl md:text-6xl text-white leading-[1.05] max-w-3xl mx-auto mb-8">
            Bring Your EV Vision to Life —<br />
            Connect with <span style={GT}>ChargeReserve</span> Today
          </h2>
        </FadeIn>
        <FadeIn delay={0.35}>
          <div className="flex flex-col sm:flex-row gap-4 mt-2">
            <Link href="/find"
              className="body-font inline-flex items-center gap-2 px-9 py-4 rounded-full font-bold text-sm text-black hover:opacity-90 transition-opacity"
              style={{ background: GRAD }}>
              <Zap className="w-4 h-4" fill="currentColor" /> Find Stations
            </Link>
            <Link href="/register"
              className="body-font inline-flex items-center gap-2 px-9 py-4 rounded-full border border-white/25 text-white font-semibold text-sm hover:bg-white/10 transition-colors">
              Get Started <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </FadeIn>

        {/* Contact info row */}
        <FadeIn delay={0.5} className="mt-48 w-full max-w-3xl">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 border border-white/[0.06] rounded-2xl bg-white/[0.02] p-6 backdrop-blur-sm">
            {[
              { icon: Mail, label: 'Email', val: 'hello@chargereserve.in' },
              { icon: MapPin, label: 'HQ', val: 'Aerocity, New Delhi' },
              { icon: Users, label: 'Careers', val: 'careers@chargereserve.in' },
            ].map(({ icon: Icon, label, val }) => (
              <div key={label} className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl border border-white/[0.08] bg-white/[0.04] flex items-center justify-center flex-shrink-0">
                  <Icon className="w-4 h-4 text-[#00e5ff]" />
                </div>
                <div className="text-left">
                  <p className="body-font text-white/30 text-[10px] uppercase tracking-widest">{label}</p>
                  <p className="body-font text-white/70 text-xs">{val}</p>
                </div>
              </div>
            ))}
          </div>
        </FadeIn>
      </div>
    </div>
  );
}

function FloatImg({
  src, top, left, w, r, m, scrollProg,
}: {
  src: string; top: string; left: string; w: number; r: number; m: number;
  scrollProg: ReturnType<typeof useScroll>['scrollYProgress'];
}) {
  const y = useTransform(scrollProg, [0, 1], [m, -m]);
  return (
    <motion.div
      style={{ y, top, left, width: w, rotate: r, position: 'absolute' }}
      className="rounded-xl overflow-hidden shadow-2xl shadow-black/60 pointer-events-none aspect-[4/3]"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt="" className="w-full h-full object-cover" loading="lazy" />
    </motion.div>
  );
}

/* ══════════════════════════════════════════════
   PAGE
══════════════════════════════════════════════ */
export default function AboutPage() {
  const [activeTab, setActiveTab] = useState<'team' | 'founder'>('team');
  const [activeZone, setActiveZone] = useState(0);

  return (
    <main className="relative bg-background text-foreground overflow-x-clip isolate">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        .display-font { font-family: 'DM Serif Display', serif; }
        .body-font { font-family: 'Plus Jakarta Sans', sans-serif; }
      `}</style>

      {/* ── 1. HERO ── */}
      <section className="relative h-[92vh] min-h-[600px] flex items-end overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1593941707882-a56bff233fb2?w=1800&q=85')" }} />
        <div className="absolute inset-0 bg-black/55" />
        <div className="absolute inset-0"
          style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.2) 50%, transparent 100%)' }} />
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse 50% 60% at 80% 10%, rgba(0,229,255,0.12) 0%, transparent 65%)' }} />

        <div className="relative z-10 w-full max-w-7xl mx-auto px-6 md:px-12 lg:px-20 pb-20">
          <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}>
            <p className="body-font text-xs font-semibold tracking-[0.25em] uppercase text-[#00e5ff] mb-5">About ChargeReserve</p>

            {/* SVG Mask Reveal Effect on hero text */}
            <MaskRevealHero
              revealRadius={260}
              className="max-w-4xl mb-8"
              baseContent={
                <>
                  <h1 className="display-font text-4xl sm:text-5xl md:text-6xl lg:text-7xl text-white leading-[1.05] mb-8">
                    India&apos;s most trusted platform for{' '}
                    <span style={GT}>EV charging reservations.</span>
                  </h1>
                  <p className="body-font text-base sm:text-lg text-white/65 max-w-2xl leading-relaxed">
                    We connect EV drivers with verified charging stations across 28 states — making the switch to electric seamless and stress-free.
                  </p>
                </>
              }
              revealContent={
                <>
                  <h1
                    className="display-font text-4xl sm:text-5xl md:text-6xl lg:text-7xl leading-[1.05] mb-8"
                    style={{
                      background: 'linear-gradient(135deg, #00e5ff 0%, #a78bfa 40%, #f472b6 70%, #00e5ff 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                      backgroundSize: '200% 100%',
                    }}
                  >
                    Experience the future of{' '}electric mobility today.
                  </h1>
                  <p className="body-font text-base sm:text-lg text-white max-w-2xl leading-relaxed">
                    Discover hidden chargers, access exclusive fast-charging networks, and reserve your slot with guaranteed availability and zero waiting time.
                  </p>
                </>
              }
            />
          </motion.div>
        </div>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 1 }}
          className="absolute bottom-8 right-10 flex flex-col items-center gap-1.5 text-white/40">
          <span className="body-font text-[10px] tracking-[0.2em] uppercase">Scroll</span>
          <motion.div animate={{ y: [0, 5, 0] }} transition={{ repeat: Infinity, duration: 1.5 }}>
            <ChevronDown className="w-4 h-4" />
          </motion.div>
        </motion.div>
      </section>

      {/* ── 2. INTRO ── */}
      <section className="bg-[#080c14] py-24 px-6 md:px-12 lg:px-20">
        <div className="max-w-7xl mx-auto">
          <FadeIn><p className="body-font text-xs font-semibold tracking-[0.2em] uppercase text-[#00e5ff] mb-4">Who We Are</p></FadeIn>
          <FadeIn delay={0.1}>
            <h2 className="display-font text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-white leading-[1.1] max-w-5xl mb-8">
              ChargeReserve is a technology platform that makes EV charging predictable, reliable, and reservation-ready across India.
            </h2>
          </FadeIn>
          <div className="grid md:grid-cols-2 gap-10 mb-16">
            <FadeIn delay={0.2}>
              <p className="body-font text-white/55 text-base md:text-lg leading-relaxed">
                Founded by EV enthusiasts who drove across the country cataloguing every pain point — that research became the blueprint for ChargeReserve.
              </p>
            </FadeIn>
            <FadeIn delay={0.3}>
              <p className="body-font text-white/55 text-base md:text-lg leading-relaxed">
                Today we work with charging operators, fleet companies, and highway concessionaires to deliver a unified reservation layer on India&apos;s fast-growing EV infrastructure.
              </p>
            </FadeIn>
          </div>
          <FadeIn delay={0.15}>
            <p className="body-font text-white/30 text-xs tracking-widest uppercase mb-5 text-center">Trusted by leading EV ecosystem partners</p>
            <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
              {PARTNERS.map((p) => (
                <div key={p} className="body-font font-bold text-xl tracking-tight text-white/20 hover:text-white/55 transition-colors duration-300 cursor-default select-none">{p}</div>
              ))}
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ── 3. EDITORIAL + STATS ── */}
      <section className="bg-[#080c14] py-20 px-6 md:px-12 lg:px-20 border-t border-white/[0.06]">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-start mb-16">
            <FadeIn direction="left">
              <div>
                <p className="body-font text-3xl sm:text-4xl font-extrabold text-white leading-tight mb-2">Efficient.</p>
                <p className="body-font text-3xl sm:text-4xl font-extrabold text-white leading-tight mb-2">Reliable.</p>
                <p className="body-font text-3xl sm:text-4xl font-extrabold leading-tight" style={GT}>ChargeReserve.</p>
              </div>
            </FadeIn>
            <FadeIn direction="right" delay={0.15}>
              <p className="body-font text-white/55 text-base leading-relaxed">
                We specialise in dependable EV infrastructure services that keep drivers charged. With unrelenting focus on platform reliability and operator partnerships, we scale across every corner of India.
              </p>
            </FadeIn>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-white/[0.07] rounded-2xl overflow-hidden border border-white/[0.06]">
            {STATS.map(({ value, suffix, label, sub }, i) => (
              <FadeIn key={label} delay={i * 0.08} className="bg-[#080c14] p-10 hover:bg-white/[0.04] transition-colors">
                <p className="body-font text-4xl sm:text-5xl font-black tabular-nums mb-2" style={GT}>
                  <Counter target={value} suffix={suffix} />
                </p>
                <p className="body-font text-white font-semibold text-sm mb-1">{label}</p>
                <p className="body-font text-white/40 text-xs">{sub}</p>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── 4. SCROLL-DRIVEN VALUE PROPS ── */}
      <ScrollValueProps />

      {/* ── 5. TEAM / FOUNDER ── */}
      <section className="bg-[#080c14] py-28 px-6 md:px-12 lg:px-20 border-t border-white/[0.06]">
        <div className="max-w-7xl mx-auto">
          <FadeIn className="flex gap-6 mb-16">
            {(['team', 'founder'] as const).map((tab) => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className={`body-font font-semibold text-sm tracking-widest uppercase pb-2 border-b-2 transition-colors duration-200 ${
                  activeTab === tab ? 'text-white border-[#00e5ff]' : 'text-white/30 border-transparent hover:text-white/60'}`}>
                {tab === 'team' ? 'Our Team' : 'The Founder'}
              </button>
            ))}
          </FadeIn>

          <AnimatePresence mode="wait">
            {activeTab === 'team' ? (
              <motion.div key="team" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.5 }}
                className="grid lg:grid-cols-2 gap-16 items-start">
                <div>
                  <h2 className="display-font text-4xl sm:text-5xl text-white leading-tight mb-8">
                    A diverse crew with a singular obsession: making EV charging{' '}
                    <em className="not-italic" style={GT}>just work.</em>
                  </h2>
                  <p className="body-font text-white/55 text-base leading-relaxed mb-6">
                    Our team spans engineering, operations, design, and data — with backgrounds in mobility, fintech, and infrastructure. What unites us is a shared belief that electric mobility is the defining transport shift of our generation.
                  </p>
                  <p className="body-font text-white/35 text-sm leading-relaxed">
                    We are hiring across all functions. If you care deeply about EV infrastructure, we want to hear from you.
                  </p>
                </div>
                <div className="relative rounded-2xl overflow-hidden border border-white/[0.08] min-h-[380px] flex items-end"
                  style={{ backgroundImage: "url('https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=900&q=75')", backgroundSize: 'cover', backgroundPosition: 'center' }}>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                  <div className="relative z-10 p-8">
                    <p className="body-font text-white/40 text-xs uppercase tracking-widest mb-3">Our Departments</p>
                    <div className="flex flex-wrap gap-2">
                      {TEAM_DEPTS.map((d) => (
                        <span key={d} className="body-font text-xs font-semibold px-3 py-1.5 rounded-full border border-white/20 text-white/70 bg-black/40 backdrop-blur-sm">{d}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div key="founder" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.5 }}
                className="grid lg:grid-cols-2 gap-16 items-start">
                <div>
                  <p className="body-font text-xs font-semibold tracking-[0.2em] uppercase text-[#00e5ff] mb-5">Founder &amp; CEO</p>
                  <h2 className="display-font text-4xl sm:text-5xl text-white leading-tight mb-8">{FOUNDER.name}</h2>
                  <p className="body-font text-white/55 text-base leading-relaxed mb-8">{FOUNDER.bio}</p>
                  <blockquote className="body-font border-l-2 border-[#00e5ff]/40 pl-6 text-white/70 text-base leading-relaxed italic">{FOUNDER.vision}</blockquote>
                </div>
                <div className="relative rounded-2xl overflow-hidden border border-white/[0.08] min-h-[420px] flex items-end"
                  style={{ backgroundImage: "url('https://images.unsplash.com/photo-1560250097-0b93528c311a?w=800&q=75')", backgroundSize: 'cover', backgroundPosition: 'center top' }}>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
                  <div className="relative z-10 p-8">
                    <p className="body-font font-bold text-white text-lg">{FOUNDER.name}</p>
                    <p className="body-font text-white/50 text-sm">{FOUNDER.title}</p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* ── 6. REGIONAL ZONES ── */}
      <section className="bg-[#050810] py-28 px-6 md:px-12 lg:px-20 border-t border-white/[0.06]">
        <div className="max-w-7xl mx-auto">
          <FadeIn className="mb-12">
            <p className="body-font text-xs font-semibold tracking-[0.2em] uppercase text-[#7b5ea7] mb-4">Presence</p>
            <h2 className="display-font text-4xl sm:text-5xl text-white">Our Regional Zones</h2>
          </FadeIn>
          <div className="flex flex-wrap gap-2 mb-10">
            {ZONES.map((z, i) => (
              <button key={z.name} onClick={() => setActiveZone(i)}
                className={`body-font font-semibold text-sm px-6 py-2.5 rounded-full border transition-all duration-200 ${
                  i === activeZone ? 'border-[#00e5ff]/70 text-[#00e5ff] bg-[#00e5ff]/10' : 'border-white/15 text-white/45 hover:border-white/40 hover:text-white/70'}`}>
                {z.name} India
              </button>
            ))}
          </div>
          <AnimatePresence mode="wait">
            <motion.div key={activeZone} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }} transition={{ duration: 0.4 }}
              className="grid md:grid-cols-2 lg:grid-cols-[1.6fr_1fr] gap-8 items-start">
              <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-8 md:p-10">
                <p className="body-font text-xs font-semibold tracking-widest uppercase text-[#00e5ff] mb-5">{ZONES[activeZone].name} Zone Cities</p>
                <div className="grid grid-cols-2 gap-3 mb-8">
                  {ZONES[activeZone].cities.map((city) => (
                    <div key={city} className="flex items-center gap-2.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#00e5ff]/60 flex-shrink-0" />
                      <span className="body-font text-white/70 text-sm font-medium">{city}</span>
                    </div>
                  ))}
                </div>
                <div className="h-px bg-white/[0.07] mb-5" />
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <MapPin className="w-4 h-4 text-[#7b5ea7] flex-shrink-0 mt-0.5" />
                    <p className="body-font text-white/50 text-sm leading-relaxed">{ZONES[activeZone].address}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="w-4 h-4 text-[#7b5ea7] flex-shrink-0" />
                    <p className="body-font text-white/50 text-sm">{ZONES[activeZone].phone}</p>
                  </div>
                </div>
              </div>
              <div className="relative rounded-2xl overflow-hidden border border-white/[0.08] min-h-[260px] bg-[#0d1220] flex items-center justify-center">
                <div className="absolute inset-0 opacity-10">
                  <svg viewBox="0 0 400 400" className="w-full h-full">
                    <defs><radialGradient id="mg" cx="50%" cy="50%" r="50%"><stop offset="0%" stopColor="#00e5ff" stopOpacity="0.4"/><stop offset="100%" stopColor="#7b5ea7" stopOpacity="0"/></radialGradient></defs>
                    {[60,120,180,240,300,360].map((v) => (
                      <g key={v}><line x1={v} y1="0" x2={v} y2="400" stroke="#00e5ff" strokeWidth="0.5" strokeOpacity="0.3"/><line x1="0" y1={v} x2="400" y2={v} stroke="#00e5ff" strokeWidth="0.5" strokeOpacity="0.3"/></g>
                    ))}
                    <circle cx="200" cy="200" r="120" fill="url(#mg)"/>
                  </svg>
                </div>
                <div className="relative z-10 text-center p-8">
                  <div className="w-12 h-12 rounded-full border border-[#00e5ff]/30 bg-[#00e5ff]/10 flex items-center justify-center mx-auto mb-4">
                    <MapPin className="w-5 h-5 text-[#00e5ff]" />
                  </div>
                  <p className="body-font text-white/60 text-sm"><span className="text-white font-semibold">{ZONES[activeZone].cities.length} cities</span> in {ZONES[activeZone].name} India</p>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      {/* ── 7. FLOATING IMAGES CTA ── */}
      <FloatingImagesCTA />
    </main>
  );
}
