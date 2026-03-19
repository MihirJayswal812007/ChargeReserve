import Link from "next/link";
import { Mail, Github, Twitter, Linkedin, MapPin, Phone, ArrowUpRight } from "@/lib/icons";
import { Logo } from "@/components/Logo";

const GRAD = 'linear-gradient(135deg, #00e5ff 0%, #7b5ea7 100%)';

const FOOTER_LINKS = {
  Product: [
    { label: "Find Charging", href: "/find" },
    { label: "Become Operator", href: "/register" },
    { label: "Mobile App", href: "#" },
    { label: "Reviews", href: "#" },
  ],
  Company: [
    { label: "About Us", href: "/about" },
    { label: "Careers", href: "#" },
    { label: "Contact", href: "/contact" },
    { label: "Newsroom", href: "#" },
  ],
  Legal: [
    { label: "Privacy Policy", href: "#" },
    { label: "Terms of Service", href: "#" },
    { label: "Cookie Policy", href: "#" },
    { label: "GDPR", href: "#" },
  ],
};

const SOCIAL_LINKS = [
  { icon: Twitter, href: "#", name: "Twitter" },
  { icon: Github, href: "#", name: "GitHub" },
  { icon: Linkedin, href: "#", name: "LinkedIn" },
];

export function Footer() {
  return (
    <footer className="w-full bg-background border-t border-border mt-auto pt-24 pb-12 px-6 md:px-12 lg:px-20 overflow-hidden relative">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        .display-font { font-family: 'DM Serif Display', serif; }
        .body-font { font-family: 'Plus Jakarta Sans', sans-serif; }
      `}</style>

      {/* Background large text */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 select-none pointer-events-none opacity-[0.03] dark:opacity-[0.05] whitespace-nowrap overflow-hidden w-full text-center">
         <h2 className="display-font text-[15vw] leading-none uppercase tracking-tighter">ChargeReserve</h2>
      </div>

      {/* Decorative gradients */}
      <div className="absolute left-[-10%] bottom-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] -z-10 translate-y-1/2 pointer-events-none" />
      <div className="absolute right-[-10%] top-0 w-[400px] h-[400px] bg-secondary/10 rounded-full blur-[120px] -z-10 -translate-y-1/2 pointer-events-none" />
      
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-16 mb-24">
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-8">
            <Logo />
            <p className="body-font text-muted-foreground max-w-sm leading-relaxed text-sm">
              The world's most advanced EV charging reservation platform. 
              Pioneering infrastructure for the next generation of mobility.
            </p>
            <div className="flex items-center gap-4">
              {SOCIAL_LINKS.map((social) => (
                <Link 
                  key={social.name}
                  href={social.href}
                  className="w-12 h-12 rounded-2xl border border-border flex items-center justify-center text-muted-foreground hover:border-primary/50 hover:text-primary transition-all duration-300 transform hover:-translate-y-1 bg-card/40 backdrop-blur-sm shadow-sm"
                >
                  <social.icon className="w-5 h-5" />
                </Link>
              ))}
            </div>
          </div>

          {/* Links */}
          {Object.entries(FOOTER_LINKS).map(([title, links]) => (
            <div key={title} className="space-y-8">
              <h3 className="body-font font-bold text-xs uppercase tracking-[0.2em] text-foreground/80">{title}</h3>
              <ul className="space-y-5">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link 
                      href={link.href} 
                      className="body-font text-muted-foreground hover:text-primary transition-all duration-200 block text-[13px] group flex items-center gap-1.5"
                    >
                      {link.label}
                      <ArrowUpRight className="w-3 h-3 opacity-0 -translate-x-1 translate-y-1 group-hover:opacity-100 group-hover:translate-x-0 group-hover:translate-y-0 transition-all" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Contact Strip */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pb-16 border-b border-border">
          <div className="flex items-center gap-5 p-6 rounded-[32px] bg-card/40 border border-border/50 backdrop-blur-sm hover:border-primary/30 transition-colors cursor-pointer group">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-black transition-colors">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <p className="body-font text-[10px] text-muted-foreground font-bold uppercase tracking-widest mb-1">Email us</p>
              <p className="body-font text-sm font-semibold group-hover:text-primary transition-colors">support@chargereserve.in</p>
            </div>
          </div>
          
          <div className="flex items-center gap-5 p-6 rounded-[32px] bg-card/40 border border-border/50 backdrop-blur-sm hover:border-secondary/30 transition-colors cursor-pointer group">
            <div className="w-12 h-12 rounded-2xl bg-secondary/10 flex items-center justify-center text-secondary group-hover:bg-secondary group-hover:text-black transition-colors">
              <Phone className="w-5 h-5" />
            </div>
            <div>
              <p className="body-font text-[10px] text-muted-foreground font-bold uppercase tracking-widest mb-1">Call hub</p>
              <p className="body-font text-sm font-semibold group-hover:text-secondary transition-colors">+91 1800-EV-RESERVE</p>
            </div>
          </div>

          <div className="flex items-center gap-5 p-6 rounded-[32px] bg-card/40 border border-border/50 backdrop-blur-sm hover:border-foreground/30 transition-colors cursor-pointer group">
            <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center text-foreground group-hover:bg-foreground group-hover:text-background transition-colors">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <p className="body-font text-[10px] text-muted-foreground font-bold uppercase tracking-widest mb-1">Corporate HQ</p>
              <p className="body-font text-sm font-semibold group-hover:text-foreground transition-colors">Aerocity, New Delhi</p>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-12 flex flex-col md:flex-row justify-between items-center gap-8 text-[11px] text-muted-foreground body-font uppercase tracking-widest font-semibold">
          <div className="flex flex-col md:flex-row items-center gap-4 md:gap-12">
             <p>© {new Date().getFullYear()} ChargeReserve Technologies Pvt. Ltd.</p>
             <div className="flex items-center gap-6">
                <Link href="#" className="hover:text-primary transition-colors">Privacy Policy</Link>
                <Link href="#" className="hover:text-primary transition-colors">Terms of Use</Link>
             </div>
          </div>
          
          <div className="flex items-center gap-2">
             <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
             <span className="text-foreground/60">Systems: Operational</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
