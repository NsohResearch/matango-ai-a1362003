import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { OPERATORS } from "@/lib/operators";
import OpenToWorkBadge from "@/components/operator/OpenToWorkBadge";

const Personas = () => (
  <div className="min-h-screen bg-background">
    <Navbar />
    <main>
      <section className="pt-32 pb-16 px-6 bg-emerald-950">
        <div className="container mx-auto max-w-4xl text-center">
          <span className="text-xs font-medium text-gold-400 uppercase tracking-[0.2em]">The Operators</span>
          <h1 className="font-display text-4xl md:text-6xl font-semibold text-cream-50 mt-3">
            Meet your <span className="italic text-gradient-accent">AI-Amplified Operators</span>
          </h1>
          <p className="mt-5 text-cream-100/60 max-w-2xl mx-auto text-lg">
            Six named operators, each with a job to do. They remember your brand, learn from results, and never miss a shift.
          </p>
        </div>
      </section>

      <section className="py-20 px-6">
        <div className="container mx-auto max-w-5xl space-y-16">
          {OPERATORS.map((op, i) => (
            <div
              key={op.slug}
              className={`grid md:grid-cols-2 gap-10 items-center ${i % 2 === 1 ? "md:[&>div:first-child]:order-2" : ""}`}
            >
              <div className="flex justify-center">
                <div className={`relative w-64 h-64 md:w-80 md:h-80 rounded-full overflow-hidden bg-gradient-to-br ${op.accent} ring-4 ring-white/10 shadow-2xl`}>
                  <img
                    src={op.image}
                    alt={`${op.name}, ${op.role}`}
                    width={768}
                    height={768}
                    loading="lazy"
                    className="w-full h-full object-cover mix-blend-luminosity opacity-95"
                  />
                  <OpenToWorkBadge />
                </div>
              </div>
              <div>
                <span className="text-xs font-medium text-primary uppercase tracking-[0.2em]">{op.role}</span>
                <h2 className="font-display text-4xl md:text-5xl font-semibold mt-2">{op.name}</h2>
                <p className="mt-3 text-lg text-muted-foreground italic">{op.tagline}</p>
                <p className="mt-2 text-xs text-muted-foreground/80">{op.experience}</p>
                <p className="mt-5 text-base">{op.bio}</p>
                <ul className="mt-6 space-y-2">
                  {op.capabilities.map((c) => (
                    <li key={c} className="flex items-start gap-2 text-sm">
                      <span className="text-primary mt-1">▸</span>
                      <span>{c}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-7">
                  {op.available ? (
                    <Link
                      to="/auth?mode=signup"
                      className="inline-flex items-center gap-2 rounded-full bg-primary text-primary-foreground px-6 py-3 font-medium hover:shadow-luxury transition-all"
                    >
                      Hire {op.name} <ArrowRight className="h-4 w-4" />
                    </Link>
                  ) : (
                    <span className="inline-flex items-center gap-2 rounded-full bg-muted text-muted-foreground px-6 py-3 font-medium italic">
                      Coming soon — join the waitlist
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
    <Footer />
  </div>
);

export default Personas;
