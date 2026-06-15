"use client";

import { useEffect, useState } from "react";
import { Target, Globe, Shield, Leaf, Zap, ArrowRight } from "lucide-react";
import { AnimatePresence, motion, useScroll, useTransform } from "framer-motion";
import { Button } from "@/components/ui/button";

const fadeUp = {
  hidden: { opacity: 0, y: 80 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8 },
  },
};

const staggerContainer = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.2 },
  },
};

const scaleReveal = {
  hidden: { opacity: 0, scale: 0.9 },
  show: { opacity: 1, scale: 1 },
};

export default function AboutPage() {
  const { scrollY } = useScroll();
  const heroY = useTransform(scrollY, [0, 800], [0, 150]);
  const [count, setCount] = useState(0);
  const [showHubLabel, setShowHubLabel] = useState(false);

  useEffect(() => {
    let current = 0;
    const interval = setInterval(() => {
      current += 2;
      if (current >= 150) {
        current = 150;
        clearInterval(interval);
      }
      setCount(current);
    }, 20);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-background text-on-surface overflow-x-hidden pt-20">
      <section className="relative h-[819px] flex items-center justify-center overflow-hidden">
        <motion.div style={{ y: heroY }} className="absolute inset-0">
          <img
            className="absolute inset-0 w-full h-full object-cover"
            alt="Cinematic wide shot of a futuristic cargo port"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuDK-Y1U3FhL9ZmauNcZCGjXyPZX2wDFspntWiHz-trbghBfKDNZZugaLCCnizznKdG7pcDNx_ocjp8tlIIXvz6oCi1NlUhT0HPeNcXQDkbqJNqiPZJnJeZwmpgWC5uCijI8hXLXBy_acu2KVup5s8ttmzuI2ExbvwWcPDWZ3arTvGaNVpYfG_hsYmT5AEvV2E8veASJBZ2jcRxz5aHJIu9fDyf7dZPhJvOfan4FdKMemXy5ve3x90izPJB26Dhj7LfIKql52mGMHMk"
          />
        </motion.div>
        <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/60 to-background" />
        {[...Array(20)].map((_, i) => (
          <motion.span
            key={i}
            className="absolute rounded-full bg-tertiary/30 blur-sm"
            style={{
              left: `${(i * 7 + 4) % 100}%`,
              top: `${(i * 11 + 5) % 100}%`,
              width: `${8 + (i % 3) * 4}px`,
              height: `${8 + (i % 3) * 4}px`,
            }}
            animate={{ y: [0, -18, 0], opacity: [0.3, 0.9, 0.3] }}
            transition={{ duration: 3 + (i % 4), repeat: Infinity, delay: i * 0.1 }}
          />
        ))}
        <motion.div
          initial="hidden"
          animate="show"
          variants={staggerContainer}
          className="relative z-10 text-center px-6 max-w-4xl mx-auto"
        >
          <motion.span variants={fadeUp} className="font-label-caps text-xs tracking-widest text-tertiary mb-4 inline-block uppercase">
            Established 1998
          </motion.span>
          <motion.h1 variants={fadeUp} className="font-display-lg text-5xl md:text-[64px] leading-tight mb-6">
            Redefining the <span className="text-tertiary">Global Logistics</span> Infrastructure
          </motion.h1>
          <motion.p variants={fadeUp} className="font-body-lg text-on-surface-variant max-w-2xl mx-auto">
            NexaCargo leverages quantum-ready data processing and a carbon-neutral fleet to move the world's most critical assets across every continent.
          </motion.p>
          <motion.div variants={fadeUp} className="mt-10 flex justify-center gap-4 flex-wrap">
            <motion.div whileHover={{ scale: 1.05, y: -3 }} whileTap={{ scale: 0.95 }}>
              <Button size="lg" className="px-10 py-4 text-base">Explore Solutions</Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05, y: -3 }} whileTap={{ scale: 0.95 }}>
              <Button size="lg" variant="secondary" className="px-10 py-4 text-base">Meet the Team</Button>
            </motion.div>
          </motion.div>
        </motion.div>
      </section>

      <section className="px-6 py-24 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 h-auto md:h-[600px]">
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.25 }}
            variants={scaleReveal}
            className="md:col-span-8 glass rounded-xl p-8 flex flex-col justify-end relative overflow-hidden group"
          >
            <motion.img
              className="absolute inset-0 w-full h-full object-cover opacity-20"
              alt="Digital supply chain network visualization"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDbFKg_sSrKIvIjUr8D-PgC4Q1Syt4jbrDrgOrFd_A76r-E4XoqCfWDBwfxxvLbRT3VnXRYXG_CYvS_sRS92XgNlWqbdMJ1vyrwYlpiL5ImvbDzFhuXA82lz2YPTmYRbqs4LKif3TvaPb5UpFOjXpK28qlc2E7yTvwTWmo3sUX-ZSYDNw633toH-TmmGzVPnk4NaUjsBgXyMYExvXLwqtNS-Qtb0ePaqCwyywroePapRQ-CwjaCIRkVOcDOXdlnsGgarazkkWzhBhw"
              whileHover={{ scale: 1.08 }}
              transition={{ duration: 0.8 }}
            />
            <div className="relative z-10">
              <motion.div
                className="mb-6 bg-tertiary/20 w-12 h-12 rounded-lg flex items-center justify-center"
                whileHover={{ rotate: 15 }}
              >
                <Target className="text-tertiary w-6 h-6" />
              </motion.div>
              <h2 className="font-headline-lg text-3xl font-semibold mb-4 text-on-surface">Our Mission</h2>
              <p className="font-body-lg text-on-surface-variant max-w-xl">
                To orchestrate the world's commerce through a seamless, intelligent, and sustainable network that empowers industries to transcend geographical boundaries. We don't just move freight; we move progress.
              </p>
            </div>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.25 }}
            variants={fadeUp}
            className="md:col-span-4 glass rounded-xl p-8 bg-tertiary-container flex flex-col justify-between border-tertiary/30"
          >
            <div className="flex justify-between items-start">
              <Globe className="text-tertiary w-12 h-12" />
              <span className="font-label-caps text-xs text-tertiary border border-tertiary/30 px-2 py-1 rounded uppercase tracking-widest">Real-time Map</span>
            </div>
            <div>
              <div className="text-[72px] font-black text-tertiary leading-none">{count}+</div>
              <div className="font-title-md text-xl font-semibold mb-2 mt-4 text-on-surface">Countries Reached</div>
              <p className="font-body-sm text-on-surface-variant">Operating across 6 continents with 400+ logistics hubs, ensuring 99.9% on-time delivery.</p>
            </div>
            <div className="mt-6 relative overflow-hidden rounded-xl border border-cyan-400/20 bg-black/20 p-2">
              <img
                className="w-full h-32 object-cover rounded-lg opacity-60 grayscale"
                alt="Stylized minimalist world map"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCMEZY5GvRx8CdXZNWXrxbMnDjtCN0e0tc2IFtScoU7ReieYL0f7_ud5CTqIIRtULu1_Gw2-VDZGVgC5oOyAZp1dBRw5ACs_jqGTOUkDCH0fJFpFBAjS0N44xPocKLraHEvILSzq52BI1CsPE9SxCblgvxKaVRX-8zMURdHoLyNN24rM7kFiAoO0L6OR7PJY19_awCSmxy3wISp1za1CRFyyL66UUpEX-6Bnhvd7heAHMncaw9Sp0KmDUrs0ut3E0m327X6Z3wpvpc"
              />
              <motion.button
                type="button"
                onMouseEnter={() => setShowHubLabel(true)}
                onMouseLeave={() => setShowHubLabel(false)}
                className="absolute top-[45%] left-[72%] z-10"
                aria-label="Bangladesh Regional Hub"
              >
                <motion.span
                  animate={{ scale: [1, 1.5, 1], opacity: [1, 0.25, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute inset-0 rounded-full bg-cyan-400/70 blur-md"
                />
                <motion.span
                  animate={{ scale: [1, 1.15, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="relative block h-3 w-3 rounded-full bg-cyan-300 shadow-[0_0_18px_rgba(56,189,248,0.9)]"
                />
              </motion.button>
              <AnimatePresence>
                {showHubLabel && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    className="absolute left-4 top-3 rounded-lg border border-cyan-400/30 bg-white/10 px-2 py-1 text-xs text-cyan-100 backdrop-blur-xl whitespace-nowrap"
                  >
                    Bangladesh Regional Hub
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="bg-surface-container-lowest py-24">
        <div className="px-6 max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
            <div className="max-w-xl">
              <span className="font-label-caps text-xs text-tertiary mb-2 block uppercase tracking-widest">Foundation</span>
              <h2 className="font-headline-lg text-3xl font-semibold text-on-surface">Corporate Values</h2>
            </div>
            <p className="font-body-lg text-on-surface-variant md:w-1/3">Our principles are the navigational beacons that guide every shipment and every strategy.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: Shield, title: "Integrity First", copy: "Uncompromising commitment to ethical standards and transparent communication in every contract and delivery." },
              { icon: Leaf, title: "Sustainability", copy: "Investing in electric fleets and AI-optimized routes to reduce our carbon footprint by 60% by 2030." },
              { icon: Zap, title: "Innovation", copy: "Continuous integration of blockchain and IoT to provide unmatched supply chain visibility." },
            ].map((item, index) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={item.title}
                  initial="hidden"
                  whileInView="show"
                  viewport={{ once: true, amount: 0.25 }}
                  variants={fadeUp}
                  transition={{ delay: index * 0.1 }}
                  className="glass p-8 rounded-xl"
                  whileHover={{ y: -10, scale: 1.03, boxShadow: "0 0 40px rgba(66,165,245,0.4)" }}
                >
                  <motion.div whileHover={{ scale: 1.15 }}>
                    <Icon className="text-tertiary mb-6 w-8 h-8" />
                  </motion.div>
                  <h3 className="font-title-md text-xl font-semibold mb-4 text-on-surface">{item.title}</h3>
                  <p className="font-body-sm text-on-surface-variant">{item.copy}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-24 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <span className="font-label-caps text-xs text-tertiary mb-2 block uppercase tracking-widest">Visionaries</span>
          <h2 className="font-headline-lg text-3xl font-semibold text-on-surface">Executive Leadership</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            { name: "Marcus Thorne", role: "Chief Executive Officer", img: "https://lh3.googleusercontent.com/aida-public/AB6AXuBM_kHGvV0MWKQclAkaMRHqMBFjODKCQKgmHJhK9XP-6N0GN21W_ixijcccIHlVZfhrMM9RSnjjnv8CT7C0MvhAu5PXgUrLMbM4mO-cPuUMjJIuWd-ujObCJ1MjZtpH88muRUQyqbLGmqKABC9DAKtU3sOF6CQDkFxWuRPNyY1E1N_hWi2VRQjk59EK164KCFRJY6Euv2ucZRj5c2A3NjU4dTVBu_JYkVTFlTmXxOZ782KF6W7mbOvO1b-y8njYjRD1KQEs1aOM54E" },
            { name: "Elena Rodriguez", role: "Head of Global Operations", img: "https://lh3.googleusercontent.com/aida-public/AB6AXuCJ5tCC49aXXGT7ON4mnN7yV7a2MT_fDUDmZ6wTYpGmVIREPwrt61l7VMhMcKt2E4dRZJ8hCjdwnkw93D11rwENusGzL9TmCXCWXgMvC5jD_ejA2zHdzWqcAhtnH4U3nE0rp2L8N90N2fWh8piC30YZr5aN2WE_Vg7cbR3dI5OCTPmlZAtpZ6Feu47k3EpbrsX7Kh8DuYnUT4ibfE8X1fTOUHAowq-gfjxJa7XhY56TB-oqKU07F-gK3c2mOY-IzxeRY0QLcNbSLoM" },
            { name: "Dr. David Chen", role: "Chief Technology Officer", img: "https://lh3.googleusercontent.com/aida-public/AB6AXuBZKiLjFFs3sO4k7rWWYfPxYacsGcys9GF8SogbkWIicYNoaDaRl69baekJuoTquiJWMNU9KW2cw9YK4oJQrWyIel77vDkR9RQ25ycMRzuspWGfNeYkzHeCj4bPXGr4kJYfZeAZDCEjwBZY2cDgmDx13hNErGK_nVcl4vzy7ICgrt4xNchrr8TIPnwCZ5Mlrrp7P6QgUon3nh_vD_7chq8jMAu7rpl-TATXk6y19g4nBV6jantKEznW8MlBbNSUa0CPXXL2zPNGbkE" },
            { name: "Sarah Jenkins", role: "Director of Sustainability", img: "https://lh3.googleusercontent.com/aida-public/AB6AXuBKlccdQcj4cFwtQd6wDjLSmLMgh7g4Ut2x4pwEQweDToaFh145ZanXL-mzVIaw5hFX0lLVhRythLDdcpnujnnEmNwiOJkfHT8JRqWh7_8tj1DXSI1f62Iqm-6NfxtZ3ooroRKDe77NtE2nwc0TI1Xd8ulDgm0WtqCBUSp4tbZcIEVMSjHffHE9EAXvS1O7sKY3HMFq9x1mz8UcuTK7vWEXM_rKykB80_1BSIynpAwoYYFFyphYVS9TseTNUm-SvOISG5L3P0BYL4Q" },
          ].map((leader, i) => (
            <motion.div
              key={leader.name}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="group cursor-pointer"
            >
              <div className="relative overflow-hidden rounded-xl mb-4 border border-white/5">
                <motion.img
                  className="w-full aspect-[3/4] object-cover"
                  alt={leader.name}
                  src={leader.img}
                  whileHover={{ scale: 1.1 }}
                  transition={{ duration: 0.5 }}
                />
                <motion.div
                  className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent opacity-60"
                  initial={{ opacity: 0 }}
                  whileHover={{ opacity: 1 }}
                />
              </div>
              <h4 className="font-title-md text-xl font-semibold text-on-surface">{leader.name}</h4>
              <p className="font-label-caps text-xs text-tertiary mt-1 uppercase tracking-widest">{leader.role}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="py-24 px-6">
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          className="max-w-7xl mx-auto glass rounded-2xl p-16 text-center relative overflow-hidden"
        >
          <div className="absolute -top-24 -left-24 w-64 h-64 bg-tertiary/10 blur-[100px]" />
          <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-primary/10 blur-[100px]" />
          <motion.div className="absolute inset-0" animate={{ rotate: 360 }} transition={{ duration: 30, repeat: Infinity, ease: "linear" }}>
            <div className="absolute left-10 top-10 h-16 w-16 rounded-full bg-tertiary/10 blur-2xl" />
            <div className="absolute right-10 bottom-10 h-20 w-20 rounded-full bg-primary/10 blur-2xl" />
          </motion.div>
          <h2 className="font-headline-lg text-3xl font-semibold mb-8 relative z-10 text-on-surface">Ready to optimize your supply chain?</h2>
          <div className="flex flex-col sm:flex-row gap-6 justify-center relative z-10">
            <motion.div whileHover={{ scale: 1.05, x: 3, y: -3 }}>
              <Button size="lg" className="px-12 py-4 text-base">Get a Quote</Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05, x: 3, y: -3 }}>
              <Button size="lg" variant="secondary" className="px-12 py-4 text-base">Contact Sales</Button>
            </motion.div>
          </div>
        </motion.div>
      </section>
    </div>
  );
}

