import { useParams, Link, Navigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ArrowRight, ArrowLeft } from "lucide-react";
import { getIndustry, getOperator } from "@/lib/operators";
import OpenToWorkBadge from "@/components/operator/OpenToWorkBadge";
import { AlwaysOnLine, AlwaysOnCallout } from "@/components/operator/AlwaysOnNote";

const IndustryDetail = () => {
  const { slug } = useParams();
  const ind = getIndustry(slug || "");
  if (!ind) return <Navigate to="/industries" replace />;

  const ops = ind.bestOperators.map(getOperator).filter(Boolean);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <section className="pt-28 pb-16 px-6 bg-emerald-950">
          <div className="container mx-auto max-w-4xl">
            <Link to="/industries" className="inline-flex items-center gap-2 text-cream-100/60 hover:text-gold-400 text-sm mb-8">
              <ArrowLeft className="h-4 w-4" /> All industries
            </Link>
            <div className="text-6xl mb-4">{ind.emoji}</div>
            <span className="text-xs font-medium text-gold-400 uppercase tracking-[0.2em]">For {ind.name}</span>
            <h1 className="font-display text-4xl md:text-6xl font-semibold text-cream-50 mt-3">
              {ind.headline}
            </h1>
          </div>
        </section>

        <section className="py-20 px-6">
          <div className="container mx-auto max-w-3xl space-y-10">
            <div className="p-7 rounded-2xl border-l-4 border-destructive bg-destructive/5">
              <span className="text-xs uppercase tracking-wider text-destructive font-medium">The problem</span>
              <p className="mt-2 text-lg">{ind.pain}</p>
            </div>
            <div className="p-7 rounded-2xl border-l-4 border-primary bg-primary/5">
              <span className="text-xs uppercase tracking-wider text-primary font-medium">With Matango</span>
              <p className="mt-2 text-lg">{ind.outcome}</p>
            </div>
          </div>
        </section>

        <section className="py-16 px-6 bg-muted/30">
          <div className="container mx-auto max-w-5xl">
            <h2 className="font-display text-3xl font-semibold text-center mb-10">
              Your AAO crew for {ind.name}
            </h2>
            <div className="grid sm:grid-cols-3 gap-6">
              {ops.map((op) => op && (
                <Link
                  key={op.slug}
                  to={`/personas/${op.slug}`}
                  className="flex flex-col items-center text-center p-6 rounded-2xl border border-border bg-card hover:border-primary/40 hover:shadow-md transition-all"
                >
                  <div className={`relative w-28 h-28 rounded-full overflow-hidden bg-gradient-to-br ${op.accent} ring-2 ring-white/10 mb-4`}>
                    <img src={op.image} alt={op.name} width={768} height={768} loading="lazy" className="w-full h-full object-cover mix-blend-luminosity opacity-95" />
                    <OpenToWorkBadge />
                  </div>
                  <h3 className="font-display text-xl font-semibold">{op.name}</h3>
                  <p className="text-sm text-muted-foreground">{op.role}</p>
                  <p className="text-[11px] text-muted-foreground/80 mt-1">{op.experience}</p>
                  <AlwaysOnLine className="mt-1.5" />
                  {!op.available && <span className="text-xs italic text-muted-foreground mt-1">Onboarding Underway</span>}
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20 px-6 text-center">
          <h2 className="font-display text-3xl md:text-4xl font-semibold mb-4">
            Ready to hire your {ind.name} crew?
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto mb-8">
            Get started in minutes. Your AAOs know your industry and are ready to start working today.
          </p>
          <Link
            to="/auth?mode=signup"
            className="inline-flex items-center gap-2 rounded-full bg-primary text-primary-foreground px-8 py-3.5 font-medium hover:shadow-luxury transition-all"
          >
            Start free <ArrowRight className="h-4 w-4" />
          </Link>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default IndustryDetail;
