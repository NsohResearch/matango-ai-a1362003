import { useParams, Link, Navigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ArrowRight, ArrowLeft } from "lucide-react";
import { getOperator, INDUSTRIES } from "@/lib/operators";

const PersonaDetail = () => {
  const { slug } = useParams();
  const op = getOperator(slug || "");
  if (!op) return <Navigate to="/personas" replace />;

  const relatedIndustries = INDUSTRIES.filter((i) => i.bestOperators.includes(op.slug));

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <section className="pt-28 pb-20 px-6 bg-emerald-950">
          <div className="container mx-auto max-w-5xl">
            <Link to="/personas" className="inline-flex items-center gap-2 text-cream-100/60 hover:text-gold-400 text-sm mb-8">
              <ArrowLeft className="h-4 w-4" /> All operators
            </Link>
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="flex justify-center">
                <div className={`relative w-72 h-72 md:w-96 md:h-96 rounded-full overflow-hidden bg-gradient-to-br ${op.accent} ring-4 ring-white/10 shadow-2xl`}>
                  <img src={op.image} alt={`${op.name}, ${op.role}`} width={768} height={768} className="w-full h-full object-cover mix-blend-luminosity opacity-95" />
                </div>
              </div>
              <div>
                <span className="text-xs font-medium text-gold-400 uppercase tracking-[0.2em]">{op.role}</span>
                <h1 className="font-display text-5xl md:text-6xl font-semibold text-cream-50 mt-2">{op.name}</h1>
                <p className="mt-4 text-xl text-cream-100/70 italic">{op.tagline}</p>
                <p className="mt-6 text-cream-100/60">{op.bio}</p>
                <div className="mt-8">
                  {op.available ? (
                    <Link to="/auth?mode=signup" className="inline-flex items-center gap-2 rounded-full bg-gold-500 text-emerald-950 px-7 py-3.5 font-medium hover:bg-gold-400 transition-all">
                      Deploy {op.name} now <ArrowRight className="h-4 w-4" />
                    </Link>
                  ) : (
                    <Link to="/contact" className="inline-flex items-center gap-2 rounded-full border border-gold-400/40 text-gold-300 px-7 py-3.5 font-medium hover:bg-gold-500/10 transition-all">
                      Join the waitlist <ArrowRight className="h-4 w-4" />
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-20 px-6">
          <div className="container mx-auto max-w-4xl">
            <h2 className="font-display text-3xl font-semibold text-center mb-10">What {op.name} does</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {op.capabilities.map((c) => (
                <div key={c} className="p-5 rounded-xl border border-border bg-card">
                  <p className="font-medium">{c}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {relatedIndustries.length > 0 && (
          <section className="py-20 px-6 bg-muted/30">
            <div className="container mx-auto max-w-4xl">
              <h2 className="font-display text-3xl font-semibold text-center mb-10">Industries where {op.name} shines</h2>
              <div className="grid sm:grid-cols-3 gap-4">
                {relatedIndustries.map((ind) => (
                  <Link key={ind.slug} to={`/industries/${ind.slug}`} className="p-6 rounded-xl border border-border bg-card hover:border-primary/40 hover:shadow-md transition-all text-center">
                    <div className="text-3xl mb-2">{ind.emoji}</div>
                    <div className="font-display font-medium">{ind.name}</div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default PersonaDetail;
