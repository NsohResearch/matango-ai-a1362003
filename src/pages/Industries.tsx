import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { INDUSTRIES } from "@/lib/operators";

const Industries = () => (
  <div className="min-h-screen bg-background">
    <Navbar />
    <main>
      <section className="pt-32 pb-16 px-6 bg-emerald-950">
        <div className="container mx-auto max-w-4xl text-center">
          <span className="text-xs font-medium text-gold-400 uppercase tracking-[0.2em]">Industries</span>
          <h1 className="font-display text-4xl md:text-6xl font-semibold text-cream-50 mt-3">
            Built for the trades <span className="italic text-gradient-accent">that win with AI.</span>
          </h1>
        </div>
      </section>

      <section className="py-20 px-6">
        <div className="container mx-auto max-w-5xl grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {INDUSTRIES.map((ind) => (
            <Link
              key={ind.slug}
              to={`/industries/${ind.slug}`}
              className="group p-7 rounded-2xl border border-border bg-card hover:border-primary/40 hover:shadow-luxury transition-all"
            >
              <div className="text-4xl mb-3">{ind.emoji}</div>
              <h2 className="font-display text-2xl font-semibold">{ind.name}</h2>
              <p className="mt-2 text-sm text-muted-foreground">{ind.headline}</p>
              <span className="mt-4 inline-flex items-center gap-1 text-sm text-primary group-hover:gap-2 transition-all">
                See the playbook <ArrowRight className="h-3.5 w-3.5" />
              </span>
            </Link>
          ))}
        </div>
      </section>
    </main>
    <Footer />
  </div>
);

export default Industries;
