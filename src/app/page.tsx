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
  Zap, Clock, ChevronUp, ChevronDown,
  ArrowRight, MapPin, Phone, Mail, Users,
  TrendingUp, Cpu, BatteryCharging, CalendarCheck, BarChart4, Map, ShieldCheck, Network
} from "@/lib/icons";
import { Globe } from "@/components/ui/globe";
import { Map as MapComponent, MapMarker, MarkerContent } from "@/components/ui/map";
import type { COBEOptions } from "cobe";
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
    num: '01', title: 'Real-Time Discovery', sub: 'Live charging status.',
    desc: 'Instantly locate available charging stations near you or along your route. Filter by connector type, charging speed, and availability status.',
    icon: BatteryCharging,
  },
  {
    num: '02', title: 'Advance Spot Reservation', sub: 'Never wait in line again.',
    desc: 'Book a charging slot up to 24 hours in advance and arrive knowing your spot is waiting exclusively for you.',
    icon: CalendarCheck,
  },
  {
    num: '03', title: 'Intelligent Route Planning', sub: 'Range-aware journeys.',
    desc: 'Plan long-haul journeys with integrated EV charging waypoints. Our algorithm calculates optimal stops based on your vehicle range and traffic.',
    icon: Map,
  },
  {
    num: '04', title: 'Operator Intelligence', sub: 'For station owners.',
    desc: 'A comprehensive dashboard for station owners to monitor utilization, track revenue, and analyze peak charging hours across their network.',
    icon: BarChart4,
  },
  {
    num: '05', title: 'Secure Digital Payments', sub: 'Plug and play payments.',
    desc: 'Seamlessly pay for your charging sessions through our integrated wallet. Auto-deduct features make your charging experience truly plug-and-play.',
    icon: ShieldCheck,
  },
  {
    num: '06', title: 'B2B Fleet Management', sub: 'Enterprise charging solutions.',
    desc: 'Dedicated enterprise solutions for managing electric vehicle fleets. Monitor charging costs, track driver schedules, and optimize fleet downtime.',
    icon: Network,
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
  { 
    name: 'North', 
    cities: [
      { name: 'Delhi NCR', address: '12th Floor, Worldmark 3, Aerocity, New Delhi — 110037', phone: '+91 11 4567 8901' },
      { name: 'Jaipur', address: 'Plot No. 2, Malviya Industrial Area, Jaipur — 302017', phone: '+91 141 2780 123' },
      { name: 'Chandigarh', address: 'Level 4, Elante Office Complex, Phase 1, Chandigarh — 160002', phone: '+91 172 4567 890' },
      { name: 'Lucknow', address: '5th Floor, Cyber Heights, Vibhuti Khand, Lucknow — 226010', phone: '+91 522 6789 012' }
    ],
    center: [77.2090, 28.6139] as [number, number], zoom: 4,
    markers: [
      { name: "Delhi", location: [28.6139, 77.2090] as [number, number] },
      { name: "Jaipur", location: [26.9124, 75.7873] as [number, number] },
      { name: "Chandigarh", location: [30.7333, 76.7794] as [number, number] },
      { name: "Lucknow", location: [26.8467, 80.9462] as [number, number] }
    ]
  },
  { 
    name: 'West', 
    cities: [
      { name: 'Mumbai', address: 'Level 8, One BKC, Bandra Kurla Complex, Mumbai — 400051', phone: '+91 22 6789 0123' },
      { name: 'Pune', address: '3rd Floor, Amar Business Park, Baner, Pune — 411045', phone: '+91 20 4567 8901' },
      { name: 'Ahmedabad', address: 'B-Block, Westgate Business Bay, SG Highway, Ahmedabad — 380051', phone: '+91 79 2345 6789' },
      { name: 'Surat', address: '7th Floor, International Business Center, Piplod, Surat — 395007', phone: '+91 261 4567 890' }
    ],
    center: [72.8777, 19.0760] as [number, number], zoom: 4,
    markers: [
      { name: "Mumbai", location: [19.0760, 72.8777] as [number, number] },
      { name: "Pune", location: [18.5204, 73.8567] as [number, number] },
      { name: "Ahmedabad", location: [23.0225, 72.5714] as [number, number] },
      { name: "Surat", location: [21.1702, 72.8311] as [number, number] }
    ]
  },
  { 
    name: 'South', 
    cities: [
      { name: 'Bengaluru', address: '5th Floor, Prestige Towers, MG Road, Bengaluru — 560001', phone: '+91 80 2345 6789' },
      { name: 'Chennai', address: '2nd Floor, Workfolio, OMR, Perungudi, Chennai — 600096', phone: '+91 44 6789 0123' },
      { name: 'Hyderabad', address: 'Level 10, My Home Twitza, Hitech City, Hyderabad — 500081', phone: '+91 40 4567 8901' },
      { name: 'Kochi', address: '3rd Floor, Lulu Cyber Tower, Infopark, Kochi — 682030', phone: '+91 484 2345 678' }
    ],
    center: [77.5946, 12.9716] as [number, number], zoom: 4.2,
    markers: [
      { name: "Bengaluru", location: [12.9716, 77.5946] as [number, number] },
      { name: "Chennai", location: [13.0827, 80.2707] as [number, number] },
      { name: "Hyderabad", location: [17.3850, 78.4867] as [number, number] },
      { name: "Kochi", location: [9.9312, 76.2673] as [number, number] }
    ]
  },
  { 
    name: 'East', 
    cities: [
      { name: 'Kolkata', address: '3rd Floor, Merlin Infinite, Salt Lake Sector V, Kolkata — 700091', phone: '+91 33 4567 8902' },
      { name: 'Bhubaneswar', address: '4th Floor, Fortune Tower, Maitree Vihar, Bhubaneswar — 751023', phone: '+91 674 2345 678' },
      { name: 'Guwahati', address: 'Level 2, Dona Planet, GS Road, Guwahati — 781005', phone: '+91 361 4567 890' },
      { name: 'Patna', address: '5th Floor, Maurya Tower, Fraser Road, Patna — 800001', phone: '+91 612 2345 678' }
    ],
    center: [88.3639, 22.5726] as [number, number], zoom: 4,
    markers: [
      { name: "Kolkata", location: [22.5726, 88.3639] as [number, number] },
      { name: "Bhubaneswar", location: [20.2961, 85.8245] as [number, number] },
      { name: "Guwahati", location: [26.1158, 91.7086] as [number, number] },
      { name: "Patna", location: [25.5941, 85.1376] as [number, number] }
    ]
  }
];

const PARTNERS = ['Tata Motors', 'MG Motor', 'Ola Electric', 'NTPC', 'EESL', 'ChargeGrid'];

/* Floating image configs for CTA [top%, left%, width, rotate, scrollMultiplier] */
const FLOAT_IMGS = [
  { src: '/images/about-cta/float-1.png', top: '5%',  left: '3%',  w: 220, r: -4,  m: -240 },
  { src: '/images/about-cta/float-2.png', top: '0%',  left: '38%', w: 200, r: 2,   m: -150 },
  { src: '/images/about-cta/float-3.png', top: '8%',  left: '72%', w: 210, r: 5,   m: -210 },
  { src: '/images/about-cta/float-4.png', top: '55%', left: '0%',  w: 230, r: 3,   m: -120 },
  { src: '/images/about-cta/float-5.png', top: '60%', left: '37%', w: 200, r: -3,  m: -270 },
  { src: '/images/about-cta/float-6.png', top: '52%', left: '71%', w: 215, r: -5,  m: -180 },
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
    <div ref={containerRef} style={{ height: `${VALUE_PROPS.length * 100}vh` }} className="bg-background">
      {/* Inner: sticky so it stays visible */}
      <div className="sticky top-0 h-screen flex flex-col justify-center bg-background px-6 md:px-12 lg:px-20 overflow-hidden">
        {/* Section header */}
        <div className="max-w-7xl mx-auto w-full">
          <div className="text-center mb-12">
            <p className="body-font text-xs font-semibold tracking-[0.2em] uppercase text-secondary/80 mb-3">
              COMPREHENSIVE PLATFORM
            </p>
            <h2 className="display-font text-4xl sm:text-5xl text-foreground max-w-2xl mx-auto leading-tight">
              One platform for every EV charging need.
            </h2>
            <p className="body-font text-muted-foreground text-base mt-3 max-w-xl mx-auto">
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
                    <PropIcon className="w-14 h-14 md:w-20 md:h-20 text-primary" strokeWidth={1.2} />
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Counter */}
              <p className="body-font text-muted-foreground text-3xl font-black tracking-widest tabular-nums select-none">
                {String(activeIdx + 1).padStart(2, '0')} / {String(VALUE_PROPS.length).padStart(2, '0')}
              </p>

              {/* Scroll hint gradient bar */}
              <div className="space-y-2">
                <p className="body-font text-muted-foreground text-xs tracking-widest uppercase">Scroll to explore</p>
                <div className="w-32 h-1 rounded-full bg-muted overflow-hidden">
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
                  className="w-10 h-10 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:border-[#00e5ff]/50 hover:text-primary transition-colors"
                  aria-label="Previous">
                  <ChevronUp className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setActiveIdx((i) => Math.min(VALUE_PROPS.length - 1, i + 1))}
                  className="w-10 h-10 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:border-[#00e5ff]/50 hover:text-primary transition-colors"
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
                className="rounded-2xl border border-border bg-card p-8 md:p-12">
                <p className="body-font text-5xl font-black text-muted-foreground mb-4 tabular-nums">{prop.num}</p>
                <h3 className="display-font text-3xl sm:text-4xl text-foreground mb-2">{prop.title}</h3>
                <p className="body-font text-primary font-semibold text-sm mb-6">{prop.sub}</p>
                <p className="body-font text-muted-foreground text-base leading-relaxed">{prop.desc}</p>

                {/* Pill nav */}
                <div className="flex flex-wrap gap-2 mt-8">
                  {VALUE_PROPS.map((vp, i) => (
                    <button key={vp.num} onClick={() => setActiveIdx(i)}
                      className={`body-font text-xs font-semibold px-3 py-1 rounded-full border transition-colors duration-200 ${
                        i === activeIdx
                          ? 'border-[#00e5ff]/60 text-primary bg-[#00e5ff]/10'
                          : 'border-border text-muted-foreground hover:border-border'
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
      className="relative bg-background dark:bg-[#06080f] overflow-hidden border-t border-border"
      style={{ minHeight: '100vh' }}
    >
      {/* Floating images — each has its own parallax offset */}
      {FLOAT_IMGS.map((img, i) => (
        <FloatImg key={i} {...img} scrollProg={scrollYProgress} />
      ))}

      {/* Vignette to blend edges */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 70% 70% at 50% 50%, transparent 30%, hsl(var(--background) / 0.85) 100%)' }} />

      {/* Central text */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6 text-center py-32">
        <FadeIn delay={0.1}>
          <p className="body-font text-xs font-semibold tracking-[0.25em] uppercase text-primary mb-6">
            WHAT WE DO
          </p>
        </FadeIn>
        <FadeIn delay={0.2}>
          <h2 className="display-font text-4xl sm:text-5xl md:text-6xl text-foreground leading-[1.05] max-w-3xl mx-auto mb-8">
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
              className="body-font inline-flex items-center gap-2 px-9 py-4 rounded-full border border-border text-foreground font-semibold text-sm hover:bg-muted transition-colors">
              Get Started <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </FadeIn>

        {/* Contact info row */}
        <FadeIn delay={0.5} className="mt-48 w-full max-w-3xl">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 border border-border rounded-2xl bg-card p-6 backdrop-blur-sm">
            {[
              { icon: Mail, label: 'Email', val: 'hello@chargereserve.in' },
              { icon: MapPin, label: 'HQ', val: 'Aerocity, New Delhi' },
              { icon: Users, label: 'Careers', val: 'careers@chargereserve.in' },
            ].map(({ icon: Icon, label, val }) => (
              <div key={label} className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl border border-border bg-muted flex items-center justify-center flex-shrink-0">
                  <Icon className="w-4 h-4 text-primary" />
                </div>
                <div className="text-left">
                  <p className="body-font text-muted-foreground text-[10px] uppercase tracking-widest">{label}</p>
                  <p className="body-font text-muted-foreground text-xs">{val}</p>
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
      className="rounded-xl overflow-hidden shadow-2xl shadow-foreground/10 pointer-events-none aspect-[4/3]"
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
  const [activeCity, setActiveCity] = useState(0);

  useEffect(() => {
    setActiveCity(0);
  }, [activeZone]);

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
        <div className="absolute inset-0 bg-background/80" />
        <div className="absolute inset-0"
          style={{ background: 'linear-gradient(to top, hsl(var(--background) / 0.92) 0%, hsl(var(--background) / 0.2) 50%, transparent 100%)' }} />
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse 50% 60% at 80% 10%, rgba(0,229,255,0.12) 0%, transparent 65%)' }} />

        <div className="relative z-10 w-full max-w-7xl mx-auto px-6 md:px-12 lg:px-20 pb-20">
          <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}>
            <p className="body-font text-xs font-semibold tracking-[0.25em] uppercase text-primary mb-5">About ChargeReserve</p>

            {/* SVG Mask Reveal Effect on hero text */}
            <MaskRevealHero
              revealRadius={260}
              className="max-w-4xl mb-8"
              baseContent={
                <>
                  <h1 className="display-font text-4xl sm:text-5xl md:text-6xl lg:text-7xl text-foreground leading-[1.05] mb-8">
                    India&apos;s most trusted platform for{' '}
                    <span style={GT}>EV charging reservations.</span>
                  </h1>
                  <p className="body-font text-base sm:text-lg text-muted-foreground max-w-2xl leading-relaxed">
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
                  <p className="body-font text-base sm:text-lg text-foreground max-w-2xl leading-relaxed">
                    Discover hidden chargers, access exclusive fast-charging networks, and reserve your slot with guaranteed availability and zero waiting time.
                  </p>
                </>
              }
            />
          </motion.div>
        </div>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 1 }}
          className="absolute bottom-8 right-10 flex flex-col items-center gap-1.5 text-muted-foreground">
          <span className="body-font text-[10px] tracking-[0.2em] uppercase">Scroll</span>
          <motion.div animate={{ y: [0, 5, 0] }} transition={{ repeat: Infinity, duration: 1.5 }}>
            <ChevronDown className="w-4 h-4" />
          </motion.div>
        </motion.div>
      </section>

      {/* ── 2. INTRO ── */}
      <section className="bg-muted/30 py-24 px-6 md:px-12 lg:px-20">
        <div className="max-w-7xl mx-auto">
          <FadeIn><p className="body-font text-xs font-semibold tracking-[0.2em] uppercase text-primary mb-4">Who We Are</p></FadeIn>
          <FadeIn delay={0.1}>
            <h2 className="display-font text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-foreground leading-[1.1] max-w-5xl mb-8">
              ChargeReserve is a technology platform that makes EV charging predictable, reliable, and reservation-ready across India.
            </h2>
          </FadeIn>
          <div className="grid md:grid-cols-2 gap-10 mb-16">
            <FadeIn delay={0.2}>
              <p className="body-font text-muted-foreground text-base md:text-lg leading-relaxed">
                Founded by EV enthusiasts who drove across the country cataloguing every pain point — that research became the blueprint for ChargeReserve.
              </p>
            </FadeIn>
            <FadeIn delay={0.3}>
              <p className="body-font text-muted-foreground text-base md:text-lg leading-relaxed">
                Today we work with charging operators, fleet companies, and highway concessionaires to deliver a unified reservation layer on India&apos;s fast-growing EV infrastructure.
              </p>
            </FadeIn>
          </div>
          <FadeIn delay={0.15}>
            <p className="body-font text-muted-foreground text-xs tracking-widest uppercase mb-5 text-center">Trusted by leading EV ecosystem partners</p>
            <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
              {PARTNERS.map((p) => (
                <div key={p} className="body-font font-bold text-xl tracking-tight text-muted-foreground hover:text-muted-foreground transition-colors duration-300 cursor-default select-none">{p}</div>
              ))}
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ── 3. EDITORIAL + STATS ── */}
      <section className="bg-muted/30 py-20 px-6 md:px-12 lg:px-20 border-t border-border">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-start mb-16">
            <FadeIn direction="left">
              <div>
                <p className="body-font text-3xl sm:text-4xl font-extrabold text-foreground leading-tight mb-2">Efficient.</p>
                <p className="body-font text-3xl sm:text-4xl font-extrabold text-foreground leading-tight mb-2">Reliable.</p>
                <p className="body-font text-3xl sm:text-4xl font-extrabold leading-tight" style={GT}>ChargeReserve.</p>
              </div>
            </FadeIn>
            <FadeIn direction="right" delay={0.15}>
              <p className="body-font text-muted-foreground text-base leading-relaxed">
                We specialise in dependable EV infrastructure services that keep drivers charged. With unrelenting focus on platform reliability and operator partnerships, we scale across every corner of India.
              </p>
            </FadeIn>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-muted rounded-2xl overflow-hidden border border-border">
            {STATS.map(({ value, suffix, label, sub }, i) => (
              <FadeIn key={label} delay={i * 0.08} className="bg-muted/30 p-10 hover:bg-accent transition-colors">
                <p className="body-font text-4xl sm:text-5xl font-black tabular-nums mb-2" style={GT}>
                  <Counter target={value} suffix={suffix} />
                </p>
                <p className="body-font text-foreground font-semibold text-sm mb-1">{label}</p>
                <p className="body-font text-muted-foreground text-xs">{sub}</p>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── 4. SCROLL-DRIVEN VALUE PROPS ── */}
      <ScrollValueProps />

      {/* ── 5. TEAM / FOUNDER ── */}
      <section className="bg-muted/30 py-28 px-6 md:px-12 lg:px-20 border-t border-border">
        <div className="max-w-7xl mx-auto">
          <FadeIn className="flex gap-6 mb-16">
            {(['team', 'founder'] as const).map((tab) => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className={`body-font font-semibold text-sm tracking-widest uppercase pb-2 border-b-2 transition-colors duration-200 ${
                  activeTab === tab ? 'text-foreground border-[#00e5ff]' : 'text-muted-foreground border-transparent hover:text-muted-foreground'}`}>
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
                  <h2 className="display-font text-4xl sm:text-5xl text-foreground leading-tight mb-8">
                    A diverse crew with a singular obsession: making EV charging{' '}
                    <em className="not-italic" style={GT}>just work.</em>
                  </h2>
                  <p className="body-font text-muted-foreground text-base leading-relaxed mb-6">
                    Our team spans engineering, operations, design, and data — with backgrounds in mobility, fintech, and infrastructure. What unites us is a shared belief that electric mobility is the defining transport shift of our generation.
                  </p>
                  <p className="body-font text-muted-foreground text-sm leading-relaxed">
                    We are hiring across all functions. If you care deeply about EV infrastructure, we want to hear from you.
                  </p>
                </div>
                <div className="relative rounded-2xl overflow-hidden border border-border min-h-[380px] flex items-end"
                  style={{ backgroundImage: "url('https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=900&q=75')", backgroundSize: 'cover', backgroundPosition: 'center' }}>
                  <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/40 to-transparent" />
                  <div className="relative z-10 p-8">
                    <p className="body-font text-muted-foreground text-xs uppercase tracking-widest mb-3">Our Departments</p>
                    <div className="flex flex-wrap gap-2">
                      {TEAM_DEPTS.map((d) => (
                        <span key={d} className="body-font text-xs font-semibold px-3 py-1.5 rounded-full border border-border text-muted-foreground bg-background/80 backdrop-blur-sm">{d}</span>
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
                  <p className="body-font text-xs font-semibold tracking-[0.2em] uppercase text-primary mb-5">Founder &amp; CEO</p>
                  <h2 className="display-font text-4xl sm:text-5xl text-foreground leading-tight mb-8">{FOUNDER.name}</h2>
                  <p className="body-font text-muted-foreground text-base leading-relaxed mb-8">{FOUNDER.bio}</p>
                  <blockquote className="body-font border-l-2 border-[#00e5ff]/40 pl-6 text-muted-foreground text-base leading-relaxed italic">{FOUNDER.vision}</blockquote>
                </div>
                <div className="relative rounded-2xl overflow-hidden border border-border min-h-[420px] flex items-end"
                  style={{ backgroundImage: "url('https://images.unsplash.com/photo-1560250097-0b93528c311a?w=800&q=75')", backgroundSize: 'cover', backgroundPosition: 'center top' }}>
                  <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/40 to-transparent" />
                  <div className="relative z-10 p-8">
                    <p className="body-font font-bold text-foreground text-lg">{FOUNDER.name}</p>
                    <p className="body-font text-muted-foreground text-sm">{FOUNDER.title}</p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* ── 6. REGIONAL ZONES ── */}
      <section className="bg-background py-28 px-6 md:px-12 lg:px-20 border-t border-border">
        <div className="max-w-7xl mx-auto">
          <FadeIn className="mb-12">
            <p className="body-font text-xs font-semibold tracking-[0.2em] uppercase text-secondary/80 mb-4">Presence</p>
            <h2 className="display-font text-4xl sm:text-5xl text-foreground">Our Regional Zones</h2>
          </FadeIn>
          <div className="flex flex-wrap gap-2 mb-10">
            {ZONES.map((z, i) => (
              <button key={z.name} onClick={() => setActiveZone(i)}
                className={`body-font font-semibold text-sm px-6 py-2.5 rounded-full border transition-all duration-200 ${
                  i === activeZone ? 'border-[#00e5ff]/70 text-primary bg-[#00e5ff]/10' : 'border-border text-muted-foreground hover:border-border hover:text-muted-foreground'}`}>
                {z.name} India
              </button>
            ))}
          </div>
          <AnimatePresence mode="wait">
            <motion.div key={activeZone} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }} transition={{ duration: 0.4 }}
              className="grid md:grid-cols-2 lg:grid-cols-[1.6fr_1fr] gap-8 items-start">
              <div className="rounded-2xl border border-border bg-card p-8 md:p-10">
                <div className="grid grid-cols-2 gap-3 mb-8">
                  {ZONES[activeZone].cities.map((city, idx) => (
                    <button 
                      key={city.name} 
                      onClick={() => setActiveCity(idx)}
                      className={`flex items-center gap-2.5 p-2 rounded-xl transition-all ${
                        idx === activeCity ? 'bg-primary/10 border border-primary/20' : 'hover:bg-muted/50 border border-transparent'
                      }`}
                    >
                      <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                        idx === activeCity ? 'bg-primary' : 'bg-[#00e5ff]/60'
                      }`} />
                      <span className={`body-font text-sm font-medium ${
                        idx === activeCity ? 'text-foreground' : 'text-muted-foreground'
                      }`}>{city.name}</span>
                    </button>
                  ))}
                </div>
                <div className="h-px bg-border mb-5" />
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <MapPin className="w-4 h-4 text-secondary/80 flex-shrink-0 mt-0.5" />
                    <p className="body-font text-muted-foreground text-sm leading-relaxed">
                      {ZONES[activeZone].cities[activeCity].address}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="w-4 h-4 text-secondary/80 flex-shrink-0" />
                    <p className="body-font text-muted-foreground text-sm">
                      {ZONES[activeZone].cities[activeCity].phone}
                    </p>
                  </div>
                </div>
              </div>
              <div className="relative rounded-2xl overflow-hidden border border-border min-h-[400px] bg-card flex flex-col">
                <div className="absolute inset-0 z-0">
                  <MapComponent 
                    viewport={{ 
                      center: ZONES[activeZone].center, 
                      zoom: ZONES[activeZone].zoom 
                    }}
                    interactive={false}
                  >
                    {ZONES[activeZone].markers.map((marker, i) => (
                      <MapMarker 
                        key={`${marker.name}-${i}`} 
                        longitude={marker.location[1]} 
                        latitude={marker.location[0]}
                      >
                        <MarkerContent>
                          <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-background border border-primary/30 backdrop-blur-md">
                            <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                            <span className="text-[9px] uppercase tracking-wider font-bold text-foreground">{marker.name}</span>
                          </div>
                        </MarkerContent>
                      </MapMarker>
                    ))}
                  </MapComponent>
                </div>

                <div className="relative z-10 text-center p-8 mt-auto bg-gradient-to-t from-background/90 to-transparent w-full">
                  <div className="w-12 h-12 rounded-full border border-[#00e5ff]/30 bg-[#00e5ff]/10 flex items-center justify-center mx-auto mb-4">
                    <MapPin className="w-5 h-5 text-primary" />
                  </div>
                  <p className="body-font text-muted-foreground text-sm"><span className="text-foreground font-semibold">{ZONES[activeZone].cities.length} cities</span> in {ZONES[activeZone].name} India</p>
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
