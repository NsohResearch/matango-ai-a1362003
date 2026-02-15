import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import InvestorHero from "@/components/marketing/InvestorHero";
import ProblemSection from "@/components/marketing/ProblemSection";
import SolutionSection from "@/components/marketing/SolutionSection";
import MarketOpportunity from "@/components/marketing/MarketOpportunity";
import ProductMoat from "@/components/marketing/ProductMoat";
import BusinessModel from "@/components/marketing/BusinessModel";
import GoToMarket from "@/components/marketing/GoToMarket";
import SecurityTrust from "@/components/marketing/SecurityTrust";
import TractionStats from "@/components/marketing/TractionStats";
import InvestorCTA from "@/components/marketing/InvestorCTA";

const Investors = () => (
  <div className="min-h-screen flex flex-col bg-background">
    <Navbar />
    <main>
      <InvestorHero />
      {/* Investor-specific problem framing */}
      <section className="py-16 px-6 bg-cream-50">
        <div className="container mx-auto max-w-3xl">
          <h2 className="font-display text-2xl font-semibold text-foreground mb-6">The Problem</h2>
          <p className="text-muted-foreground leading-relaxed mb-4">
            Marketing execution is broken. Tool sprawl, context loss, manual coordination, expensive retainers, inconsistent output.
          </p>
          <p className="text-foreground font-medium">
            AI tools generate content. They do not execute workflows.
          </p>
        </div>
      </section>
      {/* Investor-specific solution framing */}
      <section className="py-16 px-6 bg-emerald-950">
        <div className="container mx-auto max-w-3xl">
          <h2 className="font-display text-2xl font-semibold text-cream-50 mb-6">The Solution</h2>
          <p className="text-cream-100/70 mb-4">
            Matango.ai introduces AI-Amplified Operators (AAOs).
          </p>
          <p className="text-cream-100/70 mb-4">
            Brand Brain + Operators + Campaign Factory + Video Studio + Scheduler.
          </p>
          <p className="text-cream-100/70 mb-2">A unified execution engine.</p>
          <p className="text-gold-400 font-medium">Not prompt-based automation. Operator-based workflow orchestration.</p>
        </div>
      </section>
      <MarketOpportunity />
      <ProductMoat />
      <BusinessModel />
      <GoToMarket />
      <SecurityTrust />
      <TractionStats />
      <InvestorCTA />
    </main>
    <Footer />
  </div>
);

export default Investors;
