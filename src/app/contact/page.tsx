'use client';

import { useState, useRef } from 'react';
import { Footer } from "@/components/Footer";
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Mail, Phone, MapPin, Send, Zap, ChevronRight, 
  MessageSquare, Users, Building,
  CheckCircle2, AlertCircle
} from "@/lib/icons";
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const GRAD = 'linear-gradient(135deg, #00e5ff 0%, #7b5ea7 100%)';
const GT: React.CSSProperties = {
  background: GRAD, WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent', backgroundClip: 'text',
};

const CONTACT_INFO = [
  { icon: Mail, label: 'Email', val: 'support@chargereserve.in', desc: 'Typical response time: 2 hours' },
  { icon: Phone, label: 'Support', val: '+91 1800-EV-RESERVE', desc: 'Mon-Sun, 8am-10pm IST' },
  { icon: MapPin, label: 'Headquarters', val: 'Aerocity, New Delhi', desc: 'Technical & Ops Center' },
];

const FAQS = [
  { q: "How do I cancel a reservation?", a: "You can cancel any reservation up to 30 minutes before the scheduled time directly from your dashboard's 'My Reservations' section." },
  { q: "What happens if a station is offline?", a: "Our system monitors station status in real-time. If a station goes offline, we'll notify you automatically and offer an alternative slot nearby." },
  { q: "Are there any membership fees?", a: "ChargeReserve is free to join. You only pay for the energy consumed and a small convenience fee for guaranteed reservations." },
];

export default function ContactPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(r => setTimeout(r, 1500));
    
    setIsSubmitting(false);
    setSubmitted(true);
    toast.success("Message sent successfully!");
  };

  return (
    <>
    <main className="relative bg-background text-foreground overflow-x-clip min-h-screen pt-24 pb-20">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        .display-font { font-family: 'DM Serif Display', serif; }
        .body-font { font-family: 'Plus Jakarta Sans', sans-serif; }
      `}</style>

      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-[600px] bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />
      <div className="absolute top-40 right-[-10%] w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-40 left-[-10%] w-[500px] h-[500px] bg-secondary/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20 relative z-10">
        <div className="grid lg:grid-cols-[1fr_1.4fr] gap-16 lg:gap-24">
          
          {/* Left: Contact Info & Brand Content */}
          <div className="flex flex-col">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <p className="body-font text-xs font-semibold tracking-[0.2em] uppercase text-primary mb-5">Contact Us</p>
              <h1 className="display-font text-4xl sm:text-5xl lg:text-6xl leading-[1.1] mb-8">
                How can we <br />
                <span style={GT}>help you today?</span>
              </h1>
              <p className="body-font text-muted-foreground text-lg leading-relaxed mb-12 max-w-md">
                Whether you&apos;re an EV driver, a station operator, or looking for corporate fleet solutions, our team is ready to assist.
              </p>
            </motion.div>

            <div className="grid gap-6">
              {CONTACT_INFO.map(({ icon: Icon, label, val, desc }, i) => (
                <motion.div
                  key={label}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + i * 0.1 }}
                  className="flex items-start gap-4 p-5 rounded-2xl border border-border bg-card/40 backdrop-blur-sm group hover:border-[#00e5ff]/30 transition-colors"
                >
                  <div className="w-12 h-12 rounded-xl bg-muted border border-border flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="body-font text-[10px] uppercase tracking-widest text-muted-foreground mb-1">{label}</p>
                    <p className="body-font text-foreground font-semibold mb-0.5">{val}</p>
                    <p className="body-font text-muted-foreground text-xs">{desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>

          </div>

          {/* Right: Contact Form */}
          <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
          >
            <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 to-secondary/10 blur-[100px] rounded-[40px] opacity-30 pointer-events-none" />
            
            <div className="bg-card border border-border rounded-[40px] p-8 md:p-12 shadow-2xl relative overflow-hidden">
              <AnimatePresence mode="wait">
                {!submitted ? (
                  <motion.form
                    key="form"
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    onSubmit={handleSubmit}
                    className="space-y-6"
                  >
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="body-font text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Full Name</label>
                        <input 
                          type="text" 
                          required 
                          placeholder="Arjun Mehta"
                          className="w-full bg-muted/30 border border-border px-5 py-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all body-font text-sm" 
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="body-font text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Email Address</label>
                        <input 
                          type="email" 
                          required 
                          placeholder="arjun@example.com"
                          className="w-full bg-muted/30 border border-border px-5 py-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all body-font text-sm" 
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="body-font text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Topic</label>
                      <select className="w-full bg-muted/30 border border-border px-5 py-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all body-font text-sm cursor-pointer dark:[color-scheme:dark] [color-scheme:light]">
                        <option className="bg-background text-foreground">General Inquiry</option>
                        <option className="bg-background text-foreground">Technical Support</option>
                        <option className="bg-background text-foreground">Operator Partnership</option>
                        <option className="bg-background text-foreground">Enterprise / B2B</option>
                        <option className="bg-background text-foreground">Other</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="body-font text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Message</label>
                      <textarea 
                        required 
                        rows={5}
                        placeholder="How can we help you?"
                        className="w-full bg-muted/30 border border-border px-5 py-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all body-font text-sm resize-none"
                      />
                    </div>

                    <Button type="submit" disabled={isSubmitting} className="w-full h-14 rounded-2xl text-base font-bold text-black border-0 hover:opacity-90 relative overflow-hidden flex items-center justify-center gap-2 group transition-all" style={{ background: GRAD }}>
                      {isSubmitting ? (
                        <>
                          <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                          Sending...
                        </>
                      ) : (
                        <>
                          Send Message <Send className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                        </>
                      )}
                    </Button>
                    <p className="text-center body-font text-[10px] text-muted-foreground uppercase tracking-widest">By sending, you agree to our privacy policy.</p>
                  </motion.form>
                ) : (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center justify-center py-20 text-center"
                  >
                    <div className="w-20 h-20 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mb-8">
                      <CheckCircle2 className="w-10 h-10 text-primary" />
                    </div>
                    <h3 className="display-font text-3xl mb-4">Message Captured</h3>
                    <p className="body-font text-muted-foreground max-w-sm mx-auto mb-10 leading-relaxed">
                      Thank you for reaching out. A ChargeReserve expert has been notified and will get back to you within 2 hours.
                    </p>
                    <Button variant="outline" onClick={() => setSubmitted(false)} className="rounded-full px-8">
                      Send another message
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

          </motion.div>
        </div>

        {/* FAQ Section */}
        <section className="mt-32">
          <div className="text-center mb-16">
            <p className="body-font text-xs font-semibold tracking-[0.2em] uppercase text-primary mb-4">Help Center</p>
            <h2 className="display-font text-4xl mb-4">Frequently Asked Questions</h2>
            <div className="w-24 h-1 rounded-full bg-primary mx-auto opacity-30" />
          </div>

          <div className="max-w-4xl mx-auto grid gap-6">
            {FAQS.map((faq, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="p-8 rounded-[32px] border border-border bg-card/40 backdrop-blur-sm hover:bg-card transition-colors"
              >
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full border border-border flex items-center justify-center flex-shrink-0">
                    <span className="body-font text-xs font-bold text-primary">Q</span>
                  </div>
                  <div>
                    <h4 className="body-font font-bold text-lg mb-3">{faq.q}</h4>
                    <p className="body-font text-muted-foreground leading-relaxed italic">&ldquo;{faq.a}&rdquo;</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

        </section>
      </div>
    </main>
    <Footer />
    </>
  );
}
