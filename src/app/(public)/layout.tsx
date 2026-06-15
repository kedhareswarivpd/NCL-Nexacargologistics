import { PublicNavbar } from "@/components/shared/PublicNavbar";
import { Footer } from "@/components/shared/Footer";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen flex flex-col bg-background">
      <div className="pointer-events-none absolute inset-0 overflow-hidden -z-10">
        <div className="absolute -top-20 left-[-8%] h-64 w-64 rounded-full bg-primary/10 blur-3xl animate-float" />
        <div className="absolute top-[18%] right-[-6%] h-72 w-72 rounded-full bg-secondary/10 blur-3xl animate-float" style={{ animationDelay: "0.8s" }} />
        <div className="absolute bottom-[-8%] left-[30%] h-80 w-80 rounded-full bg-tertiary/10 blur-3xl animate-float" style={{ animationDelay: "1.4s" }} />
        <div className="absolute inset-x-0 top-1/3 h-px bg-gradient-to-r from-transparent via-white/8 to-transparent animate-pulse" />
        <div className="absolute inset-x-0 bottom-1/4 h-px bg-gradient-to-r from-transparent via-secondary/10 to-transparent animate-pulse" style={{ animationDelay: "1s" }} />
      </div>

      <PublicNavbar />
      <main className="relative z-10 flex-1">
        {children}
      </main>
      <Footer />
    </div>
  );
}
