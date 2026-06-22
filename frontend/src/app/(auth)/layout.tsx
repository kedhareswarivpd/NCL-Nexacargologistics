import Link from "next/link";
import { TrendingUp, Globe, Zap } from "lucide-react";

/**
 * Auth shell shared by /login, /register and /forgot-password.
 * Left: brand + live-stats visual narrative (hidden on small screens).
 * Right: the active auth form (the route's page).
 */
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex min-h-screen flex-col bg-background text-on-surface md:flex-row">
      {/* Visual narrative panel */}
      <section className="relative hidden items-center justify-center overflow-hidden border-r border-white/5 p-12 md:flex md:w-1/2 lg:w-3/5">
        <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_30%_20%,rgba(26,74,138,0.35),transparent_60%)]" />
        <div className="absolute inset-0 z-0 bg-[linear-gradient(180deg,transparent,rgba(10,22,40,0.6))]" />
        <div className="relative z-10 w-full max-w-xl">
          <Link
            href="/"
            className="font-display-lg mb-10 inline-block text-3xl font-bold tracking-tight text-primary"
          >
            NexaCargo
          </Link>
          <div className="mb-8 inline-block">
            <span className="font-label-caps rounded-full border border-tertiary/20 bg-tertiary/10 px-4 py-1.5 text-[10px] uppercase tracking-[0.2em] text-tertiary backdrop-blur-sm">
              Global Logistics Platform
            </span>
          </div>
          <h1 className="font-display-lg mb-6 text-5xl font-bold leading-[1.1] text-on-surface">
            Master the Global <span className="text-tertiary">Flow</span> of Goods.
          </h1>
          <p className="font-body-lg mb-12 max-w-lg text-lg leading-relaxed text-on-surface-variant">
            Real-time telemetry, predictive routing, and end-to-end freight
            visibility — orchestrated from a single operational dashboard.
          </p>
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: "Live Fleet", value: "12,482", note: "+34%", Icon: TrendingUp },
              { label: "Ports Active", value: "142", note: "Global", Icon: Globe },
              { label: "Avg. Latency", value: "18ms", note: "Real-time", Icon: Zap },
            ].map(({ label, value, note, Icon }) => (
              <div key={label} className="glass rounded-2xl bg-white/5 p-6">
                <div className="font-label-caps mb-2 text-[11px] uppercase tracking-widest text-tertiary/70">
                  {label}
                </div>
                <div className="font-mono text-2xl font-bold text-on-surface">{value}</div>
                <div className="mt-2 flex items-center gap-1 text-[10px] font-medium uppercase tracking-widest text-tertiary">
                  <Icon className="h-3 w-3" /> {note}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Form panel */}
      <section className="relative flex flex-1 flex-col items-center justify-center bg-surface/30 px-6 py-16">
        <div className="w-full max-w-[400px]">{children}</div>
        <footer className="absolute bottom-8 flex w-full max-w-[400px] flex-wrap items-center justify-between px-4 md:px-0">
          <span className="text-[10px] font-medium tracking-tight text-on-surface-variant">
            © {new Date().getFullYear()} NexaCargo Logistics Ltd.
          </span>
          <Link
            href="/"
            className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant hover:text-tertiary"
          >
            Back to site
          </Link>
        </footer>
      </section>
    </main>
  );
}
